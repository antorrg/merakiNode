import React, { useEffect } from 'react';
import { playSoftChime } from '../utils/audioNotifier';
import { toast } from './toast/toastManager';

export interface AppointmentNotificationData {
  type: 'START' | 'END';
  appointmentId: string;
  patientName: string;
  service: string;
  startTime: string;
  endTime: string;
  title: string;
  body: string;
}

export const NotificationListener: React.FC = () => {
  useEffect(() => {
    // Comprobar si el puente IPC está disponible en el entorno window
    const api = (window as unknown as { api?: { on: (channel: string, callback: (data: AppointmentNotificationData) => void) => () => void } }).api;
    
    if (!api || typeof api.on !== 'function') return;

    const unsubscribe = api.on('appointment:notification', (data: AppointmentNotificationData) => {
      const isStart = data.type === 'START';

      // 1. Reproducir sonido suave
      playSoftChime(isStart);

      // 2. Mostrar toast en la interfaz de React (persistente hasta descartar)
      toast.show(
        data.title || (isStart ? '🟢 Turno Iniciado' : '🔴 Turno Finalizado'),
        data.body || `Turno de ${data.service} (${data.patientName})`,
        isStart ? 'success' : 'info',
        0,
        false
      );
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return null;
};
