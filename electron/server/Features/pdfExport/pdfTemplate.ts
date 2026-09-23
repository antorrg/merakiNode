import path from 'node:path';
import fs from 'node:fs';
import {
  GeneratePdfPayload,
  PdfConfig,
  DraftEntry,
  FontSizeMode,
} from './PdfExport.js';
import { DEFAULT_APP_CONFIG } from '../../../config.types.js';

const AppConfig = DEFAULT_APP_CONFIG

export interface FontSizes {
  bodyFontSize: string;
  titleFontSize: string;
  subFontSize: string;
  badgeFontSize: string;
  clinicNameFontSize: string;
}

export interface PdfTemplateOptions {
  logoSrc?: string;
}

/**
 * Escapa caracteres especiales HTML para prevenir inyecciones XSS en campos de texto plano.
 */
export function escapeHTML(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#96;');
}

/**
 * Traduce el tipo de visita a un formato legible en español.
 */
export function translateVisitType(type: string): string {
  switch (type) {
    case 'PRESENTIAL':
      return 'Presencial';
    case 'VIRTUAL':
      return 'Virtual';
    case 'PHONE':
      return 'Telefónica';
    case 'REPORT':
      return 'Reporte';
    default:
      return type || 'Presencial';
  }
}

/**
 * Calcula los tamaños de fuente dinámicos según el modo especificado.
 */
export function getFontSizeStyles(fontSize?: FontSizeMode): FontSizes {
  const mode = fontSize || 'md';
  if (mode === 'sm') {
    return {
      bodyFontSize: '12px',
      titleFontSize: '13px',
      subFontSize: '11px',
      badgeFontSize: '10px',
      clinicNameFontSize: '14px',
    };
  }
  if (mode === 'lg') {
    return {
      bodyFontSize: '16px',
      titleFontSize: '17px',
      subFontSize: '15px',
      badgeFontSize: '12px',
      clinicNameFontSize: '18px',
    };
  }
  return {
    bodyFontSize: '14px',
    titleFontSize: '15px',
    subFontSize: '13px',
    badgeFontSize: '11px',
    clinicNameFontSize: '16px',
  };
}

/**
 * Obtiene el logo en formato base64 o URL.
 */
export function resolveLogoSrc(pdfConfig: PdfConfig, customLogoSrc?: string): string {
  if (customLogoSrc) return customLogoSrc;
  if (pdfConfig.logoUrl && pdfConfig.logoUrl.startsWith('data:image')) {
    return pdfConfig.logoUrl;
  }
  const possiblePaths = [
    path.join(process.cwd(), 'public', AppConfig.logoUrl!),
    path.join(process.cwd(), 'dist', AppConfig.logoUrl!),
    ...(process.resourcesPath
      ? [
          path.join(process.resourcesPath, 'app.asar', 'dist', AppConfig.logoUrl!),
          path.join(process.resourcesPath, 'app.asar', 'public', AppConfig.logoUrl!),
          path.join(process.resourcesPath, AppConfig.logoUrl!),
        ]
      : []),
    path.resolve(__dirname, '..', '..', '..', 'dist', AppConfig.logoUrl!),
    path.resolve(__dirname, '..', '..', '..', 'public', AppConfig.logoUrl!),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const base64Img = fs.readFileSync(p).toString('base64');
        return `data:image/png;base64,${base64Img}`;
      } catch (err) {
        console.error('Error leyendo logo para PDF:', err);
      }
    }
  }
  return '';
}

/**
 * Renderiza el bloque HTML para las entradas / consultas registradas.
 */
export function renderDraftEntries(draftEntries: DraftEntry[], pdfConfig: PdfConfig): string {
  return draftEntries
    .map((entry) => {
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
            <span class="badge badge-visit">${escapeHTML(translateVisitType(entry.visitType))}</span>
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
                <div class="section-title">Evolución del Paciente:</div>
                <div class="section-content">${entry.evolution}</div>
              </div>
            ` : ''}

            ${pdfConfig.showLinkedDiagnoses !== false && entry.linkedDiagnosesText ? `
              <div class="section-block">
                <div class="section-title">Diagnóstico/s del Paciente:</div>
                <div class="section-content"><strong>${escapeHTML(entry.linkedDiagnosesText)}</strong></div>
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
    })
    .join('');
}

/**
 * Genera el documento HTML completo listo para convertir a PDF.
 */
