import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json, redirect, ActionFunctionArgs } from "@remix-run/node";
import { authTokenCookie } from "~/utils/session.server";
import { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Clock,
  Shield,
  Key,
} from "lucide-react";

// Types pour une meilleure gestion des erreurs
interface ApiError {
  detail?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface LoginResponse {
  access_token: string;
  token_type?: string;
  is_temporary_password?: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

interface LoginAttempt {
  email: string;
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
}

// Configuration API centralisée
const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 10000,
};

// Constantes pour la limitation des tentatives
const MAX_ATTEMPTS_BEFORE_SHORT_BLOCK = 3;
const MAX_ATTEMPTS_BEFORE_LONG_BLOCK = 4;
const SHORT_BLOCK_DURATION = 60 * 3000; // 3 minute
const LONG_BLOCK_DURATION = 3 * 60 * 60 * 1000; // 3 heures
const ATTEMPT_RESET_TIME = 24 * 60 * 60 * 1000; // 24 heures

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

// Fonctions pour gérer les tentatives de connexion
function getLoginAttempts(): Record<string, LoginAttempt> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem("loginAttempts");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setLoginAttempts(attempts: Record<string, LoginAttempt>): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("loginAttempts", JSON.stringify(attempts));
  } catch {
    // Silencieux en cas d'erreur de stockage
  }
}

function isUserBlocked(email: string): {
  blocked: boolean;
  blockedUntil?: number;
  attempts: number;
} {
  const attempts = getLoginAttempts();
  const userAttempt = attempts[email];

  if (!userAttempt) {
    return { blocked: false, attempts: 0 };
  }

  const now = Date.now();

  // Réinitialiser les tentatives si plus de 24h
  if (now - userAttempt.firstAttempt > ATTEMPT_RESET_TIME) {
    delete attempts[email];
    setLoginAttempts(attempts);
    return { blocked: false, attempts: 0 };
  }

  // Vérifier si l'utilisateur est encore bloqué
  if (userAttempt.blockedUntil && now < userAttempt.blockedUntil) {
    return {
      blocked: true,
      blockedUntil: userAttempt.blockedUntil,
      attempts: userAttempt.attempts,
    };
  }

  // Si le temps de blocage est écoulé, réinitialiser blockedUntil
  if (userAttempt.blockedUntil && now >= userAttempt.blockedUntil) {
    userAttempt.blockedUntil = undefined;
    setLoginAttempts(attempts);
  }

  return { blocked: false, attempts: userAttempt.attempts };
}

function recordFailedAttempt(email: string): {
  newAttempts: number;
  blockedUntil?: number;
} {
  const attempts = getLoginAttempts();
  const now = Date.now();

  if (!attempts[email]) {
    attempts[email] = {
      email,
      attempts: 0,
      firstAttempt: now,
      lastAttempt: now,
    };
  }

  attempts[email].attempts += 1;
  attempts[email].lastAttempt = now;

  // Déterminer le blocage
  let blockedUntil: number | undefined;

  if (attempts[email].attempts === MAX_ATTEMPTS_BEFORE_SHORT_BLOCK) {
    blockedUntil = now + SHORT_BLOCK_DURATION;
  } else if (attempts[email].attempts >= MAX_ATTEMPTS_BEFORE_LONG_BLOCK) {
    blockedUntil = now + LONG_BLOCK_DURATION;
  }

  if (blockedUntil) {
    attempts[email].blockedUntil = blockedUntil;
  }

  setLoginAttempts(attempts);

  return {
    newAttempts: attempts[email].attempts,
    blockedUntil,
  };
}

