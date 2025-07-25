import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import Layout from "~/components/layout/Layout";
import { requireUser } from "~/utils/auth.server";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Globe,
  FileText,
  DollarSign,
  Clock,
  Plus,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from "lucide-react";

// Types pour les données
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  user_type: "admin" | "expert" | "entrepreneur";
  is_active: boolean;
  created_at: string;
  last_login?: string;
  // Données spécifiques aux experts
  specialization?: string;
  years_of_experience?: number;
  linkedin_profile?: string;
  cv_url?: string;
  bio?: string;
  hourly_rate?: number;
  // Données spécifiques aux entrepreneurs
  company_name?: string;
  annual_revenue?: number;
  funding_stage?: string;
}

interface LoaderData {
  user: User;
  users: User[];
  totalUsers: number;
  filters: {
    role?: string;
    status?: string;
    search?: string;
  };
}

interface ActionData {
  success?: boolean;
  error?: string;
  message?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const token = user.token;

  // Vérifier que l'utilisateur est admin
  if (user.user_type !== "admin") {
    throw new Response("Accès non autorisé", { status: 403 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  // Ici, vous devriez faire l'appel à votre API FastAPI pour récupérer les utilisateurs
  // Pour l'exemple, je simule des données
  const mockUsers: User[] = [
    {
      id: "1",
      email: "sarah.martin@example.com",
      first_name: "Sarah",
      last_name: "Martin",
      phone: "+33 6 12 34 56 78",
      city: "Paris",
      country: "France",
      user_type: "expert",
      is_active: true,
      created_at: "2024-01-15T10:30:00Z",
      last_login: "2024-01-25T09:15:00Z",
      specialization: "Marketing Digital",
      years_of_experience: 8,
      linkedin_profile: "https://linkedin.com/in/sarah-martin",
      bio: "Experte en marketing digital avec 8 ans d'expérience.",
      hourly_rate: 150,
    },
    {
      id: "2",
      email: "jean.dupont@example.com",
      first_name: "Jean",
      last_name: "Dupont",
      phone: "+33 6 98 76 54 32",
      city: "Lyon",
      country: "France",
      user_type: "entrepreneur",
      is_active: true,
      created_at: "2024-01-10T14:20:00Z",
      last_login: "2024-01-26T16:45:00Z",
      company_name: "TechStart SAS",
      annual_revenue: 250000,
      funding_stage: "seed",
    },
  ];

  const filteredUsers = mockUsers.filter((user) => {
    if (role && user.user_type !== role) return false;
    if (status === "active" && !user.is_active) return false;
    if (status === "inactive" && user.is_active) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return json<LoaderData>({
    user,
    users: filteredUsers,
    totalUsers: mockUsers.length,
    filters: { role, status, search },
  });
};

// Définir l'URL de base de l'API FastAPI
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const token = user.token;

  if (user.user_type !== "admin") {
    throw new Response("Accès non autorisé", { status: 403 });
  }

  const formData = await request.formData();
  const actionType = formData.get("actionType");

  try {
    if (actionType === "createExpert") {
      const expertData = {
        user: {
          email: formData.get("email"),
          first_name: formData.get("firstName"),
          last_name: formData.get("lastName"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          city: formData.get("city"),
          country: formData.get("country"),
          postal_code: formData.get("postalCode"),
        },
        specialization: formData.get("specialization"),
        years_of_experience: formData.get("yearsOfExperience")
          ? parseInt(formData.get("yearsOfExperience") as string)
          : null,
        linkedin_profile: formData.get("linkedinProfile"),
        cv_url: formData.get("cvUrl"),
        bio: formData.get("bio"),
        hourly_rate: formData.get("hourlyRate")
          ? parseInt(formData.get("hourlyRate") as string)
          : null,
        is_active: true,
      };

      //Ici, vous devriez faire l'appel à votre API FastAPI
      const response = await fetch(`${API_BASE_URL}/admin/experts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expertData),
      });

      if (!response.ok) {
        const error = await response.json();
        return json<ActionData>({
          error: error.detail || "Erreur lors de la création",
        });
      }

      return json<ActionData>({
        success: true,
        message: "Expert créé avec succès. Un email de bienvenue a été envoyé.",
      });
    }

    if (actionType === "toggleUserStatus") {
      const userId = formData.get("userId");
      // Ici, vous devriez faire l'appel à votre API pour activer/désactiver l'utilisateur
      return json<ActionData>({
        success: true,
        message: "Statut de l'utilisateur mis à jour",
      });
    }

    return json<ActionData>({ error: "Action non reconnue" });
  } catch (error) {
    return json<ActionData>({ error: "Une erreur est survenue" });
  }
};

export default function AdminUsers() {
  const { user, users, totalUsers, filters } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showCreateExpertModal, setShowCreateExpertModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  // Fermer le modal après création réussie
  useEffect(() => {
    if (actionData?.success && showCreateExpertModal) {
      setShowCreateExpertModal(false);
    }
  }, [actionData, showCreateExpertModal]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "expert":
        return "bg-blue-100 text-blue-800";
      case "entrepreneur":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "expert":
        return "Expert";
      case "entrepreneur":
        return "Entrepreneur";
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des utilisateurs
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez les comptes utilisateurs de votre plateforme
            </p>
          </div>
          <button
            onClick={() => setShowCreateExpertModal(true)}
            className="bg-[#0B2749] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Créer un expert</span>
          </button>
        </div>

        {/* Messages d'état */}
        {actionData?.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{actionData.message}</span>
          </div>
        )}

        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{actionData.error}</span>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Experts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.user_type === "expert").length}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entrepreneurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.user_type === "entrepreneur").length}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent w-full md:w-64"
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              {/* Filtre par rôle */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                value={filters.role || ""}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Administrateurs</option>
                <option value="expert">Experts</option>
                <option value="entrepreneur">Entrepreneurs</option>
              </select>

              {/* Filtre par statut */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {users.length} utilisateur{users.length > 1 ? "s" : ""} trouvé
              {users.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.first_name[0]}
                            {user.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                          user.user_type
                        )}`}
                      >
                        {getRoleName(user.user_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {user.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 text-gray-400 mr-1" />
                            {user.phone}
                          </div>
                        )}
                        {user.city && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            {user.city}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? formatDate(user.last_login) : "Jamais"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Form method="post" className="inline">
                          <input
                            type="hidden"
                            name="actionType"
                            value="toggleUserStatus"
                          />
                          <input type="hidden" name="userId" value={user.id} />
                          <button
                            type="submit"
                            className={`p-1 rounded ${
                              user.is_active
                                ? "text-red-600 hover:text-red-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            title={user.is_active ? "Désactiver" : "Activer"}
                          >
                            {user.is_active ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos filtres de recherche.
              </p>
            </div>
          )}
        </div>

        {/* Modal de création d'expert */}
        {showCreateExpertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Créer un nouveau compte expert
                  </h2>
                  <button
                    onClick={() => setShowCreateExpertModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <Form method="post" className="p-6 space-y-6">
                <input type="hidden" name="actionType" value="createExpert" />

                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="city"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pays
                      </label>
                      <input
                        type="text"
                        name="country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informations professionnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spécialisation *
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        required
                        placeholder="ex: Marketing Digital, Finance, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Années d'expérience
                      </label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        min="0"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profil LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedinProfile"
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taux horaire (€)
                      </label>
                      <input
                        type="number"
                        name="hourlyRate"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL du CV
                    </label>
                    <input
                      type="url"
                      name="cvUrl"
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biographie
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      placeholder="Décrivez brièvement votre parcours et expertise..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateExpertModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#0B2749] focus:border-transparent"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0B2749] border border-transparent rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-[#0B2749] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Créer l'expert</span>
                      </>
                    )}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        )}

        {/* Modal de détails utilisateur */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {selectedUser.first_name[0]}
                        {selectedUser.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </h2>
                      <p className="text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDetails(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Informations générales */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Informations générales
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">
                            Rôle
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                              selectedUser.user_type
                            )}`}
                          >
                            {getRoleName(selectedUser.user_type)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">
                            Statut
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedUser.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedUser.is_active ? "Actif" : "Inactif"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">
                            Inscription
                          </span>
                          <span className="text-sm text-gray-900">
                            {formatDate(selectedUser.created_at)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">
                            Dernière connexion
                          </span>
                          <span className="text-sm text-gray-900">
                            {selectedUser.last_login
                              ? formatDate(selectedUser.last_login)
                              : "Jamais"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Informations de contact */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Contact
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {selectedUser.email}
                          </span>
                        </div>
                        {selectedUser.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {selectedUser.phone}
                            </span>
                          </div>
                        )}
                        {(selectedUser.city || selectedUser.country) && (
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {[selectedUser.city, selectedUser.country]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                        {selectedUser.address && (
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span className="text-sm text-gray-900">
                              {selectedUser.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informations spécifiques au rôle */}
                  <div className="space-y-6">
                    {selectedUser.user_type === "expert" && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Briefcase className="h-5 w-5 mr-2" />
                          Informations d'expert
                        </h3>
                        <div className="space-y-3">
                          {selectedUser.specialization && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                Spécialisation
                              </span>
                              <span className="text-sm text-gray-900">
                                {selectedUser.specialization}
                              </span>
                            </div>
                          )}
                          {selectedUser.years_of_experience && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                Expérience
                              </span>
                              <span className="text-sm text-gray-900">
                                {selectedUser.years_of_experience} ans
                              </span>
                            </div>
                          )}
                          {selectedUser.hourly_rate && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                Taux horaire
                              </span>
                              <span className="text-sm text-gray-900 flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {selectedUser.hourly_rate}€/h
                              </span>
                            </div>
                          )}
                          {selectedUser.linkedin_profile && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                LinkedIn
                              </span>
                              <a
                                href={selectedUser.linkedin_profile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <Globe className="h-3 w-3 mr-1" />
                                Voir le profil
                              </a>
                            </div>
                          )}
                          {selectedUser.cv_url && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                CV
                              </span>
                              <a
                                href={selectedUser.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Télécharger
                              </a>
                            </div>
                          )}
                          {selectedUser.bio && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-500 block mb-2">
                                Biographie
                              </span>
                              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                {selectedUser.bio}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedUser.user_type === "entrepreneur" && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Briefcase className="h-5 w-5 mr-2" />
                          Informations d'entrepreneur
                        </h3>
                        <div className="space-y-3">
                          {selectedUser.company_name && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                Entreprise
                              </span>
                              <span className="text-sm text-gray-900">
                                {selectedUser.company_name}
                              </span>
                            </div>
                          )}
                          {selectedUser.annual_revenue && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                CA annuel
                              </span>
                              <span className="text-sm text-gray-900 flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {selectedUser.annual_revenue.toLocaleString()}€
                              </span>
                            </div>
                          )}
                          {selectedUser.funding_stage && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                Stade de financement
                              </span>
                              <span className="text-sm text-gray-900 capitalize">
                                {selectedUser.funding_stage}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions utilisateur */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Actions
                      </h3>
                      <div className="space-y-3">
                        <Form method="post" className="w-full">
                          <input
                            type="hidden"
                            name="actionType"
                            value="toggleUserStatus"
                          />
                          <input
                            type="hidden"
                            name="userId"
                            value={selectedUser.id}
                          />
                          <button
                            type="submit"
                            className={`w-full px-4 py-2 text-sm font-medium rounded-lg border focus:ring-2 focus:ring-offset-2 flex items-center justify-center space-x-2 ${
                              selectedUser.is_active
                                ? "text-red-700 bg-red-50 border-red-200 hover:bg-red-100 focus:ring-red-500"
                                : "text-green-700 bg-green-50 border-green-200 hover:bg-green-100 focus:ring-green-500"
                            }`}
                          >
                            {selectedUser.is_active ? (
                              <>
                                <Ban className="h-4 w-4" />
                                <span>Désactiver le compte</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Activer le compte</span>
                              </>
                            )}
                          </button>
                        </Form>

                        <button
                          onClick={() => {
                            // Ici vous pourriez implémenter la fonctionnalité d'envoi d'email
                            alert(
                              "Fonctionnalité d'envoi d'email à implémenter"
                            );
                          }}
                          className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Envoyer un email</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
