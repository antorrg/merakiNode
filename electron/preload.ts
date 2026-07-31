import { ipcRenderer, contextBridge } from 'electron'
import { ALLOWED_INVOKE_CHANNELS, ALLOWED_LISTEN_CHANNELS } from './white-list'

// Exponer puente API seguro y restringido al proceso Renderer
const apiBridge = {
  invoke(channel: string, payload?: unknown) {
    if (!ALLOWED_INVOKE_CHANNELS.has(channel)) {
      console.error(`[IPC Security Violation] Invocación denegada para el canal no permitido: ${channel}`)
      throw new Error(`[Security] Canal IPC no permitido para invoke: ${channel}`)
    }
    return ipcRenderer.invoke(channel, payload)
  },

  on(channel: string, listener: (...args: unknown[]) => void) {
    if (!ALLOWED_LISTEN_CHANNELS.has(channel)) {
      console.error(`[IPC Security Violation] Escucha denegada para el canal no permitido: ${channel}`)
      throw new Error(`[Security] Canal IPC no permitido para listener: ${channel}`)
    }
    const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => listener(...args)
    ipcRenderer.on(channel, subscription)
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  }
}

// Exponemos tanto window.api como window.ipcRenderer (por compatibilidad) apuntando a la api segura
contextBridge.exposeInMainWorld('api', apiBridge)
contextBridge.exposeInMainWorld('ipcRenderer', apiBridge)
