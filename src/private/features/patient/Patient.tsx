import { useState } from 'react'
import SuccessModal from '../../../shared/components/modalComponents/SuccessModal';
import FailModal from '../../../shared/components/modalComponents/FailModal';

export default function Patient(){
     const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
     const [isFailOpen, setIsFailOpen] = useState<boolean>(false);
    return(
         <div style={{backgroundColor:'gray'}}>
        <div className="container" >
        <h3>Esta es la pagina de pacientes</h3>
        <button className="btn btn-sm btn-primary me-3" onClick={()=>setIsSuccessOpen(true)}>Boton</button>
        <button className="btn btn-sm btn-primary" onClick={()=>setIsFailOpen(true)}>Boton2</button>
        </div>
        <SuccessModal
            isOpen={isSuccessOpen}
            onAccept={() => setIsSuccessOpen(false)}
            title="Propietario Creado"
            message="El usuario propietario ha sido creado. Revisa el archivo 'meraki-propietario.txt' en el directorio de la aplicación para ver tu contraseña generada."
            buttonText="Entendido"
        />
        <FailModal
            isOpen={isFailOpen}
            onAccept={() => setIsFailOpen(false)}
            title="Propietario Creado"
            message="El usuario propietario ha sido creado. Revisa el archivo 'meraki-propietario.txt' en el directorio de la aplicación para ver tu contraseña generada."
            buttonText="Entendido"
        />
        </div>
    )
}