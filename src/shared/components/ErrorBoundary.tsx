import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Error no capturado en componente React:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private handleReload = (): void => {
    window.location.hash = '#/';
    window.location.reload();
  };

  private toggleDetails = (): void => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="vh-100 d-flex flex-column justify-content-center align-items-center meraki-back-color px-3">
          <div
            className="card border-0 shadow-sm p-4 p-md-5 text-center"
            style={{ maxWidth: '600px', width: '100%', borderRadius: '15px' }}
          >
            <div className="mb-4 text-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="currentColor"
                className="bi bi-exclamation-triangle-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
            </div>
            <h1 className="h3 fw-bold text-dark mb-2">Ocurrió un inconveniente</h1>
            <p className="text-secondary mb-4">
              Se ha producido un error inesperado en la interfaz. La aplicación sigue activa y puedes reintentar la acción o volver al inicio.
            </p>

            <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
              <button
                type="button"
                className="btn btn-primary px-4 py-2 rounded-pill fw-semibold"
                onClick={this.handleReset}
              >
                Reintentar
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
                onClick={this.handleReload}
              >
                Ir al Inicio
              </button>
            </div>

            <div className="mt-3">
              <button
                type="button"
                className="btn btn-link text-decoration-none text-muted small p-0"
                onClick={this.toggleDetails}
              >
                {this.state.showDetails ? 'Ocultar detalles técnicos ▲' : 'Ver detalles técnicos ▼'}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 text-start bg-light p-3 rounded border text-monospace" style={{ fontSize: '0.8rem', maxHeight: '200px', overflowY: 'auto' }}>
                  <strong className="text-danger">{this.state.error?.toString()}</strong>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
