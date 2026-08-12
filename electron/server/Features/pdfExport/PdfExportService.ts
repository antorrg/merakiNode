import { app, BrowserWindow, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { PdfExportRepository } from './PdfExportRepository.js';
import { GeneratePdfPayload, PdfExportProps } from './PdfExport.js';
import { pdfTemplate } from './pdfTemplate.js';

export class PdfExportService {
  private repository: PdfExportRepository;

  constructor(repository: PdfExportRepository) {
    this.repository = repository;
  }
 // # = private js
 #generateHtmlContent(payload: GeneratePdfPayload): string {
    return pdfTemplate(payload);
  }

  async generatePdf(payload: GeneratePdfPayload, userId: string): Promise<{ success: boolean; filePath: string; userChosenPath?: string; exportRecord: PdfExportProps }> {
    const htmlContent = this.#generateHtmlContent(payload);

    const fontSizeMode = payload.pdfConfig?.fontSize || 'md';
    let footerFontSize = '11px';
    if (fontSizeMode === 'sm') {
      footerFontSize = '9px';
    } else if (fontSizeMode === 'lg') {
      footerFontSize = '13px';
    }

    // Crear ventana oculta para renderizar HTML y convertir a PDF
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));

    const pdfBuffer = await printWindow.webContents.printToPDF({
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: ${footerFontSize}; font-family: Helvetica, Arial, sans-serif; text-align: center; width: 100%; color: #334155; font-weight: 600; padding-bottom: 5px;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
      margins: {
        marginType: 'custom',
        top: 0.4,
        bottom: 0.6,
        left: 0.4,
        right: 0.4,
      },
    });

    printWindow.destroy();

    // 1. Guardar copia automática en carpeta por defecto (userData/pdfs/)
    const userDataPath = app.getPath('userData');
    const pdfsDir = path.join(userDataPath, 'pdfs');
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }

    const fileId = crypto.randomUUID();
    const cleanPatientName = `${payload.patientData.firstName}_${payload.patientData.lastName}`
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Historia_${cleanPatientName}_${timeStamp}.pdf`;
    const defaultFilePath = path.join(pdfsDir, fileName);

    fs.writeFileSync(defaultFilePath, pdfBuffer);

    // 2. Diálogo opcional para que el usuario guarde copia donde indique
    let userChosenPath: string | undefined = undefined;
    const saveDialogResult = await dialog.showSaveDialog({
      title: 'Guardar copia de Historia Clínica en PDF',
      defaultPath: fileName,
      filters: [{ name: 'Documentos PDF', extensions: ['pdf'] }],
    });

    if (!saveDialogResult.canceled && saveDialogResult.filePath) {
      userChosenPath = saveDialogResult.filePath;
      fs.writeFileSync(userChosenPath, pdfBuffer);
    }

    // 3. Registrar metadatos en la base de datos SQLite
    const visitIds = payload.draftEntries.map(e => e.entryId);
    const exportRecord: PdfExportProps = {
      id: fileId,
      patientId: payload.patientId,
      userId: userId,
      fileName: fileName,
      relativePath: path.relative(userDataPath, defaultFilePath),
      visitIds: visitIds,
      documentType: 'medical-history',
      createdAt: new Date().toISOString(),
    };

    this.repository.create({
      id: exportRecord.id,
      patient_id: exportRecord.patientId,
      user_id: exportRecord.userId,
      file_name: exportRecord.fileName,
      relative_path: exportRecord.relativePath,
      visit_ids: JSON.stringify(visitIds),
      document_type: exportRecord.documentType,
    });

    return {
      success: true,
      filePath: defaultFilePath,
      userChosenPath: userChosenPath,
      exportRecord,
    };
  }

  getByPatientId(patientId: string): PdfExportProps[] {
    return this.repository.getByPatientId(patientId);
  }
}
