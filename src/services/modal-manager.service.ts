class ModalManagerService {
  static instance: ModalManagerService

  private modals: { id: string; cb: () => void }[] = []

  constructor() {
    if (!ModalManagerService.instance) {
      ModalManagerService.instance = this
    }
    return ModalManagerService.instance
  }

  register(id: string, cb: () => void) {
    const modal = this.modals.find((m) => m.id === id)
    if (modal) {
      // already registered, update callback
      modal.cb = cb
      return
    }
    this.modals.push({ id, cb })
  }

  unregister(id: string) {
    const modal = this.modals.find((m) => m.id === id)
    if (!modal) return

    modal.cb()
    this.modals = this.modals.filter((m) => m.id !== id)
  }

  pop() {
    const modal = this.modals.pop()
    if (!modal) return false

    modal.cb()
    return true
  }
}

const instance = new ModalManagerService()
export default instance
