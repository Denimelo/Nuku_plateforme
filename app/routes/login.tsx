import { useState } from "react";
import { Form, useNavigate, useActionData, useSearchParams } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authServerAPI } from "~/utils/api.server";
import { createUserSession } from "~/utils/session.server";

// Action pour gérer la soumission du formulaire
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  try {
    const response = await authServerAPI.login(email, password);
    
    console.log("Response from API:", response); // Debug
    
    // Vérifier que la réponse a la structure attendue
    if (!response.access_token || !response.user_type || !response.user_id) {
      console.error("Invalid response structure:", response);
      return json({ error: "Structure de réponse invalide" }, { status: 400 });
    }
    
    // Créer un objet utilisateur temporaire avec les données disponibles
    const tempUser = {
      user_id: response.user_id,
      user_type: response.user_type,
      email: email, // On utilise l'email de connexion
      first_name: "",
      last_name: "",
      status: "active",
      created_at: new Date().toISOString()
    };
    
    // Déterminer la redirection selon le type d'utilisateur
    let redirectTo = "/dashboard";
    switch (response.user_type) {
      case "admin":
        redirectTo = "/admin/dashboard";
        break;
      case "expert":
        redirectTo = "/expert/dashboard";
        break;
      case "entrepreneur":
        redirectTo = "/entrepreneur/dashboard";
        break;
      default:
        redirectTo = "/dashboard";
    }
    
    return createUserSession(response.access_token, tempUser, redirectTo);
  } catch (error: any) {
    console.error("Login error:", error);
    return json(
      { error: error.message || "Erreur de connexion" },
      { status: 400 }
    );
  }
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Messages de succès basés sur les paramètres URL
  const message = searchParams.get("message");
  const getSuccessMessage = () => {
    switch (message) {
      case "registration_complete":
        return "Inscription terminée avec succès ! Vous pouvez maintenant vous connecter.";
      case "password_reset_success":
        return "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.";
      default:
        return null;
    }
  };

  const successMessage = getSuccessMessage();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

      <div className="relative flex min-h-screen">
        
        {/* Section gauche - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-800 items-center justify-center p-12 relative overflow-hidden">
          
          {/* Motifs géométriques */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-32 h-32 border border-teal-400/20 rounded-full"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-to-r from-teal-400/10 to-green-400/10 rounded-lg transform rotate-45"></div>
            <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-br from-slate-500/20 to-teal-500/20 rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-md">
            {/* Logo NUKU amélioré */}
            <div className="mb-12">
              <div className="inline-flex items-center justify-center mb-8">
                <div className="relative group">
                  {/* Effet de halo lumineux */}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
                  
                  {/* Conteneur principal du logo */}
                  <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                    {/* Gradient interne subtil */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                    
                    {/* Logo */}
                    <div className="relative z-10">
                      <img
                        className="h-16 w-auto filter brightness-110 drop-shadow-lg"
                        src="../../images/logo_nuku.webp"
                        alt="NUKU"
                      />
                    </div>
                    
                    {/* Points décoratifs */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-60 animate-ping"></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-40"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Bienvenue sur
              <span className="block bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
                NUKU Platform
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Votre plateforme d'innovation pour connecter entrepreneurs et experts
            </p>
            
            <div className="flex justify-center space-x-8 text-slate-400">
              <div className="text-center group">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:bg-teal-500/30 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm group-hover:text-teal-300 transition-colors">Innovation</span>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:bg-green-500/30 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm group-hover:text-green-300 transition-colors">Collaboration</span>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 bg-slate-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:bg-slate-400/30 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm group-hover:text-slate-300 transition-colors">Excellence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            
            {/* Logo mobile amélioré */}
            <div className="lg:hidden text-center mb-12">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative group">
                  {/* Effet de halo pour mobile */}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                  
                  {/* Conteneur du logo mobile */}
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                    <img
                      className="relative z-10 h-12 w-auto"
                      src="../../images/logo_nuku.webp"
                      alt="NUKU"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Carte du formulaire */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-10">
              
              {/* En-tête */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Connexion
                </h2>
                <p className="text-slate-600 text-lg">
                  Accédez à votre espace personnel
                </p>
              </div>

              {/* Message de succès */}
              {successMessage && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-green-800 font-medium">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message d'erreur */}
              {actionData?.error && (
                <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-2xl p-4">
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
                      placeholder="votre@email.com"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Champ Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300 text-base pr-12 group-hover:border-slate-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded transition-colors"
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-600 font-medium">
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm">
                    <a 
                      href="/forgot-password" 
                      className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
                    >
                      Mot de passe oublié ?
                    </a>
                  </div>
                </div>

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mt-8"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </Form>

              {/* Liens du bas */}
              <div className="text-center space-y-4 pt-8 border-t border-slate-100 mt-8">
                <p className="text-slate-600">
                  Pas encore de compte ?{" "}
                  <a
                    href="/signup"
                    className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
                  >
                    Créer un compte
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}