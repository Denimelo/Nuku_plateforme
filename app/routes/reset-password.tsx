import { useState } from "react";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { authServerAPI } from "~/utils/api.server";

// Action pour gérer la réinitialisation avec OTP
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  const email = formData.get("email") as string;
  const otp_code = formData.get("otp_code") as string;
  const new_password = formData.get("new_password") as string;
  const confirm_password = formData.get("confirm_password") as string;

  if (!email || !otp_code || !new_password || !confirm_password) {
    return json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  if (new_password !== confirm_password) {
    return json({ error: "Les mots de passe ne correspondent pas" }, { status: 400 });
  }

  if (new_password.length < 6) {
    return json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
  }

  try {
    await authServerAPI.verifyPasswordReset(email, otp_code, new_password);
    return redirect("/login?message=password_reset_success");
  } catch (error: any) {
    return json(
      { error: error.message || "Erreur lors de la réinitialisation" },
      { status: 400 }
    );
  }
}

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const email = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    otp_code: "",
    new_password: "",
    confirm_password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    setIsLoading(true);
  };

  const passwordsMatch = formData.new_password === formData.confirm_password;
  const passwordLongEnough = formData.new_password.length >= 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <img
              className="h-12 w-auto"
              src="../../public/images/logo_nuku.webp"
              alt="NUKU"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Réinitialiser votre mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez le code reçu à{" "}
            <span className="font-medium text-blue-600">{email}</span>
            {" "}et votre nouveau mot de passe
          </p>
        </div>

        {/* Formulaire */}
        <Form method="post" className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="email" value={email} />

          <div className="space-y-4">
            {/* Code OTP */}
            <div>
              <label htmlFor="otp_code" className="block text-sm font-medium text-gray-700">
                Code de vérification
              </label>
              <input
                id="otp_code"
                name="otp_code"
                type="text"
                required
                maxLength={6}
                value={formData.otp_code}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                required
                value={formData.new_password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nouveau mot de passe"
              />
              <div className="mt-1 text-xs text-gray-500">
                <div className={`${passwordLongEnough ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ Au moins 6 caractères
                </div>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirmer le mot de passe"
              />
              {formData.confirm_password && (
                <div className="mt-1 text-xs">
                  <div className={`${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordsMatch ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Erreur */}
          {actionData?.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{actionData.error}</div>
            </div>
          )}

          {/* Bouton de soumission */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !passwordsMatch || !passwordLongEnough}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Réinitialisation...
                </>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </div>

          {/* Liens utiles */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Vous n'avez pas reçu le code ?{" "}
              <a
                href={`/forgot-password`}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Renvoyer un code
              </a>
            </p>
            <a
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Retour à la connexion
            </a>
          </div>
        </Form>

        {/* Conseils de sécurité */}
        <div className="mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Conseils de sécurité
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Utilisez un mot de passe unique et complexe</li>
                    <li>Incluez des majuscules, minuscules, chiffres et symboles</li>
                    <li>Ne partagez jamais votre mot de passe</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}