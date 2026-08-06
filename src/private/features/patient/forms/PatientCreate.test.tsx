// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PatientCreate from './PatientCreate';
import { usePatientStore, PatientState } from '../usePatientStore';

vi.mock('../usePatientStore', () => ({
  usePatientStore: vi.fn(),
}));

describe('PatientCreate Component', () => {
  const mockOnHide = vi.fn();
  const mockOnRequestConfirm = vi.fn();
  const mockGetByIdentityCode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePatientStore).mockReturnValue({
      getPatientByIdentityCode: mockGetByIdentityCode,
    } as unknown as PatientState);
  });

  afterEach(() => {
    cleanup();
  });

  it('debería renderizar los campos principales del formulario de paciente', () => {
    const { container } = render(<PatientCreate onHide={mockOnHide} onRequestConfirm={mockOnRequestConfirm} />);

    expect(container.querySelector('input[name="firstName"]')).not.toBeNull();
    expect(container.querySelector('input[name="lastName"]')).not.toBeNull();
    expect(container.querySelector('input[name="identityCode"]')).not.toBeNull();
    expect(container.querySelector('input[name="birthDate"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Guardar y Confirmar/i })).not.toBeNull();
  });

  it('debería mostrar alerta de error si un paciente menor de edad no tiene tutores asignados', async () => {
    const { container } = render(<PatientCreate onHide={mockOnHide} onRequestConfirm={mockOnRequestConfirm} />);

    const birthDateInput = container.querySelector('input[name="birthDate"]')!;
    fireEvent.change(container.querySelector('input[name="firstName"]')!, { target: { value: 'Lucas' } });
    fireEvent.change(container.querySelector('input[name="lastName"]')!, { target: { value: 'Gomez' } });
    fireEvent.change(container.querySelector('input[name="identityCode"]')!, { target: { value: '55666777' } });
    fireEvent.change(birthDateInput, { target: { value: '15/05/2020' } });
    fireEvent.blur(birthDateInput);
    fireEvent.change(container.querySelector('input[name="city"]')!, { target: { value: 'Cordoba' } });
    fireEvent.change(container.querySelector('input[name="obraSocial"]')!, { target: { value: 'OSDE' } });
    fireEvent.change(container.querySelector('input[name="address"]')!, { target: { value: 'Av Colon 123' } });

    fireEvent.submit(container.querySelector('form')!);

    expect(screen.getByText(/Un paciente menor de edad debe tener al menos un tutor asignado/i)).not.toBeNull();
    expect(mockOnRequestConfirm).not.toHaveBeenCalled();
  });

  it('debería mostrar alerta si un adulto no tiene teléfono registrado', () => {
    const { container } = render(<PatientCreate onHide={mockOnHide} onRequestConfirm={mockOnRequestConfirm} />);

    const birthDateInput = container.querySelector('input[name="birthDate"]')!;
    fireEvent.change(container.querySelector('input[name="firstName"]')!, { target: { value: 'Roberto' } });
    fireEvent.change(container.querySelector('input[name="lastName"]')!, { target: { value: 'Perez' } });
    fireEvent.change(container.querySelector('input[name="identityCode"]')!, { target: { value: '25666777' } });
    fireEvent.change(birthDateInput, { target: { value: '15/05/1985' } });
    fireEvent.blur(birthDateInput);
    fireEvent.change(container.querySelector('input[name="city"]')!, { target: { value: 'Cordoba' } });
    fireEvent.change(container.querySelector('input[name="obraSocial"]')!, { target: { value: 'OSDE' } });
    fireEvent.change(container.querySelector('input[name="address"]')!, { target: { value: 'Av Colon 123' } });

    fireEvent.submit(container.querySelector('form')!);

    expect(screen.getByText(/Un paciente mayor de edad debe contar con un teléfono de contacto/i)).not.toBeNull();
    expect(mockOnRequestConfirm).not.toHaveBeenCalled();
  });

  it('debería procesar la confirmación si un adulto tiene todos los datos completos', () => {
    const { container } = render(<PatientCreate onHide={mockOnHide} onRequestConfirm={mockOnRequestConfirm} />);

    const birthDateInput = container.querySelector('input[name="birthDate"]')!;
    fireEvent.change(container.querySelector('input[name="firstName"]')!, { target: { value: 'Roberto' } });
    fireEvent.change(container.querySelector('input[name="lastName"]')!, { target: { value: 'Perez' } });
    fireEvent.change(container.querySelector('input[name="identityCode"]')!, { target: { value: '25666777' } });
    fireEvent.change(birthDateInput, { target: { value: '15/05/1985' } });
    fireEvent.blur(birthDateInput);
    fireEvent.change(container.querySelector('input[name="phone"]')!, { target: { value: '3511234567' } });
    fireEvent.change(container.querySelector('input[name="city"]')!, { target: { value: 'Cordoba' } });
    fireEvent.change(container.querySelector('input[name="obraSocial"]')!, { target: { value: 'OSDE' } });
    fireEvent.change(container.querySelector('input[name="address"]')!, { target: { value: 'Av Colon 123' } });

    fireEvent.submit(container.querySelector('form')!);

    expect(mockOnRequestConfirm).toHaveBeenCalledWith('CREATE', expect.objectContaining({
      firstName: 'Roberto',
      lastName: 'Perez',
      identityCode: '25666777',
      phone: '3511234567',
    }));
  });
});
