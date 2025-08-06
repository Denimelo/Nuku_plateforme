import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireEntrepreneur } from "~/utils/auth.server";
import { getEntrepreneurNavigation } from "~/utils/entrepreneur-navigation";
import { 
  modulesServerAPI, 
  assignmentsServerAPI, 
  callsServerAPI, 
  notificationsServerAPI,
  programsServerAPI 
} from "~/utils/api.server";
import { getUserSession } from "~/utils/session.server";
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle 
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireEntrepreneur(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  try {
    const [modules, assignments, calls, notifications, programs] = await Promise.all([
      modulesServerAPI.getModules(session.token),
      assignmentsServerAPI.getAssignments(session.token),
      callsServerAPI.getUpcomingCalls(session.token),
      notificationsServerAPI.getNotificationCounts(session.token),
      programsServerAPI.getPrograms(session.token),
    ]);

    return json({ 
      user, 
      modules, 
      assignments, 
      calls, 
      notifications, 
      programs 
    });
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    return json({ 
      user, 
      modules: [], 
      assignments: [], 
      calls: [], 
      notifications: { total: 0, unread: 0 }, 
      programs: [] 
    });
  }
}

export default function EntrepreneurDashboard() {
  const { user, modules, assignments, calls, notifications, programs } = useLoaderData<typeof loader>();

  const navigation = getEntrepreneurNavigation(location.pathname);

  // Calculs pour les statistiques
  const completedModules = modules.filter((module: any) => module.is_completed).length;
  const pendingAssignments = assignments.filter((assignment: any) => 
    assignment.is_available && !assignment.user_submitted
  ).length;
  const upcomingCalls = calls.filter((call: any) => call.is_upcoming).length;

  return (
    <Layout user={user} title="Dashboard Entrepreneur" navigation={navigation}>
      {/* Statistiques en haut */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Modules terminés"
          value={completedModules}
          total={modules.length}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Devoirs en attente"
          value={pendingAssignments}
          icon={FileText}
          color="orange"
        />
        <StatCard
          title="Appels à venir"
          value={upcomingCalls}
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
        {/* Modules en cours */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Formations en cours</h3>
              <a href="/entrepreneur/modules" className="text-blue-600 hover:text-blue-500 text-sm">
                Voir tout
              </a>
            </div>
            <div className="space-y-4">
              {modules.slice(0, 3).map((module: any) => (
                <ModuleCard key={module.module_id} module={module} />
              ))}
              {modules.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucun module disponible pour le moment
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Devoirs récents */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Devoirs récents</h3>
              <a href="/entrepreneur/assignments" className="text-blue-600 hover:text-blue-500 text-sm">
                Voir tout
              </a>
            </div>
            <div className="space-y-4">
              {assignments.slice(0, 3).map((assignment: any) => (
                <AssignmentCard key={assignment.assignment_id} assignment={assignment} />
              ))}
              {assignments.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucun devoir disponible
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prochains appels */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Prochains rendez-vous</h3>
              <a href="/entrepreneur/calls" className="text-blue-600 hover:text-blue-500 text-sm">
                Voir tout
              </a>
            </div>
            <div className="space-y-4">
              {calls.slice(0, 3).map((call: any) => (
                <CallCard key={call.call_id} call={call} />
              ))}
              {calls.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucun rendez-vous programmé
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Programmes disponibles */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Programmes disponibles</h3>
              <a href="/entrepreneur/programs" className="text-blue-600 hover:text-blue-500 text-sm">
                Voir tout
              </a>
            </div>
            <div className="space-y-4">
              {programs.slice(0, 2).map((program: any) => (
                <ProgramCard key={program.program_id} program={program} />
              ))}
              {programs.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucun programme disponible
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, total, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "bg-blue-500",
    orange: "bg-orange-500", 
    green: "bg-green-500",
    red: "bg-red-500",
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
              <dd className="text-lg font-medium text-gray-900">
                {total ? `${value}/${total}` : value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ module }: { module: any }) {
  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-shrink-0">
        {module.is_completed ? (
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        ) : (
          <PlayCircle className="h-8 w-8 text-blue-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{module.title}</p>
        <p className="text-sm text-gray-500">
          {module.completion_percentage}% terminé
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${module.completion_percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function AssignmentCard({ assignment }: { assignment: any }) {
  const isOverdue = assignment.is_overdue;
  const isSubmitted = assignment.user_submitted;

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-shrink-0">
        {isSubmitted ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : isOverdue ? (
          <AlertCircle className="h-6 w-6 text-red-500" />
        ) : (
          <Clock className="h-6 w-6 text-orange-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{assignment.title}</p>
        <p className="text-sm text-gray-500">
          {isSubmitted ? "Soumis" : isOverdue ? "En retard" : "À faire"}
        </p>
        {assignment.due_date && (
          <p className="text-xs text-gray-400">
            Échéance: {new Date(assignment.due_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

function CallCard({ call }: { call: any }) {
  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-shrink-0">
        <Calendar className="h-6 w-6 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{call.title}</p>
        <p className="text-sm text-gray-500">avec {call.expert_name}</p>
        <p className="text-xs text-gray-400">
          {new Date(call.scheduled_start).toLocaleString()}
        </p>
      </div>
      {call.can_join && (
        <div className="flex-shrink-0">
          <button className="text-green-600 hover:text-green-500 text-sm font-medium">
            Rejoindre
          </button>
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program }: { program: any }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <h4 className="text-sm font-medium text-gray-900 mb-2">{program.name}</h4>
      <p className="text-sm text-gray-500 mb-3">{program.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {program.duration_weeks} semaines
        </span>
        <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
          Postuler
        </button>
      </div>
    </div>
  );
}