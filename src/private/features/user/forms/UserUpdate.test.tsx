// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import UserUpdate from './UserUpdate';
import { useUserStore, UserState } from '../useUserStore';

vi.mock('../useUserStore', () => ({
  useUserStore: vi.fn(),
}));

describe('UserUpdate Component', () => {
  const mockOnHide = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockUsers = [
    { userId: 'u1', userEmail: 'existente@meraki.com', userName: 'Juan Perez', nickname: 'jperez', role: 'PROFESIONAL', enabled: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserStore).mockReturnValue({
      users: mockUsers,
      updateUser: mockUpdateUser,
      isLoading: false,
    } as unknown as UserState);
  });

  afterEach(() => {
    cleanup();
  });

  it('debería retornar null si userId no está definido', () => {
    const { container } = render(<UserUpdate onHide={mockOnHide} />);
    expect(container.firstChild).toBeNull();
  });

  it('debería precargar los datos del usuario especificado por userId', () => {
    const { container } = render(<UserUpdate onHide={mockOnHide} userId="u1" />);

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    const nicknameInput = container.querySelector('input[name="nickname"]') as HTMLInputElement;

    expect(emailInput.value).toBe('existente@meraki.com');
    expect(nameInput.value).toBe('Juan Perez');
    expect(nicknameInput.value).toBe('jperez');
  });

  it('debería enviar los datos modificados al hacer submit', async () => {
    mockUpdateUser.mockResolvedValueOnce(undefined);
    const { container } = render(<UserUpdate onHide={mockOnHide} userId="u1" />);

    const nameInput = container.querySelector('input[name="name"]')!;
    fireEvent.change(nameInput, { target: { value: 'Juan Perez Actualizado' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('u1', expect.objectContaining({
        name: 'Juan Perez Actualizado',
        email: 'existente@meraki.com',
      }));
      expect(mockOnHide).toHaveBeenCalled();
    });
  });
});
