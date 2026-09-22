import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { captureException } from "../utils/monitoring";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
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

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    captureException(error, { componentStack: errorInfo.componentStack });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
          dir="rtl"
        >
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              عذراً، حدث خطأ غير متوقع
            </h1>
            <p className="text-slate-500 mb-6 text-sm">
              واجه التطبيق مشكلة غير متوقعة. يرجى تحديث الصفحة أو المحاولة مرة
              أخرى لاحقاً.
            </p>
            {this.state.error && (
              <div
                className="bg-slate-100 rounded-xl p-3 mb-6 text-left overflow-auto max-h-32 text-xs font-mono text-slate-600"
                dir="ltr"
              >
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 bg-purple-900 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md"
            >
              <RefreshCw className="w-5 h-5" />
              <span>تحديث الصفحة</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
