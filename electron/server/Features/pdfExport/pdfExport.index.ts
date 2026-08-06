import { GeneratePdfPayload } from './PdfExport.js';
import { pdfExportService } from '../../Shared/dependencies.js';

export default {
  generatePdf: async (payload: GeneratePdfPayload, userId: string) => {
    return pdfExportService.generatePdf(payload, userId);
  },

  getByPatientId: (patientId: string) => {
    return pdfExportService.getByPatientId(patientId);
  }
};
