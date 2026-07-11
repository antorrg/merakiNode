import { PatientService } from '../patients/PatientService.js';
import { DiagnosisService } from '../diagnosis/DiagnosisService.js';
import { HistoryEntryService } from './HistoryEntryService.js';
import { TreatmentService } from '../treatment/TreatmentService.js';
import { UserService } from '../user/UserService.js';
import { DiagnosisStatus } from '../diagnosis/Diagnosis.js';

export class HistoryService {
  constructor(
    private patientService: PatientService,
    private diagnosisService: DiagnosisService,
    private entryService: HistoryEntryService,
    private treatmentService: TreatmentService,
    private userService: UserService
  ) {}

  async getFullHistory(patientId: string) {
    // 1. Obtener los datos del paciente (síncrono)
    const patient = this.patientService.getPatientById(patientId);

    // 2. Obtener diagnósticos y separarlos lógicamente (síncrono)
    const allDiagnoses = this.diagnosisService.getPatientDiagnoses(patientId);
    
    const activeDiagnoses = allDiagnoses.filter(d => 
      d.status === DiagnosisStatus.ACTIVE || d.status === DiagnosisStatus.CHRONIC
    );
    const pastDiagnoses = allDiagnoses.filter(d => 
      d.status === DiagnosisStatus.RESOLVED || d.status === DiagnosisStatus.SUSPENDED
    );

    // 3. Obtener todas las evoluciones (síncrono)
    const entries = this.entryService.getPatientEntries(patientId);
    
    // 4. Armar el Timeline (asíncrono porque UserService usa promesas)
    const timeline = await Promise.all(entries.map(async (entry) => {
      // 4.a Resolver el nombre del profesional
      let professionalName = 'Profesional Desconocido';
      try {
        const user = await this.userService.getById(entry.professionalId);
        professionalName = user.userName || user.userEmail || professionalName;
      } catch (e) {
        // En caso de que el usuario haya sido eliminado físicamente de la base de datos
      }

      // 4.b Obtener los tratamientos de esta evolución en particular
      const treatments = this.treatmentService.getTreatmentsByEntry(entry.entryId);

      // Eliminar professionalId original del DTO para evitar redundancia
      const { professionalId, ...entryClean } = entry;

      return {
        ...entryClean,
        professional: {
          id: professionalId,
          name: professionalName
        },
        treatments: treatments
      };
    }));

    // 5. Ensamblar la respuesta final (UX-Driven)
    return {
      patient,
      diagnoses: {
        active: activeDiagnoses,
        past: pastDiagnoses
      },
      timeline
    };
  }
}
