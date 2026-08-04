import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from "../Shared/Middlewares/IpcMiddlewares.js";
import pdfExportModule from '../Features/pdfExport/pdfExport.index.js';
import type { GeneratePdfPayload, GetPdfByPatientPayload } from "./ipc.types.js";
import { PDF_EXPORT_CHANNELS } from '../../white-list.js';

export { PDF_EXPORT_CHANNELS };

export function pdfExportIpc() {
  ipcMain.handle(
    'pdf:generate',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, data: GeneratePdfPayload) => {
        const userId = data.sessionClient?.userId || 'system';
        return pdfExportModule.generatePdf(data, userId);
      }, 'PROFESIONAL'),
      'pdf:generate'
    )
  );

  ipcMain.handle(
    'pdf:getByPatient',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, data: GetPdfByPatientPayload) => {
        return pdfExportModule.getByPatientId(data.patientId);
      }, 'PROFESIONAL'),
      'pdf:getByPatient'
    )
  );
}
