

interface DiagnosticsProps { patientId: string; }

const Diagnostics: React.FC<DiagnosticsProps> = ({ patientId }) => {
  console.log(patientId)
        return (
          <div className="bg-white p-4 rounded shadow-sm border border-light">
            <h4 className="mb-4 text-primary">Diagnóstico</h4>
            <div className="p-5 text-center text-muted bg-light border-dashed rounded" style={{ border: '2px dashed #dee2e6' }}>
              <h5 className="text-secondary mb-3">Área preparada para Tiptap</h5>
              <p>Aquí se integrará el editor para documentar el diagnóstico.</p>
            </div>
          </div>
        );
}

export default Diagnostics
