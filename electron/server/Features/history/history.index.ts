//import { NodeValidator } from 'req-valid-express';
import { historyService } from '../../Shared/dependencies.js';

export default {
  getFullHistory: async (data: unknown) => {
    // Validamos que venga un patientId correcto
    if (!data || typeof data !== 'object' || !('patientId' in data)) {
      throw new Error('Falta el parámetro patientId');
    }
    
    // Asumimos que los IDs de paciente son UUID, si no lo son, se puede ajustar la regex.
    // Omitimos NodeValidator.ValidReg.UUIDv4 si los IDs son custom. Por ahora intentaremos validarlo como string puro.
    const patientId = String((data as any).patientId);
    if (!patientId || patientId.trim().length === 0) {
        throw new Error('El patientId es inválido');
    }

    const response = await historyService.getFullHistory(patientId);
    return response;
  }
}
