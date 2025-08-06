// app/components/messages/UserTypeBadge.tsx
import { Shield, User, Settings } from "lucide-react";

interface UserTypeBadgeProps {
  userType: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

export function UserTypeBadge({ 
  userType, 
  size = 'md', 
  showIcon = true, 
  showText = true 
}: UserTypeBadgeProps) {
  
  const getUserTypeConfig = () => {
    switch (userType) {
      case 'admin':
        return {
          label: 'Admin',
          fullLabel: 'Administrateur',
          icon: Settings,
          bgColor: 'bg-gradient-to-r from-red-500 to-pink-500',
          bgColorLight: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'expert':
        return {
          label: 'Expert',
          fullLabel: 'Expert',
          icon: Shield,
          bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
          bgColorLight: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200'
        };
      case 'entrepreneur':
        return {
          label: 'Entrepreneur',
          fullLabel: 'Entrepreneur',
          icon: User,
          bgColor: 'bg-gradient-to-r from-blue-500 to-teal-500',
          bgColorLight: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          label: 'Utilisateur',
          fullLabel: 'Utilisateur',
          icon: User,
          bgColor: 'bg-gradient-to-r from-gray-500 to-slate-500',
          bgColorLight: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-0.5 text-xs',
          icon: 'h-3 w-3',
          spacing: 'space-x-1'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-sm',
          icon: 'h-5 w-5',
          spacing: 'space-x-2'
        };
      default: // md
        return {
          container: 'px-3 py-1 text-xs',
          icon: 'h-4 w-4',
          spacing: 'space-x-1.5'
        };
    }
  };

  const config = getUserTypeConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;

  if (size === 'sm' && !showText) {
    // Version très compacte - juste un point coloré
    return (
      <div className={`w-2 h-2 rounded-full ${config.bgColor}`} title={config.fullLabel} />
    );
  }

  return (
    <div className={`
      inline-flex items-center rounded-full font-medium border
      ${config.bgColorLight} ${config.textColor} ${config.borderColor}
      ${sizeClasses.container} ${sizeClasses.spacing}
    `}>
      {showIcon && (
        <Icon className={`${sizeClasses.icon} flex-shrink-0`} />
      )}
      {showText && (
        <span className="truncate">
          {size === 'sm' ? config.label : config.fullLabel}
        </span>
      )}
    </div>
  );
}

// Version gradient pour les éléments plus importants (headers, profils, etc.)
export function UserTypeBadgeGradient({ 
  userType, 
  size = 'md', 
  showIcon = true, 
  showText = true 
}: UserTypeBadgeProps) {
  
  const getUserTypeConfig = () => {
    switch (userType) {
      case 'admin':
        return {
          label: 'Admin',
          fullLabel: 'Administrateur',
          icon: Settings,
          bgColor: 'bg-gradient-to-r from-red-500 to-pink-500',
          textColor: 'text-white'
        };
      case 'expert':
        return {
          label: 'Expert',
          fullLabel: 'Expert',
          icon: Shield,
          bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
          textColor: 'text-white'
        };
      case 'entrepreneur':
        return {
          label: 'Entrepreneur',
          fullLabel: 'Entrepreneur',
          icon: User,
          bgColor: 'bg-gradient-to-r from-blue-500 to-teal-500',
          textColor: 'text-white'
        };
      default:
        return {
          label: 'Utilisateur',
          fullLabel: 'Utilisateur',
          icon: User,
          bgColor: 'bg-gradient-to-r from-gray-500 to-slate-500',
          textColor: 'text-white'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-3 py-1 text-xs',
          icon: 'h-3 w-3',
          spacing: 'space-x-1'
        };
      case 'lg':
        return {
          container: 'px-6 py-3 text-base',
          icon: 'h-6 w-6',
          spacing: 'space-x-3'
        };
      default: // md
        return {
          container: 'px-4 py-2 text-sm',
          icon: 'h-4 w-4',
          spacing: 'space-x-2'
        };
    }
  };

  const config = getUserTypeConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;

  return (
    <div className={`
      inline-flex items-center rounded-xl font-bold shadow-lg backdrop-blur-sm
      ${config.bgColor} ${config.textColor}
      ${sizeClasses.container} ${sizeClasses.spacing}
    `}>
      {showIcon && (
        <Icon className={`${sizeClasses.icon} flex-shrink-0`} />
      )}
      {showText && (
        <span className="truncate">
          {size === 'sm' ? config.label : config.fullLabel}
        </span>
      )}
    </div>
  );
}

// Hook pour obtenir les informations de type utilisateur
export function useUserTypeInfo(userType: string) {
  const getUserTypeConfig = () => {
    switch (userType) {
      case 'admin':
        return {
          label: 'Admin',
          fullLabel: 'Administrateur',
          description: 'Administrateur de la plateforme',
          icon: Settings,
          color: 'red',
          permissions: ['all']
        };
      case 'expert':
        return {
          label: 'Expert',
          fullLabel: 'Expert',
          description: 'Expert accompagnateur',
          icon: Shield,
          color: 'purple',
          permissions: ['create_modules', 'evaluate', 'mentor']
        };
      case 'entrepreneur':
        return {
          label: 'Entrepreneur',
          fullLabel: 'Entrepreneur',
          description: 'Entrepreneur en formation',
          icon: User,
          color: 'blue',
          permissions: ['view_content', 'submit_assignments', 'join_calls']
        };
      default:
        return {
          label: 'Utilisateur',
          fullLabel: 'Utilisateur',
          description: 'Utilisateur de la plateforme',
          icon: User,
          color: 'gray',
          permissions: ['basic']
        };
    }
  };

  return getUserTypeConfig();
}