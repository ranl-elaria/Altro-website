/* AltroAI self-built analytics. Loads only after consent. */
(function () {
  if (window.__altroTrackLoaded) return
  window.__altroTrackLoaded = true

  var SID_KEY = 'altro_sid'
  function getSid() {
    var sid = sessionStorage.getItem(SID_KEY)
    if (!sid) {
      sid = (crypto.randomUUID && crypto.randomUUID()) ||
            (Date.now().toString(36) + Math.random().toString(36).slice(2))
      sessionStorage.setItem(SID_KEY, sid)
    }
    return sid
  }

  function send(event, props) {
    var payload = JSON.stringify({
      event: event,
      props: props || {},
      path: location.pathname + location.search,
      ref: document.referrer || null,
      sid: getSid(),
    })
    var url = '/api/track'
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon(url, blob)
        return
      }
    } catch (e) {}
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(function () {})
  }

  window.altroTrack = send

  // Initial pageview
  send('pageview')

  // SPA route changes via History API
  var _push = history.pushState
  history.pushState = function () {
    _push.apply(this, arguments)
    send('pageview')
  }
  var _replace = history.replaceState
  history.replaceState = function () {
    _replace.apply(this, arguments)
    send('pageview')
  }
  window.addEventListener('popstate', function () { send('pageview') })

  // Scroll depth 75%
  var scrolled75 = false
  window.addEventListener('scroll', function () {
    if (scrolled75) return
    var h = document.documentElement
    var pct = (h.scrollTop + window.innerHeight) / h.scrollHeight
    if (pct >= 0.75) {
      scrolled75 = true
      send('scroll_75')
    }
  }, { passive: true })

  // Outbound link clicks
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]')
    if (!a) return
    try {
      var url = new URL(a.href, location.href)
      if (url.host && url.host !== location.host) {
        send('outbound_click', { href: a.href })
      }
    } catch (err) {}
  }, true)
})()
