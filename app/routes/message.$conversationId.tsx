// app/routes/messages.$conversationId.tsx - VERSION CORRIGÉE
import { useState, useEffect, useRef } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { MessageBubble, MessageGroup, DateSeparator, SystemMessageBubble } from "~/components/messages/MessageBubble";
import { MessageInput } from "~/components/messages/MessageInput";
import { UserTypeBadge } from "~/components/messages/UserTypeBadge";
import { requireUser } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getExpertNavigation } from "~/utils/expert-navigation";
import { getEntrepreneurNavigation } from "~/utils/entrepreneur-navigation";
// SUPPRESSION DE L'IMPORT CÔTÉ CLIENT
// import { messagesServerAPI } from "~/utils/api.server";
import { getUserSession } from "~/utils/session.server";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical,
  Users,
  Star,
  Archive,
  Bell,
  BellOff,
  Search,
  Trash2,
  Info,
  Settings,
  UserPlus
} from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user } = await requireUser(request);
  const session = await getUserSession(request);
  const conversationId = params.conversationId;
  
  if (!session || !conversationId) {
    throw new Error("Session ou ID de conversation introuvable");
  }

  try {
    const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

    // Récupérer les messages de la conversation
    const messagesResponse = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}?skip=0&limit=100`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    const messages = messagesResponse.ok ? await messagesResponse.json() : [];

    // Récupérer toutes les conversations pour trouver la conversation actuelle
    const conversationsResponse = await fetch(`${API_BASE_URL}/messages/conversations/?include_archived=false&limit=100`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    const conversations = conversationsResponse.ok ? await conversationsResponse.json() : [];

    // Trouver la conversation actuelle
    const currentConversation = conversations.find((conv: any) => 
      conv.conversation_key === conversationId || conv.conversation_id === conversationId
    );

    if (!currentConversation) {
      return json({
        user,
        messages: [],
        conversation: null,
        conversationId,
        error: "Conversation introuvable"
      });
    }

    // Marquer comme lue
    try {
      await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.token}` }
      });
    } catch (error) {
      console.log("Impossible de marquer comme lu");
    }

    return json({ 
      user, 
      messages: messages || [],
      conversation: currentConversation,
      conversationId
    });
  } catch (error) {
    console.error("Erreur lors du chargement de la conversation:", error);
    return json({ 
      user, 
      messages: [],
      conversation: null,
      conversationId,
      error: "Erreur lors du chargement de la conversation"
    });
  }
}

