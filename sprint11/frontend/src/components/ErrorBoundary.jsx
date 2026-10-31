import { Component } from 'react';

/**
 * Sprint 11 - Phase 2: a render crash inside the tree shows a recoverable panel
 * instead of a blank white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="boundary">
          <h2>⚠ The interface crashed</h2>
          <p className="muted">A component threw while rendering, so the tree was halted safely.</p>
          <pre>{this.state.error.message}</pre>
          <button className="btn btn-primary" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
