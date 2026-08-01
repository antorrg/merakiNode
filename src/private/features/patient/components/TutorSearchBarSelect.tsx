import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { adminApi } from '../../../../shared/api/api';
import { IPatient } from '../../../../types';

interface ApiResponse<T> {
  data: T;
}

interface TutorSearchBarSelectProps {
  onAddGuardian: (patient: IPatient, relationshipType: string, isPrimaryContact: boolean) => void;
  onOpenQuickModal: (initialQuery?: string) => void;
  alreadySelectedIds?: string[];
  excludePatientId?: string;
}

const TutorSearchBarSelect: React.FC<TutorSearchBarSelectProps> = ({
  onAddGuardian,
  onOpenQuickModal,
  alreadySelectedIds = [],
  excludePatientId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<IPatient[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [relationshipType, setRelationshipType] = useState('Padre');
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg(null);
    setSelectedPatientId('');

    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await adminApi.execute<ApiResponse<IPatient[]>>({
        request: { channel: 'patient:getAll', payload: { page: 1, limit: 20, search: searchTerm.trim() } }
      });

      if (response && response.data) {
        const filtered = response.data.filter(p => !excludePatientId || p.patientId !== excludePatientId);
        setResults(filtered);
      } else {
        setResults([]);
      }
      setHasSearched(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al buscar tutores');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg(null);
    if (!selectedPatientId) {
      setErrorMsg('Debe seleccionar un tutor de los resultados.');
      return;
    }

    if (alreadySelectedIds.includes(selectedPatientId)) {
      setErrorMsg('Este tutor ya se encuentra agregado en la lista.');
      return;
    }

    const selected = results.find(p => p.patientId === selectedPatientId);
    if (!selected) {
      setErrorMsg('Paciente no encontrado.');
      return;
    }

    onAddGuardian(selected, relationshipType, isPrimaryContact);
    setSelectedPatientId('');
  };

  return (
    <div className="p-3 border rounded bg-light mb-3">
      <p className="text-muted small mb-2">
        Busque un adulto por nombre o N° de documento para vincularlo como tutor:
      </p>

      {errorMsg && <Alert variant="danger" className="py-1 px-2 small">{errorMsg}</Alert>}

      <div className="mb-3">
        <Row className="g-2 align-items-center">
          <Col md={9}>
            <Form.Control
              size="sm"
              type="text"
              placeholder="Escriba nombre, apellido o DNI del tutor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value === '') {
                  setHasSearched(false);
                  setResults([]);
                  setSelectedPatientId('');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch(e);
                }
              }}
            />
          </Col>
          <Col md={3}>
            <Button 
              type="button" 
              variant="primary" 
              size="sm" 
              className="w-100" 
              disabled={isSearching}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSearch(e);
              }}
            >
              {isSearching ? <Spinner animation="border" size="sm" /> : 'Buscar Tutor'}
            </Button>
          </Col>
        </Row>
      </div>

      {hasSearched && !isSearching && results.length === 0 && (
        <Alert variant="warning" className="d-flex justify-content-between align-items-center mb-0 py-2">
          <span className="small">
            No se encontró ningún tutor con: <strong>"{searchTerm}"</strong>
          </span>
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={() => onOpenQuickModal(searchTerm)}
          >
            + Crear tutor nuevo
          </Button>
        </Alert>
      )}

      {hasSearched && !isSearching && results.length > 0 && (
        <Row className="align-items-end g-2 mt-1">
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small mb-1">Seleccionar Tutor Encontrado ({results.length})</Form.Label>
              <Form.Select
                size="sm"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">-- Seleccionar adulto --</option>
                {results.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.firstName} {p.lastName} - DNI: {p.identityCode}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small mb-1">Vínculo / Relación</Form.Label>
              <Form.Select
                size="sm"
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value)}
              >
                <option value="Padre">Padre</option>
                <option value="Madre">Madre</option>
                <option value="Tutor Legal">Tutor Legal</option>
                <option value="Familiar">Familiar</option>
                <option value="Otro">Otro</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3} className="d-flex flex-column justify-content-end">
            <Form.Check
              type="checkbox"
              id="isPrimaryContactSelect"
              label="Contacto Principal"
              checked={isPrimaryContact}
              onChange={(e) => setIsPrimaryContact(e.target.checked)}
              className="mb-1 small"
            />
            <Button variant="success" size="sm" onClick={handleAdd}>
              Añadir a la lista
            </Button>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default TutorSearchBarSelect;
