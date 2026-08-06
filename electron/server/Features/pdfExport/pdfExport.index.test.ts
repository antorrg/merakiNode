import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { db } from '../../Configs/database.js';
import { users, patients, pdf_exports } from '../../Schema/schema.js';
import pdfExportModule from './pdfExport.index.js';
import { PdfExportRepository } from './PdfExportRepository.js';
import { PdfExportService } from './PdfExportService.js';
import { GeneratePdfPayload } from './PdfExport.js';

vi.mock('../../Configs/envConfig.js', () => ({
  default: {
    DatabaseUrl: ':memory:',
    Status: 'test',
    Port: 3000,
    Secret: 'secret',
    ExpiresIn: '1'
  }
}));

describe('pdfExport.index integration tests', () => {
  const repository = new PdfExportRepository();

  beforeAll(() => {
    db.db.exec(users.sql);
    db.db.exec(patients.sql);
    db.db.exec(pdf_exports.sql);
  });

  beforeEach(() => {
    db.db.exec('PRAGMA foreign_keys = OFF;');
    db.db.exec('DELETE FROM pdf_exports;');
    db.db.exec('PRAGMA foreign_keys = ON;');
  });

  describe('getByPatientId', () => {
    it('debería retornar un arreglo vacío si el paciente no tiene PDFs exportados', () => {
      const result = pdfExportModule.getByPatientId('patient-sin-pdfs');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('debería consultar y deserializar los registros de PDF por patientId', () => {
      const patientId = 'patient-123';
      const fileId = 'pdf-uuid-1';

      db.db.exec('PRAGMA foreign_keys = OFF;');

      repository.create({
        id: fileId,
        patient_id: patientId,
        user_id: 'user-456',
        file_name: 'Historia_Juan_Perez.pdf',
        relative_path: 'pdfs/Historia_Juan_Perez.pdf',
        visit_ids: JSON.stringify(['visit-1', 'visit-2']),
        document_type: 'medical-history',
      });

      db.db.exec('PRAGMA foreign_keys = ON;');

      const exports = pdfExportModule.getByPatientId(patientId);
      expect(exports).toBeDefined();
      expect(exports.length).toBe(1);

      const record = exports[0];
      expect(record.id).toBe(fileId);
      expect(record.patientId).toBe(patientId);
      expect(record.userId).toBe('user-456');
      expect(record.fileName).toBe('Historia_Juan_Perez.pdf');
      expect(record.visitIds).toEqual(['visit-1', 'visit-2']);
      expect(record.documentType).toBe('medical-history');
    });
  });

  describe('Sanitización de HTML en plantilla PDF (escapeHTML)', () => {
    it('debería escapar caracteres HTML en texto plano y preservar etiquetas en rich-text', () => {
      const service = new PdfExportService(new PdfExportRepository());
      const payload: GeneratePdfPayload = {
        patientId: 'pat-1',
        patientData: {
          firstName: 'Juan <script>alert("xss")</script>',
          lastName: 'Perez & Hijos',
          typeDoc: 'DNI',
          identityCode: '12345678',
          birthDate: '01/01/1990',
          phone: '1122334455',
          email: 'juan@test.com',
          address: 'Av. <Prueba>',
          city: 'Ciudad',
          obraSocial: 'OSDE',
          escolaridad: 'Secundaria',
        },
        professionalData: {
          userName: 'Dr. <House>',
          userEmail: 'house@clinic.com',
        },
        pdfConfig: {
          customHeaderNotes: 'Aclaración con "comillas" & <etiqueta>',
          showDiagnosisSummary: true,
          showObservations: true,
          showTreatmentPlan: true,
          showRecommendations: true,
        },
        draftEntries: [
          {
            entryId: 'entry-1',
            patientId: 'pat-1',
            professionalId: 'prof-1',
            visitDate: new Date().toISOString(),
            visitType: 'PRESENTIAL',
            reason: '<p>Motivo de consulta con <strong>HTML legítimo</strong></p>',
            evolution: '<ul><li>Evolución médica</li></ul>',
            linkedDiagnosesText: 'Diagnóstico <Caries & Gingivitis>',
          },
        ],
      };

      // Accedemos de forma aislada a la generación de HTML
      const html = (service as unknown as { generateHtmlContent: (p: GeneratePdfPayload) => string }).generateHtmlContent(payload);

      // Verificamos que el texto plano fue escapado correctamente
      expect(html).not.toContain('Juan <script>');
      expect(html).toContain('Juan &lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(html).toContain('Perez &amp; Hijos');
      expect(html).toContain('Av. &lt;Prueba&gt;');
      expect(html).toContain('Dr. &lt;House&gt;');
      expect(html).toContain('Aclaración con &quot;comillas&quot; &amp; &lt;etiqueta&gt;');
      expect(html).toContain('Diagnóstico &lt;Caries &amp; Gingivitis&gt;');

      // Verificamos que las etiquetas HTML del rich text del editor se mantuvieron intactas
      expect(html).toContain('<p>Motivo de consulta con <strong>HTML legítimo</strong></p>');
      expect(html).toContain('<ul><li>Evolución médica</li></ul>');
    });
  });
});
