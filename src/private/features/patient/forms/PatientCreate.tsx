import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import { PatientActionType } from '../patientModalConfigs';
import { Guardian, IPatient } from '../../../../types';
import QuickGuardianModal from '../modals/QuickGuardianModal';
import TutorSearchBarSelect from '../components/TutorSearchBarSelect';
import { normalizeDateInput, validateAndParseBirthDate } from '../../../../shared/utils/dateUtils';

import { usePatientStore } from '../usePatientStore';

interface PatientCreateProps {
  onHide: () => void;
  onRequestConfirm: (action: PatientActionType, data: any) => void;
}

const PatientCreate: React.FC<PatientCreateProps> = ({ onHide, onRequestConfirm }) => {
  const { getPatientByIdentityCode } = usePatientStore();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    typeDoc: 'DNI',
    identityCode: '',
    birthDate: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [showAddGuardian, setShowAddGuardian] = useState(false);
  const [showQuickGuardianModal, setShowQuickGuardianModal] = useState(false);
  const [quickModalSearchQuery, setQuickModalSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [existingTutor, setExistingTutor] = useState<IPatient | null>(null);

  const handleIdentityCodeBlur = async () => {
    const code = formData.identityCode.trim();
    if (!code) return;
    try {
      const found = await getPatientByIdentityCode(code);
      if (found) {
        if (found.isPatient) {
          setErrorMsg(`Ya existe un paciente activo registrado con el N° de Documento ${code}.`);
          setExistingTutor(null);
        } else {
          setExistingTutor(found);
          setErrorMsg(null);
        }
      } else {
        setExistingTutor(null);
      }
    } catch {
      setExistingTutor(null);
    }
  };

  const handleQuickGuardianCreated = (newGuardian: Guardian) => {
    setGuardians(prev => {
      let updated = [...prev];
      if (newGuardian.isPrimary) {
        updated = updated.map(g => ({ ...g, isPrimary: false }));
      }
      return [...updated, newGuardian];
    });
  };

  const handleAddGuardianFromSearch = (selectedPatient: IPatient, relationshipType: string, isPrimaryContact: boolean) => {
    setErrorMsg(null);
    let updatedGuardians = [...guardians];
    if (isPrimaryContact) {
      updatedGuardians = updatedGuardians.map(g => ({ ...g, isPrimary: false }));
    }

    const guardianToAdd: Guardian = {
      guardianId: selectedPatient.patientId,
      name: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      phone: selectedPatient.phone || 'Sin teléfono',
      relationship: relationshipType,
      isPrimary: isPrimaryContact || guardians.length === 0,
      isPatient: selectedPatient.isPatient
    };

    setGuardians([...updatedGuardians, guardianToAdd]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
  };

  const handleBirthDateBlur = () => {
    if (formData.birthDate) {
      const normalized = normalizeDateInput(formData.birthDate);
      setFormData(prev => ({ ...prev, birthDate: normalized }));
    }
  };

  const handleRemoveGuardian = (indexToRemove: number) => {
    setErrorMsg(null);
    const updated = guardians.filter((_, idx) => idx !== indexToRemove);
    if (updated.length > 0 && !updated.some(g => g.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setGuardians(updated);
  };

  const dateValidation = validateAndParseBirthDate(formData.birthDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const dateResult = validateAndParseBirthDate(formData.birthDate);
    if (!dateResult.isValid) {
      setErrorMsg(dateResult.errorMessage || 'La fecha de nacimiento no es válida.');
      return;
    }

    const age = dateResult.age !== null ? dateResult.age : 99;
    const isMinor = age < 18;

    if (isMinor) {
      if (guardians.length === 0) {
        setErrorMsg('Un paciente menor de edad debe tener al menos un tutor asignado.');
        return;
      }
      const hasPrimary = guardians.some(g => g.isPrimary);
      if (!hasPrimary) {
        setErrorMsg('Debe designar al menos un tutor como contacto principal.');
        return;
      }
    } else {
      if (!formData.phone || formData.phone.trim() === '') {
        setErrorMsg('Un paciente mayor de edad debe contar con un teléfono de contacto.');
        return;
      }
    }

    const guardiansPayload = guardians.map(g => ({
      relationshipType: g.relationship,
      isPrimaryContact: g.isPrimary,
      guardian: { patientId: g.guardianId }
    }));

    const payload = {
      ...formData,
      birthDate: dateResult.normalizedDate,
      guardians: guardiansPayload
    };

    onRequestConfirm('CREATE', payload);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {errorMsg && <Alert variant="danger" onClose={() => setErrorMsg(null)} dismissible>{errorMsg}</Alert>}

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre(s)</Form.Label>
            <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Apellido(s)</Form.Label>
            <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo Doc.</Form.Label>
            <Form.Select name="typeDoc" value={formData.typeDoc} onChange={handleChange}>
              <option value="DNI">DNI</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Otro">Otro</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label>Documento</Form.Label>
            <Form.Control 
              type="text" 
              name="identityCode" 
              value={formData.identityCode} 
              onChange={handleChange} 
              onBlur={handleIdentityCodeBlur} 
              required 
            />
          </Form.Group>
        </Col>
      </Row>

      {existingTutor && (
        <Alert variant="info" className="d-flex justify-content-between align-items-center py-2 px-3 mb-3">
          <div className="small">
            <i className="bi bi-info-circle-fill me-2"></i>
            <strong>Tutor registrado encontrado:</strong> {existingTutor.firstName} {existingTutor.lastName}. Al guardar se activará como paciente.
          </div>
          <Button 
            variant="outline-info" 
            size="sm"
            type="button"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                firstName: existingTutor.firstName || prev.firstName,
                lastName: existingTutor.lastName || prev.lastName,
                birthDate: existingTutor.birthDate || prev.birthDate,
                phone: existingTutor.ownPhone || existingTutor.phone || prev.phone,
                email: existingTutor.ownEmail || existingTutor.email || prev.email,
                address: existingTutor.address || prev.address,
                city: existingTutor.city || prev.city,
                postalCode: existingTutor.postalCode || prev.postalCode,
              }));
            }}
          >
            Cargar datos del tutor
          </Button>
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha Nacimiento (DD/MM/YYYY)</Form.Label>
            <Form.Control 
              type="text" 
              name="birthDate" 
              placeholder="Ej: 15/08/1990" 
              value={formData.birthDate} 
              onChange={handleChange}
              onBlur={handleBirthDateBlur} 
              required 
            />
            {dateValidation.isValid && dateValidation.age !== null && (
              <Form.Text className="text-success d-block">
                Edad calculada: {dateValidation.age} {dateValidation.age === 1 ? 'año' : 'años'}
              </Form.Text>
            )}
            {!dateValidation.isValid && formData.birthDate.trim() !== '' && (
              <Form.Text className="text-danger d-block">
                {dateValidation.errorMessage}
              </Form.Text>
            )}
            {formData.birthDate.trim() === '' && (
              <Form.Text className="text-muted d-block">Requerido. Si es menor de 18 años, debe asignar al menos un tutor.</Form.Text>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Correo Electrónico</Form.Label>
        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ciudad</Form.Label>
            <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Código Postal</Form.Label>
            <Form.Control type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Dirección</Form.Label>
        <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} required />
      </Form.Group>

      <hr className="my-4" />
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="fw-bold text-secondary mb-0">Tutores y Responsables</h6>
          <small className="text-muted">Obligatorio para menores de 18 años (puede agregar 1 o más tutores)</small>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={() => {
              setQuickModalSearchQuery('');
              setShowQuickGuardianModal(true);
            }}
          >
            + Crear tutor ahora
          </Button>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => setShowAddGuardian(!showAddGuardian)}
          >
            {showAddGuardian ? 'Ocultar panel de búsqueda' : '+ Buscar tutor existente'}
          </Button>
        </div>
      </div>

      {showAddGuardian && (
        <TutorSearchBarSelect 
          onAddGuardian={handleAddGuardianFromSearch}
          onOpenQuickModal={(query) => {
            setQuickModalSearchQuery(query || '');
            setShowQuickGuardianModal(true);
          }}
          alreadySelectedIds={guardians.map(g => g.guardianId || '')}
        />
      )}

      {guardians.length > 0 ? (
        <Table striped bordered hover size="sm" className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Tipo de Registro</th>
              <th>Relación</th>
              <th>Teléfono</th>
              <th>Contacto Principal</th>
              <th className="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {guardians.map((g, idx) => (
              <tr key={g.guardianId || idx}>
                <td>{g.name}</td>
                <td>
                  {g.isPatient !== false ? (
                    <span className="badge bg-info text-dark">Paciente</span>
                  ) : (
                    <span className="badge bg-secondary">Solo Tutor</span>
                  )}
                </td>
                <td>{g.relationship}</td>
                <td>{g.phone}</td>
                <td>
                  {g.isPrimary ? (
                    <span className="badge bg-success">Sí, principal</span>
                  ) : (
                    <span className="badge bg-secondary">Secundario</span>
                  )}
                </td>
                <td className="text-center">
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleRemoveGuardian(idx)}
                  >
                    Quitar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted small italic">No hay tutores asignados a este paciente.</p>
      )}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" type="submit">Guardar y Confirmar</Button>
      </div>

      <QuickGuardianModal 
        show={showQuickGuardianModal} 
        onHide={() => setShowQuickGuardianModal(false)}
        defaultAddress={{
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        }}
        initialSearchQuery={quickModalSearchQuery}
        onGuardianCreated={handleQuickGuardianCreated}
      />
    </Form>
  );
};

export default PatientCreate;
