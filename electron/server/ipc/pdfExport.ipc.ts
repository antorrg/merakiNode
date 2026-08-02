import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import pdfExportModule from '../Features/pdfExport/pdfExport.index.js';
import { PDF_EXPORT_CHANNELS } from '../../white-list.js';

export { PDF_EXPORT_CHANNELS };

export function pdfExportIpc() {
  ipcMain.handle(
    'pdf:generate',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: any) => { //eslint-disable-line
        const userId = data.sessionClient?.userId || 'system';
        return pdfExportModule.generatePdf(data, userId);
      }, 'PROFESIONAL'),
      'pdf:generate'
    )
  );

  ipcMain.handle(
    'pdf:getByPatient',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: any) => { //eslint-disable-line
        return pdfExportModule.getByPatientId(data.patientId);
      }, 'PROFESIONAL'),
      'pdf:getByPatient'
    )
  );
}
