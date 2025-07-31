import { useState } from "react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Layout } from "~/components/layout/Layout";
import { requireUser } from "~/utils/auth.server";
import { authServerAPI } from "~/utils/api.server";
import { getUserSession } from "~/utils/session.server";
import { Settings, Shield, Key, CheckCircle } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireUser(request);
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  if (!session) {
    return json({ error: "Session non trouvée" }, { status: 401 });
  }

  const formData = await request.formData();
  const current_password = formData.get("current_password") as string;
  const new_password = formData.get("new_password") as string;
  const confirm_password = formData.get("confirm_password") as string;

  if (!current_password || !new_password || !confirm_password) {
    return json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  if (new_password !== confirm_password) {
    return json({ error: "Les nouveaux mots de passe ne correspondent pas" }, { status: 400 });
  }

  if (new_password.length < 6) {
    return json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
  }

  if (current_password === new_password) {
    return json({ error: "Le nouveau mot de passe doit être différent de l'ancien" }, { status: 400 });
  }

  try {
    await authServerAPI.changePassword(session.token, current_password, new_password);
    return json({ success: "Mot de passe modifié avec succès" });
  } catch (error: any) {
    return json(
      { error: error.message || "Erreur lors du changement de mot de passe" },
      { status: 400 }
    );
  }
}

export default function ChangePassword() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    current_password: "",
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

  const navigation = [
    { name: "Paramètres", href: "/settings", icon: Settings, current: false },
    { name: "Mot de passe", href: "/settings/password", icon: Key, current: true },
    { name: "Sécurité", href: "/settings/security", icon: Shield, current: false },
  ];

  const passwordsMatch = formData.new_password === formData.confirm_password;
  const passwordLongEnough = formData.new_password.length >= 6;
  const passwordsDifferent = formData.current_password !== formData.new_password;

  return (
    <Layout user={user} title="Changer le mot de passe" navigation={navigation}>
      <div className="max-w-2xl">
        {/* En-tête */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Key className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Changer votre mot de passe
                </h3>
                <p className="text-sm text-gray-500">
                  Assurez-vous d'utiliser un mot de passe fort et unique pour protéger votre compte.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
              {/* Mot de passe actuel */}
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                  Mot de passe actuel
                </label>
                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  required
                  value={formData.current_password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Entrez votre mot de passe actuel"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Entrez votre nouveau mot de passe"
                />
                
                {/* Indicateurs de force du mot de passe */}
                {formData.new_password && (
                  <div className="mt-2 space-y-1">
                    <div className={`text-xs flex items-center ${passwordLongEnough ? 'text-green-600' : 'text-red-600'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${passwordLongEnough ? 'text-green-600' : 'text-gray-300'}`} />
                      Au moins 6 caractères
                    </div>
                    <div className={`text-xs flex items-center ${passwordsDifferent ? 'text-green-600' : 'text-red-600'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${passwordsDifferent ? 'text-green-600' : 'text-gray-300'}`} />
                      Différent du mot de passe actuel
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmer nouveau mot de passe */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                
                {formData.confirm_password && (
                  <div className="mt-1 text-xs">
                    <div className={`flex items-center ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${passwordsMatch ? 'text-green-600' : 'text-gray-300'}`} />
                      {passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages de retour */}
              {actionData?.error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{actionData.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {actionData?.success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{actionData.success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setFormData({ current_password: "", new_password: "", confirm_password: "" })}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !passwordsMatch || !passwordLongEnough || !passwordsDifferent}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Modification...
                    </>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </button>
              </div>
            </Form>
          </div>
        </div>

        {/* Conseils de sécurité */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Conseils pour un mot de passe sécurisé
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                </div>
                <div className="ml-2">
                  <strong>Longueur :</strong> Utilisez au moins 8 caractères (12+ recommandé)
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                </div>
                <div className="ml-2">
                  <strong>Complexité :</strong> Mélangez majuscules, minuscules, chiffres et symboles
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                </div>
                <div className="ml-2">
                  <strong>Unicité :</strong> Utilisez un mot de passe unique pour chaque compte
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                </div>
                <div className="ml-2">
                  <strong>Évitez :</strong> Les informations personnelles faciles à deviner
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Information de sécurité
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Après avoir changé votre mot de passe, vous resterez connecté sur cet appareil.
                  Cependant, vous devrez vous reconnecter sur vos autres appareils avec le nouveau mot de passe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}