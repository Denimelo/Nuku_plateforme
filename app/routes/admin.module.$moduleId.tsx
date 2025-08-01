import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { 
  ArrowLeft,
  BookOpen,
  Users,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Video,
  Headphones,
  Image,
  Play,
  Settings,
  MessageSquare,
  BarChart3,
  Activity,
  TrendingUp,
  Edit3,
  Plus,
  Eye,
  Layers,
  Star,
  Download,
  Share2
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const moduleId = params.moduleId;
  if (!moduleId) {
    throw new Error("ID module manquant");
  }

  try {
    // Récupérer les détails du module
    const [moduleData, contentsData] = await Promise.all([
      fetch(`${API_BASE_URL}/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => {
        if (!res.ok) throw new Error("Module non trouvé");
        return res.json();
      }),
      
      fetch(`${API_BASE_URL}/modules/${moduleId}/contents`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => {
        if (!res.ok) return [];
        return res.json();
      }).catch(() => [])
    ]);

    // Statistiques factices (à remplacer par de vraies données)
    const moduleStats = {
      totalViews: 156,
      completionRate: 78.5,
      averageRating: 4.3,
      totalStudents: 89,
      activeStudents: 34,
      completedStudents: 67,
      totalDuration: contentsData.reduce((sum: number, content: any) => 
        sum + (content.duration_seconds ? Math.round(content.duration_seconds / 60) : 0), 0),
    };

    return json({ 
      user, 
      module: moduleData,
      contents: contentsData,
      stats: moduleStats,
      moduleId
    });
  } catch (error) {
    console.error("Erreur lors du chargement du module:", error);
    throw new Error("Module introuvable");
  }
}

export default function AdminModuleDetails() {
  const { user, module, contents, stats } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = getAdminNavigation(location.pathname);

  // Vérifier si il y a un message de succès dans l'URL
  const urlParams = new URLSearchParams(location.search);
  const successMessage = urlParams.get('success');

  const getModuleTypeIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-8 w-8 text-white" />;
      case "workshop":
        return <Users className="h-8 w-8 text-white" />;
      case "assessment":
        return <Target className="h-8 w-8 text-white" />;
      default:
        return <FileText className="h-8 w-8 text-white" />;
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
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4 mr-1" />
          Publié
        </span>;
      case "draft":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-4 w-4 mr-1" />
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5 text-red-500" />;
      case "audio":
        return <Headphones className="h-5 w-5 text-purple-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "text":
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
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
    <Layout user={user} title={`Module: ${module.title}`} navigation={navigation}>
      {/* En-tête avec navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/modules")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la liste des modules
        </button>
      </div>

      {/* Messages de succès */}
      {successMessage === 'module_updated' && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">Module modifié avec succès !</p>
            </div>
          </div>
        </div>
      )}

      {successMessage === 'content_added' && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">Contenu ajouté avec succès !</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Informations principales */}
        <div className="xl:col-span-2">
          {/* En-tête du module */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-700 px-8 py-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                    {getModuleTypeIcon(module.module_type)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {module.title}
                    </h1>
                    <div className="flex items-center space-x-3 mb-3">
                      {getModuleTypeBadge(module.module_type)}
                      {getStatusBadge(module.status)}
                      {module.difficulty_level && getDifficultyBadge(module.difficulty_level)}
                    </div>
                    <div className="flex items-center space-x-6 text-white/80 text-sm">
                      {module.estimated_duration_minutes && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(module.estimated_duration_minutes)}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 mr-1" />
                        {contents.length} contenus
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {stats.totalStudents} étudiants
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                    <Download className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {module.description && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Description
                </h3>
                <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                  <p className="text-gray-700 leading-relaxed">{module.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Statistiques de performance */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              Performance & Statistiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                icon={Eye}
                label="Vues totales"
                value={stats.totalViews}
                color="blue"
                subtitle="consultations"
              />
              <StatCard
                icon={Users}
                label="Étudiants actifs"
                value={stats.activeStudents}
                color="green"
                subtitle="en cours"
              />
              <StatCard
                icon={Target}
                label="Taux de complétion"
                value={`${stats.completionRate}%`}
                color="purple"
                subtitle="de réussite"
              />
              <StatCard
                icon={Star}
                label="Note moyenne"
                value={stats.averageRating.toFixed(1)}
                color="yellow"
                subtitle="/ 5.0"
              />
              <StatCard
                icon={CheckCircle}
                label="Diplômés"
                value={stats.completedStudents}
                color="orange"
                subtitle="ont terminé"
              />
              <StatCard
                icon={Clock}
                label="Durée totale"
                value={`${stats.totalDuration} min`}
                color="teal"
                subtitle="de contenu"
              />
            </div>
          </div>

          {/* Liste des contenus */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Layers className="h-6 w-6 mr-2" />
                Contenus du module ({contents.length})
              </h3>
              <a
                href={`/admin/modulecontent/${module.module_id}/contents/create`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-2xl text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter du contenu
              </a>
            </div>
            
            <div className="p-8">
              {contents.length > 0 ? (
                <div className="space-y-4">
                  {contents.map((content: any, index: number) => (
                    <div key={content.content_id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl hover:shadow-md transition-all border border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 text-teal-600 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-3">
                          {getContentTypeIcon(content.content_type)}
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{content.title}</h4>
                            {content.description && (
                              <p className="text-sm text-gray-500 mt-1">{content.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {content.duration_seconds && (
                          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                            {Math.round(content.duration_seconds / 60)} min
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          content.content_type === 'video' ? 'bg-red-100 text-red-800' :
                          content.content_type === 'audio' ? 'bg-purple-100 text-purple-800' :
                          content.content_type === 'document' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {content.content_type}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <Edit3 className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mb-6">
                    <Layers className="mx-auto h-20 w-20 text-gray-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Aucun contenu</h4>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Ce module n'a pas encore de contenu pédagogique. Commencez par ajouter votre premier élément.
                  </p>
                  <a
                    href={`/admin/modulecontent/${module.module_id}/contents/create`}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter le premier contenu
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar avec actions et informations */}
        <div className="space-y-6">
          {/* Actions de gestion */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Actions de gestion
            </h3>
            <div className="space-y-3">
              <a
                href={`/admin/moduleedit/${module.module_id}/edit`}
                className="w-full flex items-center justify-center px-4 py-3 border border-teal-300 text-sm font-medium rounded-2xl text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier le module
              </a>

              <a
                href={`/admin/modulecontent/${module.module_id}/contents/create`}
                className="w-full flex items-center justify-center px-4 py-3 border border-blue-300 text-sm font-medium rounded-2xl text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter du contenu
              </a>

              <button className="w-full flex items-center justify-center px-4 py-3 border border-purple-300 text-sm font-medium rounded-2xl text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
                <MessageSquare className="h-4 w-4 mr-2" />
                Commentaires
              </button>

              <button className="w-full flex items-center justify-center px-4 py-3 border border-green-300 text-sm font-medium rounded-2xl text-green-700 bg-green-50 hover:bg-green-100 transition-all">
                <BarChart3 className="h-4 w-4 mr-2" />
                Rapport détaillé
              </button>
            </div>
          </div>

          {/* Informations du module */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Informations
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <span className="text-sm text-gray-600">Créé par</span>
                <span className="text-sm font-medium text-gray-900">{module.creator_name || "Expert"}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{module.module_type}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                <span className="text-sm text-gray-600">Difficulté</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{module.difficulty_level || "Non définie"}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <span className="text-sm text-gray-600">Statut</span>
                <span className="text-sm font-medium text-gray-900">
                  {module.status === "published" ? "Publié" : "Brouillon"}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                <span className="text-sm text-gray-600">Créé le</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(module.created_at || Date.now()).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* Métriques rapides */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Métriques clés
            </h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-green-700">{stats.completionRate}%</div>
                <div className="text-sm text-green-600">Taux de complétion</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">{stats.totalViews}</div>
                <div className="text-sm text-blue-600">Vues totales</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">{stats.averageRating.toFixed(1)}/5</div>
                <div className="text-sm text-purple-600">Note moyenne</div>
              </div>
            </div>
          </div>

          {/* Programme associé */}
          {module.program_name && (
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Programme associé
              </h3>
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-2">{module.program_name}</h4>
                <p className="text-sm text-gray-600 mb-3">Ce module fait partie de ce programme d'accélération</p>
                <a
                  href={`/admin/programs/${module.program_id}`}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Voir le programme
                  <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    yellow: "from-yellow-500 to-yellow-600",
    orange: "from-orange-500 to-orange-600",
    teal: "from-teal-500 to-teal-600",
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}