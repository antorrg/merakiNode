import Modal from './Modal'

type SuccessModalProps = {
  isOpen: boolean
  onAccept: () => void
  title?: string
  message?: string
  buttonText?: string
}

const SuccessModal = ({
  isOpen, 
  onAccept, 
  title = "¡Éxito!", 
  message = "La operación se realizó con éxito.", 
  buttonText = "Aceptar"
}: SuccessModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onAccept}>
      <h2>{title}</h2>
      <p>{message}</p>
      <button 
        className="btn btn-sm btn-success" 
        onClick={onAccept}
        style={{ marginTop: '20px' }}
      >
        {buttonText}
      </button>
    </Modal>
  )
}

export default SuccessModal
