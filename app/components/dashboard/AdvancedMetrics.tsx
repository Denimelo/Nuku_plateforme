import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Clock, 
  Users, 
  BookOpen, 
  MessageCircle,
  Calendar,
  Award,
  Zap,
  Eye
} from 'lucide-react';

import React from 'react';

interface AdvancedMetricsProps {
  stats: any;
  comparedToLastPeriod?: boolean;
}

interface MetricData {
  id: string;
  label: string;
  value: number;
  unit: string;
  target?: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  icon: any;
  color: string;
  description: string;
}

export function AdvancedMetrics({ stats, comparedToLastPeriod = true }: AdvancedMetricsProps) {
  // Données des métriques avancées (à connecter avec vos vraies données)
  const metricsData: MetricData[] = [
    {
      id: 'completion_rate',
      label: 'Taux de complétion modules',
      value: 78,
      unit: '%',
      target: 85,
      change: 5.2,
      changeType: 'increase',
      icon: BookOpen,
      color: 'green',
      description: 'Pourcentage de modules terminés par les apprenants'
    },
    {
      id: 'user_satisfaction',
      label: 'Satisfaction utilisateurs',
      value: 4.6,
      unit: '/5',
      target: 4.8,
      change: 0.2,
      changeType: 'increase',
      icon: Award,
      color: 'blue',
      description: 'Note moyenne attribuée par les utilisateurs'
    },
    {
      id: 'session_duration',
      label: 'Durée moyenne session',
      value: 28,
      unit: 'min',
      target: 30,
      change: -2.1,
      changeType: 'decrease',
      icon: Clock,
      color: 'orange',
      description: 'Temps moyen passé par session utilisateur'
    },
    {
      id: 'engagement_rate',
      label: 'Taux d\'engagement',
      value: 84,
      unit: '%',
      target: 90,
      change: 3.7,
      changeType: 'increase',
      icon: Zap,
      color: 'purple',
      description: 'Pourcentage d\'utilisateurs actifs quotidiennement'
    },
    {
      id: 'expert_utilization',
      label: 'Utilisation experts',
      value: 67,
      unit: '%',
      target: 75,
      change: 1.8,
      changeType: 'increase',
      icon: Users,
      color: 'teal',
      description: 'Taux d\'utilisation de la capacité des experts'
    },
    {
      id: 'message_response_time',
      label: 'Temps de réponse moyen',
      value: 4.2,
      unit: 'h',
      target: 3.0,
      change: 0.8,
      changeType: 'decrease',
      icon: MessageCircle,
      color: 'red',
      description: 'Délai moyen de réponse aux messages'
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 flex items-center">
            <Target className="h-6 w-6 mr-3 text-blue-600" />
            Métriques avancées
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Indicateurs de performance et objectifs
          </p>
        </div>
        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
          <Eye className="h-4 w-4" />
          <span>Voir détails</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricsData.map((metric) => (
          <AdvancedMetricCard
            key={metric.id}
            metric={metric}
            showComparison={comparedToLastPeriod}
          />
        ))}
      </div>

      {/* Section objectifs */}
      <div className="mt-8 pt-8 border-t border-slate-200">
        <h4 className="text-lg font-bold text-slate-800 mb-4">Progression vers les objectifs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricsData
            .filter(m => m.target)
            .map((metric) => (
              <ObjectiveProgressBar
                key={`objective-${metric.id}`}
                metric={metric}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function AdvancedMetricCard({ metric, showComparison }: { metric: MetricData; showComparison: boolean }) {
  const colorClasses = {
    green: { bg: 'from-green-500 to-green-600', text: 'text-green-600', light: 'bg-green-50' },
    blue: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
    orange: { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600', light: 'bg-orange-50' },
    purple: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', light: 'bg-purple-50' },
    teal: { bg: 'from-teal-500 to-teal-600', text: 'text-teal-600', light: 'bg-teal-50' },
    red: { bg: 'from-red-500 to-red-600', text: 'text-red-600', light: 'bg-red-50' },
  };

  const colors = colorClasses[metric.color];
  const Icon = metric.icon;

  const changeIcon = metric.changeType === 'increase' ? TrendingUp : 
                    metric.changeType === 'decrease' ? TrendingDown : Minus;

  const changeColor = metric.changeType === 'increase' ? 'text-green-600' : 
                     metric.changeType === 'decrease' ? 'text-red-600' : 'text-slate-600';

  const progressPercentage = metric.target ? Math.min((metric.value / metric.target) * 100, 100) : 0;

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 group">
      {/* Header avec icône */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colors.bg} shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {metric.target && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Objectif</p>
            <p className="text-sm font-bold text-slate-700">{metric.target}{metric.unit}</p>
          </div>
        )}
      </div>

      {/* Valeur principale */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">{metric.label}</h4>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-slate-800">
            {metric.value}
          </span>
          <span className="text-sm text-slate-600 ml-1">{metric.unit}</span>
        </div>
      </div>

      {/* Changement par rapport à la période précédente */}
      {showComparison && (
        <div className="flex items-center space-x-2 mb-3">
          {React.createElement(changeIcon, { 
            className: `h-4 w-4 ${changeColor}` 
          })}
          <span className={`text-sm font-semibold ${changeColor}`}>
            {Math.abs(metric.change)}{metric.unit === '%' ? 'pts' : metric.unit}
          </span>
          <span className="text-xs text-slate-500">vs période précédente</span>
        </div>
      )}

      {/* Barre de progression vers l'objectif */}
      {metric.target && (
        <div className="mb-3">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 bg-gradient-to-r ${colors.bg} transition-all duration-1000`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-slate-500">
              {progressPercentage.toFixed(1)}% de l'objectif
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-slate-500">{metric.description}</p>
    </div>
  );
}

function ObjectiveProgressBar({ metric }: { metric: MetricData }) {
  const progressPercentage = Math.min((metric.value / metric.target!) * 100, 100);
  const isOnTrack = progressPercentage >= 80;
  const isCompleted = progressPercentage >= 100;

  let statusColor = 'text-yellow-600 bg-yellow-50';
  let barColor = 'from-yellow-500 to-yellow-600';
  let statusText = 'En cours';

  if (isCompleted) {
    statusColor = 'text-green-600 bg-green-50';
    barColor = 'from-green-500 to-green-600';
    statusText = 'Atteint';
  } else if (isOnTrack) {
    statusColor = 'text-blue-600 bg-blue-50';
    barColor = 'from-blue-500 to-blue-600';
    statusText = 'En bonne voie';
  } else if (progressPercentage < 60) {
    statusColor = 'text-red-600 bg-red-50';
    barColor = 'from-red-500 to-red-600';
    statusText = 'Attention';
  }

  return (
    <div className="p-4 bg-gradient-to-r from-white to-slate-50/30 rounded-xl border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h5 className="text-sm font-semibold text-slate-800">{metric.label}</h5>
          <p className="text-xs text-slate-600">{metric.value}{metric.unit} / {metric.target}{metric.unit}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 bg-gradient-to-r ${barColor} transition-all duration-1000 rounded-full`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-slate-500">{progressPercentage.toFixed(1)}%</span>
        <span className="text-xs text-slate-400">
          {metric.target! - metric.value > 0 ? `${(metric.target! - metric.value).toFixed(1)}${metric.unit} restant` : 'Objectif dépassé'}
        </span>
      </div>
    </div>
  );
}