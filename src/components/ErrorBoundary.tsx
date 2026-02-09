import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    window.analytics?.trackEvent('error_boundary_caught', {
      error: error.message,
      componentStack: (errorInfo.componentStack || '').slice(0, 200),
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#ff6b6b' }}>
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ marginBottom: 16, color: '#aaa' }}>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 16px',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
