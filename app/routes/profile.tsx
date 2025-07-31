import { useState } from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { authServerAPI, usersServerAPI, entrepreneursServerAPI, expertsServerAPI } from "~/utils/api.server";
import { requireUser } from "~/utils/auth.server";
import { getUserSession } from "~/utils/session.server";
import {
  User,
  Settings,
  Camera,
  Shield,
  Clock,
  Mail,
  Save,
  Eye,
  EyeOff,
  Key,
  Bell,
  Globe,
  Smartphone,
} from "lucide-react";
import { getAdminNavigation } from "~/utils/admin-navigation";

// Loader pour récupérer les données utilisateur
export async function loader({ request }: LoaderFunctionArgs) {
  const { user, token } = await requireUser(request);
  
  try {
    const userInfo = await authServerAPI.me(token);
    let roleSpecificData = null;

    // Récupérer les données spécifiques selon le rôle
    if (userInfo.user_type === "entrepreneur") {
      try {
        roleSpecificData = await entrepreneursServerAPI.getProfile(token);
      } catch (error) {
        console.log("Pas de profil entrepreneur trouvé:", error);
      }
    } else if (userInfo.user_type === "expert") {
      try {
        roleSpecificData = await expertsServerAPI.getProfile(token);
      } catch (error) {
        console.log("Pas de profil expert trouvé:", error);
      }
    }

    // Fusionner les données utilisateur avec les données spécifiques au rôle
    const completeUserData = {
      ...userInfo,
      ...roleSpecificData
    };

    return json({ user: completeUserData, error: null });
  } catch (error: any) {
    return json({ user: null, error: error.message || "Erreur lors du chargement du profil" });
  }
}

// Action pour les mises à jour du profil
export async function action({ request }: ActionFunctionArgs) {
  const { user, token } = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    switch (intent) {
      case "update_profile":
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        
        await usersServerAPI.updateProfile(token, { 
          first_name: firstName, 
          last_name: lastName, 
          email 
        });
        return json({ success: "Profil mis à jour avec succès", error: null });

      case "update_entrepreneur_profile":
        const companyName = formData.get("companyName") as string;
        const industry = formData.get("industry") as string;
        const companyDescription = formData.get("companyDescription") as string;
        const websiteUrl = formData.get("websiteUrl") as string;
        const phoneNumber = formData.get("phoneNumber") as string;
        const entrepreneurLinkedinUrl = formData.get("linkedinUrl") as string;
        const companyMaturity = formData.get("companyMaturity") as string;
        
        // Gérer la maturité de l'entreprise
        const maturityData = {
          company_not_created: companyMaturity === "not_created",
          company_recently_created: companyMaturity === "recently_created",
          company_established: companyMaturity === "established"
        };
        
        // Utiliser l'API entrepreneur pour mettre à jour les informations spécifiques
        await entrepreneursServerAPI.updateProfile(token, {
          company_name: companyName,
          industry,
          company_description: companyDescription,
          website_url: websiteUrl,
          phone_number: phoneNumber,
          linkedin_url: entrepreneurLinkedinUrl,
          ...maturityData
        });
        return json({ success: "Informations de l'entreprise mises à jour avec succès", error: null });

      case "update_expert_profile":
        const specialization = formData.get("specialization") as string;
        const experienceYears = parseInt(formData.get("experienceYears") as string) || 0;
        const hourlyRate = parseFloat(formData.get("hourlyRate") as string) || null;
        const bio = formData.get("bio") as string;
        const expertLinkedinUrl = formData.get("linkedinUrl") as string;
        
        // Utiliser l'API expert pour mettre à jour les informations spécifiques
        await expertsServerAPI.updateProfile(token, {
          specialization,
          experience_years: experienceYears,
          hourly_rate: hourlyRate,
          bio,
          linkedin_url: expertLinkedinUrl
        });
        return json({ success: "Informations professionnelles mises à jour avec succès", error: null });

      case "change_password":
        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (newPassword !== confirmPassword) {
          return json({ success: null, error: "Les mots de passe ne correspondent pas" });
        }

        await authServerAPI.changePassword(token, currentPassword, newPassword);
        return json({ success: "Mot de passe modifié avec succès", error: null });

      default:
        return json({ success: null, error: "Action non reconnue" });
    }
  } catch (error: any) {
    return json({ success: null, error: error.message || "Erreur lors de la mise à jour" });
  }
}

