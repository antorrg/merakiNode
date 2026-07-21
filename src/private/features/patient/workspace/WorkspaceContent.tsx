import React from 'react';
import { IPatient } from '../../../../shared/types';
import { WorkspaceSection } from './useWorkspaceStore';
import PatientHeader from './components/PatientHeader';
import Histories from '../../history/Histories'
import HistoryEntry from '../../history/HistoryEntry';
import Treatments from '../../treatments/Treatments';
import Diagnostics from '../../diagnostic/Diagnostics';
import Patient from '../Patient'

interface ContentProps {
  patient: IPatient;
  activeSection: WorkspaceSection;
}

const WorkspaceContent: React.FC<ContentProps> = ({ patient, activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'patient':
        return <Patient patientId={patient.patientId} />
      case 'new-entry':
      return <HistoryEntry patientId={patient.patientId} />
      case 'history':
        return <Histories patientId={patient.patientId} />
      case 'treatments':
        return <Treatments patientId={patient.patientId} />
      case 'diagnostic':
        return <Diagnostics patientId={patient.patientId} />
      default:
        return <div>Seleccione una sección</div>;
    }
  };

  return (
    <div className="fade-in d-flex flex-column gap-3 pb-5">
      <PatientHeader info={patient}/>
      {renderContent()}
    </div>
  );
};

export default WorkspaceContent;
