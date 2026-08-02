import { authIpc } from "./ipc/auth.ipc.js" 
import { userIpc } from "./ipc/user.ipc.js"
import { loggerIpc } from "./ipc/logger.ipc.js"
import { historyIpc } from "./ipc/history.ipc.js"
import { patientsIpc } from "./ipc/patients.ipc.js"
import { diagnosisIpc } from "./ipc/diagnosis.ipc.js"
import { historyEntryIpc } from "./ipc/historyEntry.ipc.js"
import { treatmentIpc } from "./ipc/treatment.ipc.js"
import { appointmentIpc } from "./ipc/appointment.ipc.js"
import { pdfExportIpc } from "./ipc/pdfExport.ipc.js"

const modules = [
  authIpc,
  userIpc,
  loggerIpc,
  historyIpc,
  patientsIpc,
  diagnosisIpc,
  historyEntryIpc,
  treatmentIpc,
  appointmentIpc,
  pdfExportIpc,
]

export function registerAllIpc() {
  modules.forEach(register => register())
}
