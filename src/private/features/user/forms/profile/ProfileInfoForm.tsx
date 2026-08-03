import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../../../../../context/AuthContext';
import { useUserStore } from '../../useUserStore';
import { UserIcon } from '../../../../../shared/components/icons';

interface ProfileInfoFormProps {
  onHide: () => void;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({ onHide }) => {
  const { user, refreshSession } = useAuth();
  const { updateMyProfile, isLoading, myProfile } = useUserStore();

  const [profileData, setProfileData] = useState({
    email: '',
    name: '',
    nickname: ''
  });

  useEffect(() => {
    if (myProfile) {
      setProfileData({
        email: myProfile.userEmail || '',
        name: myProfile.userName || '',
        nickname: myProfile.nickname || ''
      });
    }
  }, [myProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId) return;
    try {
      await updateMyProfile(user.userId, profileData);
      await refreshSession();
      onHide();
    } catch (error) {
      // Error manejado por el store
    }
  };

  return (
    <div className="card border border-light-subtle bg-body-tertiary bg-opacity-50 p-3 p-sm-4 rounded-3 shadow-sm">
      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-light-subtle">
        <UserIcon size={18} className="text-primary" />
        <h6 className="mb-0 fw-semibold text-body-secondary">Información Personal</h6>
      </div>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-medium text-body-secondary">Correo Electrónico</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            placeholder="ejemplo@meraki.com"
            required
            className="shadow-none border-light-subtle"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-medium text-body-secondary">Nombre Completo</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            placeholder="Nombre y Apellido"
            required
            className="shadow-none border-light-subtle"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-medium text-body-secondary">Nombre de Usuario (Nickname)</Form.Label>
          <Form.Control
            type="text"
            name="nickname"
            value={profileData.nickname}
            onChange={handleChange}
            placeholder="usuario123"
            required
            className="shadow-none border-light-subtle"
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top border-light-subtle">
          <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={isLoading} className="px-3">
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading} className="px-4 fw-medium shadow-sm">
            {isLoading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProfileInfoForm;
