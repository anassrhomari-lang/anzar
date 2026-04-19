import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const firestoreError = JSON.parse(this.state.error?.message || "");
        if (firestoreError.error) {
          errorMessage = `Firestore Error: ${firestoreError.error} during ${firestoreError.operationType} on ${firestoreError.path}`;
        }
      } catch (e) {
        // Not a JSON error message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_70%)] pointer-events-none" />
          
          <div className="glass-card rounded-[40px] p-10 lg:p-12 max-w-md w-full space-y-8 border-red-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-serif font-bold tracking-tight">Application Error</h1>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-6 bg-red-500/50" />
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.25em]">System Alert</p>
                <div className="h-px w-6 bg-red-500/50" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{errorMessage}</p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full h-14 rounded-2xl bg-red-500 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-red-600 transition-all active:scale-95 shadow-2xl shadow-red-500/30"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
