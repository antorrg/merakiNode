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

  const getVariantStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          cardClass: 'bg-success-subtle text-success-emphasis border-start border-4 border-success',
          icon: '✅',
        };
      case 'danger':
        return {
          cardClass: 'bg-danger-subtle text-danger-emphasis border-start border-4 border-danger',
          icon: '❌',
        };
      case 'warning':
        return {
          cardClass: 'bg-warning-subtle text-warning-emphasis border-start border-4 border-warning',
          icon: '⚠️',
        };
      case 'info':
      default:
        return {
          cardClass: 'bg-info-subtle text-info-emphasis border-start border-4 border-info',
          icon: 'ℹ️',
        };
    }
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050, position: 'fixed' }}>
      {toasts.map((t) => {
        const { cardClass, icon } = getVariantStyles(t.color);
        return (
          <Toast 
            key={t.id} 
            delay={t.delay} 
            autohide={t.autohide} 
            onClose={() => toast.remove(t.id)}
            animation={true}
            className={`shadow-sm border-0 mb-2 ${cardClass}`}
            style={{ borderRadius: '8px', minWidth: '280px', maxWidth: '360px' }}
          >
            <div className="d-flex align-items-start p-3">
              <span className="me-2 fs-6">{icon}</span>
              <div className="flex-grow-1 me-2">
                {t.title && <div className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>{t.title}</div>}
                <div style={{ fontSize: '0.85rem', lineHeight: '1.3' }}>{t.message}</div>
              </div>
              <button 
                type="button" 
                className="btn-close ms-auto" 
                aria-label="Close"
                onClick={() => toast.remove(t.id)}
              />
            </div>
          </Toast>
        );
      })}
    </ToastContainer>
  );
};
