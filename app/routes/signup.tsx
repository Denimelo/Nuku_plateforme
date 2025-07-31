import { useState } from "react";
import { Form, useActionData, useNavigate } from "@remix-run/react";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const actionData = useActionData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Informations personnelles
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    
    // Informations d'entreprise
    company_name: "",
    company_description: "",
    industry_sector: "",
    website_url: "",
    
    // Niveau de maturité (un seul peut être sélectionné)
    company_maturity: "", // "not_created", "recently_created", "established"
    
    // Champs conditionnels selon la maturité
    founding_date: "",
    company_registration_number: "",
    number_of_employees: "1",
    annual_revenue: "",
    has_raised_funds: false,
    amount_raised: "",
    wants_to_raise_funds: false,
    desired_funding_amount: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleMaturityChange = (maturity) => {
    setFormData({
      ...formData,
      company_maturity: maturity,
      // Reset des champs conditionnels
      founding_date: "",
      company_registration_number: "",
      number_of_employees: maturity === "not_created" ? "0" : "1",
      annual_revenue: "",
      has_raised_funds: false,
      amount_raised: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validation
    if (currentStep === 1) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        return;
      }
      setCurrentStep(2);
      return;
    }
    
    // Étape 2 - Soumission finale
    if (!formData.company_name || !formData.company_maturity) {
      return;
    }
    
    setIsLoading(true);
    
    // Préparer les données pour l'API
    const submissionData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      company_name: formData.company_name,
      company_description: formData.company_description,
      industry_sector: formData.industry_sector,
      website_url: formData.website_url,
      company_not_created: formData.company_maturity === "not_created",
      company_recently_created: formData.company_maturity === "recently_created",
      company_established: formData.company_maturity === "established",
      founding_date: formData.founding_date || null,
      company_registration_number: formData.company_registration_number || null,
      number_of_employees: parseInt(formData.number_of_employees) || 0,
      annual_revenue: parseFloat(formData.annual_revenue) || null,
      has_raised_funds: formData.has_raised_funds,
      amount_raised: parseFloat(formData.amount_raised) || null,
      wants_to_raise_funds: formData.wants_to_raise_funds,
      desired_funding_amount: parseFloat(formData.desired_funding_amount) || null,
    };
    
    // Simulation d'appel API (remplacez par votre logique réelle)
    setTimeout(() => {
      setIsLoading(false);
      navigate("/verify/signup?email=" + encodeURIComponent(formData.email));
    }, 2000);
  };

  const getMaturityFields = () => {
    switch (formData.company_maturity) {
      case "recently_created":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Date de création
                </label>
                <input
                  type="date"
                  name="founding_date"
                  value={formData.founding_date}
                  onChange={handleChange}
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Numéro d'enregistrement
                </label>
                <input
                  type="text"
                  name="company_registration_number"
                  value={formData.company_registration_number}
                  onChange={handleChange}
                  placeholder="Numéro SIRET/SIREN"
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Nombre d'employés
              </label>
              <select
                name="number_of_employees"
                value={formData.number_of_employees}
                onChange={handleChange}
                className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
              >
                <option value="1">1 (seulement moi)</option>
                <option value="2">2-5</option>
                <option value="6">6-10</option>
                <option value="11">11-50</option>
              </select>
            </div>
          </div>
        );
      
      case "established":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Date de création
                </label>
                <input
                  type="date"
                  name="founding_date"
                  value={formData.founding_date}
                  onChange={handleChange}
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Numéro d'enregistrement *
                </label>
                <input
                  type="text"
                  name="company_registration_number"
                  value={formData.company_registration_number}
                  onChange={handleChange}
                  required
                  placeholder="Numéro SIRET/SIREN"
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Nombre d'employés
                </label>
                <select
                  name="number_of_employees"
                  value={formData.number_of_employees}
                  onChange={handleChange}
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
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
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Chiffre d'affaires annuel (€)
                </label>
                <input
                  type="number"
                  name="annual_revenue"
                  value={formData.annual_revenue}
                  onChange={handleChange}
                  placeholder="Ex: 150000"
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                />
              </div>
            </div>

            {/* Section financement */}
            <div className="bg-gradient-to-r from-slate-50 to-teal-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Financement</h4>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="has_raised_funds"
                    name="has_raised_funds"
                    type="checkbox"
                    checked={formData.has_raised_funds}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <label htmlFor="has_raised_funds" className="ml-3 block text-sm font-medium text-slate-700">
                    Avez-vous déjà levé des fonds ?
                  </label>
                </div>

                {formData.has_raised_funds && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Montant levé (€)
                    </label>
                    <input
                      type="number"
                      name="amount_raised"
                      value={formData.amount_raised}
                      onChange={handleChange}
                      placeholder="Ex: 50000"
                      className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    id="wants_to_raise_funds"
                    name="wants_to_raise_funds"
                    type="checkbox"
                    checked={formData.wants_to_raise_funds}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <label htmlFor="wants_to_raise_funds" className="ml-3 block text-sm font-medium text-slate-700">
                    Souhaitez-vous lever des fonds ?
                  </label>
                </div>

                {formData.wants_to_raise_funds && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Montant recherché (€)
                    </label>
                    <input
                      type="number"
                      name="desired_funding_amount"
                      value={formData.desired_funding_amount}
                      onChange={handleChange}
                      placeholder="Ex: 100000"
                      className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
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
            <div className="absolute top-16 left-16 w-24 h-24 border border-teal-400/20 rounded-full"></div>
            <div className="absolute bottom-24 right-12 w-20 h-20 bg-gradient-to-r from-teal-400/10 to-green-400/10 rounded-lg transform rotate-45"></div>
            <div className="absolute top-1/2 left-8 w-12 h-12 bg-gradient-to-br from-slate-500/20 to-teal-500/20 rounded-full"></div>
            <div className="absolute top-32 right-32 w-16 h-16 border-2 border-green-400/20 transform rotate-12"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-md">
            {/* Logo NUKU */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
                  
                  <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                    
                    <div className="relative z-10">
                      <img
                        className="h-12 w-auto filter brightness-110 drop-shadow-lg"
                        src="/app/assets/images/logo_nuku.webp"
                        alt="NUKU"
                      />
                    </div>
                    
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-60 animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-40"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
              Rejoignez
              <span className="block bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
                l'écosystème NUKU
              </span>
            </h1>
            
            <p className="text-slate-300 text-base leading-relaxed mb-6">
              Connectez-vous avec des experts et accélérez votre croissance entrepreneuriale
            </p>
            
            {/* Indicateur d'étapes */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-teal-400' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= 1 ? 'border-teal-400 bg-teal-400/20' : 'border-slate-400'}`}>
                  <span className="text-sm font-semibold">1</span>
                </div>
                <span className="text-sm font-medium">Informations personnelles</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-teal-400' : 'bg-slate-400'} transition-all duration-300`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-teal-400' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= 2 ? 'border-teal-400 bg-teal-400/20' : 'border-slate-400'}`}>
                  <span className="text-sm font-semibold">2</span>
                </div>
                <span className="text-sm font-medium">Votre entreprise</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg">
            
            {/* Logo mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                  
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                    <img
                      className="relative z-10 h-10 w-auto"
                      src="/app/assets/images/logo_nuku.webp"
                      alt="NUKU"
                    />
                  </div>
                </div>
              </div>
              
              {/* Indicateur d'étapes mobile */}
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-teal-600' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= 1 ? 'border-teal-600 bg-teal-100' : 'border-slate-300'}`}>
                    <span className="text-xs font-semibold">1</span>
                  </div>
                </div>
                
                <div className={`w-6 h-0.5 ${currentStep >= 2 ? 'bg-teal-600' : 'bg-slate-300'} transition-all duration-300`}></div>
                
                <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-teal-600' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= 2 ? 'border-teal-600 bg-teal-100' : 'border-slate-300'}`}>
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
                  {currentStep === 1 ? "Vos informations" : "Votre entreprise"}
                </h2>
                <p className="text-slate-600">
                  {currentStep === 1 
                    ? "Commençons par vous connaître"
                    : "Parlez-nous de votre projet d'entreprise"
                  }
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
                
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Nom et Prénom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700 mb-3">
                          Prénom *
                        </label>
                        <input
                          id="first_name"
                          name="first_name"
                          type="text"
                          required
                          value={formData.first_name}
                          onChange={handleChange}
                          className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                          placeholder="Jean"
                        />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700 mb-3">
                          Nom *
                        </label>
                        <input
                          id="last_name"
                          name="last_name"
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={handleChange}
                          className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                          placeholder="Dupont"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                        Adresse email *
                      </label>
                      <div className="relative group">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300 pr-12"
                          placeholder="jean.dupont@example.com"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-3">
                        Téléphone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>

                    {/* Mots de passe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                          Mot de passe *
                        </label>
                        <div className="relative group">
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300 pr-12"
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
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-3">
                          Confirmer le mot de passe *
                        </label>
                        <div className="relative group">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`block w-full px-4 py-4 bg-white border-2 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 pr-12 ${
                              formData.confirmPassword && formData.password !== formData.confirmPassword
                                ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                                : 'border-slate-200 focus:ring-teal-100 focus:border-teal-400'
                            }`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
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
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p className="mt-2 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8">
                    {/* Informations de base de l'entreprise */}
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="company_name" className="block text-sm font-semibold text-slate-700 mb-3">
                          Nom de l'entreprise *
                        </label>
                        <input
                          id="company_name"
                          name="company_name"
                          type="text"
                          required
                          value={formData.company_name}
                          onChange={handleChange}
                          className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                          placeholder="Ma Super Startup"
                        />
                      </div>

                      <div>
                        <label htmlFor="industry_sector" className="block text-sm font-semibold text-slate-700 mb-3">
                          Secteur d'activité
                        </label>
                        <select
                          id="industry_sector"
                          name="industry_sector"
                          value={formData.industry_sector}
                          onChange={handleChange}
                          className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
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
                        <label htmlFor="company_description" className="block text-sm font-semibold text-slate-700 mb-3">
                          Description de votre projet
                        </label>
                        <textarea
                          id="company_description"
                          name="company_description"
                          rows={4}
                          value={formData.company_description}
                          onChange={handleChange}
                          placeholder="Décrivez brièvement votre entreprise, votre vision et vos objectifs..."
                          className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300 resize-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="website_url" className="block text-sm font-semibold text-slate-700 mb-3">
                          Site web (optionnel)
                        </label>
                        <input
                          id="website_url"
                          name="website_url"
                          type="url"
                          value={formData.website_url}
                          onChange={handleChange}
                          className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all duration-300"
                          placeholder="https://monsite.com"
                        />
                      </div>
                    </div>

                    {/* Niveau de maturité */}
                    <div className="bg-gradient-to-r from-slate-50 to-teal-50 rounded-2xl p-6 border border-slate-100">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        À quel stade est votre entreprise ? *
                      </h3>
                      <div className="space-y-4">
                        <div 
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.company_maturity === 'not_created' 
                              ? 'border-teal-400 bg-teal-50 shadow-lg' 
                              : 'border-slate-200 bg-white hover:border-teal-200'
                          }`}
                          onClick={() => handleMaturityChange('not_created')}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="company_maturity"
                              value="not_created"
                              checked={formData.company_maturity === 'not_created'}
                              onChange={(e) => handleMaturityChange(e.target.value)}
                              className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                            />
                            <div className="ml-3">
                              <label className="block text-base font-semibold text-slate-800 cursor-pointer">
                                💡 Idée / Projet en développement
                              </label>
                              <p className="text-sm text-slate-600 mt-1">
                                Vous avez une idée d'entreprise mais elle n'est pas encore créée juridiquement
                              </p>
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.company_maturity === 'recently_created' 
                              ? 'border-teal-400 bg-teal-50 shadow-lg' 
                              : 'border-slate-200 bg-white hover:border-teal-200'
                          }`}
                          onClick={() => handleMaturityChange('recently_created')}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="company_maturity"
                              value="recently_created"
                              checked={formData.company_maturity === 'recently_created'}
                              onChange={(e) => handleMaturityChange(e.target.value)}
                              className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                            />
                            <div className="ml-3">
                              <label className="block text-base font-semibold text-slate-800 cursor-pointer">
                                🚀 Startup récente (moins d'1 an)
                              </label>
                              <p className="text-sm text-slate-600 mt-1">
                                Votre entreprise est créée récemment et vous développez votre activité
                              </p>
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.company_maturity === 'established' 
                              ? 'border-teal-400 bg-teal-50 shadow-lg' 
                              : 'border-slate-200 bg-white hover:border-teal-200'
                          }`}
                          onClick={() => handleMaturityChange('established')}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="company_maturity"
                              value="established"
                              checked={formData.company_maturity === 'established'}
                              onChange={(e) => handleMaturityChange(e.target.value)}
                              className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                            />
                            <div className="ml-3">
                              <label className="block text-base font-semibold text-slate-800 cursor-pointer">
                                🏢 Entreprise établie (plus d'1 an)
                              </label>
                              <p className="text-sm text-slate-600 mt-1">
                                Votre entreprise existe depuis plus d'un an et génère du chiffre d'affaires
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Champs conditionnels selon la maturité */}
                    {formData.company_maturity && (
                      <div className="bg-white/50 rounded-2xl p-6 border border-slate-100">
                        <h4 className="text-lg font-semibold text-slate-800 mb-4">
                          Informations complémentaires
                        </h4>
                        {getMaturityFields()}
                      </div>
                    )}
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex items-center justify-between pt-6">
                  {currentStep === 2 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center px-6 py-3 border-2 border-slate-300 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all duration-300"
                    >
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Retour
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || (currentStep === 1 && (!formData.first_name || !formData.last_name || !formData.email || !formData.password || formData.password !== formData.confirmPassword))}
                    className={`group relative flex justify-center items-center py-4 px-8 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                      currentStep === 1 ? 'ml-auto' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création du compte...
                      </>
                    ) : currentStep === 1 ? (
                      <>
                        Continuer
                        <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Créer mon compte
                        <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {/* Liens du bas */}
                <div className="text-center space-y-4 pt-6 border-t border-slate-100 mt-6">
                  <p className="text-slate-600">
                    Vous avez déjà un compte ?{" "}
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
          </div>
        </div>
      </div>
    </div>
  );
}