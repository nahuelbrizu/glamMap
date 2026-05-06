import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('💥 ErrorBoundary atrapó un error:', error);
    console.error(info.componentStack);

    // Acá podrías enviar a Sentry / LogRocket / etc
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex h-screen items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-bold">Algo salió mal 😵</h1>
            <p className="text-slate-500 mt-2">
              Intentá recargar la página
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
