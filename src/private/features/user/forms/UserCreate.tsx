import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useUserStore } from '../useUserStore';

interface UserCreateProps {
  onHide: () => void;
}

const UserCreate: React.FC<UserCreateProps> = ({ onHide }) => {
  const { createUser, isLoading } = useUserStore();
  
  // Puedes usar Validator.ts después, por ahora lo hacemos controlado básico
  const [formData, setFormData] = useState({
    userEmail: '',
    userName: '',
    nickname: '',
    password: '',
    role: 'USER'
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(formData);
      // Si fue exitoso, cerramos el modal
      onHide();
    } catch (error) {
      // Si falla, el store ya mostró un Toast, así que solo evitamos cerrar el modal
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Correo Electrónico</Form.Label>
        <Form.Control type="email" name="userEmail" value={formData.userEmail} onChange={handleChange} required />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Nombre Completo</Form.Label>
        <Form.Control type="text" name="userName" value={formData.userName} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Nombre de Usuario (Nickname)</Form.Label>
        <Form.Control type="text" name="nickname" value={formData.nickname} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Rol</Form.Label>
        <Form.Select name="role" value={formData.role} onChange={handleChange}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>Cancelar</Button>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? (
            <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
          ) : (
            'Crear Usuario'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default UserCreate;
