import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { ChartsSection } from "~/components/dashboard/ChartsSection";
import { AdvancedMetrics } from "~/components/dashboard/AdvancedMetrics";
import { SmartAlerts } from "~/components/dashboard/SmartAlerts";
import { useState, useMemo, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
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

// Constantes
const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

const TIME_RANGES = {
  SEVEN_DAYS: '7_days',
  THIRTY_DAYS: '30_days',
  NINETY_DAYS: '90_days',
  ONE_YEAR: '1_year'
} as const;

const COLOR_SCHEMES = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  teal: "from-teal-500 to-teal-600",
  red: "from-red-500 to-red-600",
  slate: "from-slate-500 to-slate-600",
} as const;

// Types
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

interface Entrepreneur {
  entrepreneur_id: string;
  validation_status: 'pending' | 'approved' | 'rejected';
  user?: User;
}

interface Expert {
  expert_id: string;
  is_active: boolean;
  user?: User;
}

interface Program {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface AdminStats {
  totalUsers: number;
  pendingUsers: number;
  totalPrograms: number;
  activePrograms: number;
  upcomingPrograms: number;
  ongoingPrograms: number;
  totalModules: number;
  totalCalls: number;
  thisWeekCalls: number;
  activeExperts: number;
  approvedEntrepreneurs: number;
  rejectedEntrepreneurs: number;
}

interface Activity {
  id: string;
  type: 'user_registration' | 'program_enrollment' | 'expert_assignment' | 'module_completion';
  message: string;
  timestamp: string;
  user_data?: any;
}

interface LoaderData {
  user: User;
  adminStats: AdminStats;
  recentActivity: Activity[];
  pendingEntrepreneurs: Entrepreneur[];
  allUsers: User[];
  allExperts: Expert[];
  allEntrepreneurs: Entrepreneur[];
}

type TimeRange = typeof TIME_RANGES[keyof typeof TIME_RANGES];
type ColorScheme = keyof typeof COLOR_SCHEMES;

// Fonctions utilitaires
const validateAdminStats = (data: any): AdminStats => {
  return {
    totalUsers: Number(data?.totalUsers) || 0,
    pendingUsers: Number(data?.pendingUsers) || 0,
    totalPrograms: Number(data?.totalPrograms) || 0,
    activePrograms: Number(data?.activePrograms) || 0,
    upcomingPrograms: Number(data?.upcomingPrograms) || 0,
    ongoingPrograms: Number(data?.ongoingPrograms) || 0,
    totalModules: Number(data?.totalModules) || 0,
    totalCalls: Number(data?.totalCalls) || 0,
    thisWeekCalls: Number(data?.thisWeekCalls) || 0,
    activeExperts: Number(data?.activeExperts) || 0,
    approvedEntrepreneurs: Number(data?.approvedEntrepreneurs) || 0,
    rejectedEntrepreneurs: Number(data?.rejectedEntrepreneurs) || 0,
  };
};

const createFallbackStats = (): AdminStats => ({
  totalUsers: 0,
  pendingUsers: 0,
  totalPrograms: 0,
  activePrograms: 0,
  upcomingPrograms: 0,
  ongoingPrograms: 0,
  totalModules: 0,
  totalCalls: 0,
  thisWeekCalls: 0,
  activeExperts: 0,
  approvedEntrepreneurs: 0,
  rejectedEntrepreneurs: 0,
});

const fetchWithAuth = async (url: string, token: string) => {
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${url}:`, error);
    return [];
  }
};

// Loader
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session?.token) {
    throw new Error("Session introuvable");
  }

  try {
    const [usersData, expertsData, entrepreneursData, programsData] = await Promise.all([
      fetchWithAuth(`${API_BASE_URL}/admin/users`, session.token),
      fetchWithAuth(`${API_BASE_URL}/admin/experts`, session.token),
      fetchWithAuth(`${API_BASE_URL}/admin/entrepreneurs`, session.token),
      fetchWithAuth(`${API_BASE_URL}/programs/?active_only=false`, session.token),
    ]);

    const rawAdminStats = {
      totalUsers: usersData.length,
      pendingUsers: entrepreneursData.filter((e: Entrepreneur) => e.validation_status === 'pending').length,
      totalPrograms: programsData.length,
      activePrograms: programsData.filter((p: Program) => p.is_active).length,
      upcomingPrograms: programsData.filter((p: Program) => {
        const startDate = new Date(p.start_date);
        return startDate > new Date() && p.is_active;
      }).length,
      ongoingPrograms: programsData.filter((p: Program) => {
        const now = new Date();
        const startDate = new Date(p.start_date);
        const endDate = new Date(p.end_date);
        return startDate <= now && endDate >= now && p.is_active;
      }).length,
      totalModules: 45, // À remplacer quand l'endpoint sera disponible
      totalCalls: 230, // À remplacer quand l'endpoint sera disponible
      thisWeekCalls: 18,
      activeExperts: expertsData.filter((e: Expert) => e.is_active).length,
      approvedEntrepreneurs: entrepreneursData.filter((e: Entrepreneur) => e.validation_status === 'approved').length,
      rejectedEntrepreneurs: entrepreneursData.filter((e: Entrepreneur) => e.validation_status === 'rejected').length,
    };

    const adminStats = validateAdminStats(rawAdminStats);

    const recentActivity: Activity[] = [
      ...entrepreneursData.slice(0, 3).map((entrepreneur: Entrepreneur) => ({
        id: `entrepreneur_${entrepreneur.entrepreneur_id}`,
        type: 'user_registration' as const,
        message: `Nouvel entrepreneur inscrit: ${entrepreneur.user?.first_name || 'N/A'} ${entrepreneur.user?.last_name || ''}`,
        timestamp: entrepreneur.user?.created_at || new Date().toISOString(),
        user_data: entrepreneur
      })),
    ];

    return json({ 
      user, 
      adminStats,
      recentActivity,
      pendingEntrepreneurs: entrepreneursData.filter((e: Entrepreneur) => e.validation_status === 'pending'),
      allUsers: usersData,
      allExperts: expertsData,
      allEntrepreneurs: entrepreneursData
    });
  } catch (error) {
    console.error("Erreur lors du chargement des données admin:", error);
    
    return json({ 
      user, 
      adminStats: createFallbackStats(),
      recentActivity: [],
      pendingEntrepreneurs: [],
      allUsers: [],
      allExperts: [],
      allEntrepreneurs: []
    });
  }
}

// Interfaces pour les props des composants
interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  color: ColorScheme;
  trend?: string;
  urgent?: boolean;
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: ColorScheme;
  urgent?: boolean;
}

interface AlertCardProps {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  action?: string;
  href?: string;
}

interface ActivityCardProps {
  activity: Activity;
}

interface PerformanceMetricProps {
  label: string;
  value: number;
  color: ColorScheme;
  target?: number;
}

interface ErrorFallbackProps {
  error?: Error;
}

interface LoadingSpinnerProps {
  message?: string;
}

// Composants utilitaires
function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Erreur de chargement</h2>
        <p className="text-slate-600 mb-6">
          Une erreur s'est produite lors du chargement du dashboard.
        </p>
        {error && (
          <details className="text-left bg-slate-50 p-4 rounded-lg mb-6">
            <summary className="font-semibold cursor-pointer">Détails techniques</summary>
            <pre className="text-xs mt-2 overflow-auto">{error.message}</pre>
          </details>
        )}
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Actualiser la page
        </button>
      </div>
    </div>
  );
}

function LoadingSpinner({ message = "Chargement..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-semibold">{message}</p>
      </div>
    </div>
  );
}

// Composant principal
export default function AdminDashboard() {
  try {
    const loaderData = useLoaderData<typeof loader>() as LoaderData;
    const { user, adminStats, recentActivity, pendingEntrepreneurs } = loaderData;
    
    if (!user || !adminStats) {
      return <ErrorFallback />;
    }

    const location = useLocation();
    const navigation = getAdminNavigation(location.pathname);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(TIME_RANGES.THIRTY_DAYS);

    const handleTimeRangeChange = useCallback((range: TimeRange) => {
      setSelectedTimeRange(range);
    }, []);

    const processedStats = useMemo(() => ({
      ...adminStats,
      completionRate: adminStats.totalPrograms > 0 
        ? Math.round((adminStats.activePrograms / adminStats.totalPrograms) * 100)
        : 0,
      expertsUtilization: adminStats.activeExperts > 0 
        ? Math.round((adminStats.thisWeekCalls / adminStats.activeExperts) * 100)
        : 0,
    }), [adminStats]);

    const timeRangeOptions = [
      { value: TIME_RANGES.SEVEN_DAYS, label: '7 jours' },
      { value: TIME_RANGES.THIRTY_DAYS, label: '30 jours' },
      { value: TIME_RANGES.NINETY_DAYS, label: '3 mois' },
      { value: TIME_RANGES.ONE_YEAR, label: '1 an' }
    ];

    return (
      <Layout user={user} title="Administration" navigation={navigation}>
        <div className="space-y-8">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-slate-800 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
            {/* Motifs décoratifs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-slate-600/30 to-transparent rounded-full blur-2xl" aria-hidden="true"></div>
            
            <div className="relative">
              <h1 className="text-4xl font-bold mb-4">
                Tableau de bord administrateur
              </h1>
              <p className="text-xl text-slate-200 mb-6">
                Gérez et supervisez la plateforme NUKU
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-teal-300" aria-hidden="true" />
                  <span>Système opérationnel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-300" aria-hidden="true" />
                  <span>Dernière mise à jour: maintenant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sélecteur de période */}
          <div className="flex justify-end">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-2">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-semibold text-slate-700 px-3">Période d'analyse:</span>
                {timeRangeOptions.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => handleTimeRangeChange(period.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      selectedTimeRange === period.value
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    aria-pressed={selectedTimeRange === period.value}
                    aria-label={`Sélectionner la période ${period.label}`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total utilisateurs"
              value={processedStats.totalUsers}
              subtitle={`${processedStats.pendingUsers} en attente`}
              icon={Users}
              color="blue"
              trend="+12% ce mois"
              urgent={processedStats.pendingUsers > 0}
            />
            <StatCard
              title="Programmes"
              value={processedStats.activePrograms}
              subtitle={`${processedStats.ongoingPrograms} en cours, ${processedStats.upcomingPrograms} à venir`}
              icon={BookOpen}
              color="green"
              trend={`${processedStats.totalPrograms} total`}
            />
            <StatCard
              title="Experts actifs"
              value={processedStats.activeExperts}
              subtitle="Disponibles maintenant"
              icon={Shield}
              color="purple"
              trend="100% en ligne"
            />
            <StatCard
              title="Appels cette semaine"
              value={processedStats.thisWeekCalls}
              subtitle={`sur ${processedStats.totalCalls} total`}
              icon={Calendar}
              color="orange"
              trend="+24% vs semaine passée"
            />
          </div>

          {/* Alertes intelligentes */}
          <div>
            <SmartAlerts 
              stats={processedStats} 
              pendingEntrepreneurs={pendingEntrepreneurs}
              currentUser={user}
            />
          </div>

          {/* Actions d'administration */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Actions rapides</h2>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <QuickActionCard
                  title="Valider entrepreneurs"
                  description={`${processedStats.pendingUsers} en attente`}
                  href="/admin/entrepreneurs?filter=pending"
                  icon={UserPlus}
                  color="blue"
                  urgent={processedStats.pendingUsers > 0}
                />
                <QuickActionCard
                  title="Créer programme"
                  description="Nouveau parcours"
                  href="/admin/programs/new"
                  icon={Plus}
                  color="green"
                />
                <QuickActionCard
                  title="Gérer programmes"
                  description={`${processedStats.activePrograms} actifs`}
                  href="/admin/programs"
                  icon={BookOpen}
                  color="purple"
                />
                <QuickActionCard
                  title="Gérer experts"
                  description={`${processedStats.activeExperts} actifs`}
                  href="/admin/users?filter=expert"
                  icon={Shield}
                  color="orange"
                />
                <QuickActionCard
                  title="Analytics"
                  description="Performances détaillées"
                  href="/admin/reports"
                  icon={BarChart3}
                  color="teal"
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

          {/* Métriques avancées */}
          <div>
            <AdvancedMetrics stats={processedStats} comparedToLastPeriod={true} />
          </div>

          {/* Graphiques détaillés */}
          <div>
            <ChartsSection stats={processedStats} timeRange={selectedTimeRange} />
          </div>

          {/* Activité récente */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-blue-600" aria-hidden="true" />
                  Activité récente
                </h2>
                <div className="flex items-center space-x-4">
                  <a 
                    href="/admin/activity" 
                    className="text-teal-600 hover:text-teal-700 font-semibold flex items-center transition-colors"
                    aria-label="Voir toutes les activités"
                  >
                    <Eye className="h-5 w-5 mr-1" aria-hidden="true" />
                    Voir tout
                  </a>
                  <a 
                    href="/admin/reports" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center transition-colors"
                    aria-label="Accéder aux rapports détaillés"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" aria-hidden="true" />
                    Rapports détaillés
                  </a>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 6).map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" aria-hidden="true" />
                    <p className="text-lg">Aucune activité récente</p>
                    <p className="text-sm">Les activités apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  } catch (error) {
    console.error("Erreur dans AdminDashboard:", error);
    return <ErrorFallback error={error instanceof Error ? error : undefined} />;
  }
}

// Composants
function StatCard({ title, value, subtitle, icon: Icon, color, trend, urgent = false }: StatCardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${urgent ? 'ring-2 ring-red-300 ring-opacity-50' : ''}`}>
      <div className="p-6 relative">
        {urgent && (
          <div className="absolute top-4 right-4" aria-label="Attention requise">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mb-1">{value.toLocaleString()}</p>
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
            {trend && (
              <p className="text-xs text-green-600 font-medium mt-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
                {trend}
              </p>
            )}
          </div>
          
          <div className={`p-3 rounded-xl bg-gradient-to-r ${COLOR_SCHEMES[color]} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon: Icon, color, urgent = false }: QuickActionCardProps) {
  return (
    <a 
      href={href}
      className={`group p-6 border-2 border-transparent rounded-2xl hover:border-white/50 transition-all duration-300 relative bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] ${
        urgent ? 'ring-2 ring-red-300 ring-opacity-50 animate-pulse' : ''
      }`}
      aria-label={`${title} - ${description}`}
    >
      {urgent && (
        <div className="absolute top-3 right-3" aria-label="Action urgente requise">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      )}
      
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${COLOR_SCHEMES[color]} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
      
      <div className="mt-4 flex items-center text-sm font-semibold text-teal-600 group-hover:text-teal-700">
        <span>Accéder</span>
        <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

function AlertCard({ type, title, message, action, href }: AlertCardProps) {
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
    <div className={`p-4 border-2 rounded-2xl ${typeClasses[type]} backdrop-blur-sm`} role="alert">
      <div className="flex items-start">
        <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
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

function ActivityCard({ activity }: ActivityCardProps) {
  const getActivityIcon = (type: Activity['type']): LucideIcon => {
    const iconMap = {
      user_registration: UserPlus,
      program_enrollment: BookOpen,
      expert_assignment: Shield,
      module_completion: CheckCircle2,
    };
    return iconMap[type] || Activity;
  };

  const Icon = getActivityIcon(activity.type);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2">{activity.message}</p>
          <p className="text-xs text-slate-500">
            {new Date(activity.timestamp).toLocaleString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function PerformanceMetric({ label, value, color, target }: PerformanceMetricProps) {
  const isAboveTarget = target && value >= target;

  return (
    <div className="relative" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
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
          className={`h-3 rounded-full bg-gradient-to-r ${COLOR_SCHEMES[color]} transition-all duration-1000 ease-out shadow-sm`}
          style={{ width: `${Math.min(value, 100)}%` }}
          aria-hidden="true"
        ></div>
        {target && (
          <div 
            className="absolute top-0 w-0.5 h-3 bg-slate-400"
            style={{ left: `${Math.min(target, 100)}%` }}
            aria-hidden="true"
          ></div>
        )}
      </div>
    </div>
  );
}