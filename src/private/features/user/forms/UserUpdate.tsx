import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useUserStore } from '../useUserStore';

interface UserUpdateProps {
  onHide: () => void;
  userId?: string;
}

const UserUpdate: React.FC<UserUpdateProps> = ({ onHide, userId }) => {
  const { users, updateUser, isLoading } = useUserStore();
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    nickname: '',
    role: 'USER',
    enabled: true
  });

  useEffect(() => {
    if (userId) {
      const user = users.find(u => u.userId === userId);
      if (user) {
        setFormData({
          email: user.userEmail,
          name: user.userName,
          nickname: user.nickname || '',
          role: user.role,
          enabled: user.enabled
        });
      }
    }
  }, [userId, users]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await updateUser(userId, formData);
      onHide();
    } catch (error) {
      // El error ya lo maneja el store (mostrando toast)
    }
  };

  if (!userId) return null;

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Correo Electrónico</Form.Label>
        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Nombre Completo</Form.Label>
        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Nombre de Usuario (Nickname)</Form.Label>
        <Form.Control type="text" name="nickname" value={formData.nickname} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Rol</Form.Label>
        <Form.Select name="role" value={formData.role} onChange={handleChange}>
          <option value="SECRETARIO">Secretario/a</option>
          <option value="PROFESIONAL">Profesional</option>
          <option value="PROPIETARIO">Propietario</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check 
          type="switch"
          id="custom-switch"
          label={formData.enabled ? 'Usuario Activo' : 'Usuario Inactivo'}
          name="enabled"
          checked={formData.enabled}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>Cancelar</Button>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? (
            <><span className="spinner-border spinner-border-sm me-2" />Actualizando...</>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default UserUpdate;
