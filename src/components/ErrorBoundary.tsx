import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Koda Reader Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-6 select-none">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-2xl">
            <AlertTriangle size={32} />
          </div>

          <div className="text-center max-w-md space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Reader Encountered an Issue
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
          </div>

          <button
            onClick={this.handleReset}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-xl flex items-center space-x-2"
          >
            <RotateCcw size={14} />
            <span>Restore Koda Reader</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
