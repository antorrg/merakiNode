import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { loginValidator, ErrorLoginValue, InputLoginValue } from '../Validator';

interface LoginFormProps {
    closeLogin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ closeLogin }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    const [loginInput, setLoginInput] = useState<InputLoginValue>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<ErrorLoginValue>({});

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newInput = { ...loginInput, [name]: value };
        setLoginInput(newInput);

        // Validación híbrida: limpiamos el error en vivo si ya lo corrigió
        if (errors[name as keyof ErrorLoginValue]) {
            const validationErrors = loginValidator(newInput);
            setErrors(prev => ({ ...prev, [name]: validationErrors?.[name as keyof ErrorLoginValue] }));
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación al hacer submit
        const validationErrors = loginValidator(loginInput);
        if (validationErrors && Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        try {
            await login(loginInput);
            navigate('/dashboard');
        } catch (error) {
            console.error("Error al iniciar sesión", error);
        } finally {
            setIsLoading(false);
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    const isLoginDisabled = (!loginInput.email.trim() || !loginInput.password.trim());

    return (
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
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                    value={loginInput.email} 
                    onChange={handleLoginChange} 
                    placeholder="name@example.com"
                />
                <label>Correo electrónico</label>
                {errors.email && <div className="invalid-feedback text-start">{errors.email}</div>}
            </div>

            <div className="form-floating mb-3 position-relative">
                <input 
                    type={showPassword ? "text" : "password"} 
                    name='password' 
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                    value={loginInput.password} 
                    onChange={handleLoginChange} 
                    placeholder="Contraseña"
                    style={{
                        paddingRight: '2.75rem',
                        ...(errors.password ? { backgroundImage: 'none' } : {})
                    }}
                />
                <label>Contraseña</label>
                <button
                    type="button"
                    className="btn p-0 border-0 bg-transparent text-secondary position-absolute end-0 top-0 d-flex align-items-center justify-content-center me-3"
                    style={{
                        height: '58px',
                        width: '24px',
                        zIndex: 5,
                        cursor: 'pointer',
                        boxShadow: 'none'
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.53 3.53 0 0 1-1.676.203c-.434-.057-.84-.216-1.198-.456l.822-.822a2.49 2.49 0 0 0 1.23.253z"/>
                            <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8c.058.087.122.183.195.288.335.48.83 1.12 1.465 1.755C4.12 11.332 5.88 12.5 8 12.5c.968 0 1.884-.242 2.705-.658l1.472 1.472A8.995 8.995 0 0 1 8 13.5C3 13.5 0 8 0 8s1.656-3.037 4.243-4.757z"/>
                            <path d="M13.646 14.354l-12-12 .708-.708 12 12z"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                        </svg>
                    )}
                </button>
                {errors.password && <div className="invalid-feedback text-start">{errors.password}</div>}
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
    );
};

export default LoginForm;
