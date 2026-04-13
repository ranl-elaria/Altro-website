import { useState, useRef, useCallback, useEffect } from 'react'

const SR =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

export default function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const callbackRef = useRef(null)
  const supported = Boolean(SR)

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const start = useCallback((onTranscript) => {
    if (!SR) return
    callbackRef.current = onTranscript

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (e) => {
      let allFinal = ''
      let interim = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          allFinal += e.results[i][0].transcript
        } else {
          interim += e.results[i][0].transcript
        }
      }
      callbackRef.current?.(allFinal + interim)
    }

    rec.onerror = () => setIsListening(false)
    rec.onend   = () => setIsListening(false)

    rec.start()
    recognitionRef.current = rec
    setIsListening(true)
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, supported, start, stop }
}
