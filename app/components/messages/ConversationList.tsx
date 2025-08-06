// app/components/messages/ConversationList.tsx
import { UserTypeBadge } from "./UserTypeBadge";
import { MessageCircle, Users, Pin } from "lucide-react";

interface ConversationListProps {
  conversations: any[];
  selectedConversation: any;
  onSelectConversation: (conversation: any) => void;
  currentUserId: string;
  userType: string;
}

export function ConversationList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  currentUserId,
  userType 
}: ConversationListProps) {
  
  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getOtherParticipants = (conversation: any) => {
    return conversation.participants.filter((p: any) => p.user_id !== currentUserId);
  };

  const getConversationTitle = (conversation: any) => {
    const otherParticipants = getOtherParticipants(conversation);
    
    if (conversation.title) {
      return conversation.title;
    }
    
    if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    }
    
    if (otherParticipants.length <= 3) {
      return otherParticipants.map((p: any) => p.name).join(', ');
    }
    
    return `${otherParticipants[0].name} +${otherParticipants.length - 1} autres`;
  };

  const getConversationSubtitle = (conversation: any) => {
    const otherParticipants = getOtherParticipants(conversation);
    
    if (conversation.conversation_type === 'group') {
      return `${conversation.participant_count} participants`;
    }
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return getUserTypeDescription(participant.user_type, participant);
    }
    
    return `${otherParticipants.length} participants`;
  };

  const getUserTypeDescription = (userType: string, participant: any) => {
    switch (userType) {
      case 'expert':
        return 'Expert';
      case 'entrepreneur':
        return 'Entrepreneur';
      case 'admin':
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  };

  const getLastMessagePreview = (conversation: any) => {
    if (!conversation.last_message) {
      return 'Aucun message';
    }

    const message = conversation.last_message;
    let preview = message.message_text;

    // Limiter la longueur
    if (preview.length > 60) {
      preview = preview.substring(0, 60) + '...';
    }

    // Préfixer avec l'expéditeur si ce n'est pas le current user
    if (message.sender_id !== currentUserId) {
      const sender = conversation.participants.find((p: any) => p.user_id === message.sender_id);
      if (sender) {
        const senderFirstName = sender.name.split(' ')[0];
        preview = `${senderFirstName}: ${preview}`;
      }
    } else {
      preview = `Vous: ${preview}`;
    }

    return preview;
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune conversation
        </h3>
        <p className="text-gray-500 text-sm">
          {userType === 'expert' && "Vos conversations avec les entrepreneurs apparaîtront ici"}
          {userType === 'entrepreneur' && "Vos conversations avec les experts apparaîtront ici"}
          {userType === 'admin' && "Vos conversations avec les utilisateurs apparaîtront ici"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => {
        const isSelected = selectedConversation?.conversation_id === conversation.conversation_id;
        const otherParticipants = getOtherParticipants(conversation);
        const hasUnread = conversation.unread_count > 0;
        
        return (
          <div
            key={conversation.conversation_id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
              isSelected ? 'bg-teal-50 border-r-4 border-teal-500' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar(s) */}
              <div className="flex-shrink-0 relative">
                {otherParticipants.length === 1 ? (
                  // Avatar simple
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center text-white font-bold shadow-lg">
                    {otherParticipants[0].name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  // Avatars multiples
                  <div className="w-12 h-12 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg">
                      {otherParticipants[0].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg">
                      {otherParticipants[1] ? otherParticipants[1].name.charAt(0).toUpperCase() : '?'}
                    </div>
                    {otherParticipants.length > 2 && (
                      <div className="absolute -top-1 right-0 w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold border border-white shadow-lg">
                        +{otherParticipants.length - 2}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Indicateur de statut en ligne */}
                {otherParticipants.length === 1 && otherParticipants[0].is_online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                )}

                {/* Badge de type de conversation */}
                {conversation.conversation_type === 'group' && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Contenu de la conversation */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-sm font-semibold truncate ${
                      hasUnread ? 'text-gray-900' : 'text-gray-800'
                    }`}>
                      {getConversationTitle(conversation)}
                    </h4>
                    
                    {/* Badge du type d'utilisateur pour conversations 1-1 */}
                    {otherParticipants.length === 1 && (
                      <UserTypeBadge 
                        userType={otherParticipants[0].user_type} 
                        size="sm"
                      />
                    )}
                    
                    {/* Indicateur de conversation épinglée */}
                    {conversation.is_pinned && (
                      <Pin className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Heure du dernier message */}
                    {conversation.last_activity_at && (
                      <span className="text-xs text-gray-400">
                        {formatLastMessageTime(conversation.last_activity_at)}
                      </span>
                    )}
                    
                    {/* Badge de messages non lus */}
                    {hasUnread && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sous-titre et aperçu du dernier message */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">
                      {getConversationSubtitle(conversation)}
                    </p>
                    <p className={`text-xs truncate ${
                      hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {getLastMessagePreview(conversation)}
                    </p>
                  </div>
                  
                  {/* Indicateurs d'attachement */}
                  {conversation.last_message?.attachments?.length > 0 && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="w-4 h-4 text-gray-400">
                        📎
                      </div>
                    </div>
                  )}
                </div>

                {/* Indicateur de frappe (si implémenté) */}
                {conversation.someone_typing && (
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-teal-600">En train d'écrire...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Barre de progression pour conversations de groupe (si nécessaire) */}
            {conversation.conversation_type === 'group' && conversation.total_messages > 50 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{conversation.message_count} messages</span>
                  <span>{conversation.participant_count} participants</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
