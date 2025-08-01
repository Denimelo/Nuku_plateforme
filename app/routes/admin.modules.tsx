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
  CheckCircle, 
  XCircle,
  Eye,
  Plus,
  BookOpen,
  Activity,
  TrendingUp,
  Clock,
  Filter,
  MoreVertical,
  Settings,
  FileText,
  Video,
  Headphones,
  Image,
  Play,
  Users,
  Target,
  Edit3,
  Trash2
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
  const programFilter = url.searchParams.get("program") || "all";

  try {
    // Récupérer tous les modules via l'API
    const modulesData = await fetch(`${API_BASE_URL}/modules/`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => {
      if (!res.ok) throw new Error("Erreur lors du chargement des modules");
      return res.json();
    }).catch(() => []);

    // Récupérer tous les programmes pour le filtre
    const programsData = await fetch(`${API_BASE_URL}/programs/?active_only=false`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => {
      if (!res.ok) return [];
      return res.json();
    }).catch(() => []);

    // Filtrer selon les paramètres
    let filteredModules = modulesData;
    
    if (filter !== "all") {
      filteredModules = modulesData.filter((module: any) => {
        switch (filter) {
          case "published":
            return module.status === "published";
          case "draft":
            return module.status === "draft";
          case "lesson":
            return module.module_type === "lesson";
          case "workshop":
            return module.module_type === "workshop";
          case "assessment":
            return module.module_type === "assessment";
          default:
            return true;
        }
      });
    }

    if (programFilter !== "all") {
      filteredModules = filteredModules.filter((module: any) =>
        module.program_id === programFilter
      );
    }

    if (search) {
      filteredModules = filteredModules.filter((module: any) =>
        module.title?.toLowerCase().includes(search.toLowerCase()) ||
        module.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculer les statistiques
    const stats = {
      total: modulesData.length,
      published: modulesData.filter((m: any) => m.status === "published").length,
      draft: modulesData.filter((m: any) => m.status === "draft").length,
      lessons: modulesData.filter((m: any) => m.module_type === "lesson").length,
      workshops: modulesData.filter((m: any) => m.module_type === "workshop").length,
      assessments: modulesData.filter((m: any) => m.module_type === "assessment").length,
    };

    return json({ 
      user, 
      modules: filteredModules,
      programs: programsData,
      search,
      filter,
      programFilter,
      stats
    });
  } catch (error) {
    console.error("Erreur lors du chargement des modules:", error);
    return json({ 
      user, 
      modules: [], 
      programs: [],
      search,
      filter,
      programFilter,
      stats: { total: 0, published: 0, draft: 0, lessons: 0, workshops: 0, assessments: 0 }
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

  try {
    switch (action) {
      case "delete_module":
        const moduleId = formData.get("moduleId") as string;
        // TODO: Implémenter la suppression de module
        await fetch(`${API_BASE_URL}/modules/${moduleId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.token}` }
        });
        return json({ success: "Module supprimé avec succès" });

      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error: any) {
    return json({ error: error.message || "Erreur lors de l'action" }, { status: 400 });
  }
}

export default function AdminModules() {
  const { user, modules, programs, search, filter, programFilter, stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const navigation = getAdminNavigation(location.pathname);

  const getModuleTypeIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-4 w-4" />;
      case "workshop":
        return <Users className="h-4 w-4" />;
      case "assessment":
        return <Target className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getModuleTypeBadge = (type: string) => {
    const typeConfig = {
      lesson: { label: "Cours", color: "bg-blue-100 text-blue-800" },
      workshop: { label: "Atelier", color: "bg-green-100 text-green-800" },
      assessment: { label: "Évaluation", color: "bg-purple-100 text-purple-800" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, color: "bg-gray-100 text-gray-800" };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {getModuleTypeIcon(type)}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Publié
        </span>;
      case "draft":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Brouillon
        </span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {status || "Inconnu"}
        </span>;
    }
  };

  const getDifficultyBadge = (level: string) => {
    const levelConfig = {
      beginner: { label: "Débutant", color: "bg-green-100 text-green-800" },
      intermediate: { label: "Intermédiaire", color: "bg-yellow-100 text-yellow-800" },
      advanced: { label: "Avancé", color: "bg-red-100 text-red-800" },
    };

    const config = levelConfig[level as keyof typeof levelConfig] || { label: level, color: "bg-gray-100 text-gray-800" };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
  };

  return (
    <Layout user={user} title="Gestion des modules" navigation={navigation}>
      {/* En-tête avec gradient */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">Gestion des modules</h1>
            <p className="text-xl text-slate-200 mb-6">
              Créez et gérez vos contenus pédagogiques
            </p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
              <StatBadge label="Total" value={stats.total} color="white" />
              <StatBadge label="Publiés" value={stats.published} color="green" />
              <StatBadge label="Brouillons" value={stats.draft} color="yellow" />
              <StatBadge label="Cours" value={stats.lessons} color="blue" />
              <StatBadge label="Ateliers" value={stats.workshops} color="purple" />
              <StatBadge label="Tests" value={stats.assessments} color="orange" />
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
                  placeholder="Rechercher par titre, description..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl leading-5 bg-white/70 backdrop-blur placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <input type="hidden" name="filter" value={filter} />
                <input type="hidden" name="program" value={programFilter} />
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
                  if (programFilter !== "all") url.searchParams.set("program", programFilter);
                  window.location.href = url.toString();
                }}
                className="block pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent rounded-2xl bg-white/70 backdrop-blur"
              >
                <option value="all">Tous les modules</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons</option>
                <option value="lesson">Cours</option>
                <option value="workshop">Ateliers</option>
                <option value="assessment">Évaluations</option>
              </select>

              <select
                name="program"
                value={programFilter}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("program", e.target.value);
                  if (search) url.searchParams.set("search", search);
                  if (filter !== "all") url.searchParams.set("filter", filter);
                  window.location.href = url.toString();
                }}
                className="block pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent rounded-2xl bg-white/70 backdrop-blur"
              >
                <option value="all">Tous les programmes</option>
                {programs.map((program: any) => (
                  <option key={program.program_id} value={program.program_id}>
                    {program.name}
                  </option>
                ))}
              </select>

              <a
                href="/admin/module/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-lg transition-all text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau module
              </a>
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

      {/* Grille des modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module: any) => (
          <div key={module.module_id} className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="p-6">
              {/* Header avec type et statut */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getModuleTypeBadge(module.module_type)}
                    {getStatusBadge(module.status)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {module.title}
                  </h3>
                  {module.difficulty_level && (
                    <div className="mb-2">
                      {getDifficultyBadge(module.difficulty_level)}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-1">
                  <a
                    href={`/admin/module/${module.module_id}`}
                    className="text-teal-600 hover:text-teal-900 p-2 rounded-full hover:bg-teal-50 transition-all"
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <ModuleActionsDropdown module={module} onDelete={setShowDeleteModal} />
                </div>
              </div>

              {/* Description */}
              {module.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 bg-gray-50 p-3 rounded-2xl">
                  {module.description}
                </p>
              )}

              {/* Informations détaillées */}
              <div className="space-y-3 text-sm">
                {module.estimated_duration_minutes && (
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Durée:
                    </span>
                    <span className="font-bold text-blue-700">
                      {formatDuration(module.estimated_duration_minutes)}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <span className="text-gray-600 flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Contenus:
                  </span>
                  <span className="font-bold text-green-700">
                    {module.total_content_count || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                  <span className="text-gray-600 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Créé par:
                  </span>
                  <span className="font-medium text-purple-700">
                    {module.creator_name || "Expert"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                  <span className="text-gray-600 flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Créé le:
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(module.created_at || Date.now()).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {/* Programme associé */}
              {module.program_name && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>Programme: </span>
                    <span className="font-medium text-gray-900 ml-1">{module.program_name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun module */}
      {modules.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun module trouvé</h3>
            <p className="text-gray-500 mb-6">
              {search ? "Essayez de modifier vos critères de recherche." : "Commencez par créer votre premier module pédagogique."}
            </p>
            {!search && (
              <a
                href="/admin/module/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier module
              </a>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-3xl bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                Confirmer la suppression
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible et supprimera également tout le contenu associé.
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
                  <input type="hidden" name="action" value="delete_module" />
                  <input type="hidden" name="moduleId" value={showDeleteModal} />
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

function StatBadge({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorClasses = {
    white: "bg-white/20 text-white",
    green: "bg-green-500/20 text-green-100",
    yellow: "bg-yellow-500/20 text-yellow-100",
    blue: "bg-blue-500/20 text-blue-100",
    purple: "bg-purple-500/20 text-purple-100",
    orange: "bg-orange-500/20 text-orange-100",
  };
  
  return (
    <div className={`px-4 py-3 rounded-2xl backdrop-blur ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

function ModuleActionsDropdown({ module, onDelete }: any) {
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
            <a
              href={`/admin/module/${module.module_id}`}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </a>
            
            <a
              href={`/admin/moduleedit/${module.module_id}/edit`}
              className="flex items-center px-3 py-2 text-sm text-teal-700 hover:bg-teal-50 rounded-xl"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Modifier
            </a>
            
            <button
              onClick={() => {
                onDelete(module.module_id);
                setIsOpen(false);
              }}
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