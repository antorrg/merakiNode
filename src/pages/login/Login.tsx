import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SuccessModal from '../../shared/components/modalComponents/SuccessModal';

const Login = () => {
    const { login, createOwner, hasOwner, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    // Si ya está autenticado, podríamos redirigirlo al dashboard
    if (isAuthenticated) {
        navigate('/dashboard'); // Descomentar si deseas auto-redirección
    }

    const closeLogin = () => {
        navigate('/dashboard');
    };

    // Estado para Iniciar Sesión (hasOwner === true)
    const [loginInput, setLoginInput] = useState({
        email: '',
        password: ''
    });

    // Estado para Crear Propietario (hasOwner === false)
    const [setupInput, setSetupInput] = useState({
        email: '',
        username: ''
    });

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginInput(prev => ({ ...prev, [name]: value }));
    };

    const handleSetupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSetupInput(prev => ({ ...prev, [name]: value }));
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(loginInput);
            navigate('/dashboard'); // Restaurado para redirigir al panel admin
        } catch (error) {
            console.error("Error al iniciar sesión", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createOwner(setupInput);
            // Al crearse con éxito, hasOwner pasará a true y se mostrará el form de Login
            setSetupInput({ email: '', username: '' });
            setIsSuccessOpen(true);
        } catch (error) {
            console.error("Error al crear propietario", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isLoginDisabled = (!loginInput.email.trim() || !loginInput.password.trim());
    const isSetupDisabled = (!setupInput.email.trim() || !setupInput.username.trim());
    
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
                <form 
                    onSubmit={handleSetupSubmit}
                    style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}
                >   
                    <div className="d-flex justify-content-between align-items-center"> 
                        <img className="mb-4" src="../vite.svg" alt="" width="40" height="auto"/>
                        <button type="button" onClick={closeLogin} className="btn-close" aria-label="Close"></button>
                    </div>
                    
                    <h1 className="h3 mb-3 fw-normal text-warning">Configuración Inicial</h1>
                    <p className="text-muted small">Por favor, registra el correo y nombre del propietario. La contraseña será generada automáticamente.</p>
                
                    <div className="form-floating mb-2">
                        <input 
                            type="email" 
                            name='email' 
                            className="form-control" 
                            value={setupInput.email} 
                            onChange={handleSetupChange} 
                            placeholder="name@example.com"
                        />
                        <label>Correo del propietario</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input 
                            type="text" 
                            name='username' 
                            className="form-control" 
                            value={setupInput.username} 
                            onChange={handleSetupChange} 
                            placeholder="Nombre de usuario"
                        />
                        <label>Nombre de usuario</label>
                    </div>
                    
                    {!isLoading ? (
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-warning w-100 py-2" type="submit" disabled={isSetupDisabled}>
                                Generar Usuario y Contraseña
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-warning w-100 py-2" type="button" disabled>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creando...
                            </button>
                        </div>
                    )}
                </form>
            ) : (
                /* FORMULARIO NORMAL DE LOGIN */
                <form 
                    onSubmit={handleLoginSubmit}
                    style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}
                >   
                    <div className="d-flex justify-content-between align-items-center"> 
                        <img className="mb-4" src="../vite.svg" alt="" width="40" height="auto"/>
                        <button type="button" onClick={closeLogin} className="btn-close" aria-label="Close"></button>
                    </div>
                    
                    <h1 className="h3 mb-3 fw-normal">Iniciar Sesión</h1>
                
                    <div className="form-floating mb-2">
                        <input 
                            type="email" 
                            name='email' 
                            className="form-control" 
                            value={loginInput.email} 
                            onChange={handleLoginChange} 
                            placeholder="name@example.com"
                        />
                        <label>Correo electrónico</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input 
                            type="password" 
                            name='password' 
                            className="form-control" 
                            value={loginInput.password} 
                            onChange={handleLoginChange} 
                            placeholder="Contraseña"
                        />
                        <label>Contraseña</label>
                    </div>
                    
                    {!isLoading ? (
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-primary w-100 py-2" type="submit" disabled={isLoginDisabled}>
                                Ingresar
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-primary w-100 py-2" type="button" disabled>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Cargando...
                            </button>
                        </div>
                    )}
                </form>
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
