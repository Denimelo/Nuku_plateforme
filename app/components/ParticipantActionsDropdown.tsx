import { useState } from "react";
import { 
  MoreVertical, 
  Eye, 
  Edit,
  UserX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Clock
} from "lucide-react";

interface Participant {
  participant_id: string;
  completion_status: string;
  entrepreneur: {
    entrepreneur_id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    company_name: string;
  };
  enrollment_date: string;
  completion_date?: string;
}

interface ParticipantActionsDropdownProps {
  participant: Participant;
  programId: string;
  token: string;
  onStatusUpdate: () => void;
}

const STATUS_OPTIONS = [
  {
    value: "in_progress",
    label: "En cours",
    icon: Clock,
    color: "text-blue-700 bg-blue-50 hover:bg-blue-100",
    description: "Le participant suit activement le programme"
  },
  {
    value: "completed",
    label: "Terminé",
    icon: CheckCircle,
    color: "text-green-700 bg-green-50 hover:bg-green-100",
    description: "Le participant a terminé le programme avec succès"
  },
  {
    value: "dropped",
    label: "Abandonné",
    icon: XCircle,
    color: "text-red-700 bg-red-50 hover:bg-red-100",
    description: "Le participant a abandonné le programme"
  }
];

export default function ParticipantActionsDropdown({ 
  participant, 
  programId, 
  token, 
  onStatusUpdate 
}: ParticipantActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://nuku-api.onrender.com/api/v1/programs/${programId}/participants/${participant.entrepreneur.entrepreneur_id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ completion_status: newStatus })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la mise à jour du statut");
      }

      onStatusUpdate();
      setShowStatusModal(false);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://nuku-api.onrender.com/api/v1/programs/${programId}/participants/${participant.entrepreneur.entrepreneur_id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la suppression du participant");
      }

      onStatusUpdate();
      setShowRemoveModal(false);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = STATUS_OPTIONS.find(status => status.value === participant.completion_status);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Actions"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
        
        {isOpen && (
          <>
            {/* Overlay pour fermer le menu */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 z-20">
              <div className="p-2">
                <button
                  onClick={() => {
                    // TODO: Implémenter la vue détaillée du participant
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le profil
                </button>
                
                <button
                  onClick={() => {
                    setShowStatusModal(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-xl"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier le statut
                </button>
                
                <button
                  onClick={() => {
                    // TODO: Implémenter l'envoi de message
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-xl"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Envoyer un message
                </button>
                
                <button
                  onClick={() => {
                    // TODO: Implémenter le rapport individuel
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-xl"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport individuel
                </button>
                
                <hr className="my-2" />
                
                <button
                  onClick={() => {
                    setShowRemoveModal(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-xl"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Retirer du programme
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de changement de statut */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-4 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Modifier le statut</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Informations du participant */}
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <h4 className="font-bold text-gray-900">
                  {participant.entrepreneur.user.first_name} {participant.entrepreneur.user.last_name}
                </h4>
                <p className="text-sm text-gray-500">{participant.entrepreneur.company_name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Inscrit le {new Date(participant.enrollment_date).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Statut actuel */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut actuel
                </label>
                <div className={`flex items-center p-3 rounded-xl ${currentStatus?.color}`}>
                  {currentStatus && <currentStatus.icon className="h-4 w-4 mr-2" />}
                  <span className="font-medium">{currentStatus?.label}</span>
                </div>
              </div>

              {/* Nouveau statut */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nouveau statut
                </label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.filter(option => option.value !== participant.completion_status).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      disabled={loading}
                      className={`w-full flex items-start p-3 text-left rounded-xl transition-all ${option.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option.icon className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm opacity-80">{option.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center text-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Retirer du programme</h3>
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Informations du participant */}
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <h4 className="font-bold text-gray-900">
                  {participant.entrepreneur.user.first_name} {participant.entrepreneur.user.last_name}
                </h4>
                <p className="text-sm text-gray-500">{participant.entrepreneur.company_name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Inscrit le {new Date(participant.enrollment_date).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Avertissement */}
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900 mb-1">Action irréversible</p>
                    <p className="text-sm text-red-700">
                      Cette action retirera définitivement le participant du programme. 
                      Toutes ses données de progression seront conservées mais il ne pourra 
                      plus accéder au contenu du programme.
                    </p>
                  </div>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center text-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRemoveParticipant}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Suppression...
                    </div>
                  ) : (
                    "Retirer du programme"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}