function resetLoginAttempts(email: string): void {
  const attempts = getLoginAttempts();
  delete attempts[email];
  setLoginAttempts(attempts);
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  // Validation côté serveur
  if (!email || !password) {
    return json(
      { error: "L'email et le mot de passe sont requis" },
      { status: 400 }
    );
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: "Format des données invalide" }, { status: 400 });
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json({ error: "Format d'email invalide" }, { status: 400 });
  }

  // Appel API de connexion
  const { data, error } = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (error || !data) {
    return json(
      {
        error: error || "Erreur de connexion",
        failedAttempt: true,
        email: email,
      },
      { status: 401 }
    );
  }

  // Vérifier si le mot de passe est temporaire
  if (data.is_temporary_password) {
    // Redirection vers la page de changement de mot de passe avec le token
    return redirect("/change_password", {
      headers: {
        "Set-Cookie": await authTokenCookie.serialize(data.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        }),
      },
    });
  }

  // Redirection normale vers le dashboard
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

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [blockStatus, setBlockStatus] = useState<{
    blocked: boolean;
    blockedUntil?: number;
    attempts: number;
  }>({ blocked: false, attempts: 0 });
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const isSubmitting = navigation.state === "submitting";

  // Vérifier le statut de blocage au chargement et après une tentative échouée
  useEffect(() => {
    const checkBlockStatus = (email?: string) => {
      if (!email) return;

      const status = isUserBlocked(email);
      setBlockStatus(status);

      if (status.blocked && status.blockedUntil) {
        const remaining = status.blockedUntil - Date.now();
        setRemainingTime(Math.max(0, remaining));
      }
    };

    // Vérifier au chargement si on a un email en cours
    const currentEmail = document.querySelector<HTMLInputElement>(
      'input[name="email"]'
    )?.value;
    if (currentEmail) {
      checkBlockStatus(currentEmail);
    }

    // Vérifier après une tentative échouée
    if (actionData?.failedAttempt && actionData?.email) {
      const { newAttempts, blockedUntil } = recordFailedAttempt(
        actionData.email
      );

      setBlockStatus({
        blocked: !!blockedUntil,
        blockedUntil,
        attempts: newAttempts,
      });

      if (blockedUntil) {
        const remaining = blockedUntil - Date.now();
        setRemainingTime(Math.max(0, remaining));
      }
    }
  }, [actionData]);

  // Vérifier le statut de blocage quand l'email change
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value;
    clearFieldError("email");

    if (email) {
      const status = isUserBlocked(email);
      setBlockStatus(status);

      if (status.blocked && status.blockedUntil) {
        const remaining = status.blockedUntil - Date.now();
        setRemainingTime(Math.max(0, remaining));
      }
    } else {
      setBlockStatus({ blocked: false, attempts: 0 });
      setRemainingTime(0);
    }
  };

  // Compte à rebours pour le déblocage
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (blockStatus.blocked && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            setBlockStatus((prev) => ({ ...prev, blocked: false }));
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [blockStatus.blocked, remainingTime]);

  // Validation côté client
  const validateForm = (email: string, password: string) => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format d'email invalide";
    }

    if (!password) {
      errors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    return errors;
  };

  // Gestion de la soumission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Vérifier si l'utilisateur est bloqué
    const status = isUserBlocked(email);
    if (status.blocked) {
      event.preventDefault();
      setFormErrors({ general: "Compte temporairement bloqué" });
      return;
    }

    const errors = validateForm(email, password);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      return;
    }

    // Réinitialiser les tentatives en cas de succès
    if (!actionData?.error) {
      resetLoginAttempts(email);
    }
  };

  // Affichage temporaire du message de succès
  useEffect(() => {
    if (!actionData && isSubmitting) {
      setSuccess("Connexion réussie ! Redirection...");
    }
  }, [actionData, isSubmitting]);

  // Reset des erreurs lors de la modification des champs
  const clearFieldError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Formater le temps restant
  const formatRemainingTime = (time: number) => {
    if (time < 60000) {
      // Moins d'une minute
      const seconds = Math.ceil(time / 1000);
      return `${seconds} seconde${seconds > 1 ? "s" : ""}`;
    } else if (time < 3600000) {
      // Moins d'une heure
      const minutes = Math.ceil(time / 60000);
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else {
      // Plus d'une heure
      const hours = Math.ceil(time / 3600000);
      return `${hours} heure${hours > 1 ? "s" : ""}`;
    }
  };

  // Message d'erreur personnalisé selon le nombre de tentatives
  const getErrorMessage = () => {
    if (actionData?.error) {
      if (blockStatus.attempts >= MAX_ATTEMPTS_BEFORE_LONG_BLOCK) {
        return "Il semble que vous ne soyez pas la bonne personne ou bien si vous avez oublié votre mot de passe, veuillez le réinitialiser s'il vous plaît.";
      }
      return actionData.error;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header avec bouton retour */}
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

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* En-tête de la page */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Lock className="h-10 w-10 text-[#0B2749]" />
            </div>
            <h1
              className="text-3xl font-bold text-[#0B2749] mb-2"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              Bon retour !
            </h1>
            <p className="text-gray-600">
              Connectez-vous à votre espace NUKU pour continuer votre parcours
              entrepreneurial
            </p>
          </div>

          {/* Formulaire de connexion */}
          <Form method="post" onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
              {/* Message de blocage */}
              {blockStatus.blocked && (
                <div className="flex items-start space-x-3 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                  <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      Compte temporairement bloqué
                    </p>
                    <p className="text-sm mt-1">
                      Trop de tentatives de connexion échouées. Réessayez dans{" "}
                      {formatRemainingTime(remainingTime)}.
                    </p>
                    {blockStatus.attempts >= MAX_ATTEMPTS_BEFORE_LONG_BLOCK && (
                      <p className="text-sm mt-2">
                        <a
                          href="/reinitialize_password"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Réinitialiser votre mot de passe
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Indicateur de tentatives */}
              {blockStatus.attempts > 0 && !blockStatus.blocked && (
                <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">
                    {blockStatus.attempts}/{MAX_ATTEMPTS_BEFORE_SHORT_BLOCK}{" "}
                    tentatives échouées
                    {blockStatus.attempts ===
                      MAX_ATTEMPTS_BEFORE_SHORT_BLOCK - 1 &&
                      " - Prochaine tentative bloquera temporairement le compte"}
                  </span>
                </div>
              )}

              {/* Message d'information pour mot de passe temporaire */}
              {isSubmitting && (
                <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <Key className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">
                    Vérification en cours... Si vous utilisez un mot de passe
                    temporaire, vous serez redirigé vers la page de changement
                    de mot de passe.
                  </span>
                </div>
              )}

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
                    onChange={handleEmailChange}
                    disabled={blockStatus.blocked}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 placeholder-gray-500 ${
                      formErrors.email || actionData?.error
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    } ${
                      blockStatus.blocked ? "opacity-50 cursor-not-allowed" : ""
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

              {/* Champ mot de passe */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    onChange={() => clearFieldError("password")}
                    disabled={blockStatus.blocked}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 placeholder-gray-500 ${
                      formErrors.password || actionData?.error
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    } ${
                      blockStatus.blocked ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={blockStatus.blocked}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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

              {/* Messages d'erreur et de succès */}
              {getErrorMessage() && (
                <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">
                      {getErrorMessage()}
                    </span>
                    {blockStatus.attempts >= MAX_ATTEMPTS_BEFORE_LONG_BLOCK && (
                      <p className="text-sm mt-2">
                        <a
                          href="/reinitialize_password"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Réinitialiser votre mot de passe
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{success}</span>
                </div>
              )}

              {/* Lien mot de passe oublié */}
              <div className="text-right">
                <a
                  href="/reinitialize_password"
                  className="text-sm text-[#0B2749] hover:text-blue-600 font-medium transition-colors duration-200 hover:underline"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={isSubmitting || blockStatus.blocked}
                className="w-full bg-gradient-to-r from-[#0B2749] to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-[#0a2240] hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0B2749] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                {blockStatus.blocked ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Bloqué - {formatRemainingTime(remainingTime)}</span>
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  "Se connecter"
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

              {/* Lien inscription */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Nouveau sur NUKU ?</p>
                <a
                  href="/signup"
                  className="inline-block w-full text-center border-2 border-[#0B2749] text-[#0B2749] py-3 px-4 rounded-lg font-semibold hover:bg-[#0B2749] hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  Créer un compte gratuit
                </a>
              </div>
            </div>
          </Form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="leading-relaxed">
              En vous connectant, vous acceptez nos{" "}
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