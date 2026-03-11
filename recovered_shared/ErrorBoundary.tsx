import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex items-center justify-center min-h-[400px] p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-[20px] font-bold text-[#1F2937] mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-[14px] text-[#6B7280] mb-6 leading-relaxed">
                            An unexpected error occurred while rendering this page.
                            Please try reloading.
                        </p>
                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-[12px] text-[#9CA3AF] cursor-pointer hover:text-[#6B7280]">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 p-3 bg-[#F9FAFB] border rounded-[6px] text-[11px] text-red-600 overflow-x-auto whitespace-pre-wrap">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#059669] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#047857] transition-colors shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
