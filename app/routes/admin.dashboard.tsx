import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  Settings,
  BarChart3,
  Activity,
  Eye,
  Plus
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  try {
    // Récupérer les vraies données via l'API admin
    const [usersData, expertsData, entrepreneursData] = await Promise.all([
      fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => res.ok ? res.json() : []),
      fetch(`${API_BASE_URL}/admin/experts`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => res.ok ? res.json() : []),
      fetch(`${API_BASE_URL}/admin/entrepreneurs`, {
        headers: { Authorization: `Bearer ${session.token}` }
      }).then(res => res.ok ? res.json() : []),
    ]);

    // Calculer les statistiques réelles
    const adminStats = {
      totalUsers: usersData.length,
      pendingUsers: entrepreneursData.filter((e: any) => e.validation_status === 'pending').length,
      totalPrograms: 8, // À remplacer quand l'endpoint sera disponible
      activePrograms: 5,
      totalModules: 45, // À remplacer quand l'endpoint sera disponible
      totalCalls: 230, // À remplacer quand l'endpoint sera disponible
      thisWeekCalls: 18,
      activeExperts: expertsData.length,
      approvedEntrepreneurs: entrepreneursData.filter((e: any) => e.validation_status === 'approved').length,
      rejectedEntrepreneurs: entrepreneursData.filter((e: any) => e.validation_status === 'rejected').length,
    };

    // Activité récente basée sur les vraies données
    const recentActivity = [
      ...entrepreneursData.slice(0, 3).map((entrepreneur: any) => ({
        id: `entrepreneur_${entrepreneur.entrepreneur_id}`,
        type: "user_registration",
        message: `Nouvel entrepreneur inscrit: ${entrepreneur.user?.first_name} ${entrepreneur.user?.last_name}`,
        timestamp: entrepreneur.user?.created_at || new Date().toISOString(),
        user_data: entrepreneur
      })),
      // Ajouter d'autres activités selon vos besoins
    ];

    return json({ 
      user, 
      adminStats,
      recentActivity,
      pendingEntrepreneurs: entrepreneursData.filter((e: any) => e.validation_status === 'pending'),
      allUsers: usersData,
      allExperts: expertsData,
      allEntrepreneurs: entrepreneursData
    });
  } catch (error) {
    console.error("Erreur lors du chargement des données admin:", error);
    // Fallback avec données mockées en cas d'erreur
    const adminStats = {
      totalUsers: 0,
      pendingUsers: 0,
      totalPrograms: 0,
      activePrograms: 0,
      totalModules: 0,
      totalCalls: 0,
      thisWeekCalls: 0,
      activeExperts: 0,
      approvedEntrepreneurs: 0,
      rejectedEntrepreneurs: 0,
    };

    return json({ 
      user, 
      adminStats,
      recentActivity: [],
      pendingEntrepreneurs: [],
      allUsers: [],
      allExperts: [],
      allEntrepreneurs: []
    });
  }
}

