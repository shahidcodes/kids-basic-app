"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { Frown, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-amber-50 p-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center border-4 border-amber-200">
            <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Frown className="w-12 h-12 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-amber-800 mb-3">Oops!</h2>
            <p className="text-lg text-amber-600 mb-6">
              Something went wrong. Let&apos;s try again!
            </p>
            <button
              onClick={this.handleReset}
              className="kid-btn kid-btn-primary flex items-center gap-2 mx-auto text-lg"
            >
              <RotateCcw size={22} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
