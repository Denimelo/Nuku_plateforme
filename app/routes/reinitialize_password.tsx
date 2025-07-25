import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json, ActionFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  KeyRound,
  Send,
} from "lucide-react";

// Types pour une meilleure gestion des erreurs
interface ApiError {
  detail?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface ResetPasswordResponse {
  message: string;
}

// Configuration API centralisée
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
  const email = formData.get("email");

  // Validation côté serveur
  if (!email) {
    return json({ error: "L'adresse email est requise" }, { status: 400 });
  }

  if (typeof email !== "string") {
    return json({ error: "Format des données invalide" }, { status: 400 });
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json({ error: "Format d'email invalide" }, { status: 400 });
  }

  // Appel API de réinitialisation
  const { data, error } = await apiRequest<ResetPasswordResponse>(
    "/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  );

  if (error || !data) {
    return json(
      { error: error || "Erreur lors de la réinitialisation" },
      { status: 400 }
    );
  }

  return json({ success: true, message: data.message });
};

export default function ResetPasswordPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  // Validation côté client
  const validateForm = (email: string) => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "L'adresse email est requise";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format d'email invalide";
    }

    return errors;
  };

  // Gestion de la soumission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    const errors = validateForm(email);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      return;
    }
  };

  // Gérer le succès de l'envoi
  useEffect(() => {
    if (actionData?.success) {
      setEmailSent(true);
    }
  }, [actionData]);

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
          {!emailSent ? (
            <>
              {/* En-tête de la page */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <KeyRound className="h-10 w-10 text-white" />
                </div>
                <h1
                  className="text-3xl font-bold text-[#0B2749] mb-2"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  Mot de passe oublié ?
                </h1>
                <p className="text-gray-600">
                  Pas de souci ! Entrez votre adresse email et nous vous
                  enverrons un mot de passe temporaire.
                </p>
              </div>

              {/* Formulaire de réinitialisation */}
              <Form method="post" onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                  {/* Champ email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        onChange={() => clearFieldError("email")}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 placeholder-gray-500 ${
                          formErrors.email || actionData?.error
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
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

                  {/* Message d'erreur */}
                  {actionData?.error && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {actionData.error}
                      </span>
                    </div>
                  )}

                  {/* Bouton d'envoi */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#0B2749] to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-[#0a2240] hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0B2749] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Envoi en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Envoyer le mot de passe temporaire</span>
                      </div>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">ou</span>
                    </div>
                  </div>

                  {/* Lien retour connexion */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Vous vous souvenez de votre mot de passe ?
                    </p>
                    <a
                      href="/login"
                      className="inline-block w-full text-center border-2 border-[#0B2749] text-[#0B2749] py-3 px-4 rounded-lg font-semibold hover:bg-[#0B2749] hover:text-white transition-all duration-300 transform hover:scale-105"
                    >
                      Retour à la connexion
                    </a>
                  </div>
                </div>
              </Form>
            </>
          ) : (
            /* Page de confirmation */
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1
                className="text-3xl font-bold text-[#0B2749] mb-4"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                Email envoyé !
              </h1>

              <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                <div className="flex items-start space-x-3 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">
                      Mot de passe temporaire envoyé
                    </p>
                    <p className="text-green-700">
                      {actionData?.message ||
                        "Un mot de passe temporaire vous a été envoyé par email."}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Points importants :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Vérifiez votre boîte email (et les spams)</li>
                        <li>Le mot de passe temporaire expire dans 6 heures</li>
                        <li>
                          Vous devrez le changer lors de votre première
                          connexion
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href="/login"
                    className="block w-full bg-gradient-to-r from-[#0B2749] to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-[#0a2240] hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0B2749] focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-center"
                  >
                    Aller à la page de connexion
                  </a>

                  <button
                    onClick={() => setEmailSent(false)}
                    className="block w-full text-center border-2 border-gray-300 text-gray-600 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                  >
                    Renvoyer un email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="leading-relaxed">
              Besoin d'aide ? Contactez notre{" "}
              <a
                href="/support"
                className="text-[#0B2749] hover:text-blue-600 hover:underline transition-colors duration-200"
              >
                support technique
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
