// app/components/messages/MessageInput.tsx
import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  Smile, 
  X, 
  Image,
  FileText,
  Mic,
  MicOff,
  Loader2
} from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string, attachments?: File[]) => Promise<void>;
  onSendTypingIndicator?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  allowAttachments?: boolean;
  allowVoiceMessages?: boolean;
  replyingTo?: any;
  onCancelReply?: () => void;
}

export function MessageInput({
  onSendMessage,
  onSendTypingIndicator,
  placeholder = "Tapez votre message...",
  disabled = false,
  maxLength = 1000,
  allowAttachments = true,
  allowVoiceMessages = false,
  replyingTo,
  onCancelReply
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Auto-resize du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Gestion de l'indicateur de frappe
  useEffect(() => {
    if (onSendTypingIndicator && message.trim() !== "") {
      onSendTypingIndicator(true);
      
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
      
      const timer = setTimeout(() => {
        onSendTypingIndicator(false);
      }, 2000);
      
      setTypingTimer(timer);
    }
    
    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [message, onSendTypingIndicator]);

  // Fermer l'emoji picker en cliquant dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSend = async () => {
    if ((message.trim() === "" && attachments.length === 0) || disabled || isSending) {
      return;
    }

    setIsSending(true);
    
    try {
      await onSendMessage(message.trim(), attachments);
      setMessage("");
      setAttachments([]);
      if (onCancelReply) onCancelReply();
      
      // Arrêter l'indicateur de frappe
      if (onSendTypingIndicator) {
        onSendTypingIndicator(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      // Optionnel: Afficher une notification d'erreur
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // Limiter à 10MB par fichier
      if (file.size > 10 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 fichiers
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + emoji + message.substring(end);
      setMessage(newMessage);
      
      // Repositionner le curseur
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    return FileText;
  };

  const commonEmojis = [
    '😊', '😂', '❤️', '👍', '👎', '😍', '😭', '😡', '🤔', '😎',
    '🔥', '💯', '👏', '🙏', '💪', '✅', '❌', '⭐', '🎉', '💡'
  ];

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Message de réponse */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Répondre à</span>
              <span className="font-semibold">{replyingTo.sender_name}</span>
            </div>
            <button
              onClick={onCancelReply}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 truncate mt-1">
            {replyingTo.message_text}
          </p>
        </div>
      )}

      {/* Pièces jointes sélectionnées */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2 text-sm"
                >
                  <FileIcon className="h-4 w-4 text-gray-500" />
                  <span className="truncate max-w-32">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    ({formatFileSize(file.size)})
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-end space-x-3">
          {/* Bouton pièces jointes */}
          {allowAttachments && (
            <div className="flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ajouter des fichiers"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Zone de saisie principale */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none border border-gray-200 rounded-2xl px-4 py-2 pr-12 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '40px' }}
              maxLength={maxLength}
            />
            
            {/* Compteur de caractères */}
            {message.length > maxLength * 0.8 && (
              <div className="absolute bottom-2 right-12 text-xs text-gray-400">
                {message.length}/{maxLength}
              </div>
            )}

            {/* Bouton emoji */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Insérer un emoji"
                >
                  <Smile className="h-5 w-5" />
                </button>

                {/* Picker d'emojis simple */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white shadow-lg rounded-lg border p-3 z-50">
                    <div className="grid grid-cols-5 gap-1 w-48">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="p-2 hover:bg-gray-100 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bouton d'enregistrement vocal */}
          {allowVoiceMessages && (
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsRecording(!isRecording)}
                disabled={disabled}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            </div>
          )}

          {/* Bouton d'envoi */}
          <div className="flex-shrink-0">
            <button
              onClick={handleSend}
              disabled={disabled || isSending || (message.trim() === "" && attachments.length === 0)}
              className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-600"
              title="Envoyer le message"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Messages d'aide */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>
            Appuyez sur Entrée pour envoyer, Maj+Entrée pour un saut de ligne
          </span>
          {(attachments.length > 0 || message.length > 0) && (
            <span>
              {attachments.length > 0 && `${attachments.length} fichier${attachments.length > 1 ? 's' : ''}`}
              {attachments.length > 0 && message.length > 0 && ' • '}
              {message.length > 0 && `${message.length} caractère${message.length > 1 ? 's' : ''}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Version compacte pour les réponses rapides
export function QuickMessageInput({ 
  onSend, 
  placeholder = "Réponse rapide...", 
  disabled = false 
}: {
  onSend: (message: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (message.trim() === "" || disabled || isSending) return;
    
    setIsSending(true);
    try {
      await onSend(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled || isSending}
        className="flex-1 border-none outline-none text-sm disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || isSending || message.trim() === ""}
        className="p-1 text-teal-600 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}