// app/components/messages/MessageBubble.tsx
import { useState } from "react";
import { UserTypeBadge } from "./UserTypeBadge";
import { 
  MoreVertical, 
  Reply, 
  Edit3, 
  Trash2, 
  Copy, 
  Star,
  Download,
  ExternalLink,
  Image,
  FileText,
  Film,
  Music,
  Archive,
  Check,
  CheckCheck
} from "lucide-react";

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  currentUserId: string;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onReply?: (message: any) => void;
  onEdit?: (message: any) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  currentUserId,
  showAvatar = true,
  showTimestamp = true,
  onReply,
  onEdit,
  onDelete,
  onReact
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    
    return date.toLocaleString('fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return Image;
    if (contentType.startsWith('video/')) return Film;
    if (contentType.startsWith('audio/')) return Music;
    if (contentType.includes('pdf')) return FileText;
    if (contentType.includes('zip') || contentType.includes('rar')) return Archive;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const commonReactions = ['👍', '❤️', '😊', '😂', '👏', '🔥'];

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(message.message_id, emoji);
    }
    setShowReactions(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.message_text);
      // Optionnel: afficher une notification de succès
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}>
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {message.sender_name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Bulle de message */}
        <div className="relative">
          {/* Actions rapides */}
          <div className={`absolute -top-6 ${isOwn ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}>
            <div className="flex items-center space-x-1 bg-white shadow-lg rounded-lg px-2 py-1 border">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Réagir"
              >
                😊
              </button>
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Répondre"
                >
                  <Reply className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Plus d'actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Menu des réactions */}
          {showReactions && (
            <div className={`absolute -top-12 ${isOwn ? 'left-0' : 'right-0'} bg-white shadow-lg rounded-lg p-2 border z-20`}>
              <div className="flex space-x-1">
                {commonReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menu d'actions */}
          {showActions && (
            <div className={`absolute top-8 ${isOwn ? 'left-0' : 'right-0'} bg-white shadow-lg rounded-lg border py-1 z-20 min-w-40`}>
              <button
                onClick={copyToClipboard}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copier</span>
              </button>
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Reply className="h-4 w-4" />
                  <span>Répondre</span>
                </button>
              )}
              <button
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Star className="h-4 w-4" />
                <span>Marquer</span>
              </button>
              {isOwn && onEdit && (
                <button
                  onClick={() => onEdit(message)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
              )}
              {isOwn && onDelete && (
                <button
                  onClick={() => onDelete(message.message_id)}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </button>
              )}
            </div>
          )}

          {/* Contenu principal du message */}
          <div
            className={`px-4 py-2 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
            }`}
          >
            {/* En-tête avec nom et badge (pour messages non-own) */}
            {!isOwn && (
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  {message.sender_name}
                </span>
                <UserTypeBadge userType={message.sender_type || 'user'} size="sm" />
              </div>
            )}

            {/* Réponse à un autre message */}
            {message.parent_message_id && message.parent_message && (
              <div className={`mb-2 pl-3 border-l-2 ${isOwn ? 'border-white/30' : 'border-gray-300'}`}>
                <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                  Réponse à {message.parent_message.sender_name}
                </p>
                <p className={`text-sm ${isOwn ? 'text-white/80' : 'text-gray-600'} truncate`}>
                  {message.parent_message.message_text}
                </p>
              </div>
            )}

            {/* Texte du message */}
            <div className="break-words">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.message_text}
              </p>
            </div>

            {/* Pièces jointes */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.attachments.map((attachment: any) => {
                  const FileIcon = getFileIcon(attachment.content_type);
                  
                  if (attachment.is_image) {
                    return (
                      <div key={attachment.attachment_id} className="relative group">
                        <img
                          src={attachment.file_url}
                          alt={attachment.original_file_name}
                          className="max-w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(attachment.file_url, '_blank')}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => window.open(attachment.file_url, '_blank')}
                            className="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={attachment.attachment_id}
                      className={`flex items-center space-x-3 p-2 rounded-lg ${
                        isOwn ? 'bg-white/20' : 'bg-gray-50'
                      } hover:bg-opacity-80 transition-colors cursor-pointer`}
                      onClick={() => window.open(attachment.file_url, '_blank')}
                    >
                      <FileIcon className={`h-8 w-8 ${isOwn ? 'text-white' : 'text-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isOwn ? 'text-white' : 'text-gray-900'
                        }`}>
                          {attachment.original_file_name}
                        </p>
                        <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                          {formatFileSize(attachment.file_size)}
                        </p>
                      </div>
                      <Download className={`h-4 w-4 ${isOwn ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Réactions existantes */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.reactions.map((reaction: any) => (
                  <button
                    key={reaction.reaction_id}
                    onClick={() => handleReaction(reaction.emoji)}
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                      reaction.user_id === currentUserId
                        ? isOwn 
                          ? 'bg-white/30 text-white' 
                          : 'bg-teal-100 text-teal-700'
                        : isOwn 
                          ? 'bg-white/20 text-white/80 hover:bg-white/30' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={reaction.user_name}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-xs">1</span>
                  </button>
                ))}
              </div>
            )}

            {/* Métadonnées en bas */}
            <div className={`flex items-center justify-between mt-2 text-xs ${
              isOwn ? 'text-white/70' : 'text-gray-500'
            }`}>
              {/* Timestamp */}
              {showTimestamp && (
                <span>{formatTimestamp(message.sent_at)}</span>
              )}

              {/* Statut de lecture pour les messages envoyés */}
              {isOwn && (
                <div className="flex items-center space-x-1">
                  {message.status === 'delivered' && (
                    <Check className="h-3 w-3" />
                  )}
                  {message.status === 'read' && (
                    <CheckCheck className="h-3 w-3" />
                  )}
                  {message.edit_count > 0 && (
                    <span className="text-xs opacity-70">(modifié)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Flèche de la bulle */}
          <div className={`absolute top-2 ${
            isOwn 
              ? 'right-0 transform translate-x-1/2' 
              : 'left-0 transform -translate-x-1/2'
          }`}>
            <div className={`w-0 h-0 ${
              isOwn
                ? 'border-l-8 border-l-teal-500 border-t-4 border-t-transparent border-b-4 border-b-transparent'
                : 'border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent'
            }`} />
          </div>
        </div>
      </div>

      {/* Overlay pour fermer les menus */}
      {(showActions || showReactions) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowActions(false);
            setShowReactions(false);
          }}
        />
      )}
    </div>
  );
}

// Composant pour les messages système
export function SystemMessageBubble({ message }: { message: any }) {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full max-w-xs text-center">
        {message.message_text}
      </div>
    </div>
  );
}

// Composant pour grouper les messages du même expéditeur
export function MessageGroup({ 
  messages, 
  currentUserId, 
  onReply, 
  onEdit, 
  onDelete, 
  onReact 
}: {
  messages: any[];
  currentUserId: string;
  onReply?: (message: any) => void;
  onEdit?: (message: any) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}) {
  const isOwn = messages[0]?.sender_id === currentUserId;
  
  return (
    <div className="space-y-1">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.message_id}
          message={message}
          isOwn={isOwn}
          currentUserId={currentUserId}
          showAvatar={index === messages.length - 1} // Avatar seulement sur le dernier message du groupe
          showTimestamp={index === messages.length - 1} // Timestamp seulement sur le dernier message du groupe
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onReact={onReact}
        />
      ))}
    </div>
  );
}

// Composant pour les séparateurs de date
export function DateSeparator({ date }: { date: string }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="flex items-center justify-center my-6">
      <div className="bg-gray-100 text-gray-500 text-sm px-4 py-1 rounded-full">
        {formatDate(date)}
      </div>
    </div>
  );
}