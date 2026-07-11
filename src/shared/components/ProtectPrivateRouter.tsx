import {Navigate }from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'



interface ProtectedPrivateRouterProps {
    children: React.ReactNode
}

const ProtectedPrivateRouter = ({children}: ProtectedPrivateRouterProps) => {
    const {isAuthenticated, loading, isLoggingOut} = useAuth()
    if(loading){
        return <div>Cargando...</div>
    }
    if(!isAuthenticated && !isLoggingOut){
        return <Navigate to='/not-authorized' replace/>
    }
    return(
    <>
    {children}
    </>
    )
}

export default ProtectedPrivateRouter