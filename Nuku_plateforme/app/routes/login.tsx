import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { authTokenCookie } from "~/utils/session.server";
import { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const response = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return json(
      { error: data.detail || "Erreur de connexion" },
      { status: 401 }
    );
  }

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await authTokenCookie.serialize(data.access_token),
    },
  });
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");

  const isSubmitting = navigation.state === "submitting";

  // Affichage temporaire du message de succès et redirection
  useEffect(() => {
    if (!actionData && isSubmitting) {
      setSuccess("Connexion réussie ! Redirection...");
      const timeout = setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [actionData, isSubmitting]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="/app/assets/images/logo_nuku.webp"
            alt="NUKU Logo"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Bon retour !
          </h1>
          <p className="text-gray-600">Connectez-vous à votre espace NUKU</p>
        </div>

        <Form method="post">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                  placeholder="votre@email.com"
                />
              </div>
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Messages */}
            {actionData?.error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{actionData.error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Lien mot de passe oublié */}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Mot de passe oublié ?
              </a>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                "Se connecter"
              )}
            </button>

            {/* Lien inscription */}
            <div className="text-center pt-6">
              <div className="text-sm text-gray-500">
                Nouveau sur NUKU ?
                <a
                  href="/signup"
                  className="ml-2 text-blue-600 font-medium hover:underline"
                >
                  Créer un compte
                </a>
              </div>
            </div>
          </div>
        </Form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            En vous connectant, vous acceptez nos{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