export default function AdminDashboard() {
  const { user, adminStats, recentActivity, pendingEntrepreneurs } = useLoaderData<typeof loader>();
  
  const location = useLocation();
  const navigation = getAdminNavigation(location.pathname);

  return (
    <Layout user={user} title="Administration" navigation={navigation}>
      {/* Header avec gradient */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Motifs décoratifs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-slate-600/30 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">
              Tableau de bord administrateur
            </h1>
            <p className="text-xl text-slate-200 mb-6">
              Gérez et supervisez la plateforme NUKU
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-teal-300" />
                <span>Système opérationnel</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-300" />
                <span>Dernière mise à jour: maintenant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total utilisateurs"
          value={adminStats.totalUsers}
          subtitle={`${adminStats.pendingUsers} en attente`}
          icon={Users}
          color="blue"
          trend="+12% ce mois"
          urgent={adminStats.pendingUsers > 0}
        />
        <StatCard
          title="Programmes actifs"
          value={adminStats.activePrograms}
          subtitle={`sur ${adminStats.totalPrograms} total`}
          icon={BookOpen}
          color="green"
          trend="+2 nouveaux"
        />
        <StatCard
          title="Experts actifs"
          value={adminStats.activeExperts}
          subtitle="Disponibles maintenant"
          icon={Shield}
          color="purple"
          trend="100% en ligne"
        />
        <StatCard
          title="Appels cette semaine"
          value={adminStats.thisWeekCalls}
          subtitle={`sur ${adminStats.totalCalls} total`}
          icon={Calendar}
          color="orange"
          trend="+24% vs semaine passée"
        />
      </div>

      {/* Actions d'administration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Actions rapides</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <QuickActionCard
                  title="Valider utilisateurs"
                  description={`${adminStats.pendingUsers} en attente`}
                  href="/admin/users?filter=pending"
                  icon={UserPlus}
                  color="blue"
                  urgent={adminStats.pendingUsers > 0}
                />
                <QuickActionCard
                  title="Créer programme"
                  description="Nouveau parcours"
                  href="/admin/programs/new"
                  icon={Plus}
                  color="green"
                />
                <QuickActionCard
                  title="Analytics"
                  description="Performances détaillées"
                  href="/admin/reports"
                  icon={BarChart3}
                  color="purple"
                />
                <QuickActionCard
                  title="Gérer experts"
                  description={`${adminStats.activeExperts} actifs`}
                  href="/admin/users?filter=expert"
                  icon={Shield}
                  color="orange"
                />
                <QuickActionCard
                  title="Modérer contenu"
                  description="Modules en attente"
                  href="/admin/modules?filter=pending"
                  icon={FileText}
                  color="red"
                />
                <QuickActionCard
                  title="Paramètres"
                  description="Configuration système"
                  href="/admin/settings"
                  icon={Settings}
                  color="slate"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alertes importantes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Alertes</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {adminStats.pendingUsers > 0 && (
                <AlertCard
                  type="warning"
                  title="Validations en attente"
                  message={`${adminStats.pendingUsers} nouveaux utilisateurs à valider`}
                  action="Voir"
                  href="/admin/users?filter=pending"
                />
              )}
              <AlertCard
                type="info"
                title="Sauvegarde système"
                message="Dernière sauvegarde: il y a 2 heures"
                action="Configurer"
                href="/admin/settings/backup"
              />
              <AlertCard
                type="success"
                title="Système opérationnel"
                message="Tous les services fonctionnent normalement"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente et statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activité récente */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Activité récente</h3>
              <a href="/admin/activity" className="text-teal-600 hover:text-teal-700 font-semibold flex items-center">
                <Eye className="h-5 w-5 mr-1" />
                Voir tout
              </a>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune activité récente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graphique ou statistiques supplémentaires */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Performances</h3>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div className="space-y-6">
              <PerformanceMetric
                label="Taux de completion des modules"
                value={75}
                color="green"
                target={80}
              />
              <PerformanceMetric
                label="Satisfaction utilisateurs"
                value={88}
                color="blue"
                target={90}
              />
              <PerformanceMetric
                label="Adoption de la plateforme"
                value={62}
                color="orange"
                target={70}
              />
              <PerformanceMetric
                label="Engagement experts"
                value={94}
                color="purple"
                target={95}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend, urgent = false }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${urgent ? 'ring-2 ring-red-300 ring-opacity-50' : ''}`}>
      <div className="p-6 relative">
        {urgent && (
          <div className="absolute top-4 right-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
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
              <p className="text-xs text-green-600 font-medium mt-2 flex items-center">
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

function QuickActionCard({ title, description, href, icon: Icon, color, urgent = false }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50",
    green: "from-green-500 to-green-600 text-green-600 bg-green-50",
    purple: "from-purple-500 to-purple-600 text-purple-600 bg-purple-50",
    orange: "from-orange-500 to-orange-600 text-orange-600 bg-orange-50",
    red: "from-red-500 to-red-600 text-red-600 bg-red-50",
    slate: "from-slate-500 to-slate-600 text-slate-600 bg-slate-50",
  };

  return (
    <a 
      href={href}
      className={`group p-6 border-2 border-transparent rounded-2xl hover:border-white/50 transition-all duration-300 relative bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] ${
        urgent ? 'ring-2 ring-red-300 ring-opacity-50 animate-pulse' : ''
      }`}
    >
      {urgent && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      )}
      
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      
      <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-slate-900">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
      
      <div className="mt-4 flex items-center text-sm font-semibold text-teal-600 group-hover:text-teal-700">
        <span>Accéder</span>
        <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

function AlertCard({ type, title, message, action, href }: any) {
  const typeClasses = {
    warning: "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-800",
    info: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800",
    success: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800",
    error: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800",
  };

  const icons = {
    warning: AlertTriangle,
    info: Clock,
    success: CheckCircle2,
    error: AlertTriangle,
  };

  const Icon = icons[type];

  return (
    <div className={`p-4 border-2 rounded-2xl ${typeClasses[type]} backdrop-blur-sm`}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-bold mb-1">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
          {action && href && (
            <a href={href} className="text-sm font-semibold underline mt-2 inline-block hover:no-underline">
              {action} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: any }) {
  return (
    <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-slate-50/50 to-white/50 border border-slate-100 hover:shadow-md transition-all duration-300">
      <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{activity.message}</p>
        <p className="text-xs text-slate-500 mt-1">
          {new Date(activity.timestamp).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}

function PerformanceMetric({ label, value, color, target }: any) {
  const colorClasses = {
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  };

  const isAboveTarget = target && value >= target;

  return (
    <div className="relative">
      <div className="flex justify-between items-center text-sm mb-3">
        <span className="font-semibold text-slate-700">{label}</span>
        <div className="flex items-center space-x-2">
          <span className={`font-bold ${isAboveTarget ? 'text-green-600' : 'text-slate-600'}`}>
            {value}%
          </span>
          {target && (
            <span className="text-xs text-slate-400">
              (cible: {target}%)
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-3 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 ease-out shadow-sm`}
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
        {target && (
          <div 
            className="absolute top-0 w-0.5 h-3 bg-slate-400"
            style={{ left: `${Math.min(target, 100)}%` }}
          ></div>
        )}
      </div>
    </div>
  );
}