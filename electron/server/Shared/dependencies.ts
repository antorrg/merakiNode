import { UserRepository } from '../Features/user/UserRepository.js';
import { UserService } from '../Features/user/UserService.js';
import { SessionRepository } from '../Features/auth/SessionRepository.js';
import { AuthService } from '../Features/auth/AuthService.js';
import { DiagnosisRepository } from '../Features/diagnosis/DiagnosisRepository.js';
import { DiagnosisService } from '../Features/diagnosis/DiagnosisService.js';
import { HistoryEntryRepository } from '../Features/history/HistoryEntryRepository.js';
import { HistoryEntryService } from '../Features/history/HistoryEntryService.js';
import { TreatmentRepository } from '../Features/treatment/TreatmentRepository.js';
import { TreatmentService } from '../Features/treatment/TreatmentService.js';
import { PatientRepository } from '../Features/patients/PatientRepository.js';
import { PatientService } from '../Features/patients/PatientService.js';
import { HistoryService } from '../Features/history/HistoryService.js';


// --- Repositories ---
export const userRepository = new UserRepository();
export const sessionRepository = new SessionRepository();
export const diagnosisRepository = new DiagnosisRepository();
export const historyEntryRepository = new HistoryEntryRepository();
export const treatmentRepository = new TreatmentRepository();
export const patientRepository = new PatientRepository()

// --- Services ---
export const userService = new UserService(userRepository);
export const authService = new AuthService(sessionRepository, userService);
export const diagnosisService = new DiagnosisService(diagnosisRepository);
export const historyEntryService = new HistoryEntryService(historyEntryRepository);
export const treatmentService = new TreatmentService(treatmentRepository);
export const patientService = new PatientService(patientRepository);
export const historyService = new HistoryService(patientService, diagnosisService, historyEntryService, treatmentService, userService);

