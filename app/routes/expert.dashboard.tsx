import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireExpert } from "~/utils/auth.server";
import { 
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
  User
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireExpert(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  try {
    const [modules, assignments, calls, notifications] = await Promise.all([
      modulesServerAPI.getModules(session.token),
      assignmentsServerAPI.getAssignments(session.token),
      callsServerAPI.getUpcomingCalls(session.token),
      notificationsServerAPI.getNotificationCounts(session.token),
    ]);

    return json({ 
      user, 
      modules, 
      assignments, 
      calls, 
      notifications 
    });
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    return json({ 
      user, 
      modules: [], 
      assignments: [], 
      calls: [], 
      notifications: { total: 0, unread: 0 } 
    });
  }
}

export default function ExpertDashboard() {
  const { user, modules, assignments, calls, notifications } = useLoaderData<typeof loader>();

  const navigation = [
    { name: "Tableau de bord", href: "/expert", icon: TrendingUp, current: true },
    { name: "Mes Modules", href: "/expert/modules", icon: BookOpen },
    { name: "Évaluations", href: "/expert/assignments", icon: FileText },
    { name: "Mes Appels", href: "/expert/calls", icon: Calendar },
    { name: "Mes Étudiants", href: "/expert/students", icon: GraduationCap },
    { name: "Messages", href: "/expert/messages", icon: MessageCircle },
  ];

  // Calculs pour les statistiques
  const totalModules = modules.length;
  const pendingEvaluations = assignments.filter((assignment: any) => 
    assignment.status === 'submitted'
  ).length;
  const todayCalls = calls.filter((call: any) => {
    const today = new Date().toDateString();
    return new Date(call.scheduled_start).toDateString() === today;
  }).length;

  return (
    <Layout user={user} title="Dashboard Expert" navigation={navigation}>
      {/* Statistiques en haut */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Modules créés"
          value={totalModules}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Évaluations en attente"
          value={pendingEvaluations}
          icon={FileText}
          color="orange"
        />
        <StatCard
          title="Appels aujourd'hui"
          value={todayCalls}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Notifications"
          value={notifications.unread || 0}
          icon={AlertCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actions rapides */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard
                title="Créer un module"
                description="Nouveau contenu de formation"
                href="/expert/modules/new"
                icon={BookOpen}
                color="blue"
              />
              <QuickActionCard
                title="Planifier un appel"
                description="Nouveau rendez-vous"
                href="/expert/calls/new"
                icon={Calendar}
                color="green"
              />
              <QuickActionCard
                title="Créer un devoir"
                description="Nouvelle évaluation"
                href="/expert/assignments/new"
                icon={FileText}
                color="orange"
              />
              <QuickActionCard
                title="Voir mes étudiants"
                description="Gérer les participants"
                href="/expert/students"
                icon={Users}
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Évaluations récentes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Évaluations récentes</h3>
              <a href="/expert/assignments" className="text-blue-600 hover:text-blue-500 text-sm">
                Voir tout
              </a>
            </div>
            <div className="space-y-4">
              {assignments.slice(0, 4).map((assignment: any) => (
                <ExpertAssignmentCard key={assignment.assignment_id} assignment={assignment} />
              ))}
              {assignments.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucune évaluation en attente
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prochains appels */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Prochains appels</h3>
              <a href="/expert/calls" className="text-blue-600 hover:text-blue-500 text-sm">
                Voir tout
              </a>
            </div>
            <div className="space-y-4">
              {calls.slice(0, 4).map((call: any) => (
                <ExpertCallCard key={call.call_id} call={call} />
              ))}
              {calls.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucun appel programmé
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modules populaires */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Mes modules</h3>
              <a href="/expert/modules" className="text-blue-600 hover:text-blue-500 text-sm">
                Voir tout
              </a>
            </div>
            <div className="space-y-4">
              {modules.slice(0, 4).map((module: any) => (
                <ExpertModuleCard key={module.module_id} module={module} />
              ))}
              {modules.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucun module créé
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "bg-blue-500",
    orange: "bg-orange-500", 
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${colorClasses[color]}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    orange: "text-orange-600 bg-orange-100", 
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
  };

  return (
    <a 
      href={href}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className={`w-8 h-8 rounded-md ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </a>
  );
}

function ExpertAssignmentCard({ assignment }: { assignment: any }) {
  return (
    <div className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-shrink-0">
        <FileText className="h-5 w-5 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{assignment.title}</p>
        <p className="text-sm text-gray-500">
          {assignment.submission_count} soumissions
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          À évaluer
        </span>
      </div>
    </div>
  );
}

function ExpertCallCard({ call }: { call: any }) {
  return (
    <div className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-shrink-0">
        <Calendar className="h-5 w-5 text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{call.title}</p>
        <p className="text-sm text-gray-500">
          {call.participant_count} participants
        </p>
        <p className="text-xs text-gray-400">
          {new Date(call.scheduled_start).toLocaleString()}
        </p>
      </div>
      {call.can_join && (
        <div className="flex-shrink-0">
          <button className="text-green-600 hover:text-green-500 text-sm font-medium">
            Démarrer
          </button>
        </div>
      )}
    </div>
  );
}

function ExpertModuleCard({ module }: { module: any }) {
  return (
    <div className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-shrink-0">
        <BookOpen className="h-5 w-5 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{module.title}</p>
        <p className="text-sm text-gray-500">
          {module.total_content_count} contenus
        </p>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          module.status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {module.status === 'published' ? 'Publié' : 'Brouillon'}
        </span>
      </div>
    </div>
  );
}