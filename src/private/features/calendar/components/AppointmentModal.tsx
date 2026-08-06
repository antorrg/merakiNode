import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../../../context/AuthContext';
import { useAppointmentStore } from '../useAppointmentStore';
import { useUserStore } from '../../user/useUserStore';
import { adminApi } from '../../../../shared/api/api';
import { IPatient } from '../../../../types';
import { IAppointment } from '../../../../shared/types/appointment.types';
import { toast } from '../../../../shared/components/toast/toastManager';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStart?: Date;
  initialEnd?: Date;
  existingAppointment?: IAppointment | null;
  fixedPatientId?: string;
  onSuccess: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  initialStart,
  initialEnd,
  existingAppointment,
  fixedPatientId,
  onSuccess
}) => {
  const { user } = useAuth();
  const { createAppointment, updateAppointmentStatus, deleteAppointment, appointments, isLoading } = useAppointmentStore();
  const { users, fetchUsers } = useUserStore();

  const [patients, setPatients] = useState<IPatient[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(fixedPatientId || '');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [service, setService] = useState<string>('Consulta General');
  const [dateStr, setDateStr] = useState<string>('');
  const [startTimeStr, setStartTimeStr] = useState<string>('09:00');
  const [endTimeStr, setEndTimeStr] = useState<string>('09:30');
  const [notes, setNotes] = useState<string>('');

  const userRole = user?.role || 'PROFESIONAL';
  const isSecretary = userRole === 'SECRETARIO';
  const isProfessional = userRole === 'PROFESIONAL';
  const isOwner = userRole === 'PROPIETARIO';

  // Buscar pacientes en la base de datos con filtro en la query (SQL LIKE)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      adminApi.execute<any>({ //eslint-disable-line
        request: {
          channel: 'patient:getAll',
          payload: { search: patientSearch.trim(), limit: 25 }
        }
      }).then(res => {
        if (res) {
          const list = Array.isArray(res) ? res : (res.data || []);
          setPatients(list);
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, patientSearch]);

  // Cargar datos iniciales del modal
  useEffect(() => {
    if (!isOpen) return;

    fetchUsers();

    if (existingAppointment) {
      setSelectedPatientId(existingAppointment.patientId);
      setSelectedProfessionalId(existingAppointment.professionalId);
      setService(existingAppointment.service);
      setNotes(existingAppointment.notes || '');

      const start = dayjs(existingAppointment.startTime);
      const end = dayjs(existingAppointment.endTime);

      setDateStr(start.format('YYYY-MM-DD'));
      setStartTimeStr(start.format('HH:mm'));
      setEndTimeStr(end.format('HH:mm'));
    } else {
      if (fixedPatientId) {
        setSelectedPatientId(fixedPatientId);
      } else {
        setSelectedPatientId('');
      }

      if (isProfessional && user) {
        setSelectedProfessionalId(user.userId);
      } else if (isOwner && user) {
        setSelectedProfessionalId(user.userId);
      } else {
        setSelectedProfessionalId('');
      }

      setService('Consulta General');
      setNotes('');

      const start = initialStart ? dayjs(initialStart) : dayjs();
      const end = initialEnd ? dayjs(initialEnd) : start.add(30, 'minute');

      setDateStr(start.format('YYYY-MM-DD'));
      setStartTimeStr(start.format('HH:mm'));
      setEndTimeStr(end.format('HH:mm'));
    }
  }, [isOpen, existingAppointment, initialStart, initialEnd, fixedPatientId, user, isProfessional, isOwner]);//eslint-disable-line

  if (!isOpen) return null;

  // Filtrar profesionales de la lista de usuarios
  const professionals = (Array.isArray(users) ? users : []).filter(u => u.role === 'PROFESIONAL' || u.role === 'PROPIETARIO');
  const patientArray = Array.isArray(patients) ? patients : [];

  // Comprobar solapamiento de horario en el frontend para mejor UX
  let hasOverlap = false;
  if (!existingAppointment && selectedProfessionalId && dateStr && startTimeStr && endTimeStr) {
    const newStart = dayjs(`${dateStr}T${startTimeStr}`);
    const newEnd = dayjs(`${dateStr}T${endTimeStr}`);

    hasOverlap = appointments.some(app => {
      if (app.professionalId !== selectedProfessionalId) return false;
      if (app.status === 'CANCELLED') return false;

      const appStart = dayjs(app.startTime);
      const appEnd = dayjs(app.endTime);

      return newStart.isBefore(appEnd) && newEnd.isAfter(appStart);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasOverlap) {
      toast.error('No se puede agendar: el profesional ya tiene un turno activo en ese horario');
      return;
    }

    if (!selectedPatientId) {
      toast.error('Debe seleccionar un paciente');
      return;
    }

    if (!selectedProfessionalId) {
      toast.error('Debe seleccionar un profesional');
      return;
    }

    if (!service.trim()) {
      toast.error('Debe ingresar el servicio o motivo');
      return;
    }

    const startISO = dayjs(`${dateStr}T${startTimeStr}`).toISOString();
    const endISO = dayjs(`${dateStr}T${endTimeStr}`).toISOString();

    const created = await createAppointment({
      patientId: selectedPatientId,
      professionalId: selectedProfessionalId,
      service: service.trim(),
      startTime: startISO,
      endTime: endISO,
      notes: notes.trim()
    });

    if (created) {
      onSuccess();
      onClose();
    }
  };

  const handleStatusChange = async (newStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    if (!existingAppointment) return;

    await updateAppointmentStatus(existingAppointment.appointmentId, newStatus, notes);
    onSuccess();
    onClose();
  };
  const handleReasonsCancel = async() => {
    if (!existingAppointment) return;
    const newStatus = 'CANCELLED'
    await updateAppointmentStatus(existingAppointment.appointmentId, newStatus, notes);
    onSuccess();
    onClose();
  }

  const handleDelete = async () => {
    if (!existingAppointment) return;
    if (existingAppointment.status === 'CANCELLED') {
      toast.error('No se puede eliminar un turno cancelado. Debe conservarse la constancia en el historial del paciente.');
      return;
    }
    if (window.confirm('¿Está seguro de eliminar permanentemente este turno?')) {
      await deleteAppointment(existingAppointment.appointmentId);
      onSuccess();
      onClose();
    }
  };
  const dontDelete = existingAppointment?.status === 'CANCELLED';

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {existingAppointment ? 'Detalles del Turno' : 'Agendar Nuevo Turno'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {existingAppointment && (
                <div className="alert alert-info mb-3">
                  <strong>Estado Actual:</strong>{' '}
                  <span className={`badge ${
                    existingAppointment.status === 'CONFIRMED' ? 'bg-success' :
                    existingAppointment.status === 'CANCELLED' ? 'bg-danger' :
                    existingAppointment.status === 'COMPLETED' ? 'bg-primary' : 'bg-warning'
                  }`}>
                    {existingAppointment.status === 'CANCELLED' ? 'CANCELADO' : existingAppointment.status}
                  </span>
                  {existingAppointment.status === 'CANCELLED' && (
                    <div className="mt-1 text-danger small fw-bold">
                      * Este turno fue CANCELADO. Se liberó de la agenda general y se conserva como constancia en el historial del paciente (no se puede eliminar).
                    </div>
                  )}
                </div>
              )}

              {hasOverlap && (
                <div className="alert alert-warning mb-3 d-flex align-items-center gap-2">
                  <span className="fs-5">⚠️</span>
                  <div>
                    <strong>Horario no disponible:</strong> El profesional seleccionado ya posee un turno activo agendado en esa franja horaria.
                  </div>
                </div>
              )}

              <div className="row g-3">
                {/* Paciente */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Paciente</label>
                  {fixedPatientId ? (
                    <input
                      type="text"
                      className="form-control"
                      value={patientArray.find(p => p.patientId === fixedPatientId)?.firstName ? `${patientArray.find(p => p.patientId === fixedPatientId)?.firstName} ${patientArray.find(p => p.patientId === fixedPatientId)?.lastName}` : 'Paciente Seleccionado'}
                      disabled
                    />
                  ) : existingAppointment ? (
                    <input
                      type="text"
                      className="form-control"
                      value={existingAppointment.patientName || 'Paciente'}
                      disabled
                    />
                  ) : (
                    <div>
                      <input
                        type="text"
                        className="form-control mb-1"
                        placeholder="Buscar en BD por nombre, apellido o DNI..."
                        value={patientSearch}
                        onChange={e => setPatientSearch(e.target.value)}
                      />
                      <select
                        className="form-select"
                        value={selectedPatientId}
                        onChange={e => setSelectedPatientId(e.target.value)}
                        required
                      >
                        <option value="">-- Seleccionar Paciente --</option>
                        {patientArray.map(p => (
                          <option key={p.patientId} value={p.patientId}>
                            {p.firstName} {p.lastName} (Doc: {p.identityCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Profesional */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    Profesional {isSecretary && <span className="text-danger">* Obligatorio</span>}
                  </label>
                  {existingAppointment ? (
                    <input
                      type="text"
                      className="form-control"
                      value={existingAppointment.professionalName || 'Profesional'}
                      disabled
                    />
                  ) : isProfessional ? (
                    <input
                      type="text"
                      className="form-control"
                      value={user?.userName || 'Profesional Logueado'}
                      disabled
                    />
                  ) : (
                    <select
                      className="form-select"
                      value={selectedProfessionalId}
                      onChange={e => setSelectedProfessionalId(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccionar Profesional --</option>
                      {professionals.map(prof => (
                        <option key={prof.userId} value={prof.userId}>
                          {prof.userName} ({prof.role})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Servicio / Motivo */}
                <div className="col-md-12">
                  <label className="form-label fw-bold">Servicio / Motivo de Consulta</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Consulta General, Control Pediatría, Chequeo..."
                    value={service}
                    onChange={e => setService(e.target.value)}
                    required
                    disabled={Boolean(existingAppointment)}
                  />
                </div>

                {/* Fecha y Horarios */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateStr}
                    onChange={e => setDateStr(e.target.value)}
                    required
                    disabled={Boolean(existingAppointment)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Hora Inicio</label>
                  <input
                    type="time"
                    className="form-control"
                    value={startTimeStr}
                    onChange={e => setStartTimeStr(e.target.value)}
                    required
                    disabled={Boolean(existingAppointment)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Hora Fin</label>
                  <input
                    type="time"
                    className="form-control"
                    value={endTimeStr}
                    onChange={e => setEndTimeStr(e.target.value)}
                    required
                    disabled={Boolean(existingAppointment)}
                  />
                </div>

                {/* Notas / Observaciones */}
                <div className="col-md-12">
                  <label className="form-label fw-bold">Notas / Observaciones</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Detalles adicionales o motivo de cancelación..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer d-flex justify-content-between">
              <div>
                {existingAppointment && existingAppointment.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleDelete}
                    disabled={isLoading || dontDelete}
                  >
                    Eliminar Turno
                  </button>
                )}
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cerrar
                </button>

                {!existingAppointment ? (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading || hasOverlap}
                  >
                    {isLoading ? 'Agendando...' : 'Agendar Turno'}
                  </button>
                ) : (
                  <>
                    {existingAppointment.status !== 'CONFIRMED' && (
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => handleStatusChange('CONFIRMED')}
                        disabled={isLoading || dontDelete}
                      >
                        Confirmar
                      </button>
                    )}
                    {existingAppointment.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        className="btn btn-info text-white"
                        onClick={() => handleStatusChange('COMPLETED')}
                        disabled={isLoading|| dontDelete}
                      >
                        Completar
                      </button>
                    )}
                    {existingAppointment.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleStatusChange('CANCELLED')}
                        disabled={isLoading}
                      >
                        Cancelar Turno
                      </button>
                    )}
                    {existingAppointment.status === 'CANCELLED' && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleReasonsCancel()}
                        disabled={isLoading}
                      >
                        Guardar cambios
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
