import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { loginValidator, ErrorLoginValue, InputLoginValue } from '../Validator';
import PasswordViewer from '../../../shared/components/PasswordViewer';

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
                <PasswordViewer showPassword={showPassword} setShowPassword={()=>setShowPassword(!showPassword)}/>
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
