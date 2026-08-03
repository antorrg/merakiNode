import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../../../../../context/AuthContext';
import { useUserStore } from '../../useUserStore';
import { toast } from '../../../../../shared/components/toast/toastManager';
import PasswordViewer from '../../../../../shared/components/PasswordViewer';
import { LockIcon } from '../../../../../shared/components/icons';

interface PasswordChangeFormProps {
  onHide: () => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onHide }) => {
  const { user } = useAuth();
  const { changePasswordUser, isLoading } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  const fieldType = showPassword ? 'text' : 'password';

  return (
    <div className="card border border-light-subtle bg-body-tertiary bg-opacity-50 p-3 p-sm-4 rounded-3 shadow-sm">
      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-light-subtle">
        <LockIcon size={18} className="text-primary" />
        <h6 className="mb-0 fw-semibold text-body-secondary">Seguridad de la Cuenta</h6>
      </div>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-medium text-body-secondary">Contraseña Actual</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={fieldType}
              name="password"
              value={passwordData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña actual"
              required
              className="pe-5 shadow-none border-light-subtle"
            />
            <PasswordViewer showPassword={showPassword} setShowPassword={() => setShowPassword(!showPassword)} />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-medium text-body-secondary">Nueva Contraseña</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={fieldType}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              className="pe-5 shadow-none border-light-subtle"
            />
            <PasswordViewer showPassword={showPassword} setShowPassword={() => setShowPassword(!showPassword)} />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-medium text-body-secondary">Confirmar Nueva Contraseña</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={fieldType}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la nueva contraseña"
              required
              minLength={8}
              className="pe-5 shadow-none border-light-subtle"
            />
            <PasswordViewer showPassword={showPassword} setShowPassword={() => setShowPassword(!showPassword)} />
          </div>
        </Form.Group>

        <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top border-light-subtle">
          <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={isLoading} className="px-3">
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading} className="px-4 fw-medium shadow-sm">
            {isLoading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Actualizando...</>
            ) : (
              'Cambiar Contraseña'
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PasswordChangeForm;
