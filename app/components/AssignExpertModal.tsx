import { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  UserPlus, 
  CheckCircle, 
  AlertCircle,
  Users,
  Star,
  Briefcase,
  Globe
} from "lucide-react";

interface Expert {
  expert_id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  specialization: string;
  years_of_experience?: number;
  bio?: string;
  is_active: boolean;
}

interface AssignExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programName: string;
  token: string;
  onSuccess: () => void;
  assignedExperts?: string[]; // IDs des experts déjà assignés
}

const EXPERT_ROLES = [
  { value: "mentor", label: "Mentor", description: "Accompagnement personnalisé des entrepreneurs" },
  { value: "instructor", label: "Instructeur", description: "Création et animation de contenus pédagogiques" },
  { value: "evaluator", label: "Évaluateur", description: "Évaluation des devoirs et projets" },
  { value: "advisor", label: "Conseiller", description: "Conseil stratégique et expertise métier" },
  { value: "speaker", label: "Intervenant", description: "Conférences et présentations ponctuelles" }
];

export default function AssignExpertModal({ 
  isOpen, 
  onClose, 
  programId, 
  programName, 
  token, 
  onSuccess,
  assignedExperts = []
}: AssignExpertModalProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedRole, setSelectedRole] = useState("mentor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Charger la liste des experts disponibles
  useEffect(() => {
    if (isOpen) {
      loadExperts();
    }
  }, [isOpen]);

  // Filtrer les experts selon le terme de recherche
  useEffect(() => {
    if (!searchTerm) {
      // Exclure les experts déjà assignés
      setFilteredExperts(experts.filter(expert => 
        !assignedExperts.includes(expert.expert_id) && expert.is_active
      ));
    } else {
      const filtered = experts.filter(expert => {
        const fullName = `${expert.user.first_name} ${expert.user.last_name}`.toLowerCase();
        const specialization = expert.specialization?.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();
        
        return !assignedExperts.includes(expert.expert_id) && 
               expert.is_active &&
               (fullName.includes(searchLower) || 
                specialization.includes(searchLower) ||
                expert.user.email.toLowerCase().includes(searchLower));
      });
      setFilteredExperts(filtered);
    }
  }, [searchTerm, experts, assignedExperts]);

  const loadExperts = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://nuku-api.onrender.com/api/v1/admin/experts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Erreur lors du chargement des experts");
      
      const data = await response.json();
      setExperts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExpert = async () => {
    if (!selectedExpert) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`https://nuku-api.onrender.com/api/v1/programs/${programId}/experts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          expert_id: selectedExpert.expert_id,
          role: selectedRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de l'assignation");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedExpert(null);
    setSelectedRole("mentor");
    setSearchTerm("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Assigner un expert</h2>
                <p className="text-purple-100">Programme: {programName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Message de succès */}
          {success && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                <p className="text-sm text-green-700">Expert assigné avec succès !</p>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* Barre de recherche */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un expert par nom, spécialisation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Liste des experts */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Experts disponibles ({filteredExperts.length})
                  </h3>
                  
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-2xl"></div>
                      ))}
                    </div>
                  ) : filteredExperts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun expert disponible</p>
                      {assignedExperts.length > 0 && (
                        <p className="text-sm mt-1">Tous les experts actifs sont déjà assignés</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredExperts.map((expert) => (
                        <div
                          key={expert.expert_id}
                          onClick={() => setSelectedExpert(expert)}
                          className={`p-4 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-md ${
                            selectedExpert?.expert_id === expert.expert_id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {expert.user.first_name[0]}{expert.user.last_name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900">
                                {expert.user.first_name} {expert.user.last_name}
                              </h4>
                              <p className="text-sm text-purple-600 font-medium">
                                {expert.specialization}
                              </p>
                              {expert.years_of_experience && (
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {expert.years_of_experience} ans d'expérience
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">{expert.user.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Configuration du rôle */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Rôle dans le programme
                  </h3>

                  {selectedExpert ? (
                    <div className="space-y-4">
                      {/* Expert sélectionné */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            {selectedExpert.user.first_name[0]}{selectedExpert.user.last_name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {selectedExpert.user.first_name} {selectedExpert.user.last_name}
                            </h4>
                            <p className="text-sm text-purple-600">{selectedExpert.specialization}</p>
                          </div>
                        </div>
                        {selectedExpert.bio && (
                          <p className="text-sm text-gray-600 bg-white/60 p-3 rounded-xl">
                            {selectedExpert.bio}
                          </p>
                        )}
                      </div>

                      {/* Sélection du rôle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Choisir le rôle *
                        </label>
                        <div className="space-y-2">
                          {EXPERT_ROLES.map((role) => (
                            <label key={role.value} className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="role"
                                value={role.value}
                                checked={selectedRole === role.value}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="mt-1 text-purple-600 focus:ring-purple-500"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{role.label}</p>
                                <p className="text-sm text-gray-500">{role.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Bouton d'assignation */}
                      <button
                        onClick={handleAssignExpert}
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        {loading ? "Assignation..." : "Assigner cet expert"}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Sélectionnez un expert pour configurer son rôle</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}