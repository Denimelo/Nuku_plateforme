// app/routes/messages.tsx
import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { ConversationList } from "~/components/messages/ConversationList";
import { MessageInput } from "~/components/messages/MessageInput";
import { UserTypeBadge } from "~/components/messages/UserTypeBadge";
import { requireUser } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getExpertNavigation } from "~/utils/expert-navigation";
import { getEntrepreneurNavigation } from "~/utils/entrepreneur-navigation";
import { messagesServerAPI, expertsServerAPI, entrepreneursServerAPI } from "~/utils/api.server";
import { getUserSession } from "~/utils/session.server";
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter,
  Users,
  Send,
  Paperclip,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  UserPlus,
  Settings
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireUser(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  try {
    // Récupérer les conversations et données selon le rôle
    const [conversations, messagingSummary, unreadCount] = await Promise.all([
      messagesServerAPI.getConversations(session.token, false, 50),
      messagesServerAPI.getMessagingSummary(session.token),
      messagesServerAPI.getUnreadCount(session.token),
    ]);

    // Données spécifiques au rôle pour démarrer de nouvelles conversations
    let contactsList = [];
    
    if (user.user_type === 'expert') {
      // Les experts peuvent contacter leurs entrepreneurs
      const myEntrepreneurs = await expertsServerAPI.getMyEntrepreneurs(session.token);
      contactsList = myEntrepreneurs.map((entrepreneur: any) => ({
        id: entrepreneur.user_id,
        name: `${entrepreneur.user?.first_name} ${entrepreneur.user?.last_name}`,
        role: 'entrepreneur',
        company: entrepreneur.company_name,
        avatar: entrepreneur.user?.profile_picture_url
      }));
    } else if (user.user_type === 'entrepreneur') {
      // Les entrepreneurs peuvent contacter les experts de leurs programmes
      const availableExperts = await expertsServerAPI.getDirectory(session.token);
      contactsList = availableExperts.slice(0, 20).map((expert: any) => ({
        id: expert.user_id,
        name: `${expert.user?.first_name} ${expert.user?.last_name}`,
        role: 'expert',
        specialization: expert.specialization,
        avatar: expert.user?.profile_picture_url
      }));
    } else if (user.user_type === 'admin') {
      // Les admins peuvent contacter tous les utilisateurs (limité pour performance)
      contactsList = []; // À implémenter si nécessaire
    }

    return json({ 
      user, 
      conversations: conversations || [],
      messagingSummary: messagingSummary || { total_conversations: 0, unread_messages: 0, active_conversations: [], recent_messages: [] },
      unreadCount: unreadCount?.unread_count || 0,
      contactsList: contactsList || []
    });
  } catch (error) {
    console.error("Erreur lors du chargement des messages:", error);
    return json({ 
      user, 
      conversations: [],
      messagingSummary: { total_conversations: 0, unread_messages: 0, active_conversations: [], recent_messages: [] },
      unreadCount: 0,
      contactsList: []
    });
  }
}

