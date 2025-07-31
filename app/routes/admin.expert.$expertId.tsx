import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { adminServerAPI } from "~/utils/api.server";
import { 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Building,
  Globe,
  Activity,
  Briefcase,
  Star,
  DollarSign,
  Award,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Video,
  Users,
  FileText
} from "lucide-react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const expertId = params.expertId;
  if (!expertId) {
    throw new Error("ID expert manquant");
  }

  try {
    // Récupérer les détails de l'expert via l'API
    const expertData = await adminServerAPI.getExpert(session.token, expertId);
    
    // TODO: Récupérer des statistiques supplémentaires (programmes, sessions, évaluations)
    // Ces données pourraient venir d'autres endpoints quand ils seront disponibles
    const expertStats = {
      totalPrograms: 5, // Nombre de programmes où l'expert intervient
      totalSessions: 23, // Nombre de sessions réalisées
      totalStudents: 127, // Nombre d'étudiants accompagnés
      averageRating: 4.8, // Note moyenne des évaluations
      completedHours: 156, // Heures d'accompagnement réalisées
      upcomingSessions: 3, // Sessions à venir
    };

    return json({ 
      user, 
      expertData,
      expertStats,
      expertId
    });
  } catch (error) {
    console.error("Erreur lors du chargement de l'expert:", error);
    throw new Error("Expert introuvable");
  }
}

