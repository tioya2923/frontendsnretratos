import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Você pode registrar o erro em um serviço externo aqui
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: '1em' }}>
        <h2>Ocorreu um erro inesperado.</h2>
        <p>{this.state.error && this.state.error.toString()}</p>
      </div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
