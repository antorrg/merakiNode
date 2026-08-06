// @vitest-environment happy-dom
import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ProblemChild: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test rendering crash error');
  }
  return <div>Componente renderizado correctamente</div>;
};

describe('ErrorBoundary Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('debería renderizar sus hijos cuando no hay errores', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Componente renderizado correctamente')).not.toBeNull();
  });

  it('debería capturar el error y mostrar la interfaz de recuperación (Fallback UI)', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Ocurrió un inconveniente')).not.toBeNull();
    expect(screen.getByText(/Se ha producido un error inesperado/i)).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Reintentar' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Ir al Inicio' })).not.toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('debería permitir desplegar y ocultar los detalles técnicos del error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const toggleBtn = screen.getByText('Ver detalles técnicos ▼');
    expect(toggleBtn).not.toBeNull();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Test rendering crash error/i)).not.toBeNull();

    fireEvent.click(screen.getByText('Ocultar detalles técnicos ▲'));
    expect(screen.queryByText(/Test rendering crash error/i)).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('debería restablecer el estado al presionar el botón Reintentar', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ResettableParent = () => {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <div>
          <button onClick={() => setShouldThrow(false)}>Fix Component</button>
          <ErrorBoundary>
            <ProblemChild shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </div>
      );
    };

    render(<ResettableParent />);

    expect(screen.getByText('Ocurrió un inconveniente')).not.toBeNull();

    // 1. Arreglar la causa del error en el hijo
    fireEvent.click(screen.getByText('Fix Component'));
    // 2. Hacer clic en Reintentar en la ErrorBoundary
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(screen.getByText('Componente renderizado correctamente')).not.toBeNull();

    consoleErrorSpy.mockRestore();
  });
});
