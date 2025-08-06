import { useState } from "react";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { authServerAPI } from "~/utils/api.server";

// Action pour gérer la demande de réinitialisation
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  if (!email) {
    return json({ error: "Email requis" }, { status: 400 });
  }

  try {
    await authServerAPI.resetPassword(email);
    return redirect(`/reset-password?email=${encodeURIComponent(email)}`);
  } catch (error: any) {
    return json(
      { error: error.message || "Erreur lors de l'envoi" },
      { status: 400 }
    );
  }
}

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const actionData = useActionData<typeof action>();

  const handleSubmit = () => {
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      
      {/* Éléments décoratifs arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-tr from-slate-600/15 to-teal-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-tl from-green-400/10 to-teal-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          
          {/* Carte principale */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-10">
            
            {/* Header avec logo amélioré */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  {/* Effet de halo lumineux */}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                  
                  {/* Conteneur du logo */}
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                    <img
                      className="relative z-10 h-12 w-auto filter brightness-110 drop-shadow-lg"
                      src="../../public/images/logo_nuku.webp"
                      alt="NUKU"
                    />
                    
                    {/* Points décoratifs */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-60 animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-40"></div>
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                Mot de passe oublié ?
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Pas de souci ! Entrez votre adresse email et nous vous enverrons 
                un code de vérification pour réinitialiser votre mot de passe.
              </p>
            </div>

            {/* Formulaire */}
            <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Champ Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                  Adresse email
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300 text-base group-hover:border-slate-300"
                    placeholder="votre.email@exemple.com"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message d'erreur */}
              {actionData?.error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200/50 rounded-2xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-800 font-medium">{actionData.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer le code de vérification
                    <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>

              {/* Liens de navigation */}
              <div className="text-center space-y-4 pt-6 border-t border-slate-100">
                <p className="text-slate-600">
                  Vous vous souvenez de votre mot de passe ?{" "}
                  <a
                    href="/login"
                    className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
                  >
                    Se connecter
                  </a>
                </p>
                <a
                  href="/"
                  className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retour à l'accueil
                </a>
              </div>
            </Form>
          </div>

          {/* Informations d'aide */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Besoin d'aide ?
                </h3>
                <div className="text-sm text-slate-600 space-y-2">
                  <p>
                    • Vérifiez votre dossier spam si vous ne recevez pas l'email
                  </p>
                  <p>
                    • Le code de vérification expire après 15 minutes
                  </p>
                  <p>
                    • Contactez le support si vous rencontrez des difficultés
                  </p>
                </div>
                <div className="mt-4">
                  <a
                    href="/support"
                    className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors"
                  >
                    Contacter le support
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}