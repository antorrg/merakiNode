import { PdfExportService } from './PdfExportService.js';
import { GeneratePdfPayload } from './PdfExport.js';

class PdfExportModule {
  private service: PdfExportService;

  constructor() {
    this.service = new PdfExportService();
  }

  async generatePdf(payload: GeneratePdfPayload, userId: string) {
    return this.service.generatePdf(payload, userId);
  }

  getByPatientId(patientId: string) {
    return this.service.getByPatientId(patientId);
  }
}

export default new PdfExportModule();
