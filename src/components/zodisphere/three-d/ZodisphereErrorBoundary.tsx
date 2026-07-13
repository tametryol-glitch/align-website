'use client';

/**
 * ZodisphereErrorBoundary — catches any render/runtime error thrown inside the
 * 3D globe subtree and shows the calm fallback instead of crashing Align or
 * flashing a white screen. Scoped to Zodisphere only; the rest of the app is
 * unaffected by a globe failure.
 */

import { Component, type ReactNode } from 'react';
import ZodisphereFallbackView from './ZodisphereFallbackView';

interface Props {
  children: ReactNode;
  classicHref?: string | null;
  onError?: (error: Error) => void;
}
interface State {
  hasError: boolean;
  message?: string;
}

export default class ZodisphereErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error) {
    // Log for diagnostics without exposing internals to the user.
    console.error('[zodisphere-3d] render error:', error?.message);
    this.props.onError?.(error);
  }

  private reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <ZodisphereFallbackView
          message="Something went wrong drawing the 3D globe."
          onRetry={this.reset}
          classicHref={this.props.classicHref}
        />
      );
    }
    return this.props.children;
  }
}
