import { Component } from 'react'

// Scene Error Boundary — prevents black-screen from effect component crashes
class SceneErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.warn('[SceneErrorBoundary] caught:', err) }
  render() { return this.state.hasError ? null : this.props.children }
}

export default SceneErrorBoundary
