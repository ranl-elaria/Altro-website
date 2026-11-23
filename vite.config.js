import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { TRANSLATIONS } from './src/i18n/translations.js'

const SITE = 'https://www.altroai.net'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Emit dist/he/index.html with Hebrew lang/dir/meta in the first HTML, so crawlers
// and link previews see Hebrew without running JS. Vercel serves the file before the SPA rewrite.
function hebrewEntry() {
  let outDir = 'dist'
  let isSsr = false
  return {
    name: 'hebrew-entry-html',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
      isSsr = !!config.build.ssr
    },
    closeBundle() {
      if (isSsr) return
      const he = TRANSLATIONS.he
      const title = esc(he['meta.title'])
      const desc = esc(he['meta.description'])
      const file = resolve(outDir, 'index.html')
      if (!existsSync(file)) return
      let html = readFileSync(file, 'utf8')
      const swap = (re, to) => {
        if (!re.test(html)) throw new Error(`hebrew-entry: pattern not found ${re}`)
        html = html.replace(re, to)
      }
      swap(/<html lang="en" dir="ltr">/, '<html lang="he" dir="rtl">')
      swap(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
      swap(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
      swap(/(<link rel="canonical" href=")[^"]*(")/, `$1${SITE}/he/$2`)
      swap(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
      swap(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
      swap(/(<meta property="og:url" content=")[^"]*(")/, `$1${SITE}/he/$2`)
      swap(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
      swap(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`)
      mkdirSync(resolve(outDir, 'he'), { recursive: true })
      writeFileSync(resolve(outDir, 'he', 'index.html'), html)
    },
  }
}

/** Run Vercel `api/*.js` handlers in `npm run dev`, so the contact form can POST. */
function apiDev() {
  return {
    name: 'api-dev',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.envDir || process.cwd(), '')
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v
      }
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || '').split('?')[0]
        if (!path.startsWith('/api/') || path.includes('..')) return next()
        const file = resolve(process.cwd(), path.slice(1) + '.js')
        if (!existsSync(file)) return next()
        try {
          let body
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const raw = await new Promise((ok, err) => {
              const chunks = []
              req.on('data', (c) => chunks.push(c))
              req.on('end', () => ok(Buffer.concat(chunks)))
              req.on('error', err)
            })
            const type = String(req.headers['content-type'] || '')
            body = type.includes('json') ? JSON.parse(raw.length ? raw.toString() : '{}') : undefined
          }
          const mod = await import(pathToFileURL(file).href + '?mtime=' + Date.now())
          await mod.default(
            { method: req.method, headers: req.headers, body, url: req.url },
            {
              status(code) {
                res.statusCode = code
                return this
              },
              json(payload) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(payload))
              },
            },
          )
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Empty handler response' }))
          }
        } catch (err) {
          console.error('[api-dev]', path, err)
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Could not save enquiry. Please try again.' }))
          }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), react(), hebrewEntry(), apiDev()],
  server: {
    port: 5175,
    strictPort: false,
  },
})
