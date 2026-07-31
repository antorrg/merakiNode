import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import { PatientActionType } from '../patientModalConfigs';
import { usePatientStore } from '../usePatientStore';
import { Guardian, IPatient } from '../../../../types';
import QuickGuardianModal from '../modals/QuickGuardianModal';
import TutorSearchBarSelect from '../components/TutorSearchBarSelect';
import { normalizeDateInput, validateAndParseBirthDate } from '../../../../shared/utils/dateUtils';

interface PatientUpdateProps {
  patientId: string;
  onHide: () => void;
  onRequestConfirm: (action: PatientActionType, data: any) => void;//eslint-disable-line
}

const PatientUpdate: React.FC<PatientUpdateProps> = ({ patientId, onHide, onRequestConfirm }) => {
  const { patients, patientDetail } = usePatientStore();
  const patient = patientDetail?.patientId === patientId ? patientDetail : patients.find(p => p.patientId === patientId);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    typeDoc: 'DNI',
    identityCode: '',
    birthDate: '',
    email: '',
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
      isPrimary: isPrimaryContact || guardians.length === 0
    };

    setGuardians([...updatedGuardians, guardianToAdd]);
  };

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        typeDoc: patient.typeDoc || 'DNI',
        identityCode: patient.identityCode || '',
        birthDate: patient.birthDate || '',
        email: patient.ownEmail !== undefined ? (patient.ownEmail || '') : '',
        phone: patient.ownPhone !== undefined ? (patient.ownPhone || '') : '',
        address: patient.address || '',
        city: patient.city || '',
        postalCode: patient.postalCode || ''
      });

      if (patient.guardians && Array.isArray(patient.guardians)) {
        setGuardians([...patient.guardians]);
      } else {
        setGuardians([]);
      }
    }
  }, [patient]);

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

    const currentAge = dateResult.age !== null ? dateResult.age : 99;
    const isMinor = currentAge < 18;

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

    const payload = {
      patientId,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      typeDoc: formData.typeDoc,
      identityCode: formData.identityCode.trim(),
      birthDate: dateResult.normalizedDate,
      email: formData.email.trim() || null,
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      postalCode: formData.postalCode.trim(),
      guardians: guardians.map(g => ({
        relationId: g.relationId,
        guardianId: g.guardianId,
        relationshipType: g.relationship,
        isPrimaryContact: g.isPrimary
      }))
    };

    onRequestConfirm('UPDATE', payload);
  };

  const computedAge = dateValidation.age !== null ? dateValidation.age : 99;

  return (
    <Form onSubmit={handleSubmit}>
      {errorMsg && <Alert variant="danger" onClose={() => setErrorMsg(null)} dismissible>{errorMsg}</Alert>}

      <h6 className="fw-bold text-secondary mb-3">Datos Identificatorios</h6>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre(s)</Form.Label>
            <Form.Control 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Apellido(s)</Form.Label>
            <Form.Control 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              required 
            />
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
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Documento</Form.Label>
            <Form.Control 
              type="text" 
              name="identityCode" 
              value={formData.identityCode} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
        </Col>
        <Col md={4}>
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
          </Form.Group>
        </Col>
      </Row>

      <h6 className="fw-bold text-secondary mb-3 mt-2">Datos de Contacto y Ubicación</h6>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="Ej: 1122334455"
              required={computedAge >= 18} 
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Ciudad</Form.Label>
            <Form.Control 
              type="text" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Código Postal</Form.Label>
            <Form.Control 
              type="text" 
              name="postalCode" 
              value={formData.postalCode} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
        </Col>
      </Row>

      <hr className="my-4" />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="fw-bold text-secondary mb-0">Tutores y Responsables ({guardians.length})</h6>
          <small className="text-muted">Puede agregar 1 o más tutores o remover los existentes.</small>
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
          excludePatientId={patientId}
        />
      )}

      {guardians.length > 0 ? (
        <Table striped bordered hover size="sm" className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Relación</th>
              <th>Teléfono</th>
              <th>Contacto Principal</th>
              <th className="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {guardians.map((g, idx) => (
              <tr key={g.relationId || g.guardianId || idx}>
                <td>{g.name}</td>
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
        <p className="text-muted small italic">No hay tutores o responsables asignados.</p>
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

export default PatientUpdate;
