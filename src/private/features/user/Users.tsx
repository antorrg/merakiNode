import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import { useUserStore } from './useUserStore';
import UserForms, { UserFormMode } from './UserForms';

const Users = () => {
  const { users, isLoading, fetchUsers } = useUserStore();
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState<UserFormMode>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  // Cargar usuarios cuando se monta el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = () => {
    setFormMode('CREATE');
    setSelectedUserId(undefined);
    setShowModal(true);
  };

  const handleEdit = (id: string) => {
    setFormMode('UPDATE');
    setSelectedUserId(id);
    setShowModal(true);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Gestión de Usuarios</h2>
        <Button variant="primary" onClick={handleCreate} className="shadow-sm">
          + Nuevo Usuario
        </Button>
      </div>

      {isLoading && users.length === 0 ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded bg-white">
          <Table striped hover className="align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.userId}>
                    <td className="fw-medium">{user.userName}</td>
                    <td>{user.nickname}</td>
                    <td>{user.userEmail}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : (user.role === 'PROPIETARIO' ? 'bg-warning text-dark' : 'bg-primary')}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.enabled ? 'bg-success' : 'bg-secondary'}`}>
                        {user.enabled ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-center">
                      <Button variant="outline-primary" size="sm" onClick={() => handleEdit(user.userId)}>
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      <UserForms 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        mode={formMode} 
        selectedUserId={selectedUserId} 
      />
    </div>
  );
};

export default Users;
