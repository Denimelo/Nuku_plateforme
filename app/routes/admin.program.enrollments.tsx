import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { 
  Search, 
  Filter,
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  AlertCircle,
  Eye,
  UserCheck,
  UserX,
  MessageSquare,
  Calendar,
  Building,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Award,
  Target
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search") || "";
  const statusFilter = url.searchParams.get("status") || "all";
  const programFilter = url.searchParams.get("program") || "all";

  try {
    // Récupérer tous les programmes et leurs participants
    const [programsData, allParticipantsData] = await Promise.all([
      fetch(`${API_BASE_URL}/programs/?active_only=false`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => res.ok ? res.json() : []),
      
      // Si vous avez un endpoint pour récupérer toutes les inscriptions
      fetch(`${API_BASE_URL}/admin/enrollments`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => res.ok ? res.json() : []).catch(() => [])
    ]);

    // Si pas d'endpoint global, récupérer les participants de chaque programme
    let allEnrollments = allParticipantsData;
    if (allEnrollments.length === 0) {
      const participantsPromises = programsData.map((program: any) =>
        fetch(`${API_BASE_URL}/programs/${program.program_id}/participants`, {
          headers: { Authorization: `Bearer ${session.token}` }
        }).then(res => res.ok ? res.json() : [])
          .then(participants => participants.map((p: any) => ({
            ...p,
            program_name: program.name,
            program_id: program.program_id
          })))
          .catch(() => [])
      );
      
      const allParticipants = await Promise.all(participantsPromises);
      allEnrollments = allParticipants.flat();
    }

    // Filtrer selon les critères
    let filteredEnrollments = allEnrollments;

    if (statusFilter !== "all") {
      filteredEnrollments = filteredEnrollments.filter((enrollment: any) => 
        enrollment.completion_status === statusFilter
      );
    }

    if (programFilter !== "all") {
      filteredEnrollments = filteredEnrollments.filter((enrollment: any) => 
        enrollment.program_id === programFilter
      );
    }

    if (searchTerm) {
      filteredEnrollments = filteredEnrollments.filter((enrollment: any) => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${enrollment.entrepreneur?.user?.first_name} ${enrollment.entrepreneur?.user?.last_name}`.toLowerCase();
        const companyName = enrollment.entrepreneur?.company_name?.toLowerCase() || "";
        const email = enrollment.entrepreneur?.user?.email?.toLowerCase() || "";
        
        return fullName.includes(searchLower) || 
               companyName.includes(searchLower) || 
               email.includes(searchLower);
      });
    }

    // Statistiques
    const stats = {
      total: allEnrollments.length,
      in_progress: allEnrollments.filter((e: any) => e.completion_status === 'in_progress').length,
      completed: allEnrollments.filter((e: any) => e.completion_status === 'completed').length,
      dropped: allEnrollments.filter((e: any) => e.completion_status === 'dropped').length,
      this_month: allEnrollments.filter((e: any) => {
        const enrollDate = new Date(e.enrollment_date);
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return enrollDate >= firstOfMonth;
      }).length
    };

    return json({ 
      user, 
      enrollments: filteredEnrollments,
      programs: programsData,
      stats,
      filters: {
        search: searchTerm,
        status: statusFilter,
        program: programFilter
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des inscriptions:", error);
    return json({ 
      user, 
      enrollments: [], 
      programs: [],
      stats: { total: 0, in_progress: 0, completed: 0, dropped: 0, this_month: 0 },
      filters: { search: searchTerm, status: statusFilter, program: programFilter }
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
  const programId = formData.get("programId") as string;
  const entrepreneurId = formData.get("entrepreneurId") as string;

  try {
    if (action === "approve") {
      // TODO: Implémenter l'approbation d'inscription
      return json({ success: "Inscription approuvée" });
    }
    
    if (action === "reject") {
      const reason = formData.get("reason") as string;
      // TODO: Implémenter le rejet d'inscription
      return json({ success: "Inscription rejetée" });
    }

    return json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export default function AdminProgramEnrollments() {
  const { user, enrollments, programs, stats, filters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const location = useLocation();

  const navigation = getAdminNavigation(location.pathname);

  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges = {
      in_progress: { 
        icon: Clock, 
        text: "En cours", 
        classes: "bg-blue-100 text-blue-800" 
      },
      completed: { 
        icon: CheckCircle, 
        text: "Terminé", 
        classes: "bg-green-100 text-green-800" 
      },
      dropped: { 
        icon: XCircle, 
        text: "Abandonné", 
        classes: "bg-red-100 text-red-800" 
      }
    };

    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.classes}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays}j`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)}m`;
    return `${Math.round(diffDays / 365)}a`;
  };

  return (
    <Layout user={user} title="Gestion des inscriptions" navigation={navigation}>
      {/* En-tête avec statistiques */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">Gestion des inscriptions</h1>
            <p className="text-xl text-slate-200 mb-6">
              Suivez et gérez toutes les inscriptions aux programmes
            </p>
            
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-white/80">Total inscriptions</div>
              </div>
              <div className="bg-blue-500/20 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.in_progress}</div>
                <div className="text-blue-100">En cours</div>
              </div>
              <div className="bg-green-500/20 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-green-100">Terminées</div>
              </div>
              <div className="bg-orange-500/20 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{stats.this_month}</div>
                <div className="text-orange-100">Ce mois</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 mb-6">
        <div className="p-6">
          <Form method="get" className="flex flex-col lg:flex-row lg:items-end space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Recherche */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="search"
                  defaultValue={filters.search}
                  type="text"
                  placeholder="Nom, entreprise, email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                name="status"
                defaultValue={filters.status}
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminés</option>
                <option value="dropped">Abandonnés</option>
              </select>
            </div>

            {/* Filtre par programme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programme
              </label>
              <select
                name="program"
                defaultValue={filters.program}
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les programmes</option>
                {programs.map((program: any) => (
                  <option key={program.program_id} value={program.program_id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </button>
          </Form>
        </div>
      </div>

      {/* Messages de retour */}
      {actionData?.success && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <p className="text-sm text-green-700">{actionData.success}</p>
          </div>
        </div>
      )}

      {actionData?.error && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-sm text-red-700">{actionData.error}</p>
          </div>
        </div>
      )}

      {/* Liste des inscriptions */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Inscriptions ({enrollments.length})
            </h3>
          </div>
        </div>

        <div className="p-8">
          {enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enrollment: any) => (
                <div key={`${enrollment.program_id}-${enrollment.participant_id}`} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl hover:shadow-md transition-all group">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {enrollment.entrepreneur?.user?.first_name?.[0]}{enrollment.entrepreneur?.user?.last_name?.[0]}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-bold text-gray-900 text-lg">
                          {enrollment.entrepreneur?.user?.first_name} {enrollment.entrepreneur?.user?.last_name}
                        </h4>
                        {getStatusBadge(enrollment.completion_status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {enrollment.entrepreneur?.company_name}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Inscrit le {formatDate(enrollment.enrollment_date)}
                        </div>
                        <div className="flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          {enrollment.program_name}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>📧 {enrollment.entrepreneur?.user?.email}</span>
                        <span>⏱️ Durée: {getDuration(enrollment.enrollment_date, enrollment.completion_date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEnrollment(enrollment);
                        setShowEnrollmentModal(true);
                      }}
                      className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-all"
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="mx-auto h-20 w-20 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune inscription trouvée</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {filters.search || filters.status !== "all" || filters.program !== "all" 
                  ? "Essayez de modifier vos filtres de recherche."
                  : "Les inscriptions aux programmes apparaîtront ici."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal détails de l'inscription */}
      {showEnrollmentModal && selectedEnrollment && (
        <EnrollmentDetailsModal
          enrollment={selectedEnrollment}
          onClose={() => {
            setShowEnrollmentModal(false);
            setSelectedEnrollment(null);
          }}
          token={user.token || ""}
        />
      )}
    </Layout>
  );
}

function EnrollmentDetailsModal({ enrollment, onClose, token }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Détails de l'inscription</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Informations entrepreneur */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Entrepreneur</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <label className="text-sm font-medium text-gray-500">Nom complet</label>
                <p className="text-lg font-semibold text-gray-900">
                  {enrollment.entrepreneur?.user?.first_name} {enrollment.entrepreneur?.user?.last_name}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg font-semibold text-gray-900">
                  {enrollment.entrepreneur?.user?.email}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <label className="text-sm font-medium text-gray-500">Entreprise</label>
                <p className="text-lg font-semibold text-gray-900">
                  {enrollment.entrepreneur?.company_name}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <label className="text-sm font-medium text-gray-500">Secteur</label>
                <p className="text-lg font-semibold text-gray-900">
                  {enrollment.entrepreneur?.industry_sector || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>

          {/* Informations inscription */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Inscription</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                <label className="text-sm font-medium text-gray-500">Programme</label>
                <p className="text-lg font-semibold text-gray-900">
                  {enrollment.program_name}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                <label className="text-sm font-medium text-gray-500">Date d'inscription</label>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(enrollment.enrollment_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                <label className="text-sm font-medium text-gray-500">Statut</label>
                <div className="mt-1">
                  {enrollment.completion_status === 'completed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Terminé
                    </span>
                  )}
                  {enrollment.completion_status === 'in_progress' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Clock className="h-4 w-4 mr-1" />
                      En cours
                    </span>
                  )}
                  {enrollment.completion_status === 'dropped' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <XCircle className="h-4 w-4 mr-1" />
                      Abandonné
                    </span>
                  )}
                </div>
              </div>
              {enrollment.completion_date && (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
                  <label className="text-sm font-medium text-gray-500">Date de completion</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(enrollment.completion_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
            <a
              href={`/admin/program/${enrollment.program_id}`}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl hover:from-indigo-700 hover:to-indigo-800 transition-all"
            >
              Voir le programme
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}