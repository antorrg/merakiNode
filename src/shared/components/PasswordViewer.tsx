import { EyeClosed, EyeOpen } from "./icons/index"
type PasswordViewerProps ={
    showPassword:boolean,
    setShowPassword: ()=> void
}

const PasswordViewer = ({showPassword, setShowPassword}:PasswordViewerProps ) => {
  return (
                   <button
                    type="button"
                    className="btn p-0 border-0 bg-transparent text-secondary position-absolute end-0 top-0 d-flex align-items-center justify-content-center me-3"
                    style={{
                        height: '100%',
                        width: '24px',
                        zIndex: 5,
                        cursor: 'pointer',
                        boxShadow: 'none'
                    }}
                    onClick={setShowPassword}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                    {showPassword ? (
                        <EyeOpen size={18}/>
                    ) : (
                        <EyeClosed size={18}/>
                    )}
                </button>
  )
}

export default PasswordViewer
