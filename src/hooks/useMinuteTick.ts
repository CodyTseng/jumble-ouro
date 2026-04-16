import { useSyncExternalStore } from 'react'

let tick = 0
const listeners = new Set<() => void>()
let intervalId: ReturnType<typeof setInterval> | null = null

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    intervalId = setInterval(() => {
      tick++
      listeners.forEach((l) => l())
    }, 60_000)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
}

function noopSubscribe() {
  return () => {}
}

function getSnapshot() {
  return tick
}

export function useMinuteTick(enabled = true) {
  return useSyncExternalStore(enabled ? subscribe : noopSubscribe, getSnapshot, getSnapshot)
}
