import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigate } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { 
  ArrowLeft,
  Building,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Users as UsersIcon,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  MessageSquare,
  BookOpen,
  Activity
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const entrepreneurId = params.entrepreneurId;
  if (!entrepreneurId) {
    throw new Error("ID entrepreneur manquant");
  }

  try {
    const entrepreneurData = await fetch(`${API_BASE_URL}/admin/entrepreneurs/${entrepreneurId}`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => {
      if (!res.ok) throw new Error("Entrepreneur non trouvé");
      return res.json();
    });

    return json({ 
      user, 
      entrepreneur: entrepreneurData
    });
  } catch (error) {
    throw new Error("Erreur lors du chargement de l'entrepreneur");
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  if (!session) {
    return json({ error: "Session non trouvée" }, { status: 401 });
  }

  const entrepreneurId = params.entrepreneurId;
  if (!entrepreneurId) {
    return json({ error: "ID entrepreneur manquant" }, { status: 400 });
  }

  const formData = await request.formData();
  const actionType = formData.get("action") as string;

  try {
    let response;
    switch (actionType) {
      case "validate":
        response = await fetch(`${API_BASE_URL}/admin/entrepreneurs/${entrepreneurId}/validate`, {
          method: "PUT",
          headers: { 
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) throw new Error("Échec de la validation");
        return redirect("/admin/entrepreneurs"); // Redirection après succès

      case "reject":
        response = await fetch(`${API_BASE_URL}/admin/entrepreneurs/${entrepreneurId}/reject`, {
          method: "PUT",
          headers: { 
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) throw new Error("Échec du rejet");
        return redirect("/admin/entrepreneurs"); // Redirection après succès

      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error: any) {
    return json({ 
      error: error.message || "Erreur lors de l'action",
      status: 400 
    });
  }
}

export default function AdminEntrepreneurDetail() {
  const { user, entrepreneur } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const navigation = getAdminNavigation("/admin/entrepreneurs");

  const getValidationBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approuvé
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" />
            En attente
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Inconnu
          </span>
        );
    }
  };

  const getCompanyStatusIndicators = () => {
    const indicators = [];
    if (entrepreneur.company_not_created) {
      indicators.push({ label: "Entreprise pas encore créée", color: "bg-red-100 text-red-800" });
    }
    if (entrepreneur.company_recently_created) {
      indicators.push({ label: "Entreprise récemment créée", color: "bg-yellow-100 text-yellow-800" });
    }
    if (entrepreneur.company_established) {
      indicators.push({ label: "Entreprise établie", color: "bg-green-100 text-green-800" });
    }
    return indicators;
  };

  return (
    <Layout user={user} title="Détails de l'entrepreneur" navigation={navigation}>
      {/* En-tête avec navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/entrepreneurs")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la liste des entrepreneurs
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {entrepreneur.user?.first_name} {entrepreneur.user?.last_name}
            </h1>
            <p className="text-gray-500">{entrepreneur.company_name}</p>
          </div>
          <div className="flex items-center space-x-3">
            {getValidationBadge(entrepreneur.validation_status)}
            
            {entrepreneur.validation_status === "pending" && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowActionModal("validate")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Approuver
                </button>
                <button
                  onClick={() => setShowActionModal("reject")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages de retour */}
      {actionData?.success && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{actionData.success}</p>
            </div>
          </div>
        </div>
      )}

      {actionData?.error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{actionData.error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations utilisateur */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {entrepreneur.user?.first_name} {entrepreneur.user?.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {entrepreneur.user?.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {entrepreneur.user?.phone || "Non renseigné"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Statut du compte</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entrepreneur.user?.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entrepreneur.user?.status === 'active' ? 'Actif' : 'En attente'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date d'inscription</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {new Date(entrepreneur.user?.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dernière connexion</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {entrepreneur.user?.last_login 
                      ? new Date(entrepreneur.user.last_login).toLocaleDateString()
                      : "Jamais connecté"
                    }
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Informations de l'entreprise */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Informations de l'entreprise</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Nom de l'entreprise</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-gray-400" />
                    {entrepreneur.company_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Secteur d'activité</dt>
                  <dd className="mt-1 text-sm text-gray-900">{entrepreneur.industry_sector}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre d'employés</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {entrepreneur.number_of_employees}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {entrepreneur.company_description || "Aucune description fournie"}
                  </dd>
                </div>
                
                {/* Statut de l'entreprise */}
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Statut de l'entreprise</dt>
                  <dd className="mt-1">
                    <div className="flex flex-wrap gap-2">
                      {getCompanyStatusIndicators().map((indicator, index) => (
                        <span key={index} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${indicator.color}`}>
                          {indicator.label}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Informations de validation */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Validation</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Statut de validation</dt>
                  <dd className="mt-1">
                    {getValidationBadge(entrepreneur.validation_status)}
                  </dd>
                </div>
                
                {entrepreneur.validation_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date de validation</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(entrepreneur.validation_date).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                
                {entrepreneur.validated_by && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Validé par</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Admin ID: {entrepreneur.validated_by}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Actions uniquement pour validation en attente */}
          {entrepreneur.validation_status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <h3 className="ml-2 text-sm font-medium text-yellow-800">
                  Action requise
                </h3>
              </div>
              <div className="mt-2">
                <p className="text-sm text-yellow-700">
                  Cette candidature est en attente de validation. Vérifiez les informations et approuvez ou rejetez la demande.
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => setShowActionModal("validate")}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approuver
                </button>
                <button
                  onClick={() => setShowActionModal("reject")}
                  className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Rejeter
                </button>
              </div>
            </div>
          )}

          {/* Actions de consultation */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Actions</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Envoyer un message
                </button>

                <button className="w-full flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-all">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Voir les programmes
                </button>
              </div>
            </div>
          </div>

          {/* Activité (placeholder) */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Activité</h3>
            </div>
            <div className="px-6 py-4">
              <div className="text-center text-gray-500 py-4">
                <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm">Aucune activité enregistrée</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation d'action */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                showActionModal === "validate" ? "bg-green-100" : "bg-red-100"
              }`}>
                {showActionModal === "validate" ? (
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                ) : (
                  <ThumbsDown className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                {showActionModal === "validate" ? "Approuver l'entrepreneur" : "Rejeter la candidature"}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {showActionModal === "validate" 
                    ? `Êtes-vous sûr de vouloir approuver la candidature de ${entrepreneur.user?.first_name} ${entrepreneur.user?.last_name} pour ${entrepreneur.company_name} ? Un email de validation sera envoyé.`
                    : `Êtes-vous sûr de vouloir rejeter la candidature de ${entrepreneur.user?.first_name} ${entrepreneur.user?.last_name} ? Un email de notification sera envoyé.`
                  }
                </p>
              </div>
              <div className="flex justify-center space-x-4 px-4 py-3">
                <button
                  onClick={() => setShowActionModal(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
                <Form method="post">
                  <input type="hidden" name="action" value={showActionModal} />
                  <button
                    type="submit"
                    onClick={() => setShowActionModal(null)}
                    className={`px-4 py-2 rounded-md text-white ${
                      showActionModal === "validate"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {showActionModal === "validate" ? "Approuver" : "Rejeter"}
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}