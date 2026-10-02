// Inject the server-rendered homepage into dist/index.html (en) and dist/he/index.html (he),
// so crawlers and link previews see real text. The client still mounts with createRoot and
// replaces it, so behaviour in the browser does not change.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)

for (const [lang, file] of [['en', 'dist/index.html'], ['he', 'dist/he/index.html']]) {
  const html = readFileSync(file, 'utf8')
  const marker = '<div id="root"></div>'
  if (!html.includes(marker)) throw new Error(`prerender: root marker missing in ${file}`)
  const body = render(lang)
  if (body.length < 2000) throw new Error(`prerender: suspiciously small output for ${lang}`)
  writeFileSync(file, html.replace(marker, `<div id="root">${body}</div>`))
  console.log(`prerendered ${lang}: ${body.length} chars -> ${file}`)
}
rmSync('dist-ssr', { recursive: true, force: true })
