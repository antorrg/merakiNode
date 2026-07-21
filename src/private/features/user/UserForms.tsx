import React from 'react';
import Modal from 'react-bootstrap/Modal';
import UserCreate from './forms/UserCreate';
import UserUpgrade from './forms/UserUpgrade';

export type UserFormMode = 'CREATE' | 'UPDATE' | null;

interface UserFormsProps {
  show: boolean;
  onHide: () => void;
  mode: UserFormMode;
  selectedUserId?: string;
}

const UserForms: React.FC<UserFormsProps> = ({ show, onHide, mode, selectedUserId }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'CREATE' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mode === 'CREATE' && <UserCreate onHide={onHide} />}
        {mode === 'UPDATE' && selectedUserId && <UserUpgrade onHide={onHide} userId={selectedUserId} />}
      </Modal.Body>
    </Modal>
  );
};

export default UserForms;