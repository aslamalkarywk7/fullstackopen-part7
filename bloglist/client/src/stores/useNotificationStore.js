import { create } from 'zustand'

let timeoutId = null

const useNotificationStore = create((set) => ({
  notification: null,
  actions: {
    notify: (text, type = 'success') => {
      set(() => ({ notification: { text, type } }))
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        set(() => ({ notification: null }))
      }, 5000)
    },
  },
}))

export const useNotification = () =>
  useNotificationStore((state) => state.notification)
export const useNotificationActions = () =>
  useNotificationStore((state) => state.actions)

export default useNotificationStore
