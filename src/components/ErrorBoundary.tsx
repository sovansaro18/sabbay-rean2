import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-black text-slate-800">មានបញ្ហាបច្ចេកទេសកើតឡើង</h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                ប្រព័ន្ធជួបប្រទះបញ្ហាក្នុងការបង្ហាញទំព័រនេះ។ សូមព្យាយាមផ្ទុកទំព័រឡើងវិញ ឬត្រឡប់ទៅកាន់ទំព័រដើម។
              </p>
            </div>
            {this.state.error && (
              <div className="p-4 bg-slate-50 rounded-2xl text-[10px] font-mono text-left text-slate-500 max-h-32 overflow-auto break-all border border-slate-100">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>ត្រឡប់ទៅទំព័រដើម (Go Home)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
