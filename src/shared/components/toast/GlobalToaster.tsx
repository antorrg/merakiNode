import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';
import { toast, ToastMessage } from './toastManager';

export const GlobalToaster = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return () => { unsubscribe(); };
  }, []);

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
      {toasts.map((t) => (
        <Toast 
          key={t.id} 
          bg={t.color} 
          delay={t.delay} 
          autohide={t.autohide} 
          onClose={() => toast.remove(t.id)}
          animation={true}
        >
          <Toast.Header>
            <strong className="me-auto">{t.title}</strong>
          </Toast.Header>
          <Toast.Body className={t.color === 'info' || t.color === 'warning' ? '' : 'text-white'}>
            {t.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};
