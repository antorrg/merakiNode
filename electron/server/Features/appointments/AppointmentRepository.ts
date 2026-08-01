import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { db } from '../../Configs/database.js';
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js';
import { AppointmentProps } from './Appointment.js';

type AppointmentInsert = Record<string, any>;

export interface AppointmentWithDetails extends AppointmentProps {
  patientFirstName?: string;
  patientLastName?: string;
  patientName?: string;
  professionalName?: string;
}

export class AppointmentRepository {
  private baseRepo: BaseRepository<AppointmentProps, AppointmentInsert, Partial<AppointmentInsert>>;

  constructor() {
    this.baseRepo = new BaseRepository<AppointmentProps, AppointmentInsert, Partial<AppointmentInsert>>('appointments', 'appointment_id', true);
  }

  create(data: AppointmentInsert): string {
    return this.baseRepo.create(data) as unknown as string;
  }

  getById(id: string): AppointmentProps | null {
    const result = this.baseRepo.getById(id);
    return result.results || null;
  }

  checkOverlap(professionalId: string, startTime: string, endTime: string, excludeId?: string): boolean {
    let sql = `
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE professional_id = ? 
        AND deleted_at IS NULL 
        AND status != 'CANCELLED'
        AND start_time < ? 
        AND end_time > ?
    `;
    const params: any[] = [professionalId, endTime, startTime];

    if (excludeId) {
      sql += ` AND appointment_id != ?`;
      params.push(excludeId);
    }

    const stmt = db.db.prepare(sql);
    const result = stmt.get(...params) as { count: number };
    return result.count > 0;
  }

  getByDateRange(startDate: string, endDate: string, professionalId?: string): AppointmentWithDetails[] {
    let sql = `
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        u.user_name as professional_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN users u ON a.professional_id = u.user_id
      WHERE a.deleted_at IS NULL
        AND a.start_time >= ? 
        AND a.end_time <= ?
    `;

    const params: any[] = [startDate, endDate];

    if (professionalId) {
      sql += ` AND a.professional_id = ?`;
      params.push(professionalId);
    }

    sql += ` ORDER BY a.start_time ASC`;

    const stmt = db.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => {
      const mapped = CaseConverter.mapKeysToCamelCase<AppointmentWithDetails>(row);
      const firstName = row.patient_first_name || '';
      const lastName = row.patient_last_name || '';
      mapped.patientName = `${firstName} ${lastName}`.trim() || 'Paciente sin nombre';
      return mapped;
    });
  }

  getByPatientId(patientId: string): AppointmentWithDetails[] {
    const sql = `
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        u.user_name as professional_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN users u ON a.professional_id = u.user_id
      WHERE a.patient_id = ? AND a.deleted_at IS NULL
      ORDER BY a.start_time DESC
    `;

    const stmt = db.db.prepare(sql);
    const rows = stmt.all(patientId) as any[];

    return rows.map(row => {
      const mapped = CaseConverter.mapKeysToCamelCase<AppointmentWithDetails>(row);
      const firstName = row.patient_first_name || '';
      const lastName = row.patient_last_name || '';
      mapped.patientName = `${firstName} ${lastName}`.trim() || 'Paciente sin nombre';
      return mapped;
    });
  }

  getByProfessionalId(professionalId: string): AppointmentWithDetails[] {
    const sql = `
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        u.user_name as professional_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN users u ON a.professional_id = u.user_id
      WHERE a.professional_id = ? AND a.deleted_at IS NULL
      ORDER BY a.start_time ASC
    `;

    const stmt = db.db.prepare(sql);
    const rows = stmt.all(professionalId) as any[];

    return rows.map(row => {
      const mapped = CaseConverter.mapKeysToCamelCase<AppointmentWithDetails>(row);
      const firstName = row.patient_first_name || '';
      const lastName = row.patient_last_name || '';
      mapped.patientName = `${firstName} ${lastName}`.trim() || 'Paciente sin nombre';
      return mapped;
    });
  }

  update(id: string, data: Partial<AppointmentInsert>) {
    return this.baseRepo.update(id, data);
  }

  delete(id: string) {
    return this.baseRepo.delete(id);
  }
}