export const pdfTemplate = (payload: GeneratePdfPayload, options?: PdfTemplateOptions): string => {
  const { patientData, professionalData, pdfConfig, draftEntries } = payload;

  const fontSizes = getFontSizeStyles(pdfConfig.fontSize);
  const { bodyFontSize, titleFontSize, subFontSize, badgeFontSize, clinicNameFontSize } = fontSizes;

  const logoSrc = resolveLogoSrc(pdfConfig, options?.logoSrc);

  const todayDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const fullAddress = [patientData.address, patientData.city]
    .filter(Boolean)
    .map((val) => escapeHTML(val))
    .join(', ');

  const guardiansText =
    patientData.guardians && patientData.guardians.length > 0
      ? patientData.guardians
          .map(
            (g) =>
              `${escapeHTML(g.name)}${
                g.relationship ? ` (${escapeHTML(g.relationship)})` : ''
              }`
          )
          .join(', ')
      : 'Sin registrar';

  const entriesHtml = renderDraftEntries(draftEntries, pdfConfig);

  return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Historia Clínica - ${escapeHTML(patientData.firstName)} ${escapeHTML(patientData.lastName)}</title>
        <style>
          * { box-sizing: border-box; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: ${bodyFontSize};
            color: #0f172a;
            line-height: 1.5;
            padding: 20px 30px;
            margin: 0;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border-bottom: 2.5px solid #0252ca;
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
            font-size: ${clinicNameFontSize};
            font-weight: bold;
            color: #0252ca;
            margin-top: 5px;
            letter-spacing: 1px;
          }
          .info-box {
            background-color: #f1f5f9;
            border: 1.5px solid #94a3b8;
            border-radius: 6px;
            padding: 10px 14px;
            font-size: ${subFontSize};
            color: #0f172a;
          }
          .info-title {
            font-weight: bold;
            color: #0252ca;
            margin-bottom: 6px;
            font-size: ${titleFontSize};
            border-bottom: 1.5px solid #94a3b8;
            padding-bottom: 3px;
          }
          .custom-notes {
            background-color: #eff6ff;
            border: 1.5px solid #93c5fd;
            border-left: 5px solid #0252ca;
            padding: 10px 14px;
            font-size: ${subFontSize};
            color: #1e3a8a;
            margin-bottom: 20px;
            border-radius: 6px;
          }
          .visit-card {
            border: 1.5px solid #64748b;
            border-radius: 6px;
            margin-bottom: 18px;
            page-break-inside: avoid;
            background-color: #ffffff;
            overflow: hidden;
          }
          .visit-header {
            background-color: #e2e8f0;
            padding: 9px 14px;
            border-bottom: 1.5px solid #64748b;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            color: #0f172a;
          }
          .visit-title {
            color: #0f172a;
            font-size: ${titleFontSize};
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            font-size: ${badgeFontSize};
            font-weight: 600;
            border-radius: 4px;
            color: #ffffff;
            background-color: #0252ca;
            float: right;
          }
          .visit-body {
            padding: 14px;
          }
          .section-block {
            margin-bottom: 12px;
          }
          .section-block:last-child {
            margin-bottom: 0;
          }
          .section-title {
            font-weight: bold;
            color: #0f172a;
            font-size: ${subFontSize};
            margin-bottom: 4px;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 3px;
          }
          .section-content {
            font-size: ${bodyFontSize};
            color: #0f172a;
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
              <div class="clinic-name">${escapeHTML(pdfConfig.institutionName || 'Centro medico')}</div>
            </td>
            <td>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 35%; padding-right: 10px;">
                    <div class="info-box">
                      <div class="info-title">👨‍⚕️ Profesional</div>
                      <div><strong>Dr/a:</strong> ${escapeHTML(professionalData.userName || 'Profesional')}</div>
                      <div><strong>Email:</strong> ${escapeHTML(professionalData.userEmail || 'N/A')}</div>
                    </div>
                  </td>
                  <td style="width: 65%;">
                    <div class="info-box">
                      <div class="info-title">👤 Datos del Paciente</div>
                      <table style="width: 100%; font-size: 11px;">
                        <tr>
                          <td><strong>Nombre:</strong> ${escapeHTML(patientData.firstName)} ${escapeHTML(patientData.lastName)}</td>
                          <td><strong>${escapeHTML(patientData.typeDoc || 'Doc')}:</strong> ${escapeHTML(patientData.identityCode || 'N/A')}</td>
                        </tr>
                        <tr>
                          <td><strong>Nacimiento:</strong> ${escapeHTML(patientData.birthDate || 'N/A')} (${patientData.age ? `${escapeHTML(patientData.age)} años` : ''})</td>
                          <td><strong>Teléfono:</strong> ${escapeHTML(patientData.phone || 'Sin registrar')}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong> ${escapeHTML(patientData.email || 'Sin registrar')}</td>
                          <td><strong>Domicilio:</strong> ${fullAddress || 'Sin registrar'}</td>
                        </tr>
                        <tr>
                          <td><strong>Obra Social:</strong> ${escapeHTML(patientData.obraSocial || 'Sin registrar')}</td>
                          <td><strong>Escolaridad:</strong> ${escapeHTML(patientData.escolaridad || 'Sin registrar')}</td>
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
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 15px;">
          <span>📅 <strong>Fecha de Emisión:</strong> ${todayDate}</span>
          <span>📌 <strong>Visitas registradas:</strong> ${draftEntries.length}</span>
        </div>

        ${pdfConfig.customHeaderNotes ? `
          <div class="custom-notes">
            ℹ️ <strong>Aclaración:</strong> ${escapeHTML(pdfConfig.customHeaderNotes)}
          </div>
        ` : ''}

        <!-- Entradas -->
        ${entriesHtml}
      </body>
      </html>
    `;
};