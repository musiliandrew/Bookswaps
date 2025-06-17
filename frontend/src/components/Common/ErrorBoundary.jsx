import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4 text-[var(--text)] bg-bookish-gradient h-screen">
          <p className="mb-4">Error: {this.state.error?.message || 'Something went wrong.'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)]"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;