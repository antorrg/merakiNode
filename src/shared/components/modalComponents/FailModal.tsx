import Modal from './Modal'

type FailodalProps = {
  isOpen: boolean
  onAccept: () => void
  title?: string
  message?: string
  buttonText?: string
}

const FailModal = ({
  isOpen, 
  onAccept, 
  title = "¡Érror!", 
  message = "La operación no se pudo realizar.", 
  buttonText = "Aceptar"
}: FailodalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onAccept}>
      <h2>{title}</h2>
      <p>{message}</p>
      <button 
        className="btn btn-sm btn-danger" 
        onClick={onAccept}
        style={{ marginTop: '20px' }}
      >
        {buttonText}
      </button>
    </Modal>
  )
}

export default FailModal
