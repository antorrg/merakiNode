export type ToastType = 'info' | 'success' | 'warning' | 'danger';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  color: ToastType;
  delay?: number;
  autohide?: boolean;
}

type Listener = (toasts: ToastMessage[]) => void;

class ToastManager {
  private toasts: ToastMessage[] = [];
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(title: string, message: string, color: ToastType = 'info', delay = 3000, autohide = true) {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts = [...this.toasts, { id, title, message, color, delay, autohide }];
    this.notify();
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  success(message: string, title = 'Éxito') {
    this.show(title, message, 'success');
  }
  createInitUser(message: string, title = 'Éxito') {
    this.show(title, message, 'success', 10000);
  }

  error(message: string, title = 'Error') {
    this.show(title, message, 'danger');
  }

  info(message: string, title = 'Información') {
    this.show(title, message, 'info');
  }

  warning(message: string, title = 'Advertencia') {
    this.show(title, message, 'warning');
  }
}

export const toast = new ToastManager();
