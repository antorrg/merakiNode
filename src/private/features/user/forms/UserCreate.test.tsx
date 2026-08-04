// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import UserCreate from './UserCreate';
import { useUserStore, UserState } from '../useUserStore';

vi.mock('../useUserStore', () => ({
  useUserStore: vi.fn(),
}));

describe('UserCreate Component', () => {
  const mockOnHide = vi.fn();
  const mockCreateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserStore).mockReturnValue({
      createUser: mockCreateUser,
      isLoading: false,
    } as unknown as UserState);
  });

  afterEach(() => {
    cleanup();
  });

  it('debería renderizar todos los campos del formulario de creación de usuario', () => {
    const { container } = render(<UserCreate onHide={mockOnHide} />);

    expect(container.querySelector('input[name="userEmail"]')).not.toBeNull();
    expect(container.querySelector('input[name="userName"]')).not.toBeNull();
    expect(container.querySelector('input[name="nickname"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(container.querySelector('select[name="role"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Crear Usuario/i })).not.toBeNull();
  });

  it('debería enviar el formulario e invocar createUser y onHide', async () => {
    mockCreateUser.mockResolvedValueOnce(undefined);
    const { container } = render(<UserCreate onHide={mockOnHide} />);

    const emailInput = container.querySelector('input[name="userEmail"]')!;
    const nameInput = container.querySelector('input[name="userName"]')!;
    const nicknameInput = container.querySelector('input[name="nickname"]')!;
    const passwordInput = container.querySelector('input[name="password"]')!;
    const roleSelect = container.querySelector('select[name="role"]')!;

    fireEvent.change(emailInput, { target: { value: 'nuevo@meraki.com' } });
    fireEvent.change(nameInput, { target: { value: 'Carlos Gomez' } });
    fireEvent.change(nicknameInput, { target: { value: 'cgomez' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123456' } });
    fireEvent.change(roleSelect, { target: { value: 'PROFESIONAL' } });

    fireEvent.click(screen.getByRole('button', { name: /Crear Usuario/i }));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        userEmail: 'nuevo@meraki.com',
        userName: 'Carlos Gomez',
        nickname: 'cgomez',
        password: 'pass123456',
        role: 'PROFESIONAL',
      });
      expect(mockOnHide).toHaveBeenCalled();
    });
  });

  it('debería llamar a onHide cuando se presiona el botón Cancelar', () => {
    render(<UserCreate onHide={mockOnHide} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(mockOnHide).toHaveBeenCalled();
  });
});
