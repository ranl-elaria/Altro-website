import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { TRANSLATIONS } from './src/i18n/translations.js'

const SITE = 'https://www.altroai.net'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Emit dist/he/index.html with Hebrew lang/dir/meta in the first HTML, so crawlers
// and link previews see Hebrew without running JS. Vercel serves the file before the SPA rewrite.
function hebrewEntry() {
  let outDir = 'dist'
  return {
    name: 'hebrew-entry-html',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const he = TRANSLATIONS.he
      const title = esc(he['meta.title'])
      const desc = esc(he['meta.description'])
      const file = resolve(outDir, 'index.html')
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

export default defineConfig({
  plugins: [tailwindcss(), react(), hebrewEntry()],
  server: {
    port: 5175,
    strictPort: false,
  },
})
