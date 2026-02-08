const LOCALE_TO_LANG: Record<string, string> = {
    fr: 'fra',
    en: 'eng',
    de: 'deu',
    es: 'spa',
    it: 'ita',
}

export function useOCR() {
    const isLoading = ref(false)
    const progress = ref(0)
    const extractedText = ref('')
    const error = ref<string | null>(null)

    const { locale } = useI18n()

    async function extractText(imageSource: File | string): Promise<string> {
        isLoading.value = true
        progress.value = 0
        error.value = null
        extractedText.value = ''

        try {
            const { createWorker } = await import('tesseract.js')
            const lang = LOCALE_TO_LANG[locale.value] ?? 'eng'

            const worker = await createWorker(lang, undefined, {
                logger: (info: { progress: number }) => {
                    progress.value = Math.round(info.progress * 100)
                },
            })

            const result = await worker.recognize(imageSource)
            extractedText.value = result.data.text
            await worker.terminate()

            return extractedText.value
        } catch (err) {
            const message = err instanceof Error ? err.message : 'OCR failed'
            error.value = message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    function reset(): void {
        isLoading.value = false
        progress.value = 0
        extractedText.value = ''
        error.value = null
    }

    return {
        isLoading: readonly(isLoading),
        progress: readonly(progress),
        extractedText: readonly(extractedText),
        error: readonly(error),
        extractText,
        reset,
    }
}
