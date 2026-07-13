import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SuccessModal from '../../shared/components/modalComponents/SuccessModal';
import SetupForm from './components/SetupForm';
import LoginForm from './components/LoginForm';

const Login = () => {
    const { hasOwner, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    // Si ya está autenticado, podríamos redirigirlo al dashboard
    if (isAuthenticated) {
        navigate('/dashboard'); // Descomentar si deseas auto-redirección
    }

    const closeLogin = () => {
        navigate('/dashboard');
    };
    
    return (
        <div className="container w-50 mt-3">
            <main className="form-signin w-100 m-auto rounded-2 shadow">
                
                {/* Mientras verificamos si hay dueño o no, podríamos mostrar un loader */}
                {hasOwner === null ? (
                    <div className="text-center p-5 border rounded-2" style={{ borderColor: '#ccc' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : hasOwner === false ? (
                    /* FORMULARIO DE CONFIGURACIÓN INICIAL (PROPIETARIO) */
                    <SetupForm onSuccess={() => setIsSuccessOpen(true)} closeLogin={closeLogin} />
                ) : (
                    /* FORMULARIO NORMAL DE LOGIN */
                    <LoginForm closeLogin={closeLogin} />
                )}
            </main>

            <SuccessModal
                isOpen={isSuccessOpen}
                onAccept={() => setIsSuccessOpen(false)}
                title="Propietario Creado"
                message="El usuario propietario ha sido creado. Revisa el archivo 'meraki-propietario.txt' en el directorio de la aplicación para ver tu contraseña generada."
                buttonText="Entendido"
            />
        </div>
    );
};

export default Login;