export default function AdminExpertDetails() {
  const { user, expertData, expertStats } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = getAdminNavigation(location.pathname);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4 mr-1" />
          Actif
        </span>;
      case "pending":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-4 w-4 mr-1" />
          En attente
        </span>;
      case "inactive":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="h-4 w-4 mr-1" />
          Inactif
        </span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Inconnu</span>;
    }
  };

  const getExperienceLevel = (years: number) => {
    if (years < 2) return { label: "Junior", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (years < 5) return { label: "Confirmé", color: "text-green-600", bgColor: "bg-green-100" };
    if (years < 10) return { label: "Senior", color: "text-orange-600", bgColor: "bg-orange-100" };
    return { label: "Expert", color: "text-purple-600", bgColor: "bg-purple-100" };
  };

  const experienceLevel = getExperienceLevel(expertData.years_of_experience || 0);

  return (
    <Layout user={user} title={`${expertData.user?.first_name} ${expertData.user?.last_name}`} navigation={navigation}>
      {/* En-tête avec navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/experts")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la liste des experts
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Profil principal */}
        <div className="xl:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
            {/* En-tête du profil */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {expertData.user?.first_name?.[0]}{expertData.user?.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {expertData.user?.first_name} {expertData.user?.last_name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${experienceLevel.bgColor} ${experienceLevel.color}`}>
                        <Shield className="h-4 w-4 mr-1" />
                        Expert {experienceLevel.label}
                      </span>
                      {getStatusBadge(expertData.user?.status)}
                    </div>
                    <div className="flex items-center text-white/80 mt-3">
                      <Mail className="h-4 w-4 mr-2" />
                      {expertData.user?.email}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-xl text-white text-sm font-medium">
                    Consultation seule
                  </span>
                </div>
              </div>
            </div>

            {/* Contenu du profil */}
            <div className="p-8">
              <ExpertInfoDisplay expertData={expertData} />
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2" />
              Performance & Statistiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                icon={BookOpen}
                label="Programmes"
                value={expertStats.totalPrograms}
                color="blue"
                subtitle="programmes actifs"
              />
              <StatCard
                icon={Video}
                label="Sessions"
                value={expertStats.totalSessions}
                color="green"
                subtitle="sessions réalisées"
              />
              <StatCard
                icon={Users}
                label="Étudiants"
                value={expertStats.totalStudents}
                color="purple"
                subtitle="accompagnés"
              />
              <StatCard
                icon={Star}
                label="Note moyenne"
                value={expertStats.averageRating.toFixed(1)}
                color="yellow"
                subtitle="/ 5.0"
              />
              <StatCard
                icon={Clock}
                label="Heures"
                value={expertStats.completedHours}
                color="orange"
                subtitle="d'accompagnement"
              />
              <StatCard
                icon={Calendar}
                label="À venir"
                value={expertStats.upcomingSessions}
                color="teal"
                subtitle="sessions planifiées"
              />
            </div>
          </div>
        </div>

        {/* Sidebar avec informations */}
        <div className="space-y-6">
          {/* Informations complémentaires */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Informations
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <span className="text-sm text-gray-600">Spécialisation</span>
                <span className="text-sm font-medium text-gray-900">{expertData.specialization}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-sm text-gray-600">Expérience</span>
                <span className="text-sm font-medium text-gray-900">{expertData.years_of_experience || 0} années</span>
              </div>
              {expertData.hourly_rate && (
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <span className="text-sm text-gray-600">Tarif horaire</span>
                  <span className="text-sm font-medium text-gray-900">{expertData.hourly_rate.toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                <span className="text-sm text-gray-600">Membre depuis</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(expertData.user?.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions de consultation */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-3 border border-blue-300 text-sm font-medium rounded-2xl text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all">
                <MessageSquare className="h-4 w-4 mr-2" />
                Envoyer un message
              </button>

              <button className="w-full flex items-center justify-center px-4 py-3 border border-purple-300 text-sm font-medium rounded-2xl text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
                <Calendar className="h-4 w-4 mr-2" />
                Voir le planning
              </button>

              <button className="w-full flex items-center justify-center px-4 py-3 border border-green-300 text-sm font-medium rounded-2xl text-green-700 bg-green-50 hover:bg-green-100 transition-all">
                <BookOpen className="h-4 w-4 mr-2" />
                Voir les programmes
              </button>
            </div>
          </div>

          {/* Liens externes */}
          {expertData.linkedin_url && (
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Liens externes
              </h3>
              <a
                href={expertData.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 py-3 border border-blue-300 text-sm font-medium rounded-2xl text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                Voir LinkedIn
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ExpertInfoDisplay({ expertData }: { expertData: any }) {
  return (
    <div className="space-y-8">
      {/* Informations personnelles */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
            <label className="text-sm font-medium text-gray-500">Prénom</label>
            <p className="text-lg font-semibold text-gray-900">{expertData.user?.first_name}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
            <label className="text-sm font-medium text-gray-500">Nom</label>
            <p className="text-lg font-semibold text-gray-900">{expertData.user?.last_name}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
            <label className="text-sm font-medium text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              Email
            </label>
            <p className="text-lg font-semibold text-gray-900">{expertData.user?.email}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
            <label className="text-sm font-medium text-gray-500 flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              Téléphone
            </label>
            <p className="text-lg font-semibold text-gray-900">{expertData.user?.phone || "Non renseigné"}</p>
          </div>
        </div>
      </div>

      {/* Informations professionnelles */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Informations professionnelles
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
            <label className="text-sm font-medium text-gray-500">Spécialisation</label>
            <p className="text-lg font-semibold text-gray-900">{expertData.specialization}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
              <label className="text-sm font-medium text-gray-500">Années d'expérience</label>
              <p className="text-lg font-semibold text-gray-900">{expertData.years_of_experience || 0} années</p>
            </div>
            {expertData.hourly_rate && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Tarif horaire
                </label>
                <p className="text-lg font-semibold text-gray-900">{expertData.hourly_rate.toLocaleString()} FCFA/h</p>
              </div>
            )}
          </div>

          {expertData.bio && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
              <label className="text-sm font-medium text-gray-500 flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                Biographie
              </label>
              <p className="text-base text-gray-900 mt-2 leading-relaxed">{expertData.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-600",
    green: "from-green-500 to-green-600 text-green-600",
    purple: "from-purple-500 to-purple-600 text-purple-600",
    yellow: "from-yellow-500 to-yellow-600 text-yellow-600",
    orange: "from-orange-500 to-orange-600 text-orange-600",
    teal: "from-teal-500 to-teal-600 text-teal-600",
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