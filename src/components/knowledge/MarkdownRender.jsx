import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { renderMarkdown } from '../../lib/knowledge/markdown'

export default function MarkdownRender({ md }) {
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!ref.current) return
    const links = ref.current.querySelectorAll('a.wiki-link')
    const handlers = []
    links.forEach(a => {
      const h = (e) => {
        e.preventDefault()
        const target = a.getAttribute('data-wiki')
        if (target) navigate(`/admin/knowledge?search=${encodeURIComponent(target)}`)
      }
      a.addEventListener('click', h)
      handlers.push([a, h])
    })
    return () => handlers.forEach(([a, h]) => a.removeEventListener('click', h))
  })

  return <div ref={ref} className="knowledge-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
}
