import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import { useAuth } from '../../../../context/AuthContext';
import { useUserStore } from '../useUserStore';
import ProfileInfoForm from './profile/ProfileInfoForm';
import PasswordChangeForm from './profile/PasswordChangeForm';
import { UserIcon, LockIcon } from '../../../../shared/components/icons';

interface ProfileModalProps {
  show: boolean;
  onHide: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ show, onHide }) => {
  const { user } = useAuth();
  const { fetchMyProfile, myProfile } = useUserStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  useEffect(() => {
    if (show && user?.userId) {
      fetchMyProfile(user.userId);
      setActiveTab('profile');
    }
  }, [show, user?.userId, fetchMyProfile]);

  const userInitial = (myProfile?.userName || user?.userName || 'U').charAt(0).toUpperCase();

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="profile-modal">
      <Modal.Header closeButton className="border-bottom-0 pb-0 pt-4 px-4">
        <div className="d-flex align-items-center gap-3">
          <div 
            className="bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: '44px', height: '44px', fontSize: '1.1rem' }}
          >
            {userInitial}
          </div>
          <div>
            <Modal.Title className="h5 mb-0 fw-bold">Mi Perfil</Modal.Title>
            <p className="text-muted small mb-0">
              {myProfile?.userEmail || user?.userEmail || 'Gestiona tu cuenta y seguridad'}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Nav 
          variant="pills" 
          activeKey={activeTab} 
          onSelect={(k) => setActiveTab((k as 'profile' | 'security') || 'profile')} 
          className="nav-pills-custom mb-3 nav-fill"
        >
          <Nav.Item>
            <Nav.Link eventKey="profile" className="d-flex align-items-center justify-content-center gap-2">
              <UserIcon size={16} />
              <span>Datos Personales</span>
            </Nav.Link>
          </Nav.Item>
          
          <Nav.Item>
            <Nav.Link eventKey="security" className="d-flex align-items-center justify-content-center gap-2">
              <LockIcon size={16} />
              <span>Seguridad</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <div className="tab-content mt-3">
          {activeTab === 'profile' && (
            <ProfileInfoForm onHide={onHide} />
          )}

          {activeTab === 'security' && (
            <PasswordChangeForm onHide={onHide} />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;
