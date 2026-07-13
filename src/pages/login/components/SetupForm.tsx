import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { createValidator, ErrorCreateValue, InputCreateValue } from '../Validator';

interface SetupFormProps {
    onSuccess: () => void;
    closeLogin: () => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ onSuccess, closeLogin }) => {
    const { createOwner } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [setupInput, setSetupInput] = useState<InputCreateValue>({
        email: '',
        username: ''
    });
    const [errors, setErrors] = useState<ErrorCreateValue>({});

    const handleSetupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newInput = { ...setupInput, [name]: value };
        setSetupInput(newInput);

        // Validación híbrida: solo validamos onChange si ya existía un error previo
        if (errors[name as keyof ErrorCreateValue]) {
            const validationErrors = createValidator(newInput);
            setErrors(prev => ({ ...prev, [name]: validationErrors?.[name as keyof ErrorCreateValue] }));
        }
    };

    const handleSetupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación al hacer submit
        const validationErrors = createValidator(setupInput);
        if (validationErrors && Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        try {
            await createOwner(setupInput);
            setSetupInput({ email: '', username: '' });
            onSuccess();
        } catch (error) {
            console.error("Error al crear propietario", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isSetupDisabled = (!setupInput.email.trim() || !setupInput.username.trim());

    return (
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
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                    value={setupInput.email} 
                    onChange={handleSetupChange} 
                    placeholder="name@example.com"
                />
                <label>Correo del propietario</label>
                {errors.email && <div className="invalid-feedback text-start">{errors.email}</div>}
            </div>

            <div className="form-floating mb-3">
                <input 
                    type="text" 
                    name='username' 
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`} 
                    value={setupInput.username} 
                    onChange={handleSetupChange} 
                    placeholder="Nombre de usuario"
                />
                <label>Nombre de usuario</label>
                {errors.username && <div className="invalid-feedback text-start">{errors.username}</div>}
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
    );
};

export default SetupForm;
