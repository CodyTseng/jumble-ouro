class LibreTranslateService {
  static instance: LibreTranslateService

  constructor() {
    if (!LibreTranslateService.instance) {
      LibreTranslateService.instance = this
    }
    return LibreTranslateService.instance
  }

  async translate(
    text: string,
    target: string,
    server?: string,
    api_key?: string
  ): Promise<string> {
    if (!text) {
      return text
    }
    if (!server) {
      throw new Error('LibreTranslate server address is not configured')
    }
    const url = new URL('/translate', server).toString()
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target, source: 'auto', api_key })
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error ?? 'Failed to translate')
    }
    const translatedText = data.translatedText
    if (!translatedText) {
      throw new Error('Translation failed')
    }
    return translatedText
  }
}

const instance = new LibreTranslateService()
export default instance
