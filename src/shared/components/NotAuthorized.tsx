import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotAuthorized = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="vh-100 d-flex flex-column justify-content-center align-items-center meraki-back-color px-3">
            <div className="card border-0 shadow-sm p-4 p-md-5 text-center" style={{ maxWidth: '500px', width: '100%', borderRadius: '15px' }}>
                <div className="mb-4 text-danger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-shield-lock-fill" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5z"/>
                    </svg>
                </div>
                <h1 className="h2 fw-bold text-dark mb-3">No autorizado</h1>
                <h3 className="h5 text-secondary mb-3">
                    No tiene autorización para acceder a este recurso o su sesión ha expirado.
                </h3>
                <p className="text-muted mb-0">
                    Será redirigido al inicio de sesión en unos segundos...
                </p>
            </div>
        </div>
    );
};

export default NotAuthorized;