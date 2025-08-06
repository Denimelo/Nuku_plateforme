import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { adminServerAPI } from "~/utils/api.server";
import { 
  Users, 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle,
  Eye,
  Mail,
  Building,
  Calendar,
  UserCheck,
  Settings,
  Clock,
  Filter,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Activity,
  Download,
  MoreVertical,
  User,
  Briefcase,
  TrendingUp
} from "lucide-react";

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
    const entrepreneursData = await adminServerAPI.getEntrepreneurs(session.token);

    // Filtrer selon les paramètres
    let filteredEntrepreneurs = entrepreneursData;
    
    if (filter !== "all") {
      filteredEntrepreneurs = entrepreneursData.filter((entrepreneur: any) => {
        switch (filter) {
          case "pending":
            return entrepreneur.validation_status === "pending";
          case "approved":
            return entrepreneur.validation_status === "approved";
          case "rejected":
            return entrepreneur.validation_status === "rejected";
          default:
            return true;
        }
      });
    }

    if (search) {
      filteredEntrepreneurs = filteredEntrepreneurs.filter((entrepreneur: any) =>
        entrepreneur.user?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        entrepreneur.user?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        entrepreneur.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        entrepreneur.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        entrepreneur.industry_sector?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return json({ 
      user, 
      entrepreneurs: filteredEntrepreneurs,
      filter,
      search,
      stats: {
        total: entrepreneursData.length,
        pending: entrepreneursData.filter((e: any) => e.validation_status === "pending").length,
        approved: entrepreneursData.filter((e: any) => e.validation_status === "approved").length,
        rejected: entrepreneursData.filter((e: any) => e.validation_status === "rejected").length,
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des entrepreneurs:", error);
    return json({ 
      user, 
      entrepreneurs: [], 
      filter, 
      search,
      stats: { total: 0, pending: 0, approved: 0, rejected: 0 }
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
  const entrepreneurId = formData.get("entrepreneurId") as string;

  try {
    switch (action) {
      case "validate":
        await adminServerAPI.validateEntrepreneur(session.token, entrepreneurId);
        return json({ success: "Entrepreneur validé avec succès" });

      case "reject":
        await adminServerAPI.rejectEntrepreneur(session.token, entrepreneurId);
        return json({ success: "Candidature rejetée" });

      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error: any) {
    return json({ error: error.message || "Erreur lors de l'action" }, { status: 400 });
  }
}

export default function AdminEntrepreneurs() {
  const { user, entrepreneurs, filter, search, stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const successMessage = urlParams.get('success');
  const [showValidationModal, setShowValidationModal] = useState<{entrepreneur: any, action: string} | null>(null);
  const [selectedEntrepreneurs, setSelectedEntrepreneurs] = useState<string[]>([]);

  const navigation = getAdminNavigation(location.pathname);

  const getValidationBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approuvé
        </span>;
      case "pending":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </span>;
      case "rejected":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Rejeté
        </span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Inconnu</span>;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntrepreneurs(entrepreneurs.map((e: any) => e.entrepreneur_id));
    } else {
      setSelectedEntrepreneurs([]);
    }
  };

  const handleSelectEntrepreneur = (entrepreneurId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntrepreneurs([...selectedEntrepreneurs, entrepreneurId]);
    } else {
      setSelectedEntrepreneurs(selectedEntrepreneurs.filter(id => id !== entrepreneurId));
    }
  };

  return (
    <Layout user={user} title="Gestion des entrepreneurs" navigation={navigation}>
      {/* En-tête avec gradient */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-green-700 rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Motifs décoratifs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-slate-600/30 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">
              Gestion des entrepreneurs
            </h1>
            <p className="text-xl text-slate-200 mb-6">
              Gérez les candidatures et validations des entrepreneurs
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-300" />
                <span>Système opérationnel</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-300" />
                <span>{stats.pending} candidatures en attente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total entrepreneurs"
          value={stats.total}
          subtitle="inscrits sur la plateforme"
          icon={UserCheck}
          color="blue"
          trend="+12% ce mois"
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          subtitle="candidatures à valider"
          icon={Clock}
          color="yellow"
          trend="Urgent à traiter"
          urgent={stats.pending > 0}
        />
        <StatCard
          title="Approuvés"
          value={stats.approved}
          subtitle="entrepreneurs actifs"
          icon={CheckCircle}
          color="green"
          trend="+8% cette semaine"
        />
        <StatCard
          title="Rejetés"
          value={stats.rejected}
          subtitle="candidatures refusées"
          icon={XCircle}
          color="red"
          trend="2% du total"
        />
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
                  placeholder="Rechercher par nom, email, entreprise, secteur..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl leading-5 bg-white/70 backdrop-blur placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                className="block pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-2xl bg-white/70 backdrop-blur"
              >
                <option value="all">Tous les entrepreneurs</option>
                <option value="pending">En attente de validation</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>

              {selectedEntrepreneurs.length > 0 && (
                <button className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-2xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter sélection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {successMessage === 'entrepreneur_validated' && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">Entrepreneur approuvé avec succès !</p>
            </div>
          </div>
        </div>
      )}

      {successMessage === 'entrepreneur_rejected' && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">Candidature rejetée avec succès.</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Tableau des entrepreneurs */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEntrepreneurs.length === entrepreneurs.length && entrepreneurs.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Entrepreneur
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Secteur
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
              {entrepreneurs.map((entrepreneur: any) => (
                <tr key={entrepreneur.entrepreneur_id} className="hover:bg-white/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEntrepreneurs.includes(entrepreneur.entrepreneur_id)}
                      onChange={(e) => handleSelectEntrepreneur(entrepreneur.entrepreneur_id, e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-white">
                            {entrepreneur.user?.first_name?.[0]}{entrepreneur.user?.last_name?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">
                          {entrepreneur.user?.first_name} {entrepreneur.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {entrepreneur.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {entrepreneur.company_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entrepreneur.number_of_employees} employé{entrepreneur.number_of_employees > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {entrepreneur.industry_sector}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getValidationBadge(entrepreneur.validation_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(entrepreneur.user?.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={`/admin/entrepreneur/${entrepreneur.entrepreneur_id}`}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-all"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      
                      <div className="relative inline-block text-left">
                        <EntrepreneurActionsDropdown entrepreneur={entrepreneur} onValidate={setShowValidationModal} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entrepreneurs.length === 0 && (
          <div className="text-center py-16">
            <UserCheck className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun entrepreneur trouvé</h3>
            <p className="mt-2 text-sm text-gray-500">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
          </div>
        )}
      </div>

      {/* Modal de validation/rejet */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-3xl bg-white">
            <div className="mt-3 text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                showValidationModal.action === "validate" ? "bg-green-100" : "bg-red-100"
              }`}>
                {showValidationModal.action === "validate" ? (
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                ) : (
                  <ThumbsDown className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                {showValidationModal.action === "validate" ? "Approuver l'entrepreneur" : "Rejeter la candidature"}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {showValidationModal.action === "validate" 
                    ? `Êtes-vous sûr de vouloir approuver la candidature de ${showValidationModal.entrepreneur.user?.first_name} ${showValidationModal.entrepreneur.user?.last_name} pour ${showValidationModal.entrepreneur.company_name} ?`
                    : `Êtes-vous sûr de vouloir rejeter la candidature de ${showValidationModal.entrepreneur.user?.first_name} ${showValidationModal.entrepreneur.user?.last_name} ?`
                  }
                </p>
              </div>
              <div className="flex justify-center space-x-4 px-4 py-3">
                <button
                  onClick={() => setShowValidationModal(null)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-2xl hover:bg-gray-400 transition-all"
                >
                  Annuler
                </button>
                <Form method="post">
                  <input type="hidden" name="action" value={showValidationModal.action} />
                  <input type="hidden" name="entrepreneurId" value={showValidationModal.entrepreneur.entrepreneur_id} />
                  <button
                    type="submit"
                    onClick={() => setShowValidationModal(null)}
                    className={`px-6 py-2 rounded-2xl text-white transition-all ${
                      showValidationModal.action === "validate"
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    }`}
                  >
                    {showValidationModal.action === "validate" ? "Approuver" : "Rejeter"}
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

function StatCard({ title, value, subtitle, icon: Icon, color, trend, urgent = false }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${urgent ? 'ring-2 ring-yellow-300 ring-opacity-50' : ''}`}>
      <div className="p-6 relative">
        {urgent && (
          <div className="absolute top-4 right-4">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
            {trend && (
              <p className={`text-xs font-medium mt-2 flex items-center ${urgent ? 'text-yellow-600' : 'text-green-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend}
              </p>
            )}
          </div>
          
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EntrepreneurActionsDropdown({ entrepreneur, onValidate }: any) {
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
            {entrepreneur.validation_status === "pending" && (
              <>
                <button
                  onClick={() => {
                    onValidate({entrepreneur, action: "validate"});
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-xl"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approuver
                </button>
                <button
                  onClick={() => {
                    onValidate({entrepreneur, action: "reject"});
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-xl"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Rejeter
                </button>
              </>
            )}
            
            <a
              href={`/admin/entrepreneur/${entrepreneur.entrepreneur_id}`}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </a>
          </div>
        </div>
      )}
    </div>
  );
}