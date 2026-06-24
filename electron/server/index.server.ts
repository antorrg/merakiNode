import { authIpc } from "./ipc/auth.ipc.js" 
import { userIpc } from "./ipc/user.ipc.js"
import { loggerIpc } from "./ipc/logger.ipc.js"


const modules = [
  authIpc,
  userIpc,
  loggerIpc,
]

export function registerAllIpc() {
  modules.forEach(register => register())
}
