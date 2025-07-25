import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { requireUser } from "~/utils/auth.server";
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Target,
  Award,
  DollarSign,
  Activity,
  FileText,
  Phone,
  Star,
  Plus,
  ArrowRight,
  BarChart3,
  PieChart,
  PlayCircle,
  Download,
  Upload,
  Bell,
  Eye,
} from "lucide-react";

export const loader = async ({ request }: { request: Request }) => {
  const user = await requireUser(request);
  return json({ user });
};

// Composant de carte statistique
const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "blue",
  trend = "up",
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  color?: string;
  trend?: "up" | "down" | "neutral";
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  const trendColor = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${trendColor[trend]} font-medium mt-1`}>
              {change}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Dashboard Admin
const AdminDashboard = ({ user }: { user: any }) => {
  const adminStats = [
    {
      title: "Candidatures en attente",
      value: 12,
      change: "+3 cette semaine",
      icon: Users,
      color: "yellow",
      trend: "up",
    },
    {
      title: "Programmes actifs",
      value: 5,
      change: "2 démarrent bientôt",
      icon: BookOpen,
      color: "blue",
      trend: "neutral",
    },
    {
      title: "Entrepreneurs actifs",
      value: 48,
      change: "+8% ce mois",
      icon: TrendingUp,
      color: "green",
      trend: "up",
    },
    {
      title: "Taux de réussite",
      value: "87%",
      change: "+5% vs mois dernier",
      icon: Target,
      color: "purple",
      trend: "up",
    },
  ];

  const recentActivities = [
    {
      type: "validation",
      message: "3 nouvelles candidatures à valider",
      time: "Il y a 2h",
      urgent: true,
    },
    {
      type: "program",
      message: "Programme Scale-Up Tech démarre demain",
      time: "Il y a 4h",
      urgent: false,
    },
    {
      type: "report",
      message: "Rapport mensuel généré",
      time: "Il y a 1 jour",
      urgent: false,
    },
    {
      type: "expert",
      message: "Nouvel expert ajouté au programme FinTech",
      time: "Il y a 2 jours",
      urgent: false,
    },
  ];

  const programsOverview = [
    {
      name: "Scale-Up Tech",
      participants: 12,
      completion: 67,
      status: "active",
    },
    {
      name: "FinTech Accelerator",
      participants: 8,
      completion: 45,
      status: "active",
    },
    {
      name: "Green Innovation",
      participants: 15,
      completion: 89,
      status: "ending",
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#0B2749] to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {user.first_name} ! 👋
        </h1>
        <p className="text-blue-100">
          Gérez votre plateforme d'accélération et suivez les performances
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0B2749] hover:bg-blue-50 transition-colors duration-200 group">
                <Plus className="h-8 w-8 text-gray-400 group-hover:text-[#0B2749] mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Nouveau programme</p>
                  <p className="text-sm text-gray-500">
                    Créer un programme d'accélération
                  </p>
                </div>
              </button>
              <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0B2749] hover:bg-blue-50 transition-colors duration-200 group">
                <Users className="h-8 w-8 text-gray-400 group-hover:text-[#0B2749] mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Ajouter un expert</p>
                  <p className="text-sm text-gray-500">
                    Inviter un nouvel expert
                  </p>
                </div>
              </button>
              <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0B2749] hover:bg-blue-50 transition-colors duration-200 group">
                <BarChart3 className="h-8 w-8 text-gray-400 group-hover:text-[#0B2749] mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Générer rapport</p>
                  <p className="text-sm text-gray-500">
                    Analyse des performances
                  </p>
                </div>
              </button>
              <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0B2749] hover:bg-blue-50 transition-colors duration-200 group">
                <Bell className="h-8 w-8 text-gray-400 group-hover:text-[#0B2749] mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Validation</p>
                  <p className="text-sm text-gray-500">
                    12 candidatures en attente
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Activités récentes
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.urgent ? "bg-red-500" : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vue d'ensemble des programmes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Vue d'ensemble des programmes
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Programme
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Participants
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Progression
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Statut
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {programsOverview.map((program, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {program.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {program.participants}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${program.completion}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {program.completion}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        program.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {program.status === "active" ? "Actif" : "Se termine"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Dashboard Expert
const ExpertDashboard = ({ user }: { user: any }) => {
  const expertStats = [
    {
      title: "Entrepreneurs assignés",
      value: 12,
      change: "+2 cette semaine",
      icon: Users,
      color: "blue",
      trend: "up",
    },
    {
      title: "Modules actifs",
      value: 3,
      change: "2 en cours",
      icon: BookOpen,
      color: "green",
      trend: "neutral",
    },
    {
      title: "Calls planifiés",
      value: 8,
      change: "Cette semaine",
      icon: Phone,
      color: "purple",
      trend: "neutral",
    },
    {
      title: "Note moyenne",
      value: "4.8/5",
      change: "+0.2 ce mois",
      icon: Star,
      color: "yellow",
      trend: "up",
    },
  ];

  const upcomingCalls = [
    {
      title: "Call collectif - Pitch Deck",
      participants: 8,
      time: "14:00 - 15:30",
      date: "Aujourd'hui",
    },
    {
      title: "Mentorat individuel - Marie Dubois",
      participants: 1,
      time: "16:00 - 16:30",
      date: "Demain",
    },
    {
      title: "Workshop - Business Model Canvas",
      participants: 12,
      time: "10:00 - 12:00",
      date: "Vendredi",
    },
  ];

  const pendingTasks = [
    {
      type: "feedback",
      title: "5 exercices à corriger",
      description: "Pitch Deck - Programme Scale-Up Tech",
      urgent: true,
    },
    {
      type: "content",
      title: "Nouveau module à publier",
      description: "Plan financier - Module 4",
      urgent: false,
    },
    {
      type: "call",
      title: "Préparer le call de demain",
      description: "Mentorat Marie Dubois",
      urgent: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Salut {user.first_name} ! 🚀
        </h1>
        <p className="text-blue-100">
          Accompagnez vos entrepreneurs vers le succès
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {expertStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Prochains calls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Prochains calls
            </h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingCalls.map((call, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{call.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {call.participants} participant
                    {call.participants > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {call.date} • {call.time}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Planifier un nouveau call
          </button>
        </div>

        {/* Tâches en attente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tâches en attente
          </h2>
          <div className="space-y-4">
            {pendingTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    task.urgent ? "bg-red-500" : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {task.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
            <div className="flex items-center">
              <Upload className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium">Ajouter du contenu</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium">Feedback en attente</span>
            </div>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              5
            </span>
          </button>
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium">Voir les progrès</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Entrepreneur
const EntrepreneurDashboard = ({ user }: { user: any }) => {
  const entrepreneurStats = [
    {
      title: "Progression",
      value: "67%",
      change: "+12% cette semaine",
      icon: TrendingUp,
      color: "green",
      trend: "up",
    },
    {
      title: "Modules complétés",
      value: "4/6",
      change: "2 restants",
      icon: BookOpen,
      color: "blue",
      trend: "neutral",
    },
    {
      title: "Exercices rendus",
      value: 8,
      change: "3 en attente",
      icon: CheckCircle,
      color: "purple",
      trend: "neutral",
    },
    {
      title: "Note moyenne",
      value: "16/20",
      change: "+2 pts ce mois",
      icon: Award,
      color: "yellow",
      trend: "up",
    },
  ];

  const nextTasks = [
    {
      title: "Pitch Deck - Version finale",
      deadline: "Dans 2 jours",
      priority: "high",
      type: "exercise",
    },
    {
      title: "Étude de marché",
      deadline: "Dans 5 jours",
      priority: "medium",
      type: "exercise",
    },
    {
      title: "Call avec mentor",
      deadline: "Demain 14h",
      priority: "high",
      type: "call",
    },
    {
      title: "Module 5 - Plan financier",
      deadline: "Cette semaine",
      priority: "medium",
      type: "course",
    },
  ];

  const programProgress = [
    { module: "Business Model", progress: 100, completed: true },
    { module: "Étude de marché", progress: 100, completed: true },
    { module: "Pitch Deck", progress: 75, completed: false },
    { module: "Plan financier", progress: 50, completed: false },
    { module: "Stratégie commerciale", progress: 0, completed: false },
    { module: "Levée de fonds", progress: 0, completed: false },
  ];

  const recentFeedback = [
    {
      title: "Pitch Deck v1",
      expert: "Sarah Martin",
      note: "18/20",
      comment:
        "Excellent travail sur la présentation du problème. Améliorer la partie financière.",
      date: "Il y a 2 jours",
    },
    {
      title: "Business Model Canvas",
      expert: "Jean Dupont",
      note: "15/20",
      comment:
        "Bonne compréhension du marché. Préciser les canaux de distribution.",
      date: "Il y a 5 jours",
    },
  ];

  const upcomingEvents = [
    {
      title: "Call individuel - Sarah Martin",
      date: "Demain",
      time: "14:00",
      type: "call",
    },
    {
      title: "Workshop - Levée de fonds",
      date: "Vendredi",
      time: "10:00",
      type: "workshop",
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour {user.first_name} ! 💪
        </h1>
        <p className="text-green-100">
          Continuez sur votre lancée, vous progressez bien !
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="text-green-100">
            <span className="text-2xl font-bold">67%</span>
            <span className="text-sm ml-1">du programme complété</span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {entrepreneurStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progression du programme */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Progression du programme
            </h2>
            <div className="space-y-4">
              {programProgress.map((module, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {module.module}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {module.progress}%
                      </span>
                      {module.completed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        module.completed
                          ? "bg-green-500"
                          : module.progress > 0
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                  {module.progress > 0 && module.progress < 100 && (
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Continuer le module →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prochaines tâches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Prochaines tâches
          </h2>
          <div className="space-y-3">
            {nextTasks.map((task, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  task.priority === "high"
                    ? "border-red-500 bg-red-50"
                    : "border-yellow-500 bg-yellow-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {task.title}
                  </h3>
                  {task.type === "exercise" && (
                    <FileText className="h-4 w-4 text-gray-400" />
                  )}
                  {task.type === "call" && (
                    <Phone className="h-4 w-4 text-gray-400" />
                  )}
                  {task.type === "course" && (
                    <PlayCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600">{task.deadline}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Feedback récents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Feedback récents
          </h2>
          <div className="space-y-4">
            {recentFeedback.map((feedback, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    {feedback.title}
                  </h3>
                  <span className="text-lg font-bold text-green-600">
                    {feedback.note}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Par {feedback.expert} • {feedback.date}
                </p>
                <p className="text-sm text-gray-800">{feedback.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Événements à venir */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Événements à venir
          </h2>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  {event.type === "call" && (
                    <Phone className="h-4 w-4 text-blue-500" />
                  )}
                  {event.type === "workshop" && (
                    <Users className="h-4 w-4 text-purple-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {event.date} • {event.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors duration-200">
            <div className="flex items-center">
              <Upload className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium">Rendre un exercice</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors duration-200">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium">Contacter un expert</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors duration-200">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium">Voir ma progression</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal du Dashboard avec routage par rôle
export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  const renderDashboard = () => {
    switch (user.user_type) {
      case "admin":
        return <AdminDashboard user={user} />;
      case "expert":
        return <ExpertDashboard user={user} />;
      case "entrepreneur":
        return <EntrepreneurDashboard user={user} />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Rôle non reconnu
              </h2>
              <p className="text-gray-600">
                Votre rôle utilisateur n'est pas configuré correctement.
              </p>
            </div>
          </div>
        );
    }
  };

  return <Layout user={user}>{renderDashboard()}</Layout>;
}

// Composants additionnels pour améliorer l'expérience utilisateur

// Widget de notification en temps réel (à intégrer dans les dashboards)
const NotificationWidget = ({ notifications }: { notifications: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Widget de progression rapide
const QuickProgress = ({
  title,
  current,
  total,
  color = "blue",
}: {
  title: string;
  current: number;
  total: number;
  color?: string;
}) => {
  const percentage = (current / total) * 100;

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <span className="text-sm text-gray-600">
          {current}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {Math.round(percentage)}% complété
      </p>
    </div>
  );
};

// Widget météo des KPIs (pour admin)
const KPIWeather = ({
  metrics,
}: {
  metrics: {
    name: string;
    value: number;
    target: number;
    trend: "up" | "down" | "stable";
  }[];
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Météo des KPIs
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const performance = (metric.value / metric.target) * 100;
          let status = "warning";
          let icon = AlertCircle;

          if (performance >= 100) {
            status = "success";
            icon = CheckCircle;
          } else if (performance >= 75) {
            status = "good";
            icon = TrendingUp;
          }

          return (
            <div key={index} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {metric.name}
                </span>
                {React.createElement(icon, {
                  className: `h-4 w-4 ${
                    status === "success"
                      ? "text-green-500"
                      : status === "good"
                      ? "text-blue-500"
                      : "text-yellow-500"
                  }`,
                })}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {metric.value}
                </span>
                <span className="text-sm text-gray-500">/{metric.target}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Composant de call-to-action contextuel
const ContextualCTA = ({ userType }: { userType: string }) => {
  const ctas = {
    admin: {
      title: "Optimisez votre plateforme",
      description:
        "Analysez les performances et identifiez les axes d'amélioration",
      action: "Générer un rapport complet",
      icon: BarChart3,
      color: "from-red-500 to-red-600",
    },
    expert: {
      title: "Maximisez votre impact",
      description: "Créez du contenu engageant pour vos entrepreneurs",
      action: "Ajouter un nouveau module",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
    },
    entrepreneur: {
      title: "Accélérez votre croissance",
      description: "Terminez vos modules pour débloquer de nouveaux contenus",
      action: "Continuer mon parcours",
      icon: Target,
      color: "from-green-500 to-green-600",
    },
  };

  const cta = ctas[userType as keyof typeof ctas];

  if (!cta) return null;

  const Icon = cta.icon;

  return (
    <div className={`bg-gradient-to-r ${cta.color} rounded-xl p-6 text-white`}>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{cta.title}</h3>
          <p className="text-sm opacity-90 mb-3">{cta.description}</p>
          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
            {cta.action}
          </button>
        </div>
      </div>
    </div>
  );
};
