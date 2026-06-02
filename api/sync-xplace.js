import { createClient } from '@supabase/supabase-js'
import vm from 'vm'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fetchAndParse() {
  const res = await fetch('https://www.xplace.com/syndication/ShowNewProjects.xpl', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) throw new Error(`XPlace returned ${res.status}`)

  const scriptCode = await res.text()

  // Execute the XPlace script in a Node VM with a mock document.write
  // so we get the exact HTML it would render in a browser
  let html = ''
  const context = vm.createContext({
    document: {
      write: (s) => { html += s },
      writeln: (s) => { html += s + '\n' },
    },
    window: {},
    navigator: { userAgent: '' },
    location: { href: '' },
    tableWidth: '100%', font: 'Arial',
    titleSize: '11pt', titleColor: '#000', titleBgColor: '#fff',
    descSize: '9pt',  descColor: '#444', descBgColor: '#fff',
    UrlSize: '7pt',   UrlColor: '#c60',
  })

  vm.runInContext(scriptCode, context, { timeout: 5000 })

  return parseProjects(html)
}

function parseProjects(html) {
  const projects = []
  const seen = new Set()

  // Find all links to xplace.com article/project pages
  const linkRe = /<a\s[^>]*href=["'](https?:\/\/(?:www\.)?xplace\.com\/(?:article|project)\/\d+[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi

  let match
  while ((match = linkRe.exec(html)) !== null) {
    const url = match[1].split('?')[0] // strip query params
    const rawTitle = match[2].replace(/<[^>]+>/g, '').trim()

    if (!rawTitle || rawTitle.length < 3) continue
    if (seen.has(url)) continue
    seen.add(url)

    // Grab the text block after this link for description
    const afterStart = match.index + match[0].length
    const afterRaw = html.slice(afterStart, afterStart + 600)
    const description = afterRaw
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
      .split(/https?:\/\//)[0] // stop before the URL line
      .trim()
      .slice(0, 400)

    projects.push({ title: rawTitle, description, url })
  }

  return projects
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing Supabase env vars' })
  }

  try {
    const projects = await fetchAndParse()

    if (projects.length === 0) {
      return res.status(200).json({ synced: 0, message: 'No projects parsed from XPlace' })
    }

    const { error } = await supabase
      .from('xplace_projects')
      .upsert(
        projects.map(p => ({ ...p, synced_at: new Date().toISOString() })),
        { onConflict: 'url', ignoreDuplicates: true }
      )

    if (error) throw error

    return res.status(200).json({ synced: projects.length })
  } catch (err) {
    console.error('XPlace sync error:', err)
    return res.status(500).json({ error: err.message })
  }
}
