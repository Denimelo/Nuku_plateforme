import { Form, useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { json, redirect, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authTokenCookie } from "~/utils/session.server";
import { useEffect, useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

// Types
interface ApiError {
  detail?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface ChangePasswordResponse {
  message: string;
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

// Loader pour vérifier l'authentification
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const token = await authTokenCookie.parse(cookieHeader);
  
  if (!token) {
    return redirect("/login");
  }
  
  return json({ token });
};

// Action pour changer le mot de passe
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  // Validation côté serveur
  if (!currentPassword || !newPassword || !confirmPassword) {
    return json(
      { error: "Tous les champs sont requis" },
      { status: 400 }
    );
  }

  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string") {
    return json({ error: "Format des données invalide" }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return json({ error: "Les nouveaux mots de passe ne correspondent pas" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
  }

  // Récupération du token
  const cookieHeader = request.headers.get("Cookie");
  const token = await authTokenCookie.parse(cookieHeader);
  
  if (!token) {
    return redirect("/login");
  }

  // Appel API pour changer le mot de passe
  const { data, error } = await apiRequest<ChangePasswordResponse>("/auth/change-password", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  if (error || !data) {
    return json({ error: error || "Erreur lors du changement de mot de passe" }, { status: 400 });
  }

  // Redirection vers la page de connexion avec message de succès
  return redirect("/login?passwordChanged=true");
};

export default function ChangePasswordPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isSubmitting = navigation.state === "submitting";
  const isFirstLogin = searchParams.get("firstLogin") === "true";

  // Validation côté client
  const validateForm = (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const errors: Record<string, string> = {};

    if (!currentPassword) {
      errors.currentPassword = "Le mot de passe actuel est requis";
    }

    if (!newPassword) {
      errors.newPassword = "Le nouveau mot de passe est requis";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      errors.newPassword = "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer le nouveau mot de passe";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (currentPassword === newPassword) {
      errors.newPassword = "Le nouveau mot de passe doit être différent de l'ancien";
    }

    return errors;
  };

  // Gestion de la soumission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const errors = validateForm(currentPassword, newPassword, confirmPassword);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      return;
    }
  };

  // Reset des erreurs lors de la modification des champs
  const clearFieldError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header avec bouton retour */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="/login"
            className="flex items-center space-x-2 text-[#0B2749] hover:text-blue-600 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Retour à la connexion</span>
          </a>

          <img
            src="/app/assets/images/logo_nuku.webp"
            alt="NUKU Logo"
            className="h-8 w-auto"
          />
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* En-tête de la page */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <KeyRound className="h-10 w-10 text-white" />
            </div>
            <h1
              className="text-3xl font-bold text-[#0B2749] mb-2"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              {isFirstLogin ? "Changement requis" : "Changer le mot de passe"}
            </h1>
            <p className="text-gray-600">
              {isFirstLogin 
                ? "Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire"
                : "Modifiez votre mot de passe pour sécuriser votre compte"
              }
            </p>
          </div>

          {/* Alerte première connexion */}
          {isFirstLogin && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-amber-800">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Première connexion détectée. Vous devez changer votre mot de passe temporaire.
                </p>
              </div>
            </div>
          )}

          {/* Formulaire de changement de mot de passe */}
          <Form method="post" onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
              {/* Champ mot de passe actuel */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {isFirstLogin ? "Mot de passe temporaire" : "Mot de passe actuel"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    onChange={() => clearFieldError("currentPassword")}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 placeholder-gray-500 ${
                      formErrors.currentPassword || actionData?.error
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {formErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* Champ nouveau mot de passe */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    onChange={() => clearFieldError("newPassword")}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 placeholder-gray-500 ${
                      formErrors.newPassword
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {formErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Champ confirmation mot de passe */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    onChange={() => clearFieldError("confirmPassword")}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 placeholder-gray-500 ${
                      formErrors.confirmPassword
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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

              {/* Critères de mot de passe */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Critères du mot de passe :
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Au moins 8 caractères</li>
                  <li>• Une lettre majuscule</li>
                  <li>• Une lettre minuscule</li>
                  <li>• Un chiffre</li>
                  <li>• Différent du mot de passe actuel</li>
                </ul>
              </div>

              {/* Messages d'erreur */}
              {actionData?.error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {actionData.error}
                  </span>
                </div>
              )}

              {/* Bouton de validation */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#0B2749] to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-[#0a2240] hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0B2749] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Changement en cours...</span>
                  </div>
                ) : (
                  "Changer le mot de passe"
                )}
              </button>
            </div>
          </Form>
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