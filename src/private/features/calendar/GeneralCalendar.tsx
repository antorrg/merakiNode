
import { Calendar, dayjsLocalizer, Views, type View } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import dayjs from 'dayjs'
import es from 'dayjs/locale/es'
import { useState } from 'react'
import { messages } from './translates'

dayjs.locale(es)
const localizer = dayjsLocalizer(dayjs)

interface Appointment {
  id: number
  title: string
  patientName: string
  service: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  start: Date
  end: Date
}

// Citas de ejemplo (cada una de 30 min)
const initialEvents: Appointment[] = [
  {
    id: 1,
    title: 'Juan Pérez - Consulta General',
    patientName: 'Juan Pérez',
    service: 'Consulta General',
    status: 'confirmed',
    start: dayjs('2026-07-28T09:00:00').toDate(),
    end: dayjs('2026-07-28T09:30:00').toDate(),
  },
  {
    id: 2,
    title: 'María González - Control',
    patientName: 'María González',
    service: 'Control Pediatría',
    status: 'pending',
    start: dayjs('2026-07-28T09:30:00').toDate(),
    end: dayjs('2026-07-28T10:00:00').toDate(),
  },
  {
    id: 3,
    title: 'Carlos Silva - Chequeo',
    patientName: 'Carlos Silva',
    service: 'Chequeo Preventivo',
    status: 'completed',
    start: dayjs('2026-07-28T10:30:00').toDate(),
    end: dayjs('2026-07-28T11:00:00').toDate(),
  },
]

export default function GeneralCalendar (){
  const [events, setEvents] = useState<Appointment[]>(initialEvents)
  const [date, setDate] = useState<Date>(new Date('2026-07-28'))
  const [view, setView] = useState<View>(Views.WEEK)

  // Crear turno al hacer clic en un intervalo de 30 minutos
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const name = window.prompt('Nombre del Paciente:')
    if (!name) return

    const service = window.prompt('Motivo / Servicio:', 'Consulta') || 'Consulta'

    const newAppointment: Appointment = {
      id: Date.now(),
      title: `${name} - ${service}`,
      patientName: name,
      service: service,
      status: 'confirmed',
      start,
      end,
    }

    setEvents((prev) => [...prev, newAppointment])
  }

  // Ver detalles o cancelar turno al hacer clic en una cita
  const handleSelectEvent = (event: Appointment) => {
    const confirmDelete = window.confirm(
      `Turno de ${event.patientName} (${event.service})\n¿Deseas cancelar esta cita?`
    )
    if (confirmDelete) {
      setEvents((prev) => prev.filter((item) => item.id !== event.id))
    }
  }

  // Estilos visuales según el estado de la cita
  const eventStyleGetter = (event: Appointment) => {
    let backgroundColor = '#3174ad'
    if (event.status === 'confirmed') backgroundColor = '#10b981' // Verde
    if (event.status === 'pending') backgroundColor = '#f59e0b' // Amarillo
    if (event.status === 'completed') backgroundColor = '#3b82f6' // Azul

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        color: 'white',
        border: 'none',
        fontSize: '13px',
        padding: '2px 6px',
      },
    }
  }

  // Horario de atención del centro médico (08:00 a 20:00)
  const minTime = dayjs().set('hour', 8).set('minute', 0).toDate()
  const maxTime = dayjs().set('hour', 20).set('minute', 0).toDate()

  return (
    <div style={{ padding: '20px', height: '95vh', boxSizing: 'border-box' }}>
      <header style={{ marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>Meraki - Gestión de Agenda Médica</h2>
        <p style={{ margin: '4px 0', color: '#666' }}>
          Franjas de 30 min | Haz clic en un espacio libre para agendar | Haz clic en un turno para gestionar
        </p>
      </header>

      <Calendar
        localizer={localizer}
        events={events}
        messages={messages}
        date={date}
        onNavigate={setDate}
        view={view}
        onView={setView}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        // Configuración para turnos de 30 minutos
        step={30}
        timeslots={1}
        min={minTime}
        max={maxTime}
        // Interacciones
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        style={{ height: 'calc(100% - 75px)' }}
      />
    </div>
  )
}


// const GeneralCalendar = () => {
//   return (
//    <div className="bg-white p-4 rounded shadow-sm border border-light">
//       <h4 className="mb-4 text-primary">Calendario de sesiones</h4>
//        <div className="p-5 text-center text-muted bg-light rounded border">
//           <h5 className="text-secondary">Sin Entradas Previas</h5>
//           <p>Este calendario aun no ha sido implementado.</p>
//         </div>
//     </div>
//   )
// }

// export default GeneralCalendar