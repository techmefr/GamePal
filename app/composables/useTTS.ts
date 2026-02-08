const TTS_VOICE_KEY = 'gamepal-tts-voice'
const TTS_RATE_KEY = 'gamepal-tts-rate'

const MIN_RATE = 0.5
const MAX_RATE = 2.0
const DEFAULT_RATE = 1.0

export function useTTS() {
    const isSpeaking = ref(false)
    const isPaused = ref(false)
    const voices = ref<SpeechSynthesisVoice[]>([])
    const selectedVoiceURI = ref<string | null>(null)
    const rate = ref(DEFAULT_RATE)

    let utterance: SpeechSynthesisUtterance | null = null

    function init(): void {
        if (typeof window === 'undefined' || !window.speechSynthesis) return

        const storedVoice = localStorage.getItem(TTS_VOICE_KEY)
        if (storedVoice) selectedVoiceURI.value = storedVoice

        const storedRate = localStorage.getItem(TTS_RATE_KEY)
        if (storedRate) rate.value = parseFloat(storedRate)

        function loadVoices(): void {
            voices.value = window.speechSynthesis.getVoices()
        }

        loadVoices()
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    }

    function speak(text: string): void {
        if (typeof window === 'undefined' || !window.speechSynthesis) return

        stop()

        utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = rate.value

        if (selectedVoiceURI.value) {
            const voice = voices.value.find(v => v.voiceURI === selectedVoiceURI.value)
            if (voice) utterance.voice = voice
        }

        utterance.onend = () => {
            isSpeaking.value = false
            isPaused.value = false
        }

        utterance.onerror = () => {
            isSpeaking.value = false
            isPaused.value = false
        }

        window.speechSynthesis.speak(utterance)
        isSpeaking.value = true
        isPaused.value = false
    }

    function pause(): void {
        if (typeof window === 'undefined' || !window.speechSynthesis) return
        window.speechSynthesis.pause()
        isPaused.value = true
    }

    function resume(): void {
        if (typeof window === 'undefined' || !window.speechSynthesis) return
        window.speechSynthesis.resume()
        isPaused.value = false
    }

    function stop(): void {
        if (typeof window === 'undefined' || !window.speechSynthesis) return
        window.speechSynthesis.cancel()
        isSpeaking.value = false
        isPaused.value = false
        utterance = null
    }

    function setVoice(uri: string): void {
        selectedVoiceURI.value = uri
        if (typeof window !== 'undefined') {
            localStorage.setItem(TTS_VOICE_KEY, uri)
        }
    }

    function setRate(newRate: number): void {
        rate.value = Math.max(MIN_RATE, Math.min(MAX_RATE, newRate))
        if (typeof window !== 'undefined') {
            localStorage.setItem(TTS_RATE_KEY, String(rate.value))
        }
    }

    init()

    onUnmounted(() => {
        stop()
    })

    return {
        isSpeaking: readonly(isSpeaking),
        isPaused: readonly(isPaused),
        voices: readonly(voices),
        selectedVoiceURI: readonly(selectedVoiceURI),
        rate: readonly(rate),
        speak,
        pause,
        resume,
        stop,
        setVoice,
        setRate,
    }
}
