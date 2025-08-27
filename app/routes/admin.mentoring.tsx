import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation, useFetcher } from "@remix-run/react";
import { useState } from "react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { mentoringServerAPI, adminServerAPI } from "~/utils/api.server";
import { 
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  try {
    const [mentoringStats, experts, entrepreneurs] = await Promise.all([
      mentoringServerAPI.getStats(session.token).catch(() => ({})),
      adminServerAPI.getExperts(session.token).catch(() => []),
      adminServerAPI.getEntrepreneurs(session.token).catch(() => [])
    ]);

    return json({ 
      user, 
      mentoringStats: mentoringStats || {},
      experts: experts || [],
      entrepreneurs: entrepreneurs || []
    });
  } catch (error) {
    console.error("Erreur lors du chargement du mentorat:", error);
    return json({ 
      user, 
      mentoringStats: {},
      experts: [],
      entrepreneurs: [],
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

  if (action === 'assign_mentor') {
    const expertId = formData.get('expert_id') as string;
    const entrepreneurId = formData.get('entrepreneur_id') as string;

    try {
      const result = await mentoringServerAPI.assignMentor(session.token, expertId, entrepreneurId);
      return json({ 
        success: true, 
        message: `Mentor assigné avec succès`,
        data: result
      });
    } catch (error) {
      return json({ 
        error: `Erreur lors de l'assignation: ${error}` 
      }, { status: 400 });
    }
  }

  if (action === 'complete_mentoring') {
    const mentoringId = formData.get('mentoring_id') as string;

    try {
      const result = await mentoringServerAPI.completeMentoring(session.token, mentoringId);
      return json({ 
        success: true, 
        message: `Relation de mentorat terminée`,
        data: result
      });
    } catch (error) {
      return json({ 
        error: `Erreur lors de la completion: ${error}` 
      }, { status: 400 });
    }
  }

  return json({ error: "Action non reconnue" }, { status: 400 });
}

export default function AdminMentoring() {
  const { user, mentoringStats, experts, entrepreneurs, error } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = getAdminNavigation(location.pathname);
  const fetcher = useFetcher();

  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les entrepreneurs non assignés ou avec formation non terminée
  const availableEntrepreneurs = entrepreneurs.filter((entrepreneur: any) => 
    entrepreneur.validation_status === 'approved' &&
    (!entrepreneur.mentoring_status || entrepreneur.mentoring_status === 'available')
  );

  // Filtrer les experts avec moins de 3 mentorés
  const availableExperts = experts.filter((expert: any) => 
    expert.is_active && (expert.active_mentees_count || 0) < 3
  );

  const handleAssignMentor = () => {
    if (!selectedExpert || !selectedEntrepreneur) return;

    const formData = new FormData();
    formData.append('_action', 'assign_mentor');
    formData.append('expert_id', selectedExpert.expert_id);
    formData.append('entrepreneur_id', selectedEntrepreneur.entrepreneur_id);
    
    fetcher.submit(formData, { method: 'post' });
    
    // Reset selections
    setSelectedExpert(null);
    setSelectedEntrepreneur(null);
  };

  return (
    <Layout user={user} title="Gestion du Mentorat" navigation={navigation}>
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">
              Gestion du Mentorat
            </h1>
            <p className="text-xl text-slate-200">
              Assignez et gérez les relations mentor-entrepreneur
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {fetcher.data?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          {fetcher.data.message}
        </div>
      )}

      {fetcher.data?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {fetcher.data.error}
        </div>
      )}

      {/* Statistiques du mentorat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Experts totaux"
          value={mentoringStats.total_experts || 0}
          subtitle={`${mentoringStats.experts_available || 0} disponibles`}
          icon={Shield}
          color="blue"
        />
        <StatCard
          title="Relations actives"
          value={mentoringStats.total_active_mentorings || 0}
          subtitle="En cours"
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Taux d'utilisation"
          value={`${mentoringStats.utilization_rate || 0}%`}
          subtitle="Des experts"
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="Relations terminées"
          value={mentoringStats.total_completed_mentorings || 0}
          subtitle="Formations complétées"
          icon={CheckCircle2}
          color="orange"
        />
      </div>

      {/* Section d'assignation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Sélection expert */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <Shield className="h-6 w-6 mr-3 text-blue-600" />
            Choisir un expert
          </h3>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {availableExperts.map((expert: any) => (
              <div
                key={expert.expert_id}
                onClick={() => setSelectedExpert(expert)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedExpert?.expert_id === expert.expert_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {expert.user?.first_name} {expert.user?.last_name}
                    </p>
                    <p className="text-sm text-slate-600">{expert.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">
                      {expert.active_mentees_count || 0}/3
                    </p>
                    <p className="text-xs text-slate-500">mentorés</p>
                  </div>
                </div>
              </div>
            ))}
            
            {availableExperts.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun expert disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Sélection entrepreneur */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <Users className="h-6 w-6 mr-3 text-green-600" />
            Choisir un entrepreneur
          </h3>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {availableEntrepreneurs
              .filter((entrepreneur: any) => 
                searchTerm === "" || 
                `${entrepreneur.user?.first_name} ${entrepreneur.user?.last_name} ${entrepreneur.company_name}`
                  .toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((entrepreneur: any) => (
              <div
                key={entrepreneur.entrepreneur_id}
                onClick={() => setSelectedEntrepreneur(entrepreneur)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedEntrepreneur?.entrepreneur_id === entrepreneur.entrepreneur_id
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {entrepreneur.user?.first_name} {entrepreneur.user?.last_name}
                  </p>
                  <p className="text-sm text-slate-600">{entrepreneur.company_name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {entrepreneur.industry_sector}
                  </p>
                </div>
              </div>
            ))}
            
            {availableEntrepreneurs.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun entrepreneur disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel d'assignation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <UserPlus className="h-6 w-6 mr-3 text-purple-600" />
            Assigner
          </h3>
          
          {selectedExpert && selectedEntrepreneur ? (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-4">Assignation proposée:</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm">
                      <strong>Expert:</strong> {selectedExpert.user?.first_name} {selectedExpert.user?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">
                      <strong>Entrepreneur:</strong> {selectedEntrepreneur.user?.first_name} {selectedEntrepreneur.user?.last_name}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleAssignMentor}
                disabled={fetcher.state !== 'idle'}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetcher.state === 'submitting' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Assignation...
                  </div>
                ) : (
                  'Assigner le mentor'
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Sélectionnez d'abord</p>
              <p className="text-sm">un expert et un entrepreneur</p>
            </div>
          )}
        </div>
      </div>

      {/* Répartition de la charge de travail */}
      {mentoringStats.workload_distribution && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Répartition de la charge de travail
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(mentoringStats.workload_distribution).map(([key, value]) => (
              <div key={key} className="text-center p-6 bg-slate-50 rounded-2xl">
                <p className="text-3xl font-bold text-slate-800 mb-2">{value as number}</p>
                <p className="text-sm text-slate-600 capitalize">
                  {key.replace('_', ' ').replace('mentees', 'mentorés').replace('mentee', 'mentoré')}
                </p>
                <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${((value as number) / Math.max(mentoringStats.total_experts || 1, 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des experts et leurs mentorés */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800">
            Experts et leurs mentorés
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">
              {experts.length} experts au total
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert: any) => (
            <ExpertCard
              key={expert.expert_id}
              expert={expert}
              onViewDetails={() => {
                // Implémenter la vue détaillée si nécessaire
                console.log('Voir détails expert:', expert.expert_id);
              }}
            />
          ))}
          
          {experts.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Aucun expert trouvé</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ExpertCard({ expert, onViewDetails }: { expert: any; onViewDetails: () => void }) {
  const menteesCount = expert.active_mentees_count || 0;
  const maxMentees = 3;
  const isAvailable = menteesCount < maxMentees;

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 text-lg">
            {expert.user?.first_name} {expert.user?.last_name}
          </h4>
          <p className="text-sm text-slate-600 mb-2">{expert.specialization}</p>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isAvailable ? 'Disponible' : 'Complet'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-800">{menteesCount}</p>
          <p className="text-xs text-slate-500">/{maxMentees} mentorés</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">Charge de travail</span>
          <span className="font-semibold">{Math.round((menteesCount / maxMentees) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              menteesCount === 0 ? 'bg-gray-300' :
              menteesCount < 2 ? 'bg-gradient-to-r from-green-400 to-green-500' :
              menteesCount < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
              'bg-gradient-to-r from-red-400 to-red-500'
            }`}
            style={{ width: `${(menteesCount / maxMentees) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          <span>{expert.years_of_experience || 0} ans d'exp.</span>
        </div>
        <button
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
        >
          Détails
        </button>
      </div>
    </div>
  );
}