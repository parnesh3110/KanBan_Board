// this composable lets users talk to the app instead of typing
// uses the browser's built-in speech recognition API

import { ref, onUnmounted } from 'vue'

export function useSpeechRecognition() {
  const isListening = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  const error = ref(null)
  
  let recognition = null

  // check if the browser supports speech recognition
  if (typeof window !== 'undefined') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    isSupported.value = !!SpeechRecognition

    if (SpeechRecognition) {
      recognition = new SpeechRecognition()
      recognition.continuous = false  // stops automatically when user stops talking
      recognition.interimResults = true  // shows results as you speak
      recognition.lang = 'en-US'  // set language to english

      // when recording starts
      recognition.onstart = () => {
        isListening.value = true
        error.value = null
      }

      // when we get speech results
      recognition.onresult = (event) => {
        const results = Array.from(event.results)
        const transcriptText = results
          .map(result => result[0].transcript)
          .join('')
        
        transcript.value = transcriptText
      }

      // if something goes wrong
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        error.value = event.error
        isListening.value = false
      }

      // when recording stops
      recognition.onend = () => {
        isListening.value = false
      }
    }
  }

  // start listening to the user's voice
  const start = () => {
    if (!recognition) {
      error.value = 'Speech recognition not supported'
      return
    }

    try {
      transcript.value = ''
      error.value = null
      recognition.start()
    } catch (err) {
      console.error('Failed to start recognition:', err)
      error.value = err.message
    }
  }

  // stop listening
  const stop = () => {
    if (recognition && isListening.value) {
      recognition.stop()
    }
  }

  // toggle between start and stop
  const toggle = () => {
    if (isListening.value) {
      stop()
    } else {
      start()
    }
  }

  // cleanup when component is destroyed
  onUnmounted(() => {
    if (recognition) {
      recognition.abort()
    }
  })

  return {
    isListening,
    isSupported,
    transcript,
    error,
    start,
    stop,
    toggle
  }
}
