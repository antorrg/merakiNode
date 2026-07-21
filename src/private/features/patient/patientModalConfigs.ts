export type PatientActionType = 'CREATE' | 'UPDATE' | 'DELETE' | null;

export const patientModalConfigs = {
  DELETE: {
    title: 'Borrar paciente',
    message: 'El paciente seleccionado será eliminado lógicamente (se mantendrá su historial para auditoría pero no aparecerá en las listas regulares). ¿Desea continuar?',
    confirmText: 'Sí, borrar',
    cancelText: 'Cancelar'
  },
  CREATE: {
    title: 'Registrar paciente',
    message: '¿Está seguro de que desea registrar este nuevo paciente en el sistema?',
    confirmText: 'Sí, registrar',
    cancelText: 'Revisar datos'
  },
  UPDATE: {
    title: 'Actualizar contacto',
    message: '¿Está seguro de que desea actualizar los datos de contacto del paciente?',
    confirmText: 'Sí, actualizar',
    cancelText: 'Cancelar'
  }
};
