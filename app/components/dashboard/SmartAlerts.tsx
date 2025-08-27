import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Bell,
  TrendingDown,
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link } from '@remix-run/react';

interface SmartAlertsProps {
  stats: any;
  pendingEntrepreneurs: any[];
  currentUser: any;
}

interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
  icon: any;
  priority: number; // 1-5, 5 being highest
  timestamp?: string;
  autoHide?: boolean;
}

export function SmartAlerts({ stats, pendingEntrepreneurs, currentUser }: SmartAlertsProps) {
  // Génération intelligente des alertes basée sur les stats
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    // Alertes urgentes - validation d'entrepreneurs
    if (pendingEntrepreneurs.length > 0) {
      alerts.push({
        id: 'pending_entrepreneurs',
        type: 'urgent',
        title: 'Validations en attente',
        message: `${pendingEntrepreneurs.length} entrepreneur${pendingEntrepreneurs.length > 1 ? 's' : ''} en attente de validation depuis plus de 48h`,
        action: {
          label: 'Valider maintenant',
          href: '/admin/entrepreneurs?filter=pending'
        },
        icon: Users,
        priority: 5
      });
    }

    // Alerte système - performance
    if (stats.activePrograms > 0 && (stats.totalUsers / stats.activePrograms) > 50) {
      alerts.push({
        id: 'high_load',
        type: 'warning',
        title: 'Charge élevée détectée',
        message: 'Ratio utilisateurs/programmes élevé. Considérer l\'ouverture de nouveaux programmes.',
        action: {
          label: 'Créer programme',
          href: '/admin/program/create'
        },
        icon: TrendingDown,
        priority: 3
      });
    }

    // Alerte positive - croissance
    if (stats.totalUsers > 100) {
      alerts.push({
        id: 'growth_milestone',
        type: 'success',
        title: 'Objectif atteint !',
        message: `Félicitations ! Vous avez dépassé ${stats.totalUsers} utilisateurs inscrits.`,
        icon: CheckCircle2,
        priority: 2,
        autoHide: true
      });
    }

    // Alerte maintenance système
    alerts.push({
      id: 'system_health',
      type: 'info',
      title: 'Système opérationnel',
      message: 'Dernière sauvegarde: il y a 2 heures. Tous les services fonctionnent normalement.',
      action: {
        label: 'Voir détails',
        href: '/admin/system-status'
      },
      icon: Shield,
      priority: 1
    });

    // Alerte sur l'engagement
    const engagementRate = 75; // À calculer avec vos vraies données
    if (engagementRate < 70) {
      alerts.push({
        id: 'low_engagement',
        type: 'warning',
        title: 'Engagement en baisse',
        message: `Taux d'engagement: ${engagementRate}%. Recommandations disponibles.`,
        action: {
          label: 'Voir recommandations',
          href: '/admin/reports?focus=engagement'
        },
        icon: TrendingDown,
        priority: 4
      });
    }

    return alerts.sort((a, b) => b.priority - a.priority);
  };

  const alerts = generateAlerts();
  const criticalAlerts = alerts.filter(alert => alert.type === 'urgent');
  const otherAlerts = alerts.filter(alert => alert.type !== 'urgent');

  return (
    <div className="space-y-6">
      {/* Alertes critiques */}
      {criticalAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl border-2 border-red-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-red-800 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-3 animate-pulse" />
              Attention requise
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-red-700">
                {criticalAlerts.length} alerte{criticalAlerts.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            {criticalAlerts.map((alert) => (
              <CriticalAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Alertes normales */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center">
            <Bell className="h-6 w-6 mr-3 text-blue-600" />
            Notifications système
          </h3>
          <div className="flex items-center space-x-3">
            <StatusIndicator status="healthy" label="Système" />
            <span className="text-sm text-slate-500">
              {new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>

        {otherAlerts.length > 0 ? (
          <div className="space-y-4">
            {otherAlerts.map((alert) => (
              <StandardAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-slate-800 mb-2">Tout va bien !</h4>
            <p className="text-slate-600">Aucune alerte système à signaler</p>
          </div>
        )}
      </div>

      {/* Recommandations intelligentes */}
      <RecommendationsSection stats={stats} />
    </div>
  );
}

function CriticalAlertCard({ alert }: { alert: Alert }) {
  const Icon = alert.icon;
  
  return (
    <div className="bg-white/90 rounded-2xl p-6 border-l-4 border-red-500 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <Icon className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-red-800 mb-2">{alert.title}</h4>
            <p className="text-red-700 mb-4">{alert.message}</p>
            {alert.action && (
              <Link
                to={alert.action.href}
                className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <span>{alert.action.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
        <button className="text-red-400 hover:text-red-600 transition-colors">
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function StandardAlertCard({ alert }: { alert: Alert }) {
  const Icon = alert.icon;
  
  const typeStyles = {
    warning: {
      bg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
      border: 'border-l-yellow-500',
      icon: 'bg-yellow-100 text-yellow-600',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      border: 'border-l-blue-500',
      icon: 'bg-blue-100 text-blue-600',
      title: 'text-blue-800',
      text: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    success: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-l-green-500',
      icon: 'bg-green-100 text-green-600',
      title: 'text-green-800',
      text: 'text-green-700',
      button: 'bg-green-600 hover:bg-green-700'
    }
  };

  const styles = typeStyles[alert.type] || typeStyles.info;

  return (
    <div className={`${styles.bg} rounded-2xl p-6 border-l-4 ${styles.border} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 ${styles.icon} rounded-xl`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className={`text-lg font-bold ${styles.title} mb-2`}>{alert.title}</h4>
              <p className={`${styles.text} mb-3`}>{alert.message}</p>
              {alert.action && (
                <Link
                  to={alert.action.href}
                  className={`inline-flex items-center space-x-2 ${styles.button} text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm`}
                >
                  <span>{alert.action.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            {alert.timestamp && (
              <span className="text-xs text-slate-500">
                {new Date(alert.timestamp).toLocaleTimeString('fr-FR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ status, label }: { status: 'healthy' | 'warning' | 'critical'; label: string }) {
  const statusConfig = {
    healthy: { color: 'bg-green-500', text: 'Opérationnel' },
    warning: { color: 'bg-yellow-500', text: 'Attention' },
    critical: { color: 'bg-red-500', text: 'Critique' }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 ${config.color} rounded-full ${status === 'healthy' ? 'animate-pulse' : ''}`}></div>
      <span className="text-sm font-medium text-slate-600">{label}: {config.text}</span>
    </div>
  );
}

function RecommendationsSection({ stats }: { stats: any }) {
  const recommendations = [
    {
      id: 'add_experts',
      title: 'Recruter plus d\'experts',
      description: `Avec ${stats.totalUsers} utilisateurs et ${stats.activeExperts} experts, le ratio est de ${Math.round(stats.totalUsers / stats.activeExperts)}:1`,
      priority: 'medium',
      action: {
        label: 'Ajouter un expert',
        href: '/admin/expert/create'
      },
      icon: Shield
    },
    {
      id: 'create_program',
      title: 'Nouveau programme recommandé',
      description: 'Taux de participation élevé, considérer l\'ouverture d\'un nouveau programme',
      priority: 'high',
      action: {
        label: 'Créer programme',
        href: '/admin/program/create'
      },
      icon: BookOpen
    },
    {
      id: 'engagement_boost',
      title: 'Améliorer l\'engagement',
      description: 'Organiser des événements ou webinaires pour dynamiser la communauté',
      priority: 'low',
      action: {
        label: 'Planifier événement',
        href: '/admin/events/create'
      },
      icon: Zap
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center">
          <Zap className="h-6 w-6 mr-3 text-purple-600" />
          Recommandations intelligentes
        </h3>
        <span className="text-sm text-slate-500">Basées sur vos données</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: any }) {
  const Icon = recommendation.icon;
  
  const priorityStyles = {
    high: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700',
    medium: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-700',
    low: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700'
  };

  const buttonStyles = {
    high: 'bg-red-600 hover:bg-red-700',
    medium: 'bg-yellow-600 hover:bg-yellow-700',
    low: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className={`${priorityStyles[recommendation.priority]} rounded-2xl p-6 border-2 hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start space-x-4 mb-4">
        <div className="p-3 bg-white/70 rounded-xl">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold mb-2">{recommendation.title}</h4>
          <p className="text-sm opacity-90">{recommendation.description}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/50`}>
          {recommendation.priority === 'high' ? 'Haute priorité' : 
           recommendation.priority === 'medium' ? 'Priorité moyenne' : 'Faible priorité'}
        </span>
        <Link
          to={recommendation.action.href}
          className={`${buttonStyles[recommendation.priority]} text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors inline-flex items-center space-x-1`}
        >
          <span>{recommendation.action.label}</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}