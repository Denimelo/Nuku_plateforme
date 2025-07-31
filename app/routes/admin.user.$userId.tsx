import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigate, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { adminServerAPI } from "~/utils/api.server";
import { 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Save,
  Trash2,
  AlertCircle,
  Phone,
  MapPin,
  Building,
  Globe,
  Activity,
  Settings,
  UserCheck,
  FileText,
  CreditCard
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const userId = params.userId;
  if (!userId) {
    throw new Error("ID utilisateur manquant");
  }

  try {
    // Récupérer les détails de l'utilisateur via l'API
    const userData = await adminServerAPI.getUser(session.token, userId);
    
    // Récupérer des données additionnelles selon le type d'utilisateur
    let additionalData = null;
    if (userData.user_type === "entrepreneur") {
      try {
        additionalData = await adminServerAPI.getEntrepreneur(session.token, userId);
      } catch (error) {
        console.error("Erreur lors du chargement des données entrepreneur:", error);
      }
    } else if (userData.user_type === "expert") {
      try {
        additionalData = await adminServerAPI.getExpert(session.token, userId);
      } catch (error) {
        console.error("Erreur lors du chargement des données expert:", error);
      }
    }

    return json({ 
      user, 
      userData,
      additionalData,
      userId
    });
  } catch (error) {
    console.error("Erreur lors du chargement de l'utilisateur:", error);
    throw new Error("Utilisateur introuvable");
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  if (!session) {
    return json({ error: "Session non trouvée" }, { status: 401 });
  }

  const userId = params.userId;
  if (!userId) {
    return json({ error: "ID utilisateur manquant" }, { status: 400 });
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    switch (action) {
      case "activate":
        await adminServerAPI.activateUser(session.token, userId);
        return json({ success: "Utilisateur activé avec succès" });

      case "deactivate":
        await adminServerAPI.deactivateUser(session.token, userId);
        return json({ success: "Utilisateur désactivé avec succès" });

      case "delete":
        await adminServerAPI.deleteUser(session.token, userId);
        return json({ success: "Utilisateur supprimé avec succès", redirect: "/admin/users" });

      case "update":
        const updateData = {
          first_name: formData.get("first_name") as string,
          last_name: formData.get("last_name") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
        };
        await adminServerAPI.updateUser(session.token, userId, updateData);
        return json({ success: "Utilisateur mis à jour avec succès" });

      case "validate_entrepreneur":
        await adminServerAPI.validateEntrepreneur(session.token, userId);
        return json({ success: "Entrepreneur validé avec succès" });

      case "reject_entrepreneur":
        await adminServerAPI.rejectEntrepreneur(session.token, userId);
        return json({ success: "Candidature rejetée" });

      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error: any) {
    return json({ error: error.message || "Erreur lors de l'action" }, { status: 400 });
  }
}

export default function AdminUserDetails() {
  const { user, userData, additionalData, userId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigation = getAdminNavigation(location.pathname);

  // Redirection après suppression
  if (actionData?.redirect) {
    navigate(actionData.redirect);
  }

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "admin":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          <Shield className="h-4 w-4 mr-1" />
          Administrateur
        </span>;
      case "expert":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <User className="h-4 w-4 mr-1" />
          Expert
        </span>;
      case "entrepreneur":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <UserCheck className="h-4 w-4 mr-1" />
          Entrepreneur
        </span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Inconnu</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4 mr-1" />
          Actif
        </span>;
      case "pending":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-4 w-4 mr-1" />
          En attente
        </span>;
      case "inactive":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="h-4 w-4 mr-1" />
          Inactif
        </span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Inconnu</span>;
    }
  };

  return (
    <Layout user={user} title={`${userData.first_name} ${userData.last_name}`} navigation={navigation}>
      {/* En-tête avec navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/users")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la liste des utilisateurs
        </button>
      </div>

      {/* Messages de retour */}
      {actionData?.success && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{actionData.success}</p>
            </div>
          </div>
        </div>
      )}

      {actionData?.error && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{actionData.error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profil principal */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
            {/* En-tête du profil */}
            <div className="bg-gradient-to-r from-slate-800 to-blue-700 px-8 py-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {userData.first_name?.[0]}{userData.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {userData.first_name} {userData.last_name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2">
                      {getUserTypeBadge(userData.user_type)}
                      {getStatusBadge(userData.status)}
                    </div>
                    <div className="flex items-center text-white/80 mt-3">
                      <Mail className="h-4 w-4 mr-2" />
                      {userData.email}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 rounded-xl bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-all"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenu du profil */}
            <div className="p-8">
              {isEditing ? (
                <EditUserForm userData={userData} onCancel={() => setIsEditing(false)} />
              ) : (
                <UserInfoDisplay userData={userData} additionalData={additionalData} />
              )}
            </div>
          </div>
        </div>

        {/* Actions et informations supplémentaires */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Actions
            </h3>
            <div className="space-y-3">
              {userData.status === "active" ? (
                <Form method="post">
                  <input type="hidden" name="action" value="deactivate" />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-2xl text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Désactiver le compte
                  </button>
                </Form>
              ) : (
                <Form method="post">
                  <input type="hidden" name="action" value="activate" />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-2xl text-green-700 bg-green-50 hover:bg-green-100 transition-all"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activer le compte
                  </button>
                </Form>
              )}

              {/* Actions spécifiques aux entrepreneurs */}
              {userData.user_type === "entrepreneur" && additionalData?.validation_status === "pending" && (
                <div className="space-y-2">
                  <Form method="post">
                    <input type="hidden" name="action" value="validate_entrepreneur" />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-2xl text-green-700 bg-green-50 hover:bg-green-100 transition-all"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Valider entrepreneur
                    </button>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="action" value="reject_entrepreneur" />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-2xl text-red-700 bg-red-50 hover:bg-red-100 transition-all"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter candidature
                    </button>
                  </Form>
                </div>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-2xl text-red-700 bg-red-50 hover:bg-red-100 transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer définitivement
              </button>
            </div>
          </div>

          {/* Statistiques d'activité */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activité
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inscrit le</span>
                <span className="text-sm font-medium">
                  {new Date(userData.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dernière connexion</span>
                <span className="text-sm font-medium">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Programmes suivis</span>
                <span className="text-sm font-medium">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-3xl bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                Supprimer l'utilisateur
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur{' '}
                  <strong>{userData.first_name} {userData.last_name}</strong> ?
                  Cette action est irréversible et supprimera toutes les données associées.
                </p>
              </div>
              <div className="flex justify-center space-x-4 px-4 py-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-2xl hover:bg-gray-400 transition-all"
                >
                  Annuler
                </button>
                <Form method="post">
                  <input type="hidden" name="action" value="delete" />
                  <button
                    type="submit"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2 rounded-2xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all"
                  >
                    Supprimer
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

function UserInfoDisplay({ userData, additionalData }: { userData: any; additionalData: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Informations personnelles */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informations personnelles</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Prénom</label>
            <p className="text-sm text-gray-900">{userData.first_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Nom</label>
            <p className="text-sm text-gray-900">{userData.last_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-sm text-gray-900">{userData.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Téléphone</label>
            <p className="text-sm text-gray-900">{userData.phone || "Non renseigné"}</p>
          </div>
        </div>
      </div>

      {/* Informations système */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informations système</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Type de compte</label>
            <p className="text-sm text-gray-900 capitalize">{userData.user_type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Statut</label>
            <p className="text-sm text-gray-900 capitalize">{userData.status}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date d'inscription</label>
            <p className="text-sm text-gray-900">
              {new Date(userData.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Informations spécifiques selon le type */}
      {userData.user_type === "entrepreneur" && additionalData && (
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informations entrepreneur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Entreprise</label>
              <p className="text-sm text-gray-900">{additionalData.company_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Secteur</label>
              <p className="text-sm text-gray-900">{additionalData.industry_sector}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Statut de validation</label>
              <p className="text-sm text-gray-900 capitalize">{additionalData.validation_status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre d'employés</label>
              <p className="text-sm text-gray-900">{additionalData.number_of_employees}</p>
            </div>
          </div>
        </div>
      )}

      {userData.user_type === "expert" && additionalData && (
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informations expert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Spécialisation</label>
              <p className="text-sm text-gray-900">{additionalData.specialization}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Années d'expérience</label>
              <p className="text-sm text-gray-900">{additionalData.experience_years} ans</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Biographie</label>
              <p className="text-sm text-gray-900">{additionalData.bio || "Non renseignée"}</p>
            </div>
            {additionalData.linkedin_url && (
              <div>
                <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                <a href={additionalData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                  Voir le profil
                </a>
              </div>
            )}
            {additionalData.hourly_rate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Tarif horaire</label>
                <p className="text-sm text-gray-900">{additionalData.hourly_rate} FCFA/h</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EditUserForm({ userData, onCancel }: { userData: any; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    first_name: userData.first_name || "",
    last_name: userData.last_name || "",
    email: userData.email || "",
    phone: userData.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="action" value="update" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
            Prénom *
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            value={formData.first_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
            Nom *
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            value={formData.last_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </button>
      </div>
    </Form>
  );
}