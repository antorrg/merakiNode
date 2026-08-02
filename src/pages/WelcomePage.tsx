import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { useAppointmentStore } from '../private/features/calendar/useAppointmentStore';
import Login from './login/Login';
import { useWorkspaceStore } from '../private/features/workspace/useWorkspaceStore';
import { WelcomeHeaderCard } from './components/WelcomeHeaderCard';
import { WelcomeMetricsCard } from './components/WelcomeMetricsCard';
import { WelcomeStatusCard } from './components/WelcomeStatusCard';

export default function WelcomePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(dayjs());

  const { openPatients } = useWorkspaceStore();
  const { appointments, fetchAppointmentsByRange } = useAppointmentStore();

  // Redirección de navegación: Si el usuario está autenticado y accede a '/', redirigir a '/dashboard'
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const hoy = new Date();
  const fecha = new Intl.DateTimeFormat('es-Ar', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(hoy);

  const greet = user?.userName ? user.userName : user?.nickname || 'Usuario';
  const userRole = user?.role || 'PROFESIONAL';
  const isProfessional = userRole === 'PROFESIONAL';

  // Cargar turnos del día si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const startOfDay = dayjs().startOf('day').toISOString();
      const endOfDay = dayjs().endOf('day').toISOString();
      const profFilter = isProfessional ? user?.userId : undefined;
      fetchAppointmentsByRange(startOfDay, endOfDay, profFilter);
    }
  }, [isAuthenticated, isProfessional, user?.userId, fetchAppointmentsByRange]);

  // Timer para actualizar la hora actual en vivo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar turnos del día
  const todayStr = dayjs().format('YYYY-MM-DD');
  const todayAppointments = appointments.filter(
    (app) => dayjs(app.startTime).format('YYYY-MM-DD') === todayStr
  );

  // Métricas
  const uniquePatientsCount = new Set(todayAppointments.map((app) => app.patientId)).size;
  const totalAppointments = todayAppointments.length;
  const confirmedCount = todayAppointments.filter((app) => app.status === 'CONFIRMED').length;
  const pendingCount = todayAppointments.filter((app) => app.status === 'PENDING').length;
  const completedCount = todayAppointments.filter((app) => app.status === 'COMPLETED').length;

  // Turno actualmente en curso
  const activeTurn = todayAppointments.find((app) => {
    if (app.status === 'CANCELLED') return false;
    const start = dayjs(app.startTime);
    const end = dayjs(app.endTime);
    return currentTime.isAfter(start) && currentTime.isBefore(end);
  });

  // Próximo turno hoy
  const nextTurn = todayAppointments
    .filter((app) => {
      if (app.status === 'CANCELLED' || app.status === 'COMPLETED') return false;
      return dayjs(app.startTime).isAfter(currentTime);
    })
    .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)))[0];

  return (
    <div className="min-vh-100 position-relative meraki-back-color p-4 d-flex flex-column align-items-center justify-content-center">
      {/* CONTENIDO DASHBOARD SI ESTÁ AUTENTICADO */}
      {isAuthenticated && (
        <div className="container" style={{ maxWidth: '1000px', zIndex: 1 }}>
          <div className="row g-4">
            {/* CABECERA Y SALUDO */}
            <WelcomeHeaderCard greet={greet} userRole={userRole} fecha={fecha} />

            {/* METRICAS DE PACIENTES HOY */}
            <WelcomeMetricsCard
              uniquePatientsCount={uniquePatientsCount}
              totalAppointments={totalAppointments}
              confirmedCount={confirmedCount}
              pendingCount={pendingCount}
              completedCount={completedCount}
              isProfessional={isProfessional}
              openPatients={openPatients}
              onGoToWorkspace={() => navigate('/dashboard/patient-workspace')}
              onGoToCalendar={() => navigate('/dashboard/calendar')}
            />

            {/* ESTADO DE TURNOS */}
            <WelcomeStatusCard
              activeTurn={activeTurn}
              nextTurn={nextTurn}
              completedCount={completedCount}
              isProfessional={isProfessional}
              onGoToPatients={() => navigate('/dashboard/patients')}
            />
          </div>
        </div>
      )}

      {/* OVERLAY DE CARGA */}
      {loading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center meraki-back-color">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando sesión...</span>
          </div>
        </div>
      )}

      {/* OVERLAY DE LOGIN SI NO ESTÁ AUTENTICADO */}
      {!isAuthenticated && !loading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex meraki-back-color justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(248, 249, 250, 0.95)', zIndex: 10 }}
        >
          <Login />
        </div>
      )}
    </div>
  );
}