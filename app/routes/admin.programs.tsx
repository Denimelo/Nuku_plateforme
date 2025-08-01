import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { 
  Search, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  Plus,
  Users,
  BookOpen,
  Activity,
  TrendingUp,
  Clock,
  Target,
  Filter,
  MoreVertical,
  Settings,
  BarChart3
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const filter = url.searchParams.get("filter") || "all";

  try {
    // Récupérer tous les programmes
    const programsData = await fetch(`${API_BASE_URL}/programs/?active_only=false`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => {
      if (!res.ok) throw new Error("Erreur lors du chargement des programmes");
      return res.json();
    });

    // Filtrer selon les paramètres
    let filteredPrograms = programsData;
    
    if (filter !== "all") {
      filteredPrograms = programsData.filter((program: any) => {
        switch (filter) {
          case "active":
            return program.is_active;
          case "inactive":
            return !program.is_active;
          case "upcoming":
            return new Date(program.start_date) > new Date();
          case "ongoing":
            return new Date(program.start_date) <= new Date() && new Date(program.end_date) >= new Date();
          case "completed":
            return new Date(program.end_date) < new Date();
          default:
            return true;
        }
      });
    }

    if (search) {
      filteredPrograms = filteredPrograms.filter((program: any) =>
        program.name?.toLowerCase().includes(search.toLowerCase()) ||
        program.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculer les statistiques
    const stats = {
      total: programsData.length,
      active: programsData.filter((p: any) => p.is_active).length,
      upcoming: programsData.filter((p: any) => new Date(p.start_date) > new Date()).length,
      ongoing: programsData.filter((p: any) => 
        new Date(p.start_date) <= new Date() && new Date(p.end_date) >= new Date()
      ).length,
      completed: programsData.filter((p: any) => new Date(p.end_date) < new Date()).length,
    };

    return json({ 
      user, 
      programs: filteredPrograms,
      search,
      filter,
      stats
    });
  } catch (error) {
    console.error("Erreur lors du chargement des programmes:", error);
    return json({ 
      user, 
      programs: [], 
      search,
      filter,
      stats: { total: 0, active: 0, upcoming: 0, ongoing: 0, completed: 0 }
    });
  }
}

export default function AdminPrograms() {
  const { user, programs, search, filter, stats } = useLoaderData<typeof loader>();
  const location = useLocation();

  const navigation = getAdminNavigation(location.pathname);

  const getProgramStatusBadge = (program: any) => {
    const now = new Date();
    const startDate = new Date(program.start_date);
    const endDate = new Date(program.end_date);

    if (!program.is_active) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactif
      </span>;
    }

    if (startDate > now) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        <Clock className="h-3 w-3 mr-1" />
        À venir
      </span>;
    }

    if (startDate <= now && endDate >= now) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        En cours
      </span>;
    }

    return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
      <Target className="h-3 w-3 mr-1" />
      Terminé
    </span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} jours`;
    } else if (diffDays < 365) {
      const months = Math.round(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.round(diffDays / 365);
      return `${years} an${years > 1 ? 's' : ''}`;
    }
  };

  return (
    <Layout user={user} title="Gestion des programmes" navigation={navigation}>
      {/* En-tête avec gradient */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">Gestion des programmes</h1>
            <p className="text-xl text-slate-200 mb-6">
              Créez et gérez vos programmes d'accélération
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <StatBadge label="Total" value={stats.total} color="white" />
              <StatBadge label="Actifs" value={stats.active} color="green" />
              <StatBadge label="À venir" value={stats.upcoming} color="blue" />
              <StatBadge label="En cours" value={stats.ongoing} color="yellow" />
              <StatBadge label="Terminés" value={stats.completed} color="orange" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et actions */}
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
                  placeholder="Rechercher par nom, description..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl leading-5 bg-white/70 backdrop-blur placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <input type="hidden" name="filter" value={filter} />
              </form>
            </div>

            {/* Filtres et actions */}
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
                className="block pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-2xl bg-white/70 backdrop-blur"
              >
                <option value="all">Tous les programmes</option>
                <option value="active">Programmes actifs</option>
                <option value="upcoming">À venir</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Terminés</option>
                <option value="inactive">Inactifs</option>
              </select>

              <a
                href="/admin/program/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-lg transition-all text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau programme
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des programmes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program: any) => (
          <div key={program.program_id} className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="p-6">
              {/* Header avec statut */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {program.name}
                  </h3>
                  {getProgramStatusBadge(program)}
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-1">
                  <a
                    href={`/admin/program/${program.program_id}`}
                    className="text-purple-600 hover:text-purple-900 p-2 rounded-full hover:bg-purple-50 transition-all"
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <ProgramActionsDropdown program={program} />
                </div>
              </div>

              {/* Description */}
              {program.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 bg-gray-50 p-3 rounded-2xl">
                  {program.description}
                </p>
              )}

              {/* Informations principales */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Durée:
                  </span>
                  <span className="font-bold text-blue-700">
                    {getDuration(program.start_date, program.end_date)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <span className="text-gray-600 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Participants:
                  </span>
                  <span className="font-bold text-green-700">
                    {program.participants_count || 0}
                    {program.max_participants && ` / ${program.max_participants}`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Dates:
                  </span>
                  <span className="font-medium text-orange-700">
                    {formatDate(program.start_date)} - {formatDate(program.end_date)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                  <span className="text-gray-600 flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Créé le:
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(program.created_at)}
                  </span>
                </div>
              </div>

              {/* Barre de progression (si applicable) */}
              {program.participants_count > 0 && program.max_participants && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Occupation</span>
                    <span>{Math.round((program.participants_count / program.max_participants) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(program.participants_count / program.max_participants) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun programme */}
      {programs.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun programme trouvé</h3>
            <p className="text-gray-500 mb-6">
              {search ? "Essayez de modifier vos critères de recherche." : "Commencez par créer votre premier programme d'accélération."}
            </p>
            {!search && (
              <a
                href="/admin/program/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier programme
              </a>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorClasses = {
    white: "bg-white/20 text-white",
    green: "bg-green-500/20 text-green-100",
    blue: "bg-blue-500/20 text-blue-100",
    yellow: "bg-yellow-500/20 text-yellow-100",
    orange: "bg-orange-500/20 text-orange-100",
  };
  
  return (
    <div className={`px-4 py-3 rounded-2xl backdrop-blur ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

function ProgramActionsDropdown({ program }: any) {
  const [isOpen, setIsOpen] = useState(false);

  // Vérifier si le programme peut être modifié
  const now = new Date();
  const startDate = new Date(program.start_date);
  const canEdit = startDate > now;

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
            <a
              href={`/admin/program/${program.program_id}`}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </a>
            
            {canEdit ? (
              <a
                href={`/admin/programedit/${program.program_id}/edit`}
                className="flex items-center px-3 py-2 text-sm text-orange-700 hover:bg-orange-50 rounded-xl"
              >
                <Settings className="h-4 w-4 mr-2" />
                Modifier
              </a>
            ) : (
              <div className="flex items-center px-3 py-2 text-sm text-gray-400 cursor-not-allowed rounded-xl">
                <Settings className="h-4 w-4 mr-2" />
                Modifier (non disponible)
              </div>
            )}
            
            <button
              onClick={() => {
                // TODO: Implémenter les statistiques
                setIsOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-xl"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistiques
            </button>
          </div>
        </div>
      )}
    </div>
  );
}