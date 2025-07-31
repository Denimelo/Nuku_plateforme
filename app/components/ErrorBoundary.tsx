import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorId: string }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log immédiat de l'erreur
    console.error("🚨 ErrorBoundary - Erreur capturée:", {
      message: error.message,
      stack: error.stack,
      errorId,
      timestamp: new Date().toISOString(),
    });

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log détaillé avec informations React
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "N/A",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
    };

    // Log dans la console
    console.error("🚨 NUKU ErrorBoundary - Détails complets:", errorDetails);

    // Log pour les services de monitoring (Sentry, LogRocket, etc.)
    if (typeof window !== "undefined") {
      // Google Analytics
      if (window.gtag) {
        window.gtag("event", "exception", {
          description: `ErrorBoundary: ${error.message}`,
          fatal: false,
          custom_map: {
            error_id: this.state.errorId,
          },
        });
      }

      // Exemple pour Sentry (si configuré)
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     tags: {
      //       errorBoundary: true,
      //       errorId: this.state.errorId,
      //     },
      //     extra: errorDetails,
      //   });
      // }

      // Stockage local pour debug (optionnel)
      try {
        const existingErrors = JSON.parse(localStorage.getItem("nuku_errors") || "[]");
        existingErrors.push(errorDetails);
        // Garder seulement les 10 dernières erreurs
        const recentErrors = existingErrors.slice(-10);
        localStorage.setItem("nuku_errors", JSON.stringify(recentErrors));
      } catch (e) {
        console.warn("Impossible de stocker l'erreur dans localStorage:", e);
      }
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Si un composant fallback personnalisé est fourni
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} errorId={this.state.errorId} />;
      }

      // Sinon, rediriger vers la page d'erreur par défaut
      if (typeof window !== "undefined") {
        window.location.href = `/error?id=${this.state.errorId}&message=${encodeURIComponent(this.state.error.message)}`;
      }

      // Fallback temporaire pendant la redirection
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Redirection vers la page d'erreur...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Types pour TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    Sentry?: {
      captureException: (error: Error, options?: any) => void;
    };
  }
}