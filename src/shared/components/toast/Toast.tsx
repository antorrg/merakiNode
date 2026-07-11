import { ToastContainer } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';

export type ToastAppProp = {
 title?: string| undefined
 message?: string | undefined
 color?: string |undefined
 delay?:number |undefined
 autohide?: boolean |undefined
}

const ToastApp = ({
  title ='Mensaje',
  message = 'Mensaje por defecto',
  color='info',
  delay= 3000,
  autohide= true
}: ToastAppProp) => {
  return (
    <ToastContainer position='top-end'>
    <Toast bg={color} animation={true} delay={delay} autohide={autohide}>
      <Toast.Header>
        <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
        <strong className="me-auto">{title}</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
    </ToastContainer>
  )
}
export default ToastApp

