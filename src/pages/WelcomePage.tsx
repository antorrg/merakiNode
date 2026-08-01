import {useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from './login/Login';


export default function WelcomePage() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate()


    useEffect(()=>{
        if(isAuthenticated){
            navigate('/dashboard')
        }else{
            navigate('/')
        }
    },[isAuthenticated, navigate])



    return (
        <div className="vh-100 position-relative meraki-back-color d-flex flex-column align-items-center justify-content-center">
              <div className="bg-white p-4 rounded shadow-sm border border-light">
       <div className="p-5 text-center text-muted bg-light rounded border">
            {/* FONDO / CONTENIDO POR DEFECTO DEL PANEL ADMIN */}
            <div className="text-center" style={{ zIndex: 1 }}>
                <h1 className="display-4 fw-bold text-primary mb-3">Meraki Centro Integral</h1>
                <h3 className="h5 text-secondary">Bienvenido a la plataforma de administración</h3>
                {isAuthenticated && (
                   <p className="mt-4 text-success">¡Sesión iniciada correctamente!</p>
                )}
            </div>
            </div>
            </div>

            {/* OVERLAY DE CARGA (HYDRATION) */}
            {loading && (
                <div 
                   className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center meraki-back-color"
                //    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 10 }}
                >
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Cargando sesión...</span>
                    </div>
                </div>
            )}

            {/* OVERLAY DE LOGIN / REGISTRO SI NO ESTÁ AUTENTICADO */}
            {!isAuthenticated && !loading && (
                <div 
                   className="position-absolute top-0 start-0 w-100 h-100 d-flex meraki-back-color justify-content-center align-items-center"
                   style={{ backgroundColor: 'rgba(248, 249, 250, 0.95)', zIndex: 10 }} // bg-light con opacidad
                >
                    <Login />
                </div>
            )}
            
        </div>
    );
}