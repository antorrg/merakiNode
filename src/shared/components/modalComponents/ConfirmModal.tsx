import Modal from './Modal'

type ConfirmModalProps = {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}

const ConfirmModal = ({
  isOpen, 
  onCancel, 
  onConfirm, 
  title = "¿Estás seguro?", 
  message = " ¿Deseas continuar?", 
  confirmText = "Sí, continuar", 
  cancelText = "No, volver"
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <h2>{title}</h2>
      <p>{message}</p>
      
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
        <button 
          type="button"
          className="btn btn--secondary" 
          onClick={onCancel}
        >
          {cancelText}
        </button>
        
        <button 
          type="button"
          className="btn" 
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmModal
