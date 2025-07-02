import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json, redirect, ActionFunctionArgs } from "@remix-run/node";
import { authTokenCookie } from "~/utils/session.server";
import { useEffect, useState } from "react";
import {
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Upload,
  FileText,
  Briefcase,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// Types
interface ApiError {
  detail?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface SignupResponse {
  access_token: string;
  token_type?: string;
  entrepreneur_id: string;
}

interface FormData {
  // User data
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;

  // Entrepreneur data
  company_name: string;
  company_registration_number: string;
  company_description: string;
  industry_sector: string;
  founding_date: string;
  number_of_employees: string;
  annual_revenue: string;
  has_raised_funds: boolean;
  amount_raised: string;
  wants_to_raise_funds: boolean;
  desired_funding_amount: string;

  // Maturity level
  company_not_created: boolean;
  company_recently_created: boolean;
  company_established: boolean;

  // File uploads
  identity_card_url: string;
  company_logo_url: string;
  registration_document_url: string;
  professional_card_url: string;
}

// Configuration API
const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 10000,
};

// Fonction utilitaire pour les appels API
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.detail ||
        data.message ||
        `Erreur ${response.status}: ${response.statusText}`;

      return { error: errorMessage };
    }

    return { data };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { error: "La requête a expiré. Veuillez réessayer." };
      }
      return { error: `Erreur de connexion: ${error.message}` };
    }
    return { error: "Une erreur inattendue s'est produite" };
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  // Extract user data
  const userData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: (formData.get("phone") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    country: (formData.get("country") as string) || null,
    postal_code: (formData.get("postal_code") as string) || null,
    user_type: "entrepreneur",
  };

  // Extract entrepreneur data
  const entrepreneurData = {
    company_name: formData.get("company_name") as string,
    company_registration_number:
      (formData.get("company_registration_number") as string) || null,
    company_description:
      (formData.get("company_description") as string) || null,
    industry_sector: (formData.get("industry_sector") as string) || null,
    founding_date: (formData.get("founding_date") as string) || null,
    number_of_employees: formData.get("number_of_employees")
      ? parseInt(formData.get("number_of_employees") as string)
      : null,
    annual_revenue: formData.get("annual_revenue")
      ? parseFloat(formData.get("annual_revenue") as string)
      : null,
    has_raised_funds: formData.get("has_raised_funds") === "true",
    amount_raised: formData.get("amount_raised")
      ? parseFloat(formData.get("amount_raised") as string)
      : null,
    wants_to_raise_funds: formData.get("wants_to_raise_funds") === "true",
    desired_funding_amount: formData.get("desired_funding_amount")
      ? parseFloat(formData.get("desired_funding_amount") as string)
      : null,

    // Maturity level
    company_not_created: formData.get("company_not_created") === "true",
    company_recently_created:
      formData.get("company_recently_created") === "true",
    company_established: formData.get("company_established") === "true",

    // File uploads (URLs)
    identity_card_url: (formData.get("identity_card_url") as string) || null,
    company_logo_url: (formData.get("company_logo_url") as string) || null,
    registration_document_url:
      (formData.get("registration_document_url") as string) || null,
    professional_card_url:
      (formData.get("professional_card_url") as string) || null,
  };

  // Validation basique
  if (
    !userData.email ||
    !userData.password ||
    !userData.first_name ||
    !userData.last_name ||
    !entrepreneurData.company_name
  ) {
    return json(
      { error: "Les champs obligatoires doivent être remplis" },
      { status: 400 }
    );
  }

  // Construire le payload pour l'API
  const payload = {
    user: userData,
    ...entrepreneurData,
  };

  // Appel API de création
  const { data, error } = await apiRequest<SignupResponse>(
    "/auth/signup/entrepreneur",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (error || !data) {
    return json(
      { error: error || "Erreur lors de la création du compte" },
      { status: 400 }
    );
  }

  // Redirection avec cookie sécurisé
  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await authTokenCookie.serialize(data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
      }),
    },
  });
};

export default function SignupPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<FormData>>({
    country: "Togo",
    has_raised_funds: false,
    wants_to_raise_funds: false,
    company_not_created: false,
    company_recently_created: false,
    company_established: false,
  });

  const isSubmitting = navigation.state === "submitting";

  // Validation côté client
  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (!formData.first_name) {
      errors.first_name = "Le prénom est requis";
    }

    if (!formData.last_name) {
      errors.last_name = "Le nom est requis";
    }

    return errors;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    if (!formData.company_name) {
      errors.company_name = "Le nom de l'entreprise est requis";
    }

    // Vérifier qu'un seul niveau de maturité est sélectionné
    const maturityLevels = [
      formData.company_not_created,
      formData.company_recently_created,
      formData.company_established,
    ].filter(Boolean);

    if (maturityLevels.length === 0) {
      errors.maturity =
        "Veuillez sélectionner le niveau de maturité de votre entreprise";
    } else if (maturityLevels.length > 1) {
      errors.maturity = "Veuillez sélectionner un seul niveau de maturité";
    }

    // Validation conditionnelle selon le niveau de maturité
    if (formData.company_not_created) {
      if (!formData.identity_card_url) {
        errors.identity_card_url = "La pièce d'identité est requise";
      }
      if (!formData.company_description) {
        errors.company_description =
          "La description de l'entreprise est requise";
      }
    }

    if (formData.company_recently_created) {
      if (!formData.identity_card_url) {
        errors.identity_card_url = "La pièce d'identité est requise";
      }
      if (!formData.company_description) {
        errors.company_description =
          "La description de l'entreprise est requise";
      }
      if (!formData.registration_document_url) {
        errors.registration_document_url =
          "Le document d'enregistrement est requis";
      }
    }

    if (formData.company_established) {
      if (!formData.identity_card_url) {
        errors.identity_card_url = "La pièce d'identité est requise";
      }
      if (!formData.company_description) {
        errors.company_description =
          "La description de l'entreprise est requise";
      }
      if (!formData.registration_document_url) {
        errors.registration_document_url =
          "Le document d'enregistrement est requis";
      }
      if (!formData.industry_sector) {
        errors.industry_sector = "Le secteur d'activité est requis";
      }
      if (!formData.founding_date) {
        errors.founding_date = "La date de création est requise";
      }
    }

    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep1();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const errors = validateStep2();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      return;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleMaturityChange = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      company_not_created: level === "not_created",
      company_recently_created: level === "recently_created",
      company_established: level === "established",
    }));

    // Clear maturity error
    if (formErrors.maturity) {
      setFormErrors((prev) => ({ ...prev, maturity: "" }));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <User className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#0B2749] mb-2">
          Informations personnelles
        </h2>
        <p className="text-gray-600">Commençons par vos informations de base</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Adresse email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
              formErrors.email ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            placeholder="votre@email.com"
          />
        </div>
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.email}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mot de passe *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password || ""}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
              formErrors.password
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {formErrors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.password}
          </p>
        )}
      </div>

      {/* Confirmation mot de passe */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Confirmer le mot de passe *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword || ""}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
              formErrors.confirmPassword
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {formErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Prénom et Nom */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            value={formData.first_name || ""}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
              formErrors.first_name
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="Jean"
          />
          {formErrors.first_name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom *
          </label>
          <input
            type="text"
            value={formData.last_name || ""}
            onChange={(e) => handleInputChange("last_name", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
              formErrors.last_name
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="Dupont"
          />
          {formErrors.last_name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
          )}
        </div>
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Téléphone
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
            placeholder="+228 XX XX XX XX"
          />
        </div>
      </div>

      {/* Adresse */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Adresse
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={formData.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
            placeholder="123 Rue de l'Indépendance"
          />
        </div>
      </div>

      {/* Ville, Pays, Code postal */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ville
          </label>
          <input
            type="text"
            value={formData.city || ""}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
            placeholder="Lomé"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pays
          </label>
          <input
            type="text"
            value={formData.country || ""}
            onChange={(e) => handleInputChange("country", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
            placeholder="Togo"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Code postal
          </label>
          <input
            type="text"
            value={formData.postal_code || ""}
            onChange={(e) => handleInputChange("postal_code", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
            placeholder="BP 123"
          />
        </div>
      </div>

      {/* Bouton suivant */}
      <button
        type="button"
        onClick={handleNextStep}
        className="w-full bg-gradient-to-r from-[#0B2749] to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-[#0a2240] hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0B2749] focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
      >
        <span>Étape suivante</span>
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Building2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#0B2749] mb-2">
          Informations professionnelles
        </h2>
        <p className="text-gray-600">Parlez-nous de votre entreprise</p>
      </div>

      {/* Nom de l'entreprise */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nom de l'entreprise *
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            name="company_name"
            type="text"
            value={formData.company_name || ""}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
              formErrors.company_name
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="NUKU SARL"
          />
        </div>
        {formErrors.company_name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.company_name}
          </p>
        )}
      </div>

      {/* Niveau de maturité */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Niveau de maturité de votre entreprise *
        </label>
        <div className="space-y-3">
          <label className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="maturity_level"
              value="not_created"
              checked={formData.company_not_created}
              onChange={() => handleMaturityChange("not_created")}
              className="mt-1 h-4 w-4 text-[#0B2749] focus:ring-[#0B2749]"
            />
            <div>
              <div className="font-medium text-gray-900">
                L'entreprise n'existe pas encore
              </div>
              <div className="text-sm text-gray-600">
                Vous avez une idée mais n'avez pas encore créé votre entreprise
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="maturity_level"
              value="recently_created"
              checked={formData.company_recently_created}
              onChange={() => handleMaturityChange("recently_created")}
              className="mt-1 h-4 w-4 text-[#0B2749] focus:ring-[#0B2749]"
            />
            <div>
              <div className="font-medium text-gray-900">
                L'entreprise a été créée récemment
              </div>
              <div className="text-sm text-gray-600">
                Vous avez créé votre entreprise il y a moins de 2 ans
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="maturity_level"
              value="established"
              checked={formData.company_established}
              onChange={() => handleMaturityChange("established")}
              className="mt-1 h-4 w-4 text-[#0B2749] focus:ring-[#0B2749]"
            />
            <div>
              <div className="font-medium text-gray-900">
                L'entreprise est établie
              </div>
              <div className="text-sm text-gray-600">
                Votre entreprise existe depuis plus de 2 ans et a une activité
                stable
              </div>
            </div>
          </label>
        </div>
        {formErrors.maturity && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.maturity}
          </p>
        )}
      </div>

      {/* Champs conditionnels selon la maturité */}
      {(formData.company_not_created ||
        formData.company_recently_created ||
        formData.company_established) && (
        <>
          {/* Pièce d'identité */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pièce d'identité *{" "}
              <span className="text-xs text-gray-500">(URL du fichier)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="identity_card_url"
                type="url"
                value={formData.identity_card_url || ""}
                onChange={(e) =>
                  handleInputChange("identity_card_url", e.target.value)
                }
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
                  formErrors.identity_card_url
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="https://exemple.com/piece-identite.pdf"
              />
            </div>
            {formErrors.identity_card_url && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.identity_card_url}
              </p>
            )}
          </div>

          {/* Description de l'entreprise */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description de l'entreprise *
            </label>
            <textarea
              name="company_description"
              value={formData.company_description || ""}
              onChange={(e) =>
                handleInputChange("company_description", e.target.value)
              }
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 resize-none ${
                formErrors.company_description
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Décrivez votre entreprise, son activité, ses objectifs..."
            />
            {formErrors.company_description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.company_description}
              </p>
            )}
          </div>
        </>
      )}

      {/* Champs pour entreprise récemment créée ou établie */}
      {(formData.company_recently_created || formData.company_established) && (
        <>
          {/* Document d'enregistrement */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document d'enregistrement *{" "}
              <span className="text-xs text-gray-500">(URL du fichier)</span>
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="registration_document_url"
                type="url"
                value={formData.registration_document_url || ""}
                onChange={(e) =>
                  handleInputChange("registration_document_url", e.target.value)
                }
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
                  formErrors.registration_document_url
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="https://exemple.com/document-enregistrement.pdf"
              />
            </div>
            {formErrors.registration_document_url && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.registration_document_url}
              </p>
            )}
          </div>
        </>
      )}

      {/* Champs pour entreprise établie */}
      {formData.company_established && (
        <>
          {/* Secteur d'activité et numéro d'enregistrement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Secteur d'activité *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  name="industry_sector"
                  value={formData.industry_sector || ""}
                  onChange={(e) =>
                    handleInputChange("industry_sector", e.target.value)
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
                    formErrors.industry_sector
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Sélectionnez un secteur</option>
                  <option value="technologie">Technologie</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="commerce">Commerce</option>
                  <option value="industrie">Industrie</option>
                  <option value="services">Services</option>
                  <option value="sante">Santé</option>
                  <option value="education">Éducation</option>
                  <option value="transport">Transport</option>
                  <option value="tourisme">Tourisme</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              {formErrors.industry_sector && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.industry_sector}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro d'enregistrement
              </label>
              <input
                name="company_registration_number"
                type="text"
                value={formData.company_registration_number || ""}
                onChange={(e) =>
                  handleInputChange(
                    "company_registration_number",
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                placeholder="TG123456789"
              />
            </div>
          </div>

          {/* Date de création et nombre d'employés */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de création *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="founding_date"
                  type="date"
                  value={formData.founding_date || ""}
                  onChange={(e) =>
                    handleInputChange("founding_date", e.target.value)
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 ${
                    formErrors.founding_date
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {formErrors.founding_date && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.founding_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre d'employés
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="number_of_employees"
                  type="number"
                  min="0"
                  value={formData.number_of_employees || ""}
                  onChange={(e) =>
                    handleInputChange("number_of_employees", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {/* Chiffre d'affaires annuel */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chiffre d'affaires annuel (FCFA)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="annual_revenue"
                type="number"
                min="0"
                step="1000"
                value={formData.annual_revenue || ""}
                onChange={(e) =>
                  handleInputChange("annual_revenue", e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                placeholder="10000000"
              />
            </div>
          </div>

          {/* Levée de fonds */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="has_raised_funds"
                name="has_raised_funds"
                checked={formData.has_raised_funds || false}
                onChange={(e) =>
                  handleInputChange("has_raised_funds", e.target.checked)
                }
                className="h-4 w-4 text-[#0B2749] focus:ring-[#0B2749] border-gray-300 rounded"
              />
              <label
                htmlFor="has_raised_funds"
                className="text-sm font-medium text-gray-700"
              >
                Avez-vous déjà levé des fonds ?
              </label>
            </div>

            {formData.has_raised_funds && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Montant levé (FCFA)
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="amount_raised"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.amount_raised || ""}
                    onChange={(e) =>
                      handleInputChange("amount_raised", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                    placeholder="5000000"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="wants_to_raise_funds"
                name="wants_to_raise_funds"
                checked={formData.wants_to_raise_funds || false}
                onChange={(e) =>
                  handleInputChange("wants_to_raise_funds", e.target.checked)
                }
                className="h-4 w-4 text-[#0B2749] focus:ring-[#0B2749] border-gray-300 rounded"
              />
              <label
                htmlFor="wants_to_raise_funds"
                className="text-sm font-medium text-gray-700"
              >
                Souhaitez-vous lever des fonds ?
              </label>
            </div>

            {formData.wants_to_raise_funds && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Montant souhaité (FCFA)
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="desired_funding_amount"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.desired_funding_amount || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "desired_funding_amount",
                        e.target.value
                      )
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                    placeholder="10000000"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Documents optionnels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Documents optionnels
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Logo de l'entreprise{" "}
            <span className="text-xs text-gray-500">(URL du fichier)</span>
          </label>
          <div className="relative">
            <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              name="company_logo_url"
              type="url"
              value={formData.company_logo_url || ""}
              onChange={(e) =>
                handleInputChange("company_logo_url", e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
              placeholder="https://exemple.com/logo.png"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Carte professionnelle{" "}
            <span className="text-xs text-gray-500">(URL du fichier)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              name="professional_card_url"
              type="url"
              value={formData.professional_card_url || ""}
              onChange={(e) =>
                handleInputChange("professional_card_url", e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
              placeholder="https://exemple.com/carte-professionnelle.pdf"
            />
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {actionData?.error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{actionData.error}</span>
        </div>
      )}

      {/* Boutons */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-[#0B2749] to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-[#0a2240] hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0B2749] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Création en cours...</span>
            </div>
          ) : (
            "Créer mon compte"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="/"
            className="flex items-center space-x-2 text-[#0B2749] hover:text-blue-600 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Retour à l'accueil</span>
          </a>

          <img
            src="/app/assets/images/logo_nuku.webp"
            alt="NUKU Logo"
            className="h-8 w-auto"
          />
        </div>
      </header>

      {/* Progress indicator */}
      <div className="px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${
                currentStep === 1 ? "text-[#0B2749]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 1
                    ? "bg-[#0B2749] text-white"
                    : currentStep > 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <span className="font-medium">Informations personnelles</span>
            </div>

            <div
              className={`w-16 h-1 rounded ${
                currentStep > 1 ? "bg-green-500" : "bg-gray-200"
              }`}
            ></div>

            <div
              className={`flex items-center space-x-2 ${
                currentStep === 2 ? "text-[#0B2749]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 2 ? "bg-[#0B2749] text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className="font-medium">Informations professionnelles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <Form method="post" onSubmit={handleSubmit}>
            {/* Hidden inputs pour transporter les données entre les étapes */}
            {currentStep === 2 && (
              <>
                <input
                  type="hidden"
                  name="email"
                  value={formData.email || ""}
                />
                <input
                  type="hidden"
                  name="password"
                  value={formData.password || ""}
                />
                <input
                  type="hidden"
                  name="first_name"
                  value={formData.first_name || ""}
                />
                <input
                  type="hidden"
                  name="last_name"
                  value={formData.last_name || ""}
                />
                <input
                  type="hidden"
                  name="phone"
                  value={formData.phone || ""}
                />
                <input
                  type="hidden"
                  name="address"
                  value={formData.address || ""}
                />
                <input type="hidden" name="city" value={formData.city || ""} />
                <input
                  type="hidden"
                  name="country"
                  value={formData.country || ""}
                />
                <input
                  type="hidden"
                  name="postal_code"
                  value={formData.postal_code || ""}
                />
                <input
                  type="hidden"
                  name="company_not_created"
                  value={formData.company_not_created ? "true" : "false"}
                />
                <input
                  type="hidden"
                  name="company_recently_created"
                  value={formData.company_recently_created ? "true" : "false"}
                />
                <input
                  type="hidden"
                  name="company_established"
                  value={formData.company_established ? "true" : "false"}
                />
                <input
                  type="hidden"
                  name="has_raised_funds"
                  value={formData.has_raised_funds ? "true" : "false"}
                />
                <input
                  type="hidden"
                  name="wants_to_raise_funds"
                  value={formData.wants_to_raise_funds ? "true" : "false"}
                />
              </>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {currentStep === 1 ? renderStep1() : renderStep2()}
            </div>
          </Form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="leading-relaxed">
              En créant votre compte, vous acceptez nos{" "}
              <a
                href="/terms"
                className="text-[#0B2749] hover:text-blue-600 hover:underline transition-colors duration-200"
              >
                conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a
                href="/privacy"
                className="text-[#0B2749] hover:text-blue-600 hover:underline transition-colors duration-200"
              >
                politique de confidentialité
              </a>
            </p>
            <p className="mt-2">
              Vous avez déjà un compte ?{" "}
              <a
                href="/login"
                className="text-[#0B2749] hover:text-blue-600 hover:underline font-medium transition-colors duration-200"
              >
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Background decoratif */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-[#0B2749]/10 to-transparent rounded-full opacity-50"></div>
      </div>
    </div>
  );
}
