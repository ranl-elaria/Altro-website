// Client-side markdown renderer with [[wikilink]] support + XSS sanitization.
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const WIKI_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

export function renderMarkdown(md, { onWikiClick } = {}) {
  if (!md) return ''
  // Rewrite [[link]] → <a data-wiki="link">display</a> before parsing
  const withWiki = String(md).replace(WIKI_RE, (_, target, display) =>
    `<a class="wiki-link" data-wiki="${escapeAttr(target.trim())}" href="#">${escapeHtml(display?.trim() || target.trim())}</a>`
  )
  const html = marked.parse(withWiki, { breaks: true, gfm: true })
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['data-wiki', 'target', 'rel'],
    ADD_TAGS: [],
  })
}

function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;') }
