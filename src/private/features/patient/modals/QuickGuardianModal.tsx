import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { usePatientStore } from '../usePatientStore';
import { Guardian } from '../../../../types';
import { validateAndParseBirthDate } from '../../../../shared/utils/dateUtils';

interface DefaultAddress {
  address?: string;
  city?: string;
  postalCode?: string;
}

interface QuickGuardianModalProps {
  show: boolean;
  onHide: () => void;
  defaultAddress?: DefaultAddress;
  initialSearchQuery?: string;
  onGuardianCreated: (guardianInfo: Guardian) => void;
}

const QuickGuardianModal: React.FC<QuickGuardianModalProps> = ({
  show,
  onHide,
  defaultAddress,
  initialSearchQuery,
  onGuardianCreated
}) => {
  const { createPatient } = usePatientStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    typeDoc: 'DNI',
    identityCode: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    relationshipType: 'Padre',
    isPrimaryContact: true
  });

  React.useEffect(() => {
    if (show && initialSearchQuery) {
      const trimmed = initialSearchQuery.trim();
      if (/^\d+$/.test(trimmed)) {
        setFormData(prev => ({ ...prev, identityCode: trimmed }));
      } else if (trimmed) {
        const parts = trimmed.split(' ');
        setFormData(prev => ({
          ...prev,
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || ''
        }));
      }
    }
  }, [show, initialSearchQuery]);

  const [useSameAddress, setUseSameAddress] = useState(false);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData(prev => ({ ...prev, [target.name]: value }));
    setErrorMsg(null);
  };

  const handleToggleSameAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUseSameAddress(checked);
    if (checked && defaultAddress) {
      setFormData(prev => ({
        ...prev,
        address: defaultAddress.address || prev.address,
        city: defaultAddress.city || prev.city,
        postalCode: defaultAddress.postalCode || prev.postalCode
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validar campos requeridos según registerPatientSchema
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMsg('Nombre y Apellido son obligatorios.');
      return;
    }
    if (!formData.identityCode.trim()) {
      setErrorMsg('El número de documento es obligatorio.');
      return;
    }
    if (!formData.birthDate) {
      setErrorMsg('La fecha de nacimiento es obligatoria.');
      return;
    }

    const dateResult = validateAndParseBirthDate(formData.birthDate);
    if (!dateResult.isValid) {
      setErrorMsg(dateResult.errorMessage || 'La fecha de nacimiento no es válida.');
      return;
    }

    if (!formData.address.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      setErrorMsg('La dirección completa (calle, ciudad y código postal) es obligatoria.');
      return;
    }

    try {
      setIsSubmitting(true);

      const createdTutor = await createPatient({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        typeDoc: formData.typeDoc,
        identityCode: formData.identityCode.trim(),
        birthDate: dateResult.normalizedDate,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        guardians: []
      });

      if (createdTutor && createdTutor.patientId) {
        const newGuardian: Guardian = {
          guardianId: createdTutor.patientId,
          name: `${createdTutor.firstName} ${createdTutor.lastName}`,
          phone: createdTutor.phone || 'Sin teléfono',
          relationship: formData.relationshipType,
          isPrimary: formData.isPrimaryContact
        };
        onGuardianCreated(newGuardian);
        onHide();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al registrar el tutor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg" style={{ zIndex: 1060 }}>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="h6 mb-0">+ Registrar Nuevo Tutor / Responsable</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <h6 className="fw-bold text-secondary mb-3">Datos Personales del Tutor</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
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
                <Form.Label>Apellido *</Form.Label>
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
                <Form.Label>Tipo Doc. *</Form.Label>
                <Form.Select name="typeDoc" value={formData.typeDoc} onChange={handleChange}>
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="LE">LE</option>
                  <option value="LC">LC</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>N° Documento *</Form.Label>
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
                <Form.Label>Fecha de Nacimiento *</Form.Label>
                <Form.Control 
                  type="date" 
                  name="birthDate" 
                  value={formData.birthDate} 
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-3" />
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold text-secondary mb-0">Dirección y Contacto</h6>
            {defaultAddress && (defaultAddress.address || defaultAddress.city) && (
              <Form.Check 
                type="checkbox"
                id="useSameAddressCheck"
                label="Usar la misma dirección del paciente"
                checked={useSameAddress}
                onChange={handleToggleSameAddress}
                className="small text-muted fw-semibold"
              />
            )}
          </div>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dirección (Calle y N°) *</Form.Label>
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
                <Form.Label>Ciudad *</Form.Label>
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
                <Form.Label>Cód. Postal *</Form.Label>
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

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono de Contacto</Form.Label>
                <Form.Control 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
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
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-3" />
          <h6 className="fw-bold text-secondary mb-3">Vínculo con el Paciente Actual</h6>
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Relación / Vínculo</Form.Label>
                <Form.Select 
                  name="relationshipType" 
                  value={formData.relationshipType} 
                  onChange={handleChange}
                >
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Tutor Legal">Tutor Legal</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Check 
                type="checkbox" 
                id="isPrimaryContactQuick"
                name="isPrimaryContact"
                label="Definir como Contacto Principal"
                checked={formData.isPrimaryContact}
                onChange={handleChange}
                className="mt-3"
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={onHide} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="success" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando tutor...
                </>
              ) : (
                'Guardar y Vincular Tutor'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default QuickGuardianModal;
