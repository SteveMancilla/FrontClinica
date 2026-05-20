import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeMedicalDictationText } from '@/utils/speechNormalizer'

interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } } }
  resultIndex: number
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor()
    setIsSupported(Boolean(Ctor))
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'es-PE'

    recognition.onresult = (event) => {
      const index = event.resultIndex
      const transcript = event.results[index]?.[0]?.transcript ?? ''
      const normalized = normalizeMedicalDictationText(transcript)
      if (normalized) onTranscriptRef.current(normalized)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      setIsListening(false)
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, isSupported, start, stop }
}
