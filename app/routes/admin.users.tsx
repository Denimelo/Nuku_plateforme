import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { 
  Users, 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle,
  Eye,
  Mail,
  Calendar,
  UserCheck,
  Settings,
  Clock,
  Filter,
  Trash2,
  AlertCircle,
  Plus,
  Download,
  Edit,
  MoreVertical,
  User
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "all";
  const search = url.searchParams.get("search") || "";

  try {
    // Récupérer tous les utilisateurs
    const usersData = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => res.ok ? res.json() : []);

    // Filtrer selon les paramètres
    let filteredUsers = usersData;
    
    if (filter !== "all") {
      filteredUsers = usersData.filter((user: any) => {
        switch (filter) {
          case "entrepreneur":
            return user.user_type === "entrepreneur";
          case "expert":
            return user.user_type === "expert";
          case "admin":
            return user.user_type === "admin";
          case "active":
            return user.status === "active";
          case "pending":
            return user.status === "pending";
          case "inactive":
            return user.status === "inactive";
          default:
            return true;
        }
      });
    }

    if (search) {
      filteredUsers = filteredUsers.filter((user: any) =>
        user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return json({ 
      user, 
      users: filteredUsers,
      filter,
      search,
      stats: {
        total: usersData.length,
        entrepreneurs: usersData.filter((u: any) => u.user_type === "entrepreneur").length,
        experts: usersData.filter((u: any) => u.user_type === "expert").length,
        admins: usersData.filter((u: any) => u.user_type === "admin").length,
        active: usersData.filter((u: any) => u.status === "active").length,
        pending: usersData.filter((u: any) => u.status === "pending").length,
        inactive: usersData.filter((u: any) => u.status === "inactive").length,
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    return json({ 
      user, 
      users: [], 
      filter, 
      search,
      stats: { total: 0, entrepreneurs: 0, experts: 0, admins: 0, active: 0, pending: 0, inactive: 0 }
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  if (!session) {
    return json({ error: "Session non trouvée" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;
  const userId = formData.get("userId") as string;

  try {
    switch (action) {
      case "activate":
        await fetch(`${API_BASE_URL}/admin/users/${userId}/activate`, {
          method: "PUT",
          headers: { 
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json"
          }
        });
        return json({ success: "Utilisateur activé avec succès" });

      case "deactivate":
        await fetch(`${API_BASE_URL}/admin/users/${userId}/deactivate`, {
          method: "PUT",
          headers: { 
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json"
          }
        });
        return json({ success: "Utilisateur désactivé avec succès" });

      case "delete":
        await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json"
          }
        });
        return json({ success: "Utilisateur supprimé avec succès" });

      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error: any) {
    return json({ error: error.message || "Erreur lors de l'action" }, { status: 400 });
  }
}

export default function AdminUsers() {
  const { user, users, filter, search, stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState<{user: any} | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const navigation = getAdminNavigation(location.pathname);

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "admin":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </span>;
      case "expert":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <User className="h-3 w-3 mr-1" />
          Expert
        </span>;
      case "entrepreneur":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <UserCheck className="h-3 w-3 mr-1" />
          Entrepreneur
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inconnu</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Actif
        </span>;
      case "pending":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </span>;
      case "inactive":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Inactif
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inconnu</span>;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((u: any) => u.user_id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  return (
    <Layout user={user} title="Gestion des utilisateurs" navigation={navigation}>
      {/* En-tête avec statistiques */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">Gestion des utilisateurs</h1>
            <p className="text-xl text-slate-200 mb-6">
              Gérez tous les comptes utilisateurs de la plateforme
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
              <StatBadge label="Total" value={stats.total} color="white" />
              <StatBadge label="Entrepreneurs" value={stats.entrepreneurs} color="green" />
              <StatBadge label="Experts" value={stats.experts} color="blue" />
              <StatBadge label="Admins" value={stats.admins} color="purple" />
              <StatBadge label="Actifs" value={stats.active} color="emerald" />
              <StatBadge label="En attente" value={stats.pending} color="yellow" />
              <StatBadge label="Inactifs" value={stats.inactive} color="red" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Recherche */}
            <div className="flex-1 max-w-lg">
              <form method="get" className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="search"
                  defaultValue={search}
                  type="text"
                  placeholder="Rechercher par nom, email..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl leading-5 bg-white/70 backdrop-blur placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <input type="hidden" name="filter" value={filter} />
              </form>
            </div>

            {/* Actions et filtres */}
            <div className="flex items-center space-x-3">
              <select
                name="filter"
                value={filter}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("filter", e.target.value);
                  if (search) url.searchParams.set("search", search);
                  window.location.href = url.toString();
                }}
                className="block pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-2xl bg-white/70 backdrop-blur"
              >
                <option value="all">Tous les utilisateurs</option>
                <optgroup label="Par type">
                  <option value="entrepreneur">Entrepreneurs</option>
                  <option value="expert">Experts</option>
                  <option value="admin">Administrateurs</option>
                </optgroup>
                <optgroup label="Par statut">
                  <option value="active">Actifs</option>
                  <option value="pending">En attente</option>
                  <option value="inactive">Inactifs</option>
                </optgroup>
              </select>

              <button
                onClick={() => window.location.href = '/admin/experts/new'}
                className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvel expert
              </button>

              {selectedUsers.length > 0 && (
                <button className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-2xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter sélection
                </button>
              )}
            </div>
          </div>
        </div>
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

      {/* Tableau des utilisateurs */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="relative px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 backdrop-blur divide-y divide-gray-200">
              {users.map((currentUser: any) => (
                <tr key={currentUser.user_id} className="hover:bg-white/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(currentUser.user_id)}
                      onChange={(e) => handleSelectUser(currentUser.user_id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-white">
                            {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">
                          {currentUser.first_name} {currentUser.last_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUserTypeBadge(currentUser.user_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(currentUser.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(currentUser.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={`/admin/user/${currentUser.user_id}`}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-all"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      
                      <div className="relative inline-block text-left">
                        <UserActionsDropdown user={currentUser} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-16">
            <Users className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun utilisateur trouvé</h3>
            <p className="mt-2 text-sm text-gray-500">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
          </div>
        )}
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
                  <strong>{showDeleteModal.user.first_name} {showDeleteModal.user.last_name}</strong> ?
                  Cette action est irréversible.
                </p>
              </div>
              <div className="flex justify-center space-x-4 px-4 py-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-2xl hover:bg-gray-400 transition-all"
                >
                  Annuler
                </button>
                <Form method="post">
                  <input type="hidden" name="action" value="delete" />
                  <input type="hidden" name="userId" value={showDeleteModal.user.user_id} />
                  <button
                    type="submit"
                    onClick={() => setShowDeleteModal(null)}
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

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    white: "bg-white/20 text-white",
    green: "bg-green-500/20 text-green-100",
    blue: "bg-blue-500/20 text-blue-100",
    purple: "bg-purple-500/20 text-purple-100",
    emerald: "bg-emerald-500/20 text-emerald-100",
    yellow: "bg-yellow-500/20 text-yellow-100",
    red: "bg-red-500/20 text-red-100",
  };
  
  return (
    <div className={`px-3 py-2 rounded-2xl backdrop-blur ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

function UserActionsDropdown({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 z-10">
          <div className="p-2">
            
            {user.status === "active" ? (
              <Form method="post" className="block">
                <input type="hidden" name="action" value="deactivate" />
                <input type="hidden" name="userId" value={user.user_id} />
                <button
                  type="submit"
                  className="flex items-center w-full px-3 py-2 text-sm text-orange-700 hover:bg-orange-50 rounded-xl"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Désactiver
                </button>
              </Form>
            ) : (
              <Form method="post" className="block">
                <input type="hidden" name="action" value="activate" />
                <input type="hidden" name="userId" value={user.user_id} />
                <button
                  type="submit"
                  className="flex items-center w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-xl"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activer
                </button>
              </Form>
            )}
            
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}