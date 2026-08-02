import { app, BrowserWindow, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { PdfExportRepository } from './PdfExportRepository.js';
import { GeneratePdfPayload, PdfExportProps } from './PdfExport.js';

export class PdfExportService {
  private repository: PdfExportRepository;

  constructor() {
    this.repository = new PdfExportRepository();
  }

  private translateVisitType(type: string): string {
    switch (type) {
      case 'PRESENTIAL': return 'Presencial';
      case 'VIRTUAL': return 'Virtual';
      case 'PHONE': return 'Telefónica';
      case 'REPORT': return 'Reporte';
      default: return type || 'Presencial';
    }
  }

  private generateHtmlContent(payload: GeneratePdfPayload): string {
    const { patientData, professionalData, pdfConfig, draftEntries } = payload;

    const todayDate = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const fullAddress = [patientData.address, patientData.city, patientData.postalCode]
      .filter(Boolean)
      .join(', ');

    const guardiansText = patientData.guardians && patientData.guardians.length > 0
      ? patientData.guardians.map(g => `${g.name}${g.relationship ? ` (${g.relationship})` : ''}`).join(', ')
      : 'Sin registrar';

    let logoSrc = '';
    if (pdfConfig.logoUrl && pdfConfig.logoUrl.startsWith('data:image')) {
      logoSrc = pdfConfig.logoUrl;
    } else {
      const possiblePaths = [
        path.join(process.cwd(), 'public', 'merakifav.png'),
        path.join(process.cwd(), 'dist', 'merakifav.png'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          try {
            const base64Img = fs.readFileSync(p).toString('base64');
            logoSrc = `data:image/png;base64,${base64Img}`;
            break;
          } catch (err) {
            console.error('Error leyendo logo para PDF:', err);
          }
        }
      }
    }

    const entriesHtml = draftEntries.map((entry) => {
      const formattedDate = new Date(entry.visitDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return `
        <div class="visit-card">
          <div class="visit-header">
            <span class="visit-title">Visita día ${formattedDate}</span>
            <span class="badge badge-visit">${this.translateVisitType(entry.visitType)}</span>
          </div>

          <div class="visit-body">
            ${entry.reason ? `
              <div class="section-block">
                <div class="section-title">Motivo de Consulta:</div>
                <div class="section-content">${entry.reason}</div>
              </div>
            ` : ''}

            ${entry.evolution ? `
              <div class="section-block">
                <div class="section-title">Evolución Médica:</div>
                <div class="section-content">${entry.evolution}</div>
              </div>
            ` : ''}

            ${pdfConfig.showLinkedDiagnoses !== false && entry.linkedDiagnosesText ? `
              <div class="section-block">
                <div class="section-title">Diagnósticos Asociados del Paciente:</div>
                <div class="section-content"><strong>${entry.linkedDiagnosesText}</strong></div>
              </div>
            ` : ''}

            ${pdfConfig.showDiagnosisSummary && entry.diagnosisSummary ? `
              <div class="section-block">
                <div class="section-title">Resumen de Diagnóstico:</div>
                <div class="section-content">${entry.diagnosisSummary}</div>
              </div>
            ` : ''}

            ${pdfConfig.showObservations && entry.observations ? `
              <div class="section-block">
                <div class="section-title">Observaciones:</div>
                <div class="section-content">${entry.observations}</div>
              </div>
            ` : ''}

            ${pdfConfig.showTreatmentPlan && entry.treatmentPlan ? `
              <div class="section-block">
                <div class="section-title">Plan de Tratamiento:</div>
                <div class="section-content">${entry.treatmentPlan}</div>
              </div>
            ` : ''}

            ${pdfConfig.showRecommendations && entry.recommendations ? `
              <div class="section-block">
                <div class="section-title">Recomendaciones:</div>
                <div class="section-content">${entry.recommendations}</div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Historia Clínica - ${patientData.firstName} ${patientData.lastName}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #2b2b2b;
            line-height: 1.5;
            padding: 20px 30px;
            margin: 0;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border-bottom: 2px solid #0d6efd;
            padding-bottom: 15px;
          }
          .header-table td {
            vertical-align: top;
          }
          .logo-cell {
            width: 120px;
            text-align: center;
          }
          .logo-img {
            max-width: 90px;
            max-height: 70px;
          }
          .clinic-name {
            font-size: 14px;
            font-weight: bold;
            color: #0d6efd;
            margin-top: 5px;
            letter-spacing: 1px;
          }
          .info-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 10px 14px;
            font-size: 11px;
          }
          .info-title {
            font-weight: bold;
            color: #0d6efd;
            margin-bottom: 5px;
            font-size: 12px;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 3px;
          }
          .custom-notes {
            background-color: #e7f1ff;
            border-left: 4px solid #0d6efd;
            padding: 8px 12px;
            font-size: 11px;
            margin-bottom: 20px;
            border-radius: 4px;
          }
          .visit-card {
            border: 1px solid #dee2e6;
            border-radius: 6px;
            margin-bottom: 18px;
            page-break-inside: avoid;
            background-color: #ffffff;
          }
          .visit-header {
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
          }
          .visit-title {
            color: #1e293b;
            font-size: 12px;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 600;
            border-radius: 4px;
            color: #ffffff;
            background-color: #0d6efd;
            float: right;
          }
          .visit-body {
            padding: 12px;
          }
          .section-block {
            margin-bottom: 10px;
          }
          .section-block:last-child {
            margin-bottom: 0;
          }
          .section-title {
            font-weight: bold;
            color: #475569;
            font-size: 11px;
            margin-bottom: 3px;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 2px;
          }
          .section-content {
            font-size: 11px;
            color: #1e293b;
          }
          .section-content p { margin: 0 0 4px 0; }
          .section-content ul, .section-content ol { padding-left: 18px; margin: 0 0 4px 0; }
        </style>
      </head>
      <body>
        <!-- Header Principal -->
        <table class="header-table">
          <tr>
            <td class="logo-cell">
              ${logoSrc ? `<img src="${logoSrc}" class="logo-img" alt="Logo" /><br/>` : ''}
              <div class="clinic-name">MERAKI</div>
            </td>
            <td>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 35%; padding-right: 10px;">
                    <div class="info-box">
                      <div class="info-title">👨‍⚕️ Profesional</div>
                      <div><strong>Dr/a:</strong> ${professionalData.userName || 'Profesional'}</div>
                      <div><strong>Email:</strong> ${professionalData.userEmail || 'N/A'}</div>
                    </div>
                  </td>
                  <td style="width: 65%;">
                    <div class="info-box">
                      <div class="info-title">👤 Datos del Paciente</div>
                      <table style="width: 100%; font-size: 11px;">
                        <tr>
                          <td><strong>Nombre:</strong> ${patientData.firstName} ${patientData.lastName}</td>
                          <td><strong>${patientData.typeDoc || 'Doc'}:</strong> ${patientData.identityCode || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Nacimiento:</strong> ${patientData.birthDate || 'N/A'} (${patientData.age ? `${patientData.age} años` : ''})</td>
                          <td><strong>Teléfono:</strong> ${patientData.phone || 'Sin registrar'}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong> ${patientData.email || 'Sin registrar'}</td>
                          <td><strong>Domicilio:</strong> ${fullAddress || 'Sin registrar'}</td>
                        </tr>
                        ${patientData.guardians && patientData.guardians.length > 0 ? `
                        <tr>
                          <td colspan="2"><strong>Tutor:</strong> ${guardiansText}</td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Emisión & Resumen -->
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 15px;">
          <span>📅 <strong>Fecha de Emisión:</strong> ${todayDate}</span>
          <span>📌 <strong>Visitas registradas:</strong> ${draftEntries.length}</span>
        </div>

        ${pdfConfig.customHeaderNotes ? `
          <div class="custom-notes">
            ℹ️ <strong>Aclaración:</strong> ${pdfConfig.customHeaderNotes}
          </div>
        ` : ''}

        <!-- Entradas -->
        ${entriesHtml}
      </body>
      </html>
    `;
  }

  async generatePdf(payload: GeneratePdfPayload, userId: string): Promise<{ success: boolean; filePath: string; userChosenPath?: string; exportRecord: PdfExportProps }> {
    const htmlContent = this.generateHtmlContent(payload);

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
        <div style="font-size: 9px; font-family: Helvetica, Arial, sans-serif; text-align: center; width: 100%; color: #64748b; padding-bottom: 5px;">
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
