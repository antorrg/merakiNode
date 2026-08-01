import { useEffect, useState } from 'react';
import { Calendar, dayjsLocalizer, Views, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import es from 'dayjs/locale/es';
import { messages } from './translates';
import { useAuth } from '../../../context/AuthContext';
import { useAppointmentStore } from './useAppointmentStore';
import { useUserStore } from '../user/useUserStore';
import { AppointmentModal } from './components/AppointmentModal';
import { IAppointment } from '../../../shared/types/appointment.types';

dayjs.locale(es);
const localizer = dayjsLocalizer(dayjs);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: IAppointment;
}

export default function GeneralCalendar() {
  const { user } = useAuth();
  const { appointments, fetchAppointmentsByRange, selectedProfessionalId, setSelectedProfessionalId } = useAppointmentStore();
  const { users, fetchUsers } = useUserStore();

  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>(Views.WEEK);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);

  const userRole = user?.role || 'PROFESIONAL';
  const isSecretary = userRole === 'SECRETARIO';
  const isProfessional = userRole === 'PROFESIONAL';
  const isOwner = userRole === 'PROPIETARIO';

  // Cargar lista de profesionales si es SECRETARIO o PROPIETARIO
  useEffect(() => {
    if (isSecretary || isOwner) {
      fetchUsers();
    }
  }, [isSecretary, isOwner, fetchUsers]);

  // Si es PROFESIONAL, forzar la selección a su propio userId
  useEffect(() => {
    if (isProfessional && user) {
      setSelectedProfessionalId(user.userId);
    }
  }, [isProfessional, user, setSelectedProfessionalId]);

  // Cargar turnos desde backend cuando cambia la fecha, vista o profesional seleccionado
  const loadAppointments = () => {
    const startRange = dayjs(date).startOf('month').subtract(7, 'day').toISOString();
    const endRange = dayjs(date).endOf('month').add(7, 'day').toISOString();
    const profId = isProfessional && user ? user.userId : (selectedProfessionalId || undefined);

    fetchAppointmentsByRange(startRange, endRange, profId);
  };

  useEffect(() => {
    loadAppointments();
  }, [date, view, selectedProfessionalId,user]);//eslint-disable-line

  // Mapear turnos backend a eventos de react-big-calendar
  const events: CalendarEvent[] = appointments.map(app => ({
    id: app.appointmentId,
    title: `${app.patientName || 'Paciente'} - ${app.service}${app.professionalName ? ` (Dr. ${app.professionalName})` : ''}`,
    start: new Date(app.startTime),
    end: new Date(app.endTime),
    resource: app
  }));

  // Crear turno al hacer clic en un slot libre
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedAppointment(null);
    setSelectedSlot({ start, end });
    setIsModalOpen(true);
  };

  // Seleccionar turno existente para ver/editar/cancelar
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedSlot(null);
    setSelectedAppointment(event.resource);
    setIsModalOpen(true);
  };

  // Estilos según el estado del turno
  const eventStyleGetter = (event: CalendarEvent) => {
    const app = event.resource;
    let backgroundColor = 'hsl(208, 56%, 44%)';
    let opacity = 1;
    let textDecoration = 'none';

    if (app.status === 'CONFIRMED') {
      backgroundColor = '#2ecc71'; // Verde
    } else if (app.status === 'PENDING') {
      backgroundColor = '#f39c12'; // Amarillo/Naranja
    } else if (app.status === 'COMPLETED') {
      backgroundColor = '#3498db'; // Azul
    } else if (app.status === 'CANCELLED') {
      backgroundColor = '#e74c3c'; // Rojo
      opacity = 0.75;
      textDecoration = 'line-through';
    }

    return {
      style: {
        backgroundColor,
        opacity,
        textDecoration,
        borderRadius: '6px',
        color: '#ffffff',
        border: 'none',
        fontSize: '13px',
        padding: '2px 6px',
        fontWeight: '500'
      }
    };
  };

  const professionals = users.filter(u => u.role === 'PROFESIONAL' || u.role === 'PROPIETARIO');

  // Horario de atención del centro médico (08:00 a 20:00)
  const minTime = dayjs().set('hour', 8).set('minute', 0).toDate();
  const maxTime = dayjs().set('hour', 20).set('minute', 0).toDate();

  return (
    <div style={{ padding: '20px', height: '92vh', boxSizing: 'border-box' }} className="d-flex flex-column">
      <header className="mb-3 d-flex flex-wrap justify-content-between align-items-center bg-white p-3 rounded shadow-sm border">
        <div>
          <h3 className="m-0 text-primary fw-bold">Agenda Médica de Turnos</h3>
          <p className="m-0 text-muted small">
            Franjas de 30 min | Haz clic en un espacio libre para agendar | Haz clic en un turno para gestionar
          </p>
        </div>

        {/* Filtro de Profesional para Secretario / Propietario */}
        {(isSecretary || isOwner) && (
          <div className="d-flex align-items-center gap-2">
            <label className="fw-bold mb-0 text-secondary">Filtrar Agenda por Profesional:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: '250px' }}
              value={selectedProfessionalId || ''}
              onChange={e => setSelectedProfessionalId(e.target.value || null)}
            >
              <option value="">-- Ver Todos / Agenda General --</option>
              {professionals.map(prof => (
                <option key={prof.userId} value={prof.userId}>
                  {prof.userName} ({prof.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Calendario React Big Calendar */}
      <div className="bg-white p-3 rounded shadow-sm border flex-grow-1">
        <Calendar
          localizer={localizer}
          events={events}
          messages={messages}
          date={date}
          onNavigate={setDate}
          view={view}
          onView={setView}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          step={30}
          timeslots={1}
          min={minTime}
          max={maxTime}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%' }}
        />
      </div>

      {/* Modal de Agendamiento / Gestión de Turno */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialStart={selectedSlot?.start}
        initialEnd={selectedSlot?.end}
        existingAppointment={selectedAppointment}
        onSuccess={loadAppointments}
      />
    </div>
  );
}