import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { PatientActionType } from '../patientModalConfigs';
import { usePatientStore } from '../usePatientStore';

interface PatientCreateProps {
  onHide: () => void;
  onRequestConfirm: (action: PatientActionType, data: any) => void;
}

const PatientCreate: React.FC<PatientCreateProps> = ({ onHide, onRequestConfirm }) => {
  const { patients } = usePatientStore(); // Usamos los pacientes cacheados para seleccionar tutor
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

  const [hasGuardian, setHasGuardian] = useState(false);
  const [guardianData, setGuardianData] = useState({
    guardianId: '',
    relationshipType: 'Padre/Madre',
    isPrimaryContact: true
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardianChange = (e: any) => {
    setGuardianData({ ...guardianData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construimos el array de guardians como lo espera el backend
    const guardiansPayload = [];
    if (hasGuardian && guardianData.guardianId) {
      const selectedGuardian = patients.find(p => p.patientId === guardianData.guardianId);
      if (selectedGuardian) {
        guardiansPayload.push({
          relationshipType: guardianData.relationshipType,
          isPrimaryContact: guardianData.isPrimaryContact,
          guardian: selectedGuardian
        });
      }
    }

    const payload = {
      ...formData,
      guardians: guardiansPayload
    };

    onRequestConfirm('CREATE', payload);
  };

  return (
    <Form onSubmit={handleSubmit}>
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
            <Form.Control type="text" name="identityCode" value={formData.identityCode} onChange={handleChange} required />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha Nacimiento (DD/MM/YYYY)</Form.Label>
            <Form.Control type="text" name="birthDate" placeholder="Ej: 15/08/1990" value={formData.birthDate} onChange={handleChange} required />
            <Form.Text className="text-muted">Requerido. Si es menor de 18 años, debe asignar un tutor.</Form.Text>
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
      
      <Form.Group className="mb-3" controlId="hasGuardianCheckbox">
        <Form.Check 
          type="checkbox" 
          label="Añadir Tutor / Responsable (Obligatorio para menores o pacientes con discapacidad)" 
          checked={hasGuardian}
          onChange={(e) => setHasGuardian(e.target.checked)}
        />
      </Form.Group>

      {hasGuardian && (
        <div className="p-3 border rounded bg-light mb-4">
          <p className="text-muted small mb-3">
            Nota: El adulto responsable debe estar registrado previamente como paciente en el sistema. 
            Si no lo está, regístrelo primero.
          </p>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Seleccionar Tutor</Form.Label>
                <Form.Select name="guardianId" value={guardianData.guardianId} onChange={handleGuardianChange} required={hasGuardian}>
                  <option value="">-- Seleccione un adulto --</option>
                  {patients.map(p => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.firstName} {p.lastName} - {p.identityCode}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vínculo</Form.Label>
                <Form.Select name="relationshipType" value={guardianData.relationshipType} onChange={handleGuardianChange}>
                  <option value="Padre/Madre">Padre/Madre</option>
                  <option value="Tutor Legal">Tutor Legal</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" type="submit">Guardar y Confirmar</Button>
      </div>
    </Form>
  );
};

export default PatientCreate;
