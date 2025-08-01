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
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Activity,
  TrendingUp,
  BarChart3,
  UserCheck,
  MessageSquare,
  Settings,
  FileText,
  Award,
  Zap
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const programId = params.programId;
  if (!programId) {
    throw new Error("ID programme manquant");
  }

  try {
    // Récupérer les détails du programme
    const [programData, participantsData, statsData] = await Promise.all([
      fetch(`${API_BASE_URL}/programs/${programId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => {
        if (!res.ok) throw new Error("Programme non trouvé");
        return res.json();
      }),
      
      fetch(`${API_BASE_URL}/programs/${programId}/participants`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => {
        if (!res.ok) return [];
        return res.json();
      }).catch(() => []),
      
      fetch(`${API_BASE_URL}/programs/${programId}/stats`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => {
        if (!res.ok) return null;
        return res.json();
      }).catch(() => null)
    ]);

    return json({ 
      user, 
      program: programData,
      participants: participantsData,
      stats: statsData,
      programId
    });
  } catch (error) {
    console.error("Erreur lors du chargement du programme:", error);
    throw new Error("Programme introuvable");
  }
}

export default function AdminProgramDetails() {
  const { user, program, participants, stats } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = getAdminNavigation(location.pathname);

  // Vérifier si il y a un message de succès dans l'URL
  const urlParams = new URLSearchParams(location.search);
  const successMessage = urlParams.get('success');

  const getProgramStatusBadge = (program: any) => {
    const now = new Date();
    const startDate = new Date(program.start_date);
    const endDate = new Date(program.end_date);

    if (!program.is_active) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-4 w-4 mr-1" />
        Inactif
      </span>;
    }

    if (startDate > now) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        <Clock className="h-4 w-4 mr-1" />
        À venir
      </span>;
    }

    if (startDate <= now && endDate >= now) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-4 w-4 mr-1" />
        En cours
      </span>;
    }

    return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
      <Target className="h-4 w-4 mr-1" />
      Terminé
    </span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
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

  const getProgress = () => {
    const now = new Date();
    const start = new Date(program.start_date);
    const end = new Date(program.end_date);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const current = now.getTime() - start.getTime();
    return Math.round((current / total) * 100);
  };

  const progress = getProgress();

  return (
    <Layout user={user} title={`Programme: ${program.name}`} navigation={navigation}>
      {/* En-tête avec navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/programs")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la liste des programmes
        </button>
      </div>

      {/* Message de succès si programme modifié */}
      {successMessage === 'program_updated' && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">Programme modifié avec succès !</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Informations principales */}
        <div className="xl:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
            {/* En-tête du programme */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {program.name}
                    </h1>
                    <div className="flex items-center space-x-4 mb-3">
                      {getProgramStatusBadge(program)}
                      <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-xl text-white text-sm font-medium">
                        {getDuration(program.start_date, program.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(program.start_date)} - {formatDate(program.end_date)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              {program.is_active && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                    <span>Progression du programme</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-white h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Contenu du programme */}
            <div className="p-8">
              <ProgramInfoDisplay program={program} participants={participants} />
            </div>
          </div>

          {/* Statistiques détaillées */}
          {stats && (
            <div className="mt-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2" />
                Statistiques & Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  label="Participants totaux"
                  value={stats.total_participants}
                  color="blue"
                  subtitle="inscrits"
                />
                <StatCard
                  icon={Activity}
                  label="Participants actifs"
                  value={stats.active_participants}
                  color="green"
                  subtitle="en cours"
                />
                <StatCard
                  icon={Award}
                  label="Participants diplômés"
                  value={stats.completed_participants}
                  color="purple"
                  subtitle="terminé"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Taux de réussite"
                  value={`${stats.completion_rate}%`}
                  color="orange"
                  subtitle="de réussite"
                />
              </div>

              {/* Graphique de répartition */}
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Répartition des participants</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-100 rounded-xl">
                    <div className="text-2xl font-bold text-green-700">{stats.active_participants}</div>
                    <div className="text-sm text-green-600">En cours</div>
                  </div>
                  <div className="p-4 bg-purple-100 rounded-xl">
                    <div className="text-2xl font-bold text-purple-700">{stats.completed_participants}</div>
                    <div className="text-sm text-purple-600">Terminés</div>
                  </div>
                  <div className="p-4 bg-red-100 rounded-xl">
                    <div className="text-2xl font-bold text-red-700">{stats.dropped_participants}</div>
                    <div className="text-sm text-red-600">Abandons</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Liste des participants */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
            <div className="px-8 py-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <UserCheck className="h-6 w-6 mr-2" />
                Participants ({participants.length})
              </h3>
            </div>
            <div className="p-8">
              {participants.length > 0 ? (
                <div className="space-y-4">
                  {participants.slice(0, 10).map((participant: any) => (
                    <div key={participant.participant_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl hover:shadow-md transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-white">
                            {participant.entrepreneur?.user?.first_name?.[0]}{participant.entrepreneur?.user?.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {participant.entrepreneur?.user?.first_name} {participant.entrepreneur?.user?.last_name}
                          </h4>
                          <p className="text-sm text-gray-500">{participant.entrepreneur?.company_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          participant.completion_status === 'completed' ? 'bg-green-100 text-green-800' :
                          participant.completion_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {participant.completion_status === 'completed' ? 'Terminé' :
                           participant.completion_status === 'in_progress' ? 'En cours' : 'Abandonné'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Inscrit le {new Date(participant.enrollment_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {participants.length > 10 && (
                    <div className="text-center pt-4">
                      <button className="text-purple-600 hover:text-purple-800 font-medium">
                        Voir tous les participants ({participants.length})
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun participant</h4>
                  <p className="text-gray-500">Ce programme n'a pas encore de participants inscrits.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar avec actions et informations */}
        <div className="space-y-6">
          {/* Informations clés */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Informations clés
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <span className="text-sm text-gray-600">Participants inscrits</span>
                <span className="text-sm font-medium text-gray-900">
                  {participants.length}
                  {program.max_participants && ` / ${program.max_participants}`}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-sm text-gray-600">Durée</span>
                <span className="text-sm font-medium text-gray-900">
                  {getDuration(program.start_date, program.end_date)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                <span className="text-sm text-gray-600">Statut</span>
                <span className="text-sm font-medium text-gray-900">
                  {program.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                <span className="text-sm text-gray-600">Créé le</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(program.created_at)}
                </span>
              </div>

              {progress > 0 && progress < 100 && (
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="text-sm font-medium text-gray-900">{progress}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions de gestion */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Actions
            </h3>
            <div className="space-y-3">
              {/* Bouton modifier - seulement si le programme n'a pas commencé */}
              {(() => {
                const now = new Date();
                const startDate = new Date(program.start_date);
                const canEdit = startDate > now;
                
                return canEdit ? (
                  <a
                    href={`/admin/programedit/${program.program_id}/edit`}
                    className="w-full flex items-center justify-center px-4 py-3 border border-orange-300 text-sm font-medium rounded-2xl text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Modifier le programme
                  </a>
                ) : (
                  <div className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-2xl text-gray-400 bg-gray-50 cursor-not-allowed">
                    <Settings className="h-4 w-4 mr-2" />
                    Modification non disponible
                  </div>
                );
              })()}

              <button className="w-full flex items-center justify-center px-4 py-3 border border-blue-300 text-sm font-medium rounded-2xl text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all">
                <MessageSquare className="h-4 w-4 mr-2" />
                Envoyer un message groupé
              </button>

              <button className="w-full flex items-center justify-center px-4 py-3 border border-green-300 text-sm font-medium rounded-2xl text-green-700 bg-green-50 hover:bg-green-100 transition-all">
                <FileText className="h-4 w-4 mr-2" />
                Générer un rapport
              </button>

              <button className="w-full flex items-center justify-center px-4 py-3 border border-purple-300 text-sm font-medium rounded-2xl text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
                <BarChart3 className="h-4 w-4 mr-2" />
                Voir les statistiques détaillées
              </button>
            </div>
          </div>

          {/* Métriques rapides */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Métriques rapides
            </h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-green-700">{participants.length}</div>
                <div className="text-sm text-green-600">Participants actifs</div>
              </div>
              
              {stats && (
                <>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-700">{stats.completion_rate}%</div>
                    <div className="text-sm text-purple-600">Taux de réussite</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">{stats.active_participants + stats.completed_participants}</div>
                    <div className="text-sm text-blue-600">Participants engagés</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ProgramInfoDisplay({ program, participants }: { program: any; participants: any[] }) {
  return (
    <div className="space-y-8">
      {/* Description */}
      {program.description && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Description
          </h3>
          <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
            <p className="text-gray-700 leading-relaxed">{program.description}</p>
          </div>
        </div>
      )}

      {/* Informations détaillées */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Informations détaillées
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
            <label className="text-sm font-medium text-gray-500">Date de début</label>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(program.start_date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
            <label className="text-sm font-medium text-gray-500">Date de fin</label>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(program.end_date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
            <label className="text-sm font-medium text-gray-500">Capacité</label>
            <p className="text-lg font-semibold text-gray-900">
              {program.max_participants ? `${program.max_participants} participants max` : "Illimitée"}
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
            <label className="text-sm font-medium text-gray-500">Participants inscrits</label>
            <p className="text-lg font-semibold text-gray-900">
              {participants.length} participant{participants.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all">
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