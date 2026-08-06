// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import RouteErrorBoundary from './RouteErrorBoundary';

const CrashComponent: React.FC = () => {
  throw new Error('Simulated route crash error');
};

describe('RouteErrorBoundary Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('debería capturar el error de la ruta y mostrar la interfaz de rescate personalizada', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const router = createMemoryRouter(
      [
        {
          path: '/test-crash',
          element: <CrashComponent />,
          errorElement: <RouteErrorBoundary />,
        },
      ],
      { initialEntries: ['/test-crash'] }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Error en la vista')).not.toBeNull();
    expect(screen.getByText(/Se ha producido un problema al cargar esta sección/i)).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Reintentar la página' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Volver al Inicio' })).not.toBeNull();

    consoleErrorSpy.mockRestore();
  });
});
