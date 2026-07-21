import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { useAuth } from '../../../../context/AuthContext';
import { useUserStore } from '../useUserStore';
import { toast } from '../../../../shared/components/toast/toastManager';

interface ProfileModalProps {
  show: boolean;
  onHide: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ show, onHide }) => {
  const { user, refreshSession } = useAuth();
  const { updateMyProfile, changePasswordUser, isLoading, fetchMyProfile, myProfile } = useUserStore();
  
  const [profileData, setProfileData] = useState({
    email: '',
    name: '',
    nickname: ''
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('profile');

  // Cargar el perfil completo cuando se abre el modal
  useEffect(() => {
    if (show && user?.userId) {
      fetchMyProfile(user.userId);
      setPasswordData({
        password: '',
        newPassword: '',
        confirmPassword: ''
      });
      setActiveTab('profile');
    }
  }, [show, user?.userId, fetchMyProfile]);

  // Llenar el formulario con los datos completos del store
  useEffect(() => {
    if (myProfile) {
      setProfileData({
        email: myProfile.userEmail || '',
        name: myProfile.userName || '',
        nickname: myProfile.nickname || ''
      });
    }
  }, [myProfile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId) return;
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    try {
      await changePasswordUser({
        userId: user.userId,
        password: passwordData.password,
        newPassword: passwordData.newPassword
      });
      onHide();
    } catch (error) {
      // Error manejado por el store
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Mi Perfil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'profile')} className="mb-3">
          <Tab eventKey="profile" title="Datos Personales">
            <Form onSubmit={handleProfileSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control type="email" name="email" value={profileData.email} onChange={handleProfileChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nombre Completo</Form.Label>
                <Form.Control type="text" name="name" value={profileData.name} onChange={handleProfileChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de Usuario (Nickname)</Form.Label>
                <Form.Control type="text" name="nickname" value={profileData.nickname} onChange={handleProfileChange} required />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={onHide} disabled={isLoading}>Cancelar</Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </Form>
          </Tab>
          
          <Tab eventKey="security" title="Seguridad">
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña Actual</Form.Label>
                <Form.Control type="password" name="password" value={passwordData.password} onChange={handlePasswordChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nueva Contraseña</Form.Label>
                <Form.Control type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength={8} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                <Form.Control type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required minLength={8} />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={onHide} disabled={isLoading}>Cancelar</Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </Button>
              </div>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;
