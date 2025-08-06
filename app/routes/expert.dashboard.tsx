import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireExpert } from "~/utils/auth.server";
import { getExpertNavigation } from "~/utils/expert-navigation";
import { 
  expertsServerAPI,
  modulesServerAPI,
  assignmentsServerAPI,
  callsServerAPI,
  notificationsServerAPI 
} from "~/utils/api.server";
import { getUserSession } from "~/utils/session.server";
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Users, 
  MessageCircle,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Plus,
  Eye,
  Edit3,
  BarChart3,
  Star,
  Activity,
  Award,
  Target,
  Zap
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireExpert(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  try {
    // Récupérer toutes les données en parallèle
    const [
      expertProfile,
      expertStats, 
      myModules,
      myPrograms,
      myEntrepreneurs,
      upcomingCalls,
      notifications,
      pendingAssignments
    ] = await Promise.all([
      expertsServerAPI.getProfile(session.token).catch(() => null),
      expertsServerAPI.getStats(session.token).catch(() => ({
        total_modules: 0,
        total_students: 0,
        total_hours: 0,
        average_rating: 0,
        total_ratings: 0,
        completion_rate: 0
      })),
      expertsServerAPI.getMyModules(session.token).catch(() => []),
      expertsServerAPI.getMyPrograms(session.token).catch(() => []),
      expertsServerAPI.getMyEntrepreneurs(session.token).catch(() => []),
      callsServerAPI.getUpcomingCalls(session.token).catch(() => []),
      notificationsServerAPI.getNotificationCounts(session.token).catch(() => ({ total: 0, unread: 0 })),
      assignmentsServerAPI.getAssignments(session.token).then(assignments => 
        assignments.filter((a: any) => a.status === 'pending_review')
      ).catch(() => [])
    ]);

    // Calculer des statistiques avancées
    const todaysCalls = upcomingCalls.filter((call: any) => {
      const today = new Date();
      const callDate = new Date(call.scheduled_start);
      return callDate.toDateString() === today.toDateString();
    });

    const thisWeekCalls = upcomingCalls.filter((call: any) => {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const callDate = new Date(call.scheduled_start);
      return callDate >= now && callDate <= weekFromNow;
    });

    const publishedModules = myModules.filter((m: any) => m.status === 'published');
    const draftModules = myModules.filter((m: any) => m.status === 'draft');

    const recentActivity = [
      ...myModules.slice(0, 3).map((m: any) => ({
        type: 'module',
        action: m.status === 'published' ? 'published' : 'created',
        title: m.title,
        date: m.updated_at || m.created_at,
        id: m.module_id
      })),
      ...upcomingCalls.slice(0, 3).map((c: any) => ({
        type: 'call',
        action: 'scheduled',
        title: c.title,
        date: c.scheduled_start,
        id: c.call_id
      })),
      ...pendingAssignments.slice(0, 3).map((a: any) => ({
        type: 'assignment',
        action: 'submitted',
        title: a.title,
        date: a.submitted_at,
        id: a.assignment_id
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return json({ 
      user,
      expertProfile,
      stats: expertStats,
      modules: myModules,
      programs: myPrograms,
      entrepreneurs: myEntrepreneurs,
      calls: upcomingCalls,
      todaysCalls,
      thisWeekCalls,
      notifications,
      pendingAssignments,
      publishedModules,
      draftModules,
      recentActivity
    });
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    return json({ 
      user, 
      expertProfile: null,
      stats: { total_modules: 0, total_students: 0, total_hours: 0, average_rating: 0, total_ratings: 0, completion_rate: 0 },
      modules: [], 
      programs: [],
      entrepreneurs: [],
      calls: [],
      todaysCalls: [],
      thisWeekCalls: [],
      notifications: { total: 0, unread: 0 },
      pendingAssignments: [],
      publishedModules: [],
      draftModules: [],
      recentActivity: []
    });
  }
}

export default function ExpertDashboard() {
  const { 
    user, 
    expertProfile,
    stats,
    modules, 
    programs,
    entrepreneurs,
    calls, 
    todaysCalls,
    thisWeekCalls,
    notifications,
    pendingAssignments,
    publishedModules,
    draftModules,
    recentActivity
  } = useLoaderData<typeof loader>();

  const location = useLocation();
  const navigation = getExpertNavigation(location.pathname);

  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'students' | 'calls'>('overview');

  return (
    <Layout user={user} title="Dashboard Expert" navigation={navigation}>
      {/* En-tête avec profil expert */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Bonjour, {user.first_name} !
                  </h1>
                  <p className="text-xl text-slate-200 mb-2">
                    {expertProfile?.specialization || 'Expert'} • {programs.length} programme(s)
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    {stats.average_rating > 0 && (
                      <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 mr-1" />
                        {stats.average_rating.toFixed(1)}/5 ({stats.total_ratings} avis)
                      </div>
                    )}
                    <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      {entrepreneurs.length} étudiant{entrepreneurs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{publishedModules.length}</div>
                    <div className="text-slate-200 text-sm">Modules publiés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{todaysCalls.length}</div>
                    <div className="text-slate-200 text-sm">Appels aujourd'hui</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Modules"
          value={stats.total_modules}
          subtitle={`${publishedModules.length} publiés`}
          icon={BookOpen}
          color="blue"
          trend={publishedModules.length > draftModules.length ? 'up' : 'stable'}
        />
        <StatCard
          title="Évaluations en attente"
          value={pendingAssignments.length}
          subtitle="À traiter"
          icon={FileText}
          color="orange"
          trend={pendingAssignments.length > 0 ? 'attention' : 'stable'}
        />
        <StatCard
          title="Appels cette semaine"
          value={thisWeekCalls.length}
          subtitle={`${todaysCalls.length} aujourd'hui`}
          icon={Calendar}
          color="green"
          trend="stable"
        />
        <StatCard
          title="Étudiants actifs"
          value={entrepreneurs.length}
          subtitle={stats.completion_rate > 0 ? `${Math.round(stats.completion_rate)}% de réussite` : 'En cours'}
          icon={Users}
          color="purple"
          trend={stats.completion_rate > 75 ? 'up' : 'stable'}
        />
      </div>

      {/* Onglets de navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'modules', name: 'Mes modules', icon: BookOpen },
              { id: 'students', name: 'Mes étudiants', icon: GraduationCap },
              { id: 'calls', name: 'Mes appels', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Actions rapides */}
            <QuickActionsCard />
            
            {/* Activité récente */}
            <RecentActivityCard activities={recentActivity} />
            
            {/* Notifications importantes */}
            <NotificationsCard notifications={notifications} pendingCount={pendingAssignments.length} />
            
            {/* Aperçu des performances */}
            <PerformanceOverview stats={stats} />
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ModulesOverviewCard modules={modules} publishedModules={publishedModules} draftModules={draftModules} />
            <ModulesListCard modules={modules.slice(0, 6)} />
          </div>
        )}

        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StudentsOverviewCard entrepreneurs={entrepreneurs} />
            <StudentsListCard entrepreneurs={entrepreneurs.slice(0, 6)} />
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CallsOverviewCard calls={calls} todaysCalls={todaysCalls} thisWeekCalls={thisWeekCalls} />
            <CallsListCard calls={calls.slice(0, 6)} />
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: any) {
  const colorClasses = {
    blue: { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600" },
    orange: { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600" },
    green: { bg: "bg-green-500", light: "bg-green-50", text: "text-green-600" },
    purple: { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-600" },
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-500" />,
    down: <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />,
    attention: <AlertCircle className="h-4 w-4 text-orange-500" />,
    stable: <Activity className="h-4 w-4 text-gray-400" />
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${colorClasses[color].bg}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
          </div>
          <div>
            {trendIcons[trend]}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionsCard() {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-4">
          <QuickActionItem
            title="Créer un module"
            description="Nouveau contenu"
            href="/expert/module/create"
            icon={Plus}
            color="blue"
          />
          <QuickActionItem
            title="Voir mes modules"
            description="Gérer le contenu"
            href="/expert/modules"
            icon={BookOpen}
            color="teal"
          />
          <QuickActionItem
            title="Planifier un appel"
            description="Nouveau RDV"
            href="/expert/calls/new"
            icon={Calendar}
            color="green"
          />
          <QuickActionItem
            title="Mes étudiants"
            description="Suivi des participants"
            href="/expert/students"
            icon={Users}
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionItem({ title, description, href, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100 hover:bg-blue-200",
    teal: "text-teal-600 bg-teal-100 hover:bg-teal-200",
    green: "text-green-600 bg-green-100 hover:bg-green-200",
    purple: "text-purple-600 bg-purple-100 hover:bg-purple-200",
  };

  return (
    <a href={href} className="group p-4 rounded-2xl border border-gray-200 hover:shadow-md transition-all">
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </a>
  );
}

function RecentActivityCard({ activities }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Activité récente</h3>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {activities.map((activity: any, index: number) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className={`p-2 rounded-full ${
                activity.type === 'module' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'call' ? 'bg-green-100 text-green-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                {activity.type === 'module' && <BookOpen className="h-4 w-4" />}
                {activity.type === 'call' && <Calendar className="h-4 w-4" />}
                {activity.type === 'assignment' && <FileText className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.action === 'published' ? 'Module publié' : 
                   activity.action === 'created' ? 'Module créé' :
                   activity.action === 'scheduled' ? 'Appel planifié' :
                   'Évaluation soumise'}
                </p>
                <p className="text-xs text-gray-500 truncate">{activity.title}</p>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(activity.date).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-gray-500 text-center py-6">Aucune activité récente</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationsCard({ notifications, pendingCount }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          {notifications.unread > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {notifications.unread} non lues
            </span>
          )}
        </div>
        <div className="space-y-3">
          {pendingCount > 0 && (
            <div className="flex items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  {pendingCount} évaluation{pendingCount > 1 ? 's' : ''} en attente
                </p>
                <p className="text-xs text-orange-700">
                  Des étudiants attendent vos corrections
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
            <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">Plateforme à jour</p>
              <p className="text-xs text-blue-700">Tous vos modules sont synchronisés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceOverview({ stats }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Performance</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Taux de réussite</span>
            <span className="text-lg font-bold text-green-600">
              {stats.completion_rate ? Math.round(stats.completion_rate) : 0}%
            </span>
          </div>
          
          {stats.average_rating > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-700">Note moyenne</span>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-lg font-bold text-yellow-600">
                  {stats.average_rating.toFixed(1)}/5
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Heures d'enseignement</span>
            <span className="text-lg font-bold text-purple-600">
              {stats.total_hours || 0}h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cartes spécifiques pour les onglets
function ModulesOverviewCard({ modules, publishedModules, draftModules }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Aperçu des modules</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{publishedModules.length}</div>
            <div className="text-sm text-green-700">Publiés</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-600">{draftModules.length}</div>
            <div className="text-sm text-gray-700">Brouillons</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulesListCard({ modules }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Derniers modules</h3>
          <a href="/expert/modules" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            Voir tout →
          </a>
        </div>
        <div className="space-y-3">
          {modules.map((module: any) => (
            <div key={module.module_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 text-sm truncate max-w-48">{module.title}</p>
                  <p className="text-xs text-gray-500">{module.total_content_count || 0} contenus</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                module.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {module.status === 'published' ? 'Publié' : 'Brouillon'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentsOverviewCard({ entrepreneurs }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Mes étudiants</h3>
        <div className="text-center p-6 bg-purple-50 rounded-xl">
          <div className="text-3xl font-bold text-purple-600">{entrepreneurs.length}</div>
          <div className="text-sm text-purple-700">Entrepreneurs accompagnés</div>
        </div>
      </div>
    </div>
  );
}

function StudentsListCard({ entrepreneurs }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Étudiants récents</h3>
          <a href="/expert/students" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            Voir tout →
          </a>
        </div>
        <div className="space-y-3">
          {entrepreneurs.map((entrepreneur: any) => (
            <div key={entrepreneur.entrepreneur_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">
                  {entrepreneur.user?.first_name} {entrepreneur.user?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {entrepreneur.company_name}
                </p>
              </div>
            </div>
          ))}
          {entrepreneurs.length === 0 && (
            <p className="text-gray-500 text-center py-4">Aucun étudiant assigné</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CallsOverviewCard({ calls, todaysCalls, thisWeekCalls }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Mes appels</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{todaysCalls.length}</div>
            <div className="text-sm text-green-700">Aujourd'hui</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{thisWeekCalls.length}</div>
            <div className="text-sm text-blue-700">Cette semaine</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-600">{calls.length}</div>
            <div className="text-sm text-gray-700">À venir</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CallsListCard({ calls }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Prochains appels</h3>
          <a href="/expert/calls" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            Voir tout →
          </a>
        </div>
        <div className="space-y-3">
          {calls.map((call: any) => (
            <div key={call.call_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900 text-sm truncate max-w-48">{call.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(call.scheduled_start).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(call.scheduled_start).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {call.participant_count && (
                  <span className="text-xs text-gray-500">
                    {call.participant_count} participants
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  call.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 
                  call.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {call.status === 'scheduled' ? 'Programmé' :
                   call.status === 'in_progress' ? 'En cours' :
                   call.status}
                </span>
              </div>
            </div>
          ))}
          {calls.length === 0 && (
            <p className="text-gray-500 text-center py-4">Aucun appel programmé</p>
          )}
        </div>
      </div>
    </div>
  );
}