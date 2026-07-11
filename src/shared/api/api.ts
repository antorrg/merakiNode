import { IpcClient } from './base/IpcClient'
import { AdminApi } from "./base/AdminApi";

const getSessionId = () => localStorage.getItem('sessionId');

export const publicApi = new AdminApi(new IpcClient({ requireAuth: false }))

export const sessionApi = new AdminApi(new IpcClient({ 
  getSessionId, 
  requireAuth: true 
}))

export const adminApi = new AdminApi(new IpcClient({ 
  getSessionId, 
  requireAuth: true 
}))

