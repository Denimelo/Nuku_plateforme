import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireExpert } from "~/utils/auth.server";
import { getExpertNavigation } from "~/utils/expert-navigation";
import { getUserSession } from "~/utils/session.server";
import { modulesServerAPI, expertsServerAPI } from "~/utils/api.server";
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  Target,
  BookOpen,
  Download,
  MessageCircle
} from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireExpert(request);
  const session = await getUserSession(request);
  const { moduleId } = params;
  
  if (!session || !moduleId) {
    throw new Error("Session ou module ID introuvable");
  }

  try {
    // Récupérer les détails du module et ses statistiques
    const [moduleDetails, moduleStats] = await Promise.all([
      modulesServerAPI.getModule(session.token, moduleId),
      expertsServerAPI.getModuleStats(session.token, moduleId).catch(() => ({
        total_views: 0,
        unique_viewers: 0,
        completion_rate: 0,
        average_time_spent: 0,
        total_completions: 0,
        average_rating: 0,
        total_ratings: 0,
        content_engagement: [],
        weekly_activity: [],
        participant_progress: [],
        feedback_summary: {
          positive: 0,
          negative: 0,
          neutral: 0
        }
      }))
    ]);

    // Vérifier que l'expert est bien le créateur du module
    // if (moduleDetails.created_by !== user.user_id) {
    //   throw new Response("Non autorisé", { status: 403 });
    // }

    return json({ 
      user, 
      module: moduleDetails,
      stats: moduleStats
    });
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
    throw new Response("Module non trouvé", { status: 404 });
  }
}