export default function ConversationPage() {
  const { user, messages: initialMessages, conversation, conversationId, error } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();

  // États locaux
  const [messages, setMessages] = useState(initialMessages);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  // Scroll vers le bas quand nouveaux messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Gestion de l'erreur
  if (error) {
    return (
      <Layout user={user} title="Erreur" navigation={navigation}>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Conversation introuvable</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/messages')}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
            >
              Retour aux messages
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!conversation) {
    return (
      <Layout user={user} title="Chargement..." navigation={navigation}>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Obtenir les autres participants
  const otherParticipants = conversation.participants?.filter(
    (p: any) => p.user_id !== user.user_id
  ) || [];

  // Titre de la conversation
  const conversationTitle = conversation.title || 
    otherParticipants.map((p: any) => p.name).join(', ') || 'Conversation';

  // Envoyer un message - UTILISATION DE FETCH
  const handleSendMessage = async (messageText: string, attachments?: File[]) => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      
      if (attachments && attachments.length > 0) {
        // Envoyer avec pièces jointes
        const formData = new FormData();
        formData.append('message_text', messageText);
        formData.append('conversation_id', conversationId);
        
        if (replyingTo) {
          formData.append('parent_message_id', replyingTo.message_id);
        }

        attachments.forEach((file) => {
          formData.append('files', file);
        });

        const response = await fetch('https://nuku-api.onrender.com/api/v1/messages/with-attachment', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setMessages(prev => [...prev, result]);
        } else {
          throw new Error('Erreur lors de l\'envoi avec pièces jointes');
        }
      } else {
        // Message texte simple
        const messageData = {
          receiver_id: otherParticipants[0]?.user_id || null,
          message_text: messageText,
          parent_message_id: replyingTo?.message_id || null
        };

        const response = await fetch('https://nuku-api.onrender.com/api/v1/messages/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        });

        if (response.ok) {
          const result = await response.json();
          setMessages(prev => [...prev, result]);
        } else {
          throw new Error('Erreur lors de l\'envoi du message');
        }
      }

      setReplyingTo(null);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      alert("Erreur lors de l'envoi du message");
    }
  };

  // Répondre à un message
  const handleReply = (message: any) => {
    setReplyingTo(message);
  };

  // Modifier un message
  const handleEdit = async (message: any) => {
    const newText = prompt("Modifier le message:", message.message_text);
    if (newText && newText !== message.message_text) {
      try {
        const token = localStorage.getItem('auth_token') || '';
        const response = await fetch(`https://nuku-api.onrender.com/api/v1/messages/${message.message_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message_text: newText
          }),
        });

        if (response.ok) {
          // Mettre à jour localement
          setMessages(prev => prev.map(msg => 
            msg.message_id === message.message_id 
              ? { ...msg, message_text: newText, edit_count: (msg.edit_count || 0) + 1 }
              : msg
          ));
        } else {
          throw new Error('Erreur lors de la modification');
        }
      } catch (error) {
        console.error("Erreur lors de la modification:", error);
        alert("Erreur lors de la modification du message");
      }
    }
  };

  // Supprimer un message
  const handleDelete = async (messageId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      try {
        const token = localStorage.getItem('auth_token') || '';
        const response = await fetch(`https://nuku-api.onrender.com/api/v1/messages/${messageId}?delete_for_all=false`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Retirer localement
          setMessages(prev => prev.filter(msg => msg.message_id !== messageId));
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression du message");
      }
    }
  };

  // Ajouter une réaction
  const handleReact = async (messageId: string, emoji: string) => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const response = await fetch(`https://nuku-api.onrender.com/api/v1/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emoji: emoji,
          reaction_type: 'reaction'
        }),
      });

      if (response.ok) {
        // Mettre à jour localement (simplifié)
        setMessages(prev => prev.map(msg => 
          msg.message_id === messageId
            ? { 
                ...msg, 
                reactions: [...(msg.reactions || []), {
                  reaction_id: Date.now().toString(),
                  user_id: user.user_id,
                  user_name: `${user.first_name} ${user.last_name}`,
                  emoji: emoji,
                  reaction_type: 'reaction',
                  created_at: new Date().toISOString()
                }]
              }
            : msg
        ));
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la réaction:", error);
    }
  };

  // Indicateur de frappe
  const handleTypingIndicator = (isTyping: boolean) => {
    setIsTyping(isTyping);
    // Ici vous pouvez envoyer l'indicateur via WebSocket
  };

  // Grouper les messages par expéditeur et par jour
  const groupMessages = (messages: any[]) => {
    const groups: any[] = [];
    let currentGroup: any[] = [];
    let currentSender = null;
    let currentDate = null;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.sent_at).toDateString();
      
      // Ajouter séparateur de date si nécessaire
      if (currentDate !== messageDate) {
        if (currentGroup.length > 0) {
          groups.push({ type: 'messages', messages: currentGroup });
          currentGroup = [];
        }
        groups.push({ type: 'date', date: message.sent_at });
        currentDate = messageDate;
        currentSender = null;
      }

      // Messages système
      if (message.message_type === 'system') {
        if (currentGroup.length > 0) {
          groups.push({ type: 'messages', messages: currentGroup });
          currentGroup = [];
        }
        groups.push({ type: 'system', message });
        currentSender = null;
        return;
      }

      // Grouper par expéditeur
      if (currentSender !== message.sender_id || currentGroup.length >= 5) {
        if (currentGroup.length > 0) {
          groups.push({ type: 'messages', messages: currentGroup });
        }
        currentGroup = [message];
        currentSender = message.sender_id;
      } else {
        currentGroup.push(message);
      }

      // Ajouter le dernier groupe
      if (index === messages.length - 1 && currentGroup.length > 0) {
        groups.push({ type: 'messages', messages: currentGroup });
      }
    });

    return groups;
  };

  const messageGroups = groupMessages(messages);

  return (
    <Layout user={user} title={`Conversation - ${conversationTitle}`} navigation={navigation}>
      <div className="max-w-5xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        {/* En-tête de conversation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-t-3xl shadow-xl border border-white/50 border-b-0">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {/* Informations de gauche */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/messages')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                {/* Avatars des participants */}
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {otherParticipants.slice(0, 3).map((participant: any, index: number) => (
                      <div
                        key={participant.user_id}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg"
                        style={{ zIndex: 10 - index }}
                      >
                        {participant.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    ))}
                    {otherParticipants.length > 3 && (
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg">
                        +{otherParticipants.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 truncate max-w-64">
                      {conversationTitle}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500">
                        {conversation.participant_count || otherParticipants.length + 1} participant{(conversation.participant_count || otherParticipants.length + 1) !== 1 ? 's' : ''}
                      </p>
                      {otherParticipants.length === 1 && (
                        <UserTypeBadge userType={otherParticipants[0].user_type || 'user'} size="sm" />
                      )}
                      {isTyping && (
                        <div className="flex items-center space-x-1 text-teal-600">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs">En train d'écrire...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions de droite */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Rechercher dans la conversation"
                >
                  <Search className="h-5 w-5" />
                </button>
                
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Appel vocal"
                >
                  <Phone className="h-5 w-5" />
                </button>
                
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Appel vidéo"
                >
                  <Video className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => setShowConversationInfo(!showConversationInfo)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Informations de la conversation"
                >
                  <Info className="h-5 w-5" />
                </button>
                
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Plus d'options"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Barre de recherche */}
            {showSearch && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Rechercher dans cette conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 flex">
          {/* Messages principaux */}
          <div className={`${showConversationInfo ? 'flex-1' : 'w-full'} flex flex-col`}>
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-4"
            >
              {messageGroups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Début de la conversation
                  </h3>
                  <p className="text-gray-500">
                    C'est le début de votre conversation avec {conversationTitle}
                  </p>
                </div>
              ) : (
                messageGroups.map((group, index) => {
                  if (group.type === 'date') {
                    return <DateSeparator key={`date-${index}`} date={group.date} />;
                  }
                  
                  if (group.type === 'system') {
                    return <SystemMessageBubble key={`system-${index}`} message={group.message} />;
                  }
                  
                  if (group.type === 'messages') {
                    return (
                      <MessageGroup
                        key={`group-${index}`}
                        messages={group.messages}
                        currentUserId={user.user_id}
                        onReply={handleReply}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReact={handleReact}
                      />
                    );
                  }
                  
                  return null;
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="bg-white/80 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/50 border-t-0">
              <MessageInput
                onSendMessage={handleSendMessage}
                onSendTypingIndicator={handleTypingIndicator}
                placeholder={`Écrire à ${conversationTitle}...`}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                allowAttachments={true}
                allowVoiceMessages={false}
              />
            </div>
          </div>

          {/* Panneau d'informations */}
          {showConversationInfo && (
            <div className="w-80 bg-white/80 backdrop-blur-sm shadow-xl border-l border-white/50 overflow-y-auto">
              <ConversationInfoPanel 
                conversation={conversation}
                participants={conversation.participants || []}
                currentUser={user}
                onClose={() => setShowConversationInfo(false)}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Panneau d'informations de la conversation
function ConversationInfoPanel({ 
  conversation, 
  participants, 
  currentUser, 
  onClose 
}: {
  conversation: any;
  participants: any[];
  currentUser: any;
  onClose: () => void;
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Informations</h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          ×
        </button>
      </div>

      {/* Participants */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Participants ({participants.length})
        </h4>
        <div className="space-y-3">
          {participants.map((participant) => (
            <div key={participant.user_id} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center text-white font-bold text-sm">
                {participant.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{participant.name || 'Utilisateur'}</p>
                <div className="flex items-center space-x-2">
                  <UserTypeBadge userType={participant.user_type || 'user'} size="sm" />
                  {participant.user_id === currentUser.user_id && (
                    <span className="text-xs text-gray-500">(Vous)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
        </button>
        
        <button className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <Star className="h-5 w-5" />
          <span>Marquer la conversation</span>
        </button>
        
        <button className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <Archive className="h-5 w-5" />
          <span>Archiver</span>
        </button>
        
        <button className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
          <Trash2 className="h-5 w-5" />
          <span>Supprimer la conversation</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Statistiques</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Messages</span>
            <span>{conversation.message_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Créée le</span>
            <span>{new Date(conversation.created_at || Date.now()).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex justify-between">
            <span>Dernière activité</span>
            <span>{new Date(conversation.last_activity_at || Date.now()).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}