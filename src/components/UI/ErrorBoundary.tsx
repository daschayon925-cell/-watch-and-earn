import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('[Application ErrorBoundary Caught]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070B] text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950 font-['Hind_Siliguri','Outfit',sans-serif]">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl">
              ▶
            </div>
            <h2 className="text-lg font-black text-white">
              WATCH & EARN BD 🇧🇩
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              সাময়িক লোডিং জনিত সমস্যার কারণে পেজটি রিফ্রেশ করার প্রয়োজন হতে পারে। অনুগ্রহ করে নিচের বাটনে ক্লিক করুন।
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              🔄 পেজ রিফ্রেশ করুন (Reload App)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
