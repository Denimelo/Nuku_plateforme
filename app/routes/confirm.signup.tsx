import { useEffect } from "react";
import { Link, useSearchParams } from "@remix-run/react";

export default function SignupConfirmation() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const userName = searchParams.get("name") || "";

  // Nettoyer le sessionStorage après inscription réussie
  useEffect(() => {
    sessionStorage.removeItem('signup_user_data');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      
      {/* Éléments décoratifs arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-tr from-slate-600/15 to-teal-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-tl from-green-400/10 to-teal-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6">
        
        {/* Carte de confirmation */}
        <div className="w-full max-w-2xl">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-all duration-700 animate-pulse"></div>
                
                <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                  
                  <div className="relative z-10">
                    <img
                      className="h-16 w-auto filter brightness-110 drop-shadow-lg"
                      src="../../../../images/logo_nuku.webp"
                      alt="NUKU"
                    />
                  </div>
                  
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-60 animate-ping"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-40"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-12">
            
            {/* Icône de succès animée */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center shadow-xl">
                    <svg 
                      className="w-10 h-10 text-white animate-bounce" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                Inscription soumise avec succès !
              </h1>
              
              {userName && (
                <p className="text-lg text-slate-600 mb-2">
                  Merci <span className="font-semibold text-teal-600">{userName}</span> !
                </p>
              )}
              
              <p className="text-slate-600 text-lg">
                Votre demande d'inscription a été reçue.
              </p>
            </div>

            {/* Étapes suivantes */}
            <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-2xl p-6 lg:p-8 mb-8 border border-teal-100">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Que se passe-t-il maintenant ?
              </h2>
              
              <div className="space-y-6">
                
                {/* Étape 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Vérification de votre email
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Un email de confirmation vous a été envoyé à <span className="font-semibold text-teal-600">{email}</span>. 
                      Notre équipe va examiner votre dossier et vérifier les informations fournies.
                    </p>
                  </div>
                </div>

                {/* Étape 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Examen de votre candidature
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      L'équipe NUKU analysera votre profil et votre projet d'entreprise pour s'assurer qu'ils correspondent à notre communauté.
                    </p>
                  </div>
                </div>

                {/* Étape 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Réponse sous 48h
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Vous recevrez un email vous informant si votre candidature a été acceptée ou si des informations complémentaires sont nécessaires.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations importantes */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">
                    Points importants à retenir
                  </h3>
                  <ul className="text-amber-700 text-sm space-y-1">
                    <li>• Vérifiez votre boîte email (y compris les spams)</li>
                    <li>• Le processus de validation peut prendre jusqu'à 48h</li>
                    <li>• Assurez-vous que votre adresse email est correcte</li>
                    <li>• En cas de question, contactez notre support</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Timeline visuelle */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">
                Délai de traitement
              </h3>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mb-2"></div>
                  <span className="text-xs font-medium text-slate-600">Maintenant</span>
                  <span className="text-xs text-slate-500">Inscription soumise</span>
                </div>
                
                <div className="flex-1 h-1 bg-gradient-to-r from-teal-200 to-amber-200 rounded-full mx-4"></div>
                
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mb-2 animate-pulse"></div>
                  <span className="text-xs font-medium text-slate-600">0-48h</span>
                  <span className="text-xs text-slate-500">Examen en cours</span>
                </div>
                
                <div className="flex-1 h-1 bg-gradient-to-r from-amber-200 to-green-200 rounded-full mx-4"></div>
                
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mb-2"></div>
                  <span className="text-xs font-medium text-slate-600">Bientôt</span>
                  <span className="text-xs text-slate-500">Réponse reçue</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="group relative flex justify-center items-center py-3 px-8 border-2 border-teal-600 text-base font-semibold rounded-xl text-teal-600 bg-white hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Aller à la connexion
              </Link>
              
              <a
                href="mailto:support@nuku.com"
                className="group relative flex justify-center items-center py-3 px-8 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contacter le support
              </a>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                En cas de problème, n'hésitez pas à nous contacter à{" "}
                <a href="mailto:support@nuku.com" className="text-teal-600 hover:text-teal-500 font-medium">
                  support@nuku.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}