export default function Profile() {
  const { user, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  // Définir la navigation selon le type d'utilisateur
  const getNavigationForUser = (userType: string, currentPath: string = "/profile") => {
    switch (userType) {
      case "admin":
        return getAdminNavigation(currentPath);
      case "entrepreneur":
        // return getEntrepreneurNavigation(currentPath); // À créer si nécessaire
        return [];
      case "expert":
        // return getExpertNavigation(currentPath); // À créer si nécessaire
        return [];
      default:
        return [];
    }
  };

  const navigationItems = user ? getNavigationForUser(user.user_type) : [];

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "admin":
        return "Administrateur";
      case "expert":
        return "Expert";
      case "entrepreneur":
        return "Entrepreneur";
      default:
        return "Utilisateur";
    }
  };

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-pink-500";
      case "expert":
        return "bg-gradient-to-r from-purple-500 to-indigo-500";
      case "entrepreneur":
        return "bg-gradient-to-r from-blue-500 to-teal-500";
      default:
        return "bg-gradient-to-r from-slate-500 to-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { color: "bg-green-100 text-green-800 border-green-200", label: "Actif" };
      case "inactive":
        return { color: "bg-red-100 text-red-800 border-red-200", label: "Inactif" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "En attente" };
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Inconnu" };
    }
  };

  if (error) {
    return (
      <Layout user={user} title="Profil" navigation={navigationItems}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const statusInfo = getStatusBadge(user?.status || "");

  return (
    <Layout user={user} title="Mon Profil" navigation={navigationItems}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Messages de feedback */}
        {actionData?.success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Save className="h-5 w-5 text-white" />
              </div>
              <p className="ml-3 text-green-800 font-medium">{actionData.success}</p>
            </div>
          </div>
        )}

        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <p className="ml-3 text-red-800 font-medium">{actionData.error}</p>
            </div>
          </div>
        )}

        {/* Header du profil */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
              <div className={`relative w-32 h-32 ${getUserTypeBadge(user?.user_type || "")} rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl group-hover:scale-105 transition-all duration-300`}>
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg border-2 border-white flex items-center justify-center hover:scale-110 transition-transform group">
                <Camera className="h-5 w-5 text-slate-600 group-hover:text-teal-600" />
              </button>
            </div>

            {/* Informations */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {user?.first_name} {user?.last_name}
              </h1>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4 mb-4">
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getUserTypeBadge(user?.user_type || "")} text-white`}>
                  {getUserTypeLabel(user?.user_type || "")}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-6 text-slate-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {user?.email}
                </div>
                {user?.last_login && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Dernière connexion : {new Date(user.last_login).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-2">
          <nav className="flex space-x-2">
            {[
              { id: "profile", label: "Informations", icon: User },
              { id: "security", label: "Sécurité", icon: Shield },
              { id: "preferences", label: "Préférences", icon: Settings },
              { id: "notifications", label: "Notifications", icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-slate-700 to-teal-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          
          {/* Onglet Profil */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Informations personnelles */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Informations personnelles</h2>
                <Form method="post" className="space-y-6">
                  <input type="hidden" name="intent" value="update_profile" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-3">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        defaultValue={user?.first_name}
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-3">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        defaultValue={user?.last_name}
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={user?.email}
                      className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Sauvegarder les informations personnelles
                      </>
                    )}
                  </button>
                </Form>
              </div>

              {/* Section spécifique Entrepreneur */}
              {user?.user_type === "entrepreneur" && (
                <div className="border-t border-slate-200 pt-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Informations de votre entreprise
                  </h2>
                  <Form method="post" className="space-y-6">
                    <input type="hidden" name="intent" value="update_entrepreneur_profile" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700 mb-3">
                          Nom de l'entreprise
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          defaultValue={user?.company_name || ""}
                          placeholder="Nom de votre entreprise"
                          className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="industry" className="block text-sm font-semibold text-slate-700 mb-3">
                          Secteur d'activité
                        </label>
                        <select
                          id="industry"
                          name="industry"
                          defaultValue={user?.industry || ""}
                          className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                        >
                          <option value="">Sélectionnez un secteur</option>
                          <option value="technology">Technologie</option>
                          <option value="healthcare">Santé</option>
                          <option value="finance">Finance</option>
                          <option value="education">Éducation</option>
                          <option value="ecommerce">E-commerce</option>
                          <option value="agriculture">Agriculture</option>
                          <option value="manufacturing">Industrie</option>
                          <option value="services">Services</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="companyDescription" className="block text-sm font-semibold text-slate-700 mb-3">
                        Description de l'entreprise
                      </label>
                      <textarea
                        id="companyDescription"
                        name="companyDescription"
                        rows={4}
                        defaultValue={user?.company_description || ""}
                        placeholder="Décrivez votre entreprise, ses activités et sa mission..."
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="websiteUrl" className="block text-sm font-semibold text-slate-700 mb-3">
                        Site web (optionnel)
                      </label>
                      <input
                        type="url"
                        id="websiteUrl"
                        name="websiteUrl"
                        defaultValue={user?.website_url || ""}
                        placeholder="https://www.votre-entreprise.com"
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                      />
                    </div>

                    {/* Maturité de l'entreprise */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Maturité de votre entreprise
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="companyMaturity"
                            value="not_created"
                            defaultChecked={user?.company_not_created}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span className="ml-3 text-slate-700">Entreprise pas encore créée</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="companyMaturity"
                            value="recently_created"
                            defaultChecked={user?.company_recently_created}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span className="ml-3 text-slate-700">Entreprise récemment créée</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="companyMaturity"
                            value="established"
                            defaultChecked={user?.company_established}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span className="ml-3 text-slate-700">Entreprise établie</span>
                        </label>
                      </div>
                    </div>

                    {/* Informations de contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 mb-3">
                          Numéro de téléphone (optionnel)
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          defaultValue={user?.phone_number || ""}
                          placeholder="+33 6 12 34 56 78"
                          className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="linkedinUrl" className="block text-sm font-semibold text-slate-700 mb-3">
                          Profil LinkedIn (optionnel)
                        </label>
                        <input
                          type="url"
                          id="linkedinUrl"
                          name="linkedinUrl"
                          defaultValue={user?.linkedin_url || ""}
                          placeholder="https://www.linkedin.com/in/votre-profil"
                          className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Sauvegarder les informations entreprise
                        </>
                      )}
                    </button>
                  </Form>
                </div>
              )}

              {/* Section spécifique Expert */}
              {user?.user_type === "expert" && (
                <div className="border-t border-slate-200 pt-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    Informations sur votre profession
                  </h2>
                  <Form method="post" className="space-y-6">
                    <input type="hidden" name="intent" value="update_expert_profile" />
                    
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-semibold text-slate-700 mb-3">
                        Spécialisation
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        defaultValue={user?.specialization || ""}
                        placeholder="Ex: Marketing digital, Finance d'entreprise, Stratégie..."
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="experienceYears" className="block text-sm font-semibold text-slate-700 mb-3">
                          Années d'expérience
                        </label>
                        <input
                          type="number"
                          id="experienceYears"
                          name="experienceYears"
                          min="0"
                          max="50"
                          defaultValue={user?.experience_years || ""}
                          placeholder="Ex: 5"
                          className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-semibold text-slate-700 mb-3">
                          Tarif horaire (€) - optionnel
                        </label>
                        <input
                          type="number"
                          id="hourlyRate"
                          name="hourlyRate"
                          min="0"
                          step="0.01"
                          defaultValue={user?.hourly_rate || ""}
                          placeholder="Ex: 75.00"
                          className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-3">
                        Biographie professionnelle
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        defaultValue={user?.bio || ""}
                        placeholder="Présentez votre parcours, vos compétences et votre approche d'accompagnement..."
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedinUrl" className="block text-sm font-semibold text-slate-700 mb-3">
                        Profil LinkedIn (optionnel)
                      </label>
                      <input
                        type="url"
                        id="linkedinUrl"
                        name="linkedinUrl"
                        defaultValue={user?.linkedin_url || ""}
                        placeholder="https://www.linkedin.com/in/votre-profil"
                        className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Sauvegarder les informations professionnelles
                        </>
                      )}
                    </button>
                  </Form>
                </div>
              )}
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === "security" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Sécurité du compte</h2>
              <Form method="post" className="space-y-6">
                <input type="hidden" name="intent" value="change_password" />
                
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-700 mb-3">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      className="block w-full px-4 py-3 pr-12 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-3">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      className="block w-full px-4 py-3 pr-12 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-3">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="block w-full px-4 py-3 pr-12 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Modification...
                    </>
                  ) : (
                    <>
                      <Key className="h-5 w-5 mr-2" />
                      Changer le mot de passe
                    </>
                  )}
                </button>
              </Form>
            </div>
          )}

          {/* Onglet Préférences */}
          {activeTab === "preferences" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Préférences</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-slate-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Langue</h3>
                      <p className="text-sm text-slate-600">Choisissez votre langue préférée</p>
                    </div>
                  </div>
                  <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option>Français</option>
                    <option>English</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 text-slate-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Mode sombre</h3>
                      <p className="text-sm text-slate-600">Activer le thème sombre</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === "notifications" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Notifications</h2>
              <div className="space-y-4">
                {[
                  { label: "Notifications par email", description: "Recevoir les notifications importantes par email" },
                  { label: "Notifications push", description: "Recevoir les notifications sur votre navigateur" },
                  { label: "Rappels de projets", description: "Être notifié des échéances de projets" },
                  { label: "Messages privés", description: "Notifications pour les nouveaux messages" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.label}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}