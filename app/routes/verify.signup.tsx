import { useState, useEffect } from "react";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { authServerAPI } from "~/utils/api.server";

// Action pour gérer la vérification OTP + finalisation inscription
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  const verificationData = {
    // Infos utilisateur (répétées pour l'API)
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    otp_code: formData.get("otp_code") as string,
    
    // Infos entreprise
    company_name: formData.get("company_name") as string,
    company_description: formData.get("company_description") as string,
    industry_sector: formData.get("industry_sector") as string,
    number_of_employees: parseInt(formData.get("number_of_employees") as string) || 1,
    
    // Données économiques (optionnelles)
    annual_revenue: formData.get("annual_revenue") ? parseFloat(formData.get("annual_revenue") as string) : undefined,
    founding_date: formData.get("founding_date") as string || undefined,
    company_registration_number: formData.get("company_registration_number") as string || undefined,
    
    // Financement (optionnel)
    has_raised_funds: formData.get("has_raised_funds") === "true",
    amount_raised: formData.get("amount_raised") ? parseFloat(formData.get("amount_raised") as string) : undefined,
    wants_to_raise_funds: formData.get("wants_to_raise_funds") === "true",
    desired_funding_amount: formData.get("desired_funding_amount") ? parseFloat(formData.get("desired_funding_amount") as string) : undefined,
    
    // Niveau de maturité (un seul doit être True)
    company_not_created: formData.get("company_not_created") === "true",
    company_recently_created: formData.get("company_recently_created") === "true",
    company_established: formData.get("company_established") === "true",
  };

  if (!verificationData.email || !verificationData.otp_code) {
    return json({ error: "Email et code OTP requis" }, { status: 400 });
  }

  if (!verificationData.company_name) {
    return json({ error: "Le nom de l'entreprise est requis" }, { status: 400 });
  }

  try {
    await authServerAPI.verifyRegistration(verificationData);
    return redirect("/login?message=registration_complete");
  } catch (error: any) {
    return json(
      { error: error.message || "Erreur lors de la vérification" },
      { status: 400 }
    );
  }
}

