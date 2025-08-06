import { useEffect } from "react";
import { Link, useRouteError } from "@remix-run/react";
import { AlertTriangle, Home, RefreshCw, Mail } from "lucide-react";

interface ErrorBoundaryProps {
  error?: Error;
  errorId?: string;
}

export default function ErrorBoundary({ error, errorId }: ErrorBoundaryProps) {
  const routeError = useRouteError();
  const actualError = error || routeError;

  // Log l'erreur complète dans la console et les logs
  useEffect(() => {
    if (actualError) {
      const errorDetails = {
        message: actualError.message || "Erreur inconnue",
        stack: actualError.stack || "Stack trace non disponible",
        timestamp: new Date().toISOString(),
        errorId: errorId || `error_${Date.now()}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Log dans la console pour le développement
      console.error("🚨 ERREUR NUKU PLATFORM:", errorDetails);

      // Log structuré pour les logs serveur (à adapter selon votre système de logging)
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "exception", {
          description: errorDetails.message,
          fatal: false,
        });
      }

      // Vous pouvez aussi envoyer à un service de monitoring comme Sentry
      // Sentry.captureException(actualError, { extra: errorDetails });
    }
  }, [actualError, errorId]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      
      {/* Éléments décoratifs arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-tr from-slate-600/15 to-red-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-tl from-orange-400/10 to-red-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          
          {/* Carte principale d'erreur */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-12 text-center">
            
            {/* Logo NUKU */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                  <img
                    className="relative z-10 h-12 w-auto filter brightness-110 drop-shadow-lg"
                    src="../../images/logo_nuku.webp"
                    alt="NUKU"
                  />
                </div>
              </div>
            </div>

            {/* Icône d'erreur animée */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <AlertTriangle className="h-12 w-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-xl opacity-30 animate-ping"></div>
              </div>
            </div>

            {/* Message principal */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Oups ! 😅
              </h1>
              <h2 className="text-2xl font-semibold text-slate-700 mb-6">
                Un petit souci technique...
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
                Notre équipe technique travaille activement sur une solution. 
                Cette fonctionnalité sera réparée très prochainement dans la version à venir.
              </p>
            </div>

            {/* Informations techniques (cachées par défaut) */}
            <details className="mb-8 text-left bg-slate-50 rounded-2xl p-4">
              <summary className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                Détails techniques (pour les développeurs)
              </summary>
              <div className="mt-4 p-4 bg-slate-100 rounded-xl">
                <div className="text-sm text-slate-600 space-y-2">
                  <p><strong>ID de l'erreur:</strong> {errorId || `error_${Date.now()}`}</p>
                  <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                  {actualError?.message && (
                    <p><strong>Message:</strong> {actualError.message}</p>
                  )}
                  <p><strong>URL:</strong> {typeof window !== "undefined" ? window.location.href : "N/A"}</p>
                </div>
              </div>
            </details>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleRefresh}
                className="group flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RefreshCw className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Réessayer
              </button>
              
              <Link
                to="/"
                className="group flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Home className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Retour à l'accueil
              </Link>
            </div>

            {/* Contact support */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 mb-4">
                Le problème persiste ? Notre équipe est là pour vous aider.
              </p>
              <a
                href="mailto:support@nuku.com?subject=Erreur Technique - ID: {{errorId}}"
                className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contacter le support technique
              </a>
            </div>
          </div>

          {/* Informations sur le statut */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-3"></div>
                <span className="text-sm font-medium text-slate-700">
                  Systèmes NUKU : Opérationnels
                </span>
              </div>
              <a
                href="/status"
                className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors"
              >
                Voir le statut →
              </a>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Dernière vérification : {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}