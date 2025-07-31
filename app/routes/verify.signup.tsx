import { useState, useEffect } from "react";

export default function SignupVerify() {
  const [isLoading, setIsLoading] = useState(false);
  const [actionData, setActionData] = useState(null);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    company_description: "",
    industry_sector: "",
    number_of_employees: "1",
    company_not_created: false,
    company_recently_created: false,
    company_established: false,
  });

  // Simuler la récupération de l'email depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    // Timer pour le renvoi du code
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(value);
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    
    // Simuler l'appel API de renvoi
    setTimeout(() => {
      setActionData({ success: "Code renvoyé avec succès !" });
      
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setActionData({ error: "Veuillez saisir un code de vérification valide" });
      return;
    }

    if (!formData.company_name || (!formData.company_not_created && !formData.company_recently_created && !formData.company_established)) {
      setActionData({ error: "Veuillez compléter toutes les informations requises" });
      return;
    }

    setIsLoading(true);
    
    // Préparer les données pour l'API
    const submissionData = {
      email: email,
      otp_code: otpCode,
      company_name: formData.company_name,
      company_description: formData.company_description,
      industry_sector: formData.industry_sector,
      number_of_employees: parseInt(formData.number_of_employees) || 1,
      company_not_created: formData.company_not_created,
      company_recently_created: formData.company_recently_created,
      company_established: formData.company_established,
    };
    
    // Simulation d'appel API
    setTimeout(() => {
      setIsLoading(false);
      // Redirection vers login avec message de succès
      window.location.href = "/login?message=registration_complete";
    }, 2000);
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
            <div className="absolute top-24 right-24 w-12 h-12 border-2 border-green-400/20 transform rotate-12"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-md">
            {/* Logo NUKU */}
            <div className="mb-12">
              <div className="inline-flex items-center justify-center mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
                  
                  <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                    
                    <div className="relative z-10">
                      <img
                        className="h-16 w-auto filter brightness-110 drop-shadow-lg"
                        src="/app/assets/images/logo_nuku.webp"
                        alt="NUKU"
                      />
                    </div>
                    
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-60 animate-ping"></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-40"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Presque fini !
              <span className="block bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
                Dernière étape
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Vérifiez votre email et complétez votre profil pour rejoindre la communauté NUKU
            </p>
            
            {/* Étapes de progression */}
            <div className="flex justify-center space-x-8 text-slate-400">
              <div className="text-center group">
                <div className="w-12 h-12 bg-teal-500/30 rounded-lg flex items-center justify-center mb-2 mx-auto transition-all duration-300">
                  <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-teal-300">Inscription</span>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:bg-green-500/30 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <span className="text-sm group-hover:text-green-300 transition-colors">Vérification</span>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 bg-slate-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:bg-slate-400/30 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm group-hover:text-slate-300 transition-colors">Démarrage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            
            {/* Logo mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                  
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                    <img
                      className="relative z-10 h-12 w-auto"
                      src="/app/assets/images/logo_nuku.webp"
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
                  Vérifiez votre email
                </h2>
                <p className="text-slate-600 text-lg">
                  Un code de vérification a été envoyé à
                </p>
                <p className="text-teal-600 font-semibold text-lg mt-1">
                  {email}
                </p>
              </div>

              {/* Messages de succès/erreur */}
              {actionData?.success && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-green-800 font-medium">{actionData.success}</p>
                    </div>
                  </div>
                </div>
              )}

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
              <div className="space-y-6">
                
                <input type="hidden" name="email" value={email} />
                
                {/* Code OTP */}
                <div>
                  <label htmlFor="otp_code" className="block text-sm font-semibold text-slate-700 mb-3">
                    Code de vérification
                  </label>
                  <div className="relative">
                    <input
                      id="otp_code"
                      name="otp_code"
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={handleOtpChange}
                      className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300 text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Bouton renvoyer le code */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-slate-600">
                      Vous n'avez pas reçu le code ?
                    </span>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={!canResend}
                      className={`text-sm font-semibold transition-colors ${
                        canResend
                          ? 'text-teal-600 hover:text-teal-500 cursor-pointer'
                          : 'text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {canResend ? 'Renvoyer' : `Renvoyer (${resendTimer}s)`}
                    </button>
                  </div>
                </div>

                {/* Informations de l'entreprise */}
                <div className="bg-gradient-to-r from-slate-50 to-teal-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Complétez votre profil
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="company_name" className="block text-sm font-semibold text-slate-700 mb-2">
                        Nom de l'entreprise *
                      </label>
                      <input
                        id="company_name"
                        name="company_name"
                        type="text"
                        required
                        value={formData.company_name}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                        placeholder="Ma Super Startup"
                      />
                    </div>

                    <div>
                      <label htmlFor="industry_sector" className="block text-sm font-semibold text-slate-700 mb-2">
                        Secteur d'activité *
                      </label>
                      <select
                        id="industry_sector"
                        name="industry_sector"
                        required
                        value={formData.industry_sector}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                      >
                        <option value="">Sélectionnez un secteur</option>
                        <option value="technology">Technologie</option>
                        <option value="healthcare">Santé</option>
                        <option value="education">Éducation</option>
                        <option value="finance">Finance</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="commerce">Commerce</option>
                        <option value="services">Services</option>
                        <option value="manufacturing">Industrie</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="number_of_employees" className="block text-sm font-semibold text-slate-700 mb-2">
                        Nombre d'employés
                      </label>
                      <select
                        id="number_of_employees"
                        name="number_of_employees"
                        value={formData.number_of_employees}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                      >
                        <option value="1">1 (seulement moi)</option>
                        <option value="2">2-5</option>
                        <option value="6">6-10</option>
                        <option value="11">11-50</option>
                        <option value="51">51-200</option>
                        <option value="201">200+</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="company_description" className="block text-sm font-semibold text-slate-700 mb-2">
                        Description de l'entreprise
                      </label>
                      <textarea
                        id="company_description"
                        name="company_description"
                        rows={3}
                        value={formData.company_description}
                        onChange={handleChange}
                        placeholder="Décrivez brièvement votre entreprise et votre projet..."
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300 resize-none"
                      />
                    </div>

                    {/* Statut de l'entreprise */}
                    <div className="space-y-3">
                      <span className="block text-sm font-semibold text-slate-700">
                        Statut de votre entreprise *
                      </span>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            id="company_not_created"
                            name="company_not_created"
                            type="checkbox"
                            checked={formData.company_not_created}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  company_not_created: true,
                                  company_recently_created: false,
                                  company_established: false,
                                });
                              } else {
                                setFormData({...formData, company_not_created: false});
                              }
                            }}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                          />
                          <label htmlFor="company_not_created" className="ml-3 block text-sm text-slate-900 font-medium">
                            💡 Entreprise pas encore créée
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="company_recently_created"
                            name="company_recently_created"
                            type="checkbox"
                            checked={formData.company_recently_created}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  company_not_created: false,
                                  company_recently_created: true,
                                  company_established: false,
                                });
                              } else {
                                setFormData({...formData, company_recently_created: false});
                              }
                            }}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                          />
                          <label htmlFor="company_recently_created" className="ml-3 block text-sm text-slate-900 font-medium">
                            🚀 Entreprise récemment créée (moins d'1 an)
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="company_established"
                            name="company_established"
                            type="checkbox"
                            checked={formData.company_established}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  company_not_created: false,
                                  company_recently_created: false,
                                  company_established: true,
                                });
                              } else {
                                setFormData({...formData, company_established: false});
                              }
                            }}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                          />
                          <label htmlFor="company_established" className="ml-3 block text-sm text-slate-900 font-medium">
                            🏢 Entreprise établie (plus d'1 an)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading || !otpCode || otpCode.length !== 6}
                  className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mt-8"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Finalisation...
                    </>
                  ) : (
                    <>
                      Finaliser l'inscription
                      <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Liens utiles */}
                <div className="text-center space-y-4 pt-6 border-t border-slate-100 mt-6">
                  <a
                    href="/login"
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à la connexion
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