export default function ExpertModuleStats() {
  const { user, module, stats } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const params = useParams();

  const navigation = getExpertNavigation(`/expert/modulestats/${params.moduleId}`);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getEngagementColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    if (percentage >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getCompletionBadge = (rate: number) => {
    if (rate >= 80) return { color: "bg-green-500", label: "Excellent" };
    if (rate >= 60) return { color: "bg-blue-500", label: "Bon" };
    if (rate >= 40) return { color: "bg-yellow-500", label: "Moyen" };
    return { color: "bg-red-500", label: "Faible" };
  };

  const completionBadge = getCompletionBadge(stats.completion_rate);

  return (
    <Layout user={user} title={`Statistiques: ${module.title}`} navigation={navigation}>
      {/* En-tête avec navigation */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate(`/expert/module/${module.module_id}`)}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au module
          </button>
          <span className="text-gray-300">•</span>
          <button
            onClick={() => navigate("/expert/modules")}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Mes modules
          </button>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Statistiques du module</h1>
                <p className="text-xl text-slate-200 mb-2">{module.title}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                    {module.total_content_count || 0} contenu(s)
                  </span>
                  <span className={`px-3 py-1 rounded-full ${
                    module.status === 'published' 
                      ? 'bg-green-500/20 text-green-100' 
                      : 'bg-yellow-500/20 text-yellow-100'
                  }`}>
                    {module.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                  <span className={`px-3 py-1 rounded-full ${completionBadge.color}/20 text-white`}>
                    Taux de completion: {stats.completion_rate}% ({completionBadge.label})
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.total_views}</div>
                <div className="text-slate-200">vues totales</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Vues uniques"
          value={stats.unique_viewers}
          icon={Eye}
          color="blue"
          subtitle="utilisateurs différents"
        />
        <StatCard
          title="Taux de completion"
          value={`${stats.completion_rate}%`}
          icon={CheckCircle}
          color={stats.completion_rate >= 70 ? "green" : stats.completion_rate >= 50 ? "yellow" : "red"}
          subtitle={`${stats.total_completions} complétions`}
        />
        <StatCard
          title="Temps moyen"
          value={formatDuration(stats.average_time_spent)}
          icon={Clock}
          color="purple"
          subtitle="par participant"
        />
        <StatCard
          title="Note moyenne"
          value={stats.average_rating ? `${stats.average_rating.toFixed(1)}/5` : "N/A"}
          icon={Star}
          color="orange"
          subtitle={`${stats.total_ratings} évaluations`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement par contenu */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Engagement par contenu
          </h3>
          
          {stats.content_engagement && stats.content_engagement.length > 0 ? (
            <div className="space-y-4">
              {stats.content_engagement.map((content: any, index: number) => (
                <div key={content.content_id || index} className="border-l-4 border-teal-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {content.title || `Contenu ${index + 1}`}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(content.engagement_rate || 0)}`}>
                      {content.engagement_rate || 0}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(content.engagement_rate || 0, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{content.total_views || 0} vues</span>
                    <span>{content.average_time_spent ? formatDuration(content.average_time_spent) : '0min'} en moyenne</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucune donnée d'engagement disponible</p>
            </div>
          )}
        </div>

        {/* Activité hebdomadaire */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Activité des 7 derniers jours
          </h3>
          
          {stats.weekly_activity && stats.weekly_activity.length > 0 ? (
            <div className="space-y-3">
              {stats.weekly_activity.map((day: any, index: number) => (
                <div key={day.date || index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {day.date ? new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : `Jour ${index + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-blue-600 font-medium">{day.views || 0} vues</span>
                    <span className="text-green-600 font-medium">{day.completions || 0} complétions</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucune activité récente</p>
            </div>
          )}
        </div>

        {/* Progression des participants */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Progression des participants
          </h3>
          
          {stats.participant_progress && stats.participant_progress.length > 0 ? (
            <div className="space-y-4">
              {stats.participant_progress.slice(0, 5).map((participant: any, index: number) => (
                <div key={participant.user_id || index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-700">
                        {participant.user_name ? participant.user_name.charAt(0) : '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {participant.user_name || 'Utilisateur anonyme'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {participant.last_activity ? 
                          `Dernière activité: ${new Date(participant.last_activity).toLocaleDateString('fr-FR')}` :
                          'Aucune activité'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-700">
                      {participant.completion_percentage || 0}%
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(participant.completion_percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {stats.participant_progress.length > 5 && (
                <div className="text-center pt-4">
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Voir tous les participants ({stats.participant_progress.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun participant inscrit</p>
            </div>
          )}
        </div>

        {/* Résumé des retours */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-yellow-600" />
            Retours des participants
          </h3>
          
          {stats.feedback_summary ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.feedback_summary.positive || 0}
                  </div>
                  <div className="text-xs text-green-700">Positifs</div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-600">
                    {stats.feedback_summary.neutral || 0}
                  </div>
                  <div className="text-xs text-gray-700">Neutres</div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.feedback_summary.negative || 0}
                  </div>
                  <div className="text-xs text-red-700">Négatifs</div>
                </div>
              </div>
              
              {stats.average_rating > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-bold text-yellow-700">
                      {stats.average_rating.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="text-center text-sm text-yellow-600 mt-1">
                    Note moyenne sur {stats.total_ratings} évaluations
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun retour disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions recommandées */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Recommandations d'amélioration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.completion_rate < 50 && (
            <RecommendationCard
              icon={TrendingUp}
              title="Améliorer le taux de completion"
              description="Votre taux de completion est faible. Considérez simplifier le contenu ou ajouter plus d'interactions."
              color="red"
            />
          )}
          
          {stats.average_time_spent < (module.estimated_duration_minutes || 60) * 0.5 && (
            <RecommendationCard
              icon={Clock}
              title="Augmenter l'engagement"
              description="Les participants passent moins de temps que prévu. Ajoutez du contenu interactif."
              color="yellow"
            />
          )}
          
          {stats.average_rating < 4 && stats.total_ratings > 0 && (
            <RecommendationCard
              icon={Star}
              title="Améliorer la satisfaction"
              description="La note moyenne peut être améliorée. Consultez les retours détaillés."
              color="orange"
            />
          )}
          
          {(!stats.content_engagement || stats.content_engagement.length === 0) && (
            <RecommendationCard
              icon={BookOpen}
              title="Ajouter du contenu"
              description="Votre module manque de contenu. Ajoutez des vidéos, documents ou exercices."
              color="blue"
            />
          )}
          
          {stats.total_views > 100 && stats.completion_rate > 80 && (
            <RecommendationCard
              icon={CheckCircle}
              title="Module performant !"
              description="Excellent travail ! Votre module est très apprécié par les participants."
              color="green"
            />
          )}
          
          {stats.total_views < 10 && module.status === 'published' && (
            <RecommendationCard
              icon={Eye}
              title="Promouvoir le module"
              description="Votre module a peu de vues. Partagez-le davantage ou améliorez son titre."
              color="purple"
            />
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-6 flex items-center justify-center space-x-4">
        <button
          onClick={() => navigate(`/expert/module/${module.module_id}`)}
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-teal-700 bg-teal-100 rounded-2xl hover:bg-teal-200 transition-all"
        >
          <Eye className="h-4 w-4 mr-2" />
          Voir le module
        </button>
        
        <button
          onClick={() => navigate(`/expert/moduleedit/${module.module_id}`)}
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-blue-700 bg-blue-100 rounded-2xl hover:bg-blue-200 transition-all"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Modifier le module
        </button>
        
        <button
          onClick={() => navigate(`/expert/modulecontent/${module.module_id}`)}
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-purple-700 bg-purple-100 rounded-2xl hover:bg-purple-200 transition-all"
        >
          <Download className="h-4 w-4 mr-2" />
          Gérer les contenus
        </button>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500", 
    red: "bg-red-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-2xl font-bold text-gray-900">{value}</dd>
            {subtitle && (
              <dd className="text-xs text-gray-400 mt-1">{subtitle}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ icon: Icon, title, description, color }: any) {
  const colorClasses = {
    red: "border-red-200 bg-red-50 text-red-700",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
  };

  return (
    <div className={`p-4 rounded-2xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-sm mb-1">{title}</h4>
          <p className="text-xs opacity-80">{description}</p>
        </div>
      </div>
    </div>
  );
}