export default function MessagesPage() {
  const { user, conversations, messagingSummary, unreadCount, contactsList } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation selon le rôle
  const getNavigation = () => {
    switch (user.user_type) {
      case 'admin':
        return getAdminNavigation(location.pathname);
      case 'expert':
        return getExpertNavigation(location.pathname);
      case 'entrepreneur':
        return getEntrepreneurNavigation(location.pathname);
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  // États locaux
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtrer les conversations
  const filteredConversations = conversations.filter((conv: any) => {
    const matchesSearch = searchQuery === "" || 
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants.some((p: any) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesUnread = !filterUnreadOnly || conv.unread_count > 0;
    
    return matchesSearch && matchesUnread;
  });

  // Démarrer nouvelle conversation
  const startNewConversation = async (contactId: string, initialMessage: string) => {
    setLoading(true);
    try {
      const response = await messagesServerAPI.startConversationWithEntrepreneur(
        localStorage.getItem('auth_token') || '',
        contactId,
        initialMessage
      );
      
      if (response.conversation_identifier) {
        navigate(`/messages/${response.conversation_identifier}`);
      }
      
      setShowNewMessageModal(false);
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  // Titre selon le rôle
  const getPageTitle = () => {
    switch (user.user_type) {
      case 'expert':
        return "Mes Messages - Communication avec les entrepreneurs";
      case 'entrepreneur':
        return "Mes Messages - Communication avec les experts";
      case 'admin':
        return "Messages - Gestion des communications";
      default:
        return "Messages";
    }
  };

  return (
    <Layout user={user} title="Messages" navigation={navigation}>
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec statistiques */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-800 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-4">Messages</h1>
                  <p className="text-xl text-slate-200 mb-6">
                    {getPageTitle()}
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      <MessageCircle className="h-4 w-4" />
                      <span>{messagingSummary.total_conversations} conversation{messagingSummary.total_conversations !== 1 ? 's' : ''}</span>
                    </div>
                    {unreadCount > 0 && (
                      <div className="flex items-center space-x-2 bg-red-500/20 backdrop-blur px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span>{unreadCount} non lu{unreadCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-2xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Nouveau message</span>
                  </button>
                  <UserTypeBadge userType={user.user_type} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-300px)]">
          {/* Liste des conversations */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            {/* Barre de recherche et filtres */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une conversation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl transition-colors ${
                    showFilters ? 'bg-teal-100 text-teal-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>

              {/* Filtres */}
              {showFilters && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filterUnreadOnly}
                      onChange={(e) => setFilterUnreadOnly(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">Messages non lus uniquement</span>
                  </label>
                </div>
              )}
            </div>

            {/* Liste des conversations */}
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
                currentUserId={user.user_id}
                userType={user.user_type}
              />
            </div>
          </div>

          {/* Zone de message principale */}
          <div className="lg:col-span-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            {selectedConversation ? (
              // Vue conversation sélectionnée
              <div className="h-full flex flex-col">
                {/* En-tête de conversation */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {selectedConversation.participants.slice(0, 3).map((participant: any, index: number) => (
                        <div
                          key={participant.user_id}
                          className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center text-white font-bold text-sm border-2 border-white"
                          style={{ zIndex: 10 - index }}
                        >
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {selectedConversation.title || 
                         selectedConversation.participants
                           .filter((p: any) => p.user_id !== user.user_id)
                           .map((p: any) => p.name)
                           .join(', ')
                        }
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.participants.length} participant{selectedConversation.participants.length !== 1 ? 's' : ''}
                        {selectedConversation.unread_count > 0 && (
                          <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                            {selectedConversation.unread_count} non lu{selectedConversation.unread_count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                      <Star className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                      <Archive className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/messages/${selectedConversation.conversation_key}`)}
                      className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors"
                    >
                      Ouvrir la conversation
                    </button>
                  </div>
                </div>

                {/* Messages récents (aperçu) */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {selectedConversation.last_message ? (
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Conversation avec {selectedConversation.participants
                          .filter((p: any) => p.user_id !== user.user_id)
                          .map((p: any) => p.name)
                          .join(', ')
                        }
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Dernier message: {selectedConversation.last_message.message_text}
                      </p>
                      <p className="text-sm text-gray-400 mb-6">
                        {new Date(selectedConversation.last_activity_at).toLocaleString('fr-FR')}
                      </p>
                      <button
                        onClick={() => navigate(`/messages/${selectedConversation.conversation_key}`)}
                        className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors"
                      >
                        Ouvrir la conversation complète
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nouvelle conversation
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Commencez à échanger avec {selectedConversation.participants
                          .filter((p: any) => p.user_id !== user.user_id)
                          .map((p: any) => p.name)
                          .join(', ')
                        }
                      </p>
                      <button
                        onClick={() => navigate(`/messages/${selectedConversation.conversation_key}`)}
                        className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors"
                      >
                        Démarrer la conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // État vide - aucune conversation sélectionnée
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md">
                    Choisissez une conversation dans la liste de gauche ou démarrez une nouvelle discussion.
                  </p>
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Nouveau message</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal nouveau message */}
        {showNewMessageModal && (
          <NewMessageModal
            contacts={contactsList}
            onClose={() => setShowNewMessageModal(false)}
            onSend={startNewConversation}
            loading={loading}
            currentUserType={user.user_type}
          />
        )}
      </div>
    </Layout>
  );
}

// Modal pour nouveau message
function NewMessageModal({ contacts, onClose, onSend, loading, currentUserType }: any) {
  const [selectedContact, setSelectedContact] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (selectedContact && message.trim()) {
      onSend(selectedContact, message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Nouveau message</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Sélection du destinataire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinataire
            </label>
            <select
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Sélectionner un contact</option>
              {contacts.map((contact: any) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} {contact.role === 'entrepreneur' && contact.company ? `(${contact.company})` : ''}
                  {contact.role === 'expert' && contact.specialization ? `(${contact.specialization})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedContact || !message.trim() || loading}
            className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{loading ? 'Envoi...' : 'Envoyer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}