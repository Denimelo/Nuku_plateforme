import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation, useFetcher, Form } from "@remix-run/react";
import { useState } from "react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { reportsServerAPI, mentoringServerAPI } from "~/utils/api.server";
import { ReportsCharts } from "~/components/reports/ReportsCharts";
import { 
  Calendar,
  Download,
  BarChart3,
  Users,
  TrendingUp,
  Activity,
  FileText,
  Filter,
  RefreshCw,
  Eye,
  Printer,
  FileSpreadsheet,
  FileDown
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const url = new URL(request.url);
  const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = url.searchParams.get('end_date') || new Date().toISOString().split('T')[0];

  try {
    const [platformMetrics, userActivity, mentoringStats] = await Promise.all([
      reportsServerAPI.getPlatformMetrics(session.token, startDate, endDate).catch(() => ({})),
      reportsServerAPI.getUserActivity(session.token, undefined, startDate, endDate).catch(() => ({})),
      mentoringServerAPI.getStats(session.token).catch(() => ({}))
    ]);

    return json({ 
      user, 
      platformMetrics: platformMetrics || {},
      userActivity: userActivity || {},
      mentoringStats: mentoringStats || {},
      filters: { startDate, endDate }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des rapports:", error);
    return json({ 
      user, 
      platformMetrics: {},
      userActivity: {},
      mentoringStats: {},
      filters: { startDate, endDate },
      error: "Erreur lors du chargement des données"
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw json({ error: "Session introuvable" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get('_action');

  if (action === 'export_report') {
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const reportType = formData.get('report_type') as string;
    const format = formData.get('format') as string;

    try {
      const blob = await reportsServerAPI.exportReport(session.token, reportType, format, startDate, endDate);
      
      return json({ 
        success: true, 
        message: `Rapport ${reportType} exporté pour la période du ${startDate} au ${endDate}`,
        downloadUrl: URL.createObjectURL(blob) // Note: Ceci est un exemple, l'implémentation réelle peut varier
      });
    } catch (error) {
      return json({ 
        error: `Erreur lors de l'export: ${error}` 
      }, { status: 500 });
    }
  }

  return json({ error: "Action non reconnue" }, { status: 400 });
}

export default function AdminReports() {
  const { user, platformMetrics, userActivity, mentoringStats, filters, error } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = getAdminNavigation(location.pathname);
  const fetcher = useFetcher();

  const [selectedPeriod, setSelectedPeriod] = useState('30_days');
  const [reportType, setReportType] = useState('platform_overview');
  const [exportFormat, setExportFormat] = useState('excel');

  const periodOptions = [
    { value: '7_days', label: '7 derniers jours' },
    { value: '30_days', label: '30 derniers jours' },
    { value: '90_days', label: '3 derniers mois' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const reportTypes = [
    { value: 'platform_overview', label: 'Vue d\'ensemble de la plateforme', icon: BarChart3 },
    { value: 'user_activity', label: 'Activité des utilisateurs', icon: Users },
    { value: 'program_performance', label: 'Performance des programmes', icon: TrendingUp },
    { value: 'mentoring_stats', label: 'Statistiques de mentorat', icon: Activity }
  ];

  const handleExport = (format: string) => {
    const form = new FormData();
    form.append('_action', 'export_report');
    form.append('start_date', filters.startDate);
    form.append('end_date', filters.endDate);
    form.append('report_type', reportType);
    form.append('format', format);
    
    fetcher.submit(form, { method: 'post' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout user={user} title="Rapports et Analytics" navigation={navigation}>
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-800 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Rapports et Analytics
              </h1>
              <p className="text-xl text-slate-200">
                Analysez les performances et l'utilisation de la plateforme
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-colors print:hidden"
              >
                <Printer className="h-5 w-5" />
                <span>Imprimer</span>
              </button>
              
              <button
                onClick={() => handleExport('excel')}
                disabled={fetcher.state !== 'idle'}
                className="flex items-center space-x-2 bg-green-600/80 hover:bg-green-700 px-6 py-3 rounded-xl transition-colors disabled:opacity-50 print:hidden"
              >
                {fetcher.state === 'submitting' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5" />
                )}
                <span>Excel</span>
              </button>

              <button
                onClick={() => handleExport('pdf')}
                disabled={fetcher.state !== 'idle'}
                className="flex items-center space-x-2 bg-red-600/80 hover:bg-red-700 px-6 py-3 rounded-xl transition-colors disabled:opacity-50 print:hidden"
              >
                {fetcher.state === 'submitting' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileDown className="h-5 w-5" />
                )}
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 print:hidden">
          {error}
        </div>
      )}

      {fetcher.data?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 print:hidden">
          {fetcher.data.message}
        </div>
      )}

      {fetcher.data?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 print:hidden">
          {fetcher.data.error}
        </div>
      )}

      {/* Filtres de rapport */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8 print:hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center">
            <Filter className="h-6 w-6 mr-3 text-blue-600" />
            Filtres de rapport
          </h3>
        </div>

        <Form method="get" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sélection de période */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Période
            </label>
            <select
              name="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type de rapport */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Type de rapport
            </label>
            <select
              name="report_type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dates personnalisées */}
          {selectedPeriod === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  name="start_date"
                  defaultValue={filters.startDate}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  name="end_date"
                  defaultValue={filters.endDate}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Appliquer filtres
            </button>
          </div>
        </Form>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Utilisateurs actifs"
          value={platformMetrics.active_users_7d || 0}
          change="+12%"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Nouveaux utilisateurs"
          value={platformMetrics.new_users_7d || 0}
          change="+8%"
          changeType="positive"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Messages envoyés"
          value={platformMetrics.messages_sent_7d || 0}
          change="+15%"
          changeType="positive"
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Appels programmés"
          value={platformMetrics.upcoming_calls || 0}
          change="-3%"
          changeType="negative"
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Statistiques de mentorat */}
      {mentoringStats && Object.keys(mentoringStats).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <Activity className="h-6 w-6 mr-3 text-purple-600" />
              Statistiques de mentorat
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-2xl">
                <p className="text-2xl font-bold text-blue-600">{mentoringStats.total_experts || 0}</p>
                <p className="text-sm text-blue-700">Experts totaux</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-2xl">
                <p className="text-2xl font-bold text-green-600">{mentoringStats.experts_with_mentees || 0}</p>
                <p className="text-sm text-green-700">Experts actifs</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-2xl">
                <p className="text-2xl font-bold text-purple-600">{mentoringStats.total_active_mentorings || 0}</p>
                <p className="text-sm text-purple-700">Relations actives</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-2xl">
                <p className="text-2xl font-bold text-orange-600">{mentoringStats.utilization_rate || 0}%</p>
                <p className="text-sm text-orange-700">Taux d'utilisation</p>
              </div>
            </div>
          </div>

          {/* Répartition de la charge */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              Répartition de la charge
            </h3>
            
            <div className="space-y-4">
              {mentoringStats.workload_distribution && Object.entries(mentoringStats.workload_distribution).map(([key, value]) => (
                <WorkloadBar
                  key={key}
                  label={key.replace('_', ' ').replace('mentees', 'mentorés').replace('mentee', 'mentoré')}
                  value={value as number}
                  total={mentoringStats.total_experts || 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Graphiques et visualisations */}
      <div className="mb-8">
        <ReportsCharts
          platformMetrics={platformMetrics}
          userActivity={userActivity}
          mentoringStats={mentoringStats}
          timeRange={selectedPeriod}
        />
      </div>

      {/* Tableau de données détaillées */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-purple-600" />
            Données détaillées
          </h3>
          <span className="text-sm text-slate-500">
            Période: {filters.startDate} au {filters.endDate}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Métrique</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Valeur actuelle</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Période précédente</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Évolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="py-4 px-6 font-medium">Total utilisateurs</td>
                <td className="py-4 px-6">{platformMetrics.total_users || 0}</td>
                <td className="py-4 px-6">-</td>
                <td className="py-4 px-6">
                  <span className="text-green-600 font-semibold">-</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-4 px-6 font-medium">Utilisateurs actifs (7j)</td>
                <td className="py-4 px-6">{platformMetrics.active_users_7d || 0}</td>
                <td className="py-4 px-6">-</td>
                <td className="py-4 px-6">
                  <span className="text-green-600 font-semibold">-</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-4 px-6 font-medium">Programmes actifs</td>
                <td className="py-4 px-6">{platformMetrics.active_programs || 0}</td>
                <td className="py-4 px-6">-</td>
                <td className="py-4 px-6">
                  <span className="text-green-600 font-semibold">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function MetricCard({ title, value, change, changeType, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  const changeColor = changeType === 'positive' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 print:break-inside-avoid">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mb-2">{value.toLocaleString()}</p>
          <p className={`text-sm font-semibold ${changeColor}`}>{change} vs période précédente</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function WorkloadBar({ label, value, total }: { label: string; value: number; total: number }) {
  const percentage = (value / Math.max(total, 1)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-700 capitalize">{label}</span>
        <span className="text-sm font-bold text-slate-600">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3">
        <div 
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}