export default function SignupVerify() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const email = searchParams.get("email") || "";
  const userId = searchParams.get("user_id") || "";
  
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Données utilisateur (à récupérer depuis l'étape 1 ou localStorage)
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
  });

  const [formData, setFormData] = useState({
    company_name: "",
    company_description: "",
    industry_sector: "",
    number_of_employees: "1",
    
    // Niveau de maturité
    company_maturity: "", // "not_created", "recently_created", "established"
    
    // Champs conditionnels selon la maturité
    founding_date: "",
    company_registration_number: "",
    annual_revenue: "",
    has_raised_funds: false,
    amount_raised: "",
    wants_to_raise_funds: false,
    desired_funding_amount: "",
  });

  // Timer pour le renvoi du code
  useEffect(() => {
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

  // Récupérer les données utilisateur depuis sessionStorage ou URL
  useEffect(() => {
    const storedUserData = sessionStorage.getItem('signup_user_data');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(value);
  };

  const handleMaturityChange = (maturity: string) => {
    setFormData({
      ...formData,
      company_maturity: maturity,
      // Reset des champs conditionnels
      founding_date: "",
      company_registration_number: "",
      annual_revenue: "",
      has_raised_funds: false,
      amount_raised: "",
      wants_to_raise_funds: false,
      desired_funding_amount: "",
    });
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    
    // Appel API pour renvoyer le code (si disponible dans votre backend)
    // await authServerAPI.resendOTP(email);
    
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
  };

  const handleSubmit = () => {
    setIsLoading(true);
  };

  const getMaturityFields = () => {
    switch (formData.company_maturity) {
      case "recently_created":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date de création
                </label>
                <input
                  type="date"
                  name="founding_date"
                  value={formData.founding_date}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Numéro d'enregistrement
                </label>
                <input
                  type="text"
                  name="company_registration_number"
                  value={formData.company_registration_number}
                  onChange={handleChange}
                  placeholder="Numéro SIRET/SIREN"
                  className="block w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        );
      
      case "established":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date de création
                </label>
                <input
                  type="date"
                  name="founding_date"
                  value={formData.founding_date}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Numéro d'enregistrement *
                </label>
                <input
                  type="text"
                  name="company_registration_number"
                  value={formData.company_registration_number}
                  onChange={handleChange}
                  required
                  placeholder="Numéro SIRET/SIREN"
                  className="block w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Chiffre d'affaires annuel (€)
              </label>
              <input
                type="number"
                name="annual_revenue"
                value={formData.annual_revenue}
                onChange={handleChange}
                placeholder="Ex: 150000"
                className="block w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
              />
            </div>

            {/* Section financement */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h5 className="text-base font-semibold text-slate-800 mb-3">Financement</h5>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="has_raised_funds"
                    name="has_raised_funds"
                    type="checkbox"
                    checked={formData.has_raised_funds}
                    onChange={(e) => setFormData({...formData, has_raised_funds: e.target.checked})}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <label htmlFor="has_raised_funds" className="ml-3 block text-sm text-slate-700">
                    Avez-vous déjà levé des fonds ?
                  </label>
                </div>

                {formData.has_raised_funds && (
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">
                      Montant levé (€)
                    </label>
                    <input
                      type="number"
                      name="amount_raised"
                      value={formData.amount_raised}
                      onChange={handleChange}
                      placeholder="Ex: 50000"
                      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    id="wants_to_raise_funds"
                    name="wants_to_raise_funds"
                    type="checkbox"
                    checked={formData.wants_to_raise_funds}
                    onChange={(e) => setFormData({...formData, wants_to_raise_funds: e.target.checked})}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <label htmlFor="wants_to_raise_funds" className="ml-3 block text-sm text-slate-700">
                    Souhaitez-vous lever des fonds ?
                  </label>
                </div>

                {formData.wants_to_raise_funds && (
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">
                      Montant recherché (€)
                    </label>
                    <input
                      type="number"
                      name="desired_funding_amount"
                      value={formData.desired_funding_amount}
                      onChange={handleChange}
                      placeholder="Ex: 100000"
                      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
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
                        src="public/images/logo_nuku.webp"
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
            
            {/* Indicateur d'étapes */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="flex items-center space-x-2 text-teal-400">
                <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-teal-400 bg-teal-400/20 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Informations personnelles</span>
              </div>
              
              <div className="w-8 h-0.5 bg-teal-400 transition-all duration-300"></div>
              
              <div className="flex items-center space-x-2 text-teal-400">
                <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-teal-400 bg-teal-400/20 transition-all duration-300">
                  <span className="text-sm font-semibold">2</span>
                </div>
                <span className="text-sm font-medium">Vérification & Entreprise</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-1/2 flex items-start justify-center p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-lg py-8">
            
            {/* Logo mobile */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                  
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                    <img
                      className="relative z-10 h-10 w-auto"
                      src="public/images/logo_nuku.webp"
                      alt="NUKU"
                    />
                  </div>
                </div>
              </div>
              
              {/* Indicateur d'étapes mobile */}
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="flex items-center space-x-2 text-teal-600">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-teal-600 bg-teal-100 transition-all duration-300">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                
                <div className="w-6 h-0.5 bg-teal-600 transition-all duration-300"></div>
                
                <div className="flex items-center space-x-2 text-teal-600">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-teal-600 bg-teal-100 transition-all duration-300">
                    <span className="text-xs font-semibold">2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte du formulaire */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-6 lg:p-8">
              
              {/* En-tête */}
              <div className="text-center mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                  Vérifiez votre email
                </h2>
                <p className="text-slate-600">
                  Un code de vérification a été envoyé à
                </p>
                <p className="text-teal-600 font-semibold mt-1">
                  {email}
                </p>
              </div>

              {/* Message d'erreur */}
              {actionData?.error && (
                <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-2xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                {/* Champs cachés pour les données utilisateur */}
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="first_name" value={userData.first_name} />
                <input type="hidden" name="last_name" value={userData.last_name} />
                <input type="hidden" name="phone" value={userData.phone} />
                <input type="hidden" name="password" value={userData.password} />
                
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
                    Informations sur votre entreprise
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
                        Secteur d'activité
                      </label>
                      <select
                        id="industry_sector"
                        name="industry_sector"
                        value={formData.industry_sector}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                      >
                        <option value="">Sélectionnez un secteur</option>
                        <option value="Agroalimentaire">Agroalimentaire</option>
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

                    {/* Niveau de maturité */}
                    <div className="space-y-3">
                      <span className="block text-sm font-semibold text-slate-700">
                        À quel stade est votre entreprise ? *
                      </span>
                      
                      <div className="space-y-3">
                        <div 
                          className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.company_maturity === 'not_created' 
                              ? 'border-teal-400 bg-teal-50' 
                              : 'border-slate-200 bg-white hover:border-teal-200'
                          }`}
                          onClick={() => handleMaturityChange('not_created')}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="company_maturity"
                              value="not_created"
                              checked={formData.company_maturity === 'not_created'}
                              onChange={(e) => handleMaturityChange(e.target.value)}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                            />
                            <div className="ml-3">
                              <label className="block text-sm font-medium text-slate-800 cursor-pointer">
                                💡 Idée / Projet en développement
                              </label>
                              <p className="text-xs text-slate-600 mt-1">
                                Vous avez une idée d'entreprise mais elle n'est pas encore créée juridiquement
                              </p>
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.company_maturity === 'recently_created' 
                              ? 'border-teal-400 bg-teal-50' 
                              : 'border-slate-200 bg-white hover:border-teal-200'
                          }`}
                          onClick={() => handleMaturityChange('recently_created')}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="company_maturity"
                              value="recently_created"
                              checked={formData.company_maturity === 'recently_created'}
                              onChange={(e) => handleMaturityChange(e.target.value)}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                            />
                            <div className="ml-3">
                              <label className="block text-sm font-medium text-slate-800 cursor-pointer">
                                🚀 Startup récente (moins d'1 an)
                              </label>
                              <p className="text-xs text-slate-600 mt-1">
                                Votre entreprise est créée récemment et vous développez votre activité
                              </p>
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.company_maturity === 'established' 
                              ? 'border-teal-400 bg-teal-50' 
                              : 'border-slate-200 bg-white hover:border-teal-200'
                          }`}
                          onClick={() => handleMaturityChange('established')}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="company_maturity"
                              value="established"
                              checked={formData.company_maturity === 'established'}
                              onChange={(e) => handleMaturityChange(e.target.value)}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                            />
                            <div className="ml-3">
                              <label className="block text-sm font-medium text-slate-800 cursor-pointer">
                                🏢 Entreprise établie (plus d'1 an)
                              </label>
                              <p className="text-xs text-slate-600 mt-1">
                                Votre entreprise existe depuis plus d'un an et génère du chiffre d'affaires
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Champs cachés pour les valeurs booléennes */}
                    <input type="hidden" name="company_not_created" value={formData.company_maturity === 'not_created' ? 'true' : 'false'} />
                    <input type="hidden" name="company_recently_created" value={formData.company_maturity === 'recently_created' ? 'true' : 'false'} />
                    <input type="hidden" name="company_established" value={formData.company_maturity === 'established' ? 'true' : 'false'} />
                  </div>
                </div>

                {/* Champs conditionnels selon la maturité */}
                {formData.company_maturity && formData.company_maturity !== 'not_created' && (
                  <div className="bg-white/50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="text-base font-semibold text-slate-800 mb-4">
                      Informations complémentaires
                    </h4>
                    {getMaturityFields()}
                  </div>
                )}

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={isLoading || !otpCode || otpCode.length !== 6 || !formData.company_name || !formData.company_maturity}
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
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}