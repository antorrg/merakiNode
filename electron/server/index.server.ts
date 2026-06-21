import { authIpc } from "./ipc/auth.ipc.js" 
import { userIpc } from "./ipc/user.ipc.js"


const modules = [
  authIpc,
  userIpc,
]

export function registerAllIpc() {
  modules.forEach(register => register())
}
