class PostEditorService extends EventTarget {
  static instance: PostEditorService

  isSuggestionPopupOpen = false

  constructor() {
    super()
    if (!PostEditorService.instance) {
      PostEditorService.instance = this
    }
    return PostEditorService.instance
  }

  closeSuggestionPopup() {
    if (this.isSuggestionPopupOpen) {
      this.isSuggestionPopupOpen = false
      this.dispatchEvent(new CustomEvent('closeSuggestionPopup'))
    }
  }
}

const instance = new PostEditorService()
export default instance
