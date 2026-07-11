import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import style from './modal.module.css'

type ModalProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
  isOpen: boolean
  onClose: () => void
  styles?: {
    overlay?: string
    modalCard?: string
  }
}

const Modal = ({ children, isOpen, onClose, styles }: ModalProps) => {
  // Evitar que el fondo (body) haga scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className={[style.overlay, styles?.overlay].filter(Boolean).join(' ')} onClick={onClose}>
      <div className={[style.modalCard, styles?.modalCard].filter(Boolean).join(' ')} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Modal