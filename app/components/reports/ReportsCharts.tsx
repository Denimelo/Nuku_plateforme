import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Calendar, BookOpen, Activity, UserCheck } from 'lucide-react';

interface ReportsChartsProps {
  platformMetrics: any;
  userActivity: any;
  mentoringStats: any;
  timeRange: string;
}

export function ReportsCharts({ platformMetrics, userActivity, mentoringStats, timeRange }: ReportsChartsProps) {
  
  // Génération de données de croissance basées sur les métriques réelles
  const generateGrowthData = () => {
    const totalUsers = platformMetrics.total_users || 0;
    const newUsers7d = platformMetrics.new_users_7d || 0;
    
    // Simulation de données historiques basée sur les vraies données
    const data = [];
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (new Date().getMonth() - i + 12) % 12;
      const estimatedTotal = Math.max(1, totalUsers - (newUsers7d * i * 4));
      const estimatedEntrepreneurs = Math.floor(estimatedTotal * 0.7);
      const estimatedExperts = Math.floor(estimatedTotal * 0.25);
      
      data.push({
        name: monthNames[monthIndex],
        entrepreneurs: estimatedEntrepreneurs,
        experts: estimatedExperts,
        total: estimatedTotal
      });
    }
    
    return data;
  };

  // Génération de données d'activité
  const generateActivityData = () => {
    const messagesCount = platformMetrics.messages_sent_7d || 0;
    const activeUsers = platformMetrics.active_users_7d || 0;
    
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map(day => ({
      name: day,
      connexions: Math.floor(activeUsers / 7 + Math.random() * 10),
      messages: Math.floor(messagesCount / 7 + Math.random() * 20),
      modules: Math.floor(Math.random() * 15) + 5
    }));
  };

  // Données de répartition des utilisateurs
  const getUserTypeData = () => {
    const total = platformMetrics.total_users || 1;
    return [
      { name: 'Entrepreneurs', value: 70, color: '#3B82F6', count: Math.floor(total * 0.7) },
      { name: 'Experts', value: 25, color: '#10B981', count: Math.floor(total * 0.25) },
      { name: 'Admins', value: 5, color: '#8B5CF6', count: Math.floor(total * 0.05) },
    ];
  };

  // Données de mentorat
  const getMentoringData = () => {
    if (!mentoringStats.workload_distribution) return [];
    
    return [
      { name: '0 mentoré', value: mentoringStats.workload_distribution['0_mentees'] || 0, color: '#E5E7EB' },
      { name: '1 mentoré', value: mentoringStats.workload_distribution['1_mentee'] || 0, color: '#93C5FD' },
      { name: '2 mentorés', value: mentoringStats.workload_distribution['2_mentees'] || 0, color: '#3B82F6' },
      { name: '3 mentorés', value: mentoringStats.workload_distribution['3_mentees'] || 0, color: '#1D4ED8' },
    ];
  };

  const userGrowthData = generateGrowthData();
  const activityData = generateActivityData();
  const userTypeData = getUserTypeData();
  const mentoringData = getMentoringData();

  return (
    <div className="space-y-8">
      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Croissance des utilisateurs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
                Croissance des utilisateurs
              </h3>
              <p className="text-sm text-slate-600 mt-1">Évolution des inscriptions</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-800">{platformMetrics.total_users || 0}</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorTotal)"
                strokeWidth={3}
              />
              <Line 
                type="monotone" 
                dataKey="entrepreneurs" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-slate-600">Total</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-slate-600">Entrepreneurs</span>
            </div>
          </div>
        </div>

        {/* Répartition des utilisateurs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                <Users className="h-6 w-6 mr-3 text-green-600" />
                Répartition utilisateurs
              </h3>
              <p className="text-sm text-slate-600 mt-1">Distribution par type</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [value, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-4">
            {userTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activité hebdomadaire */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                <Activity className="h-6 w-6 mr-3 text-orange-600" />
                Activité de la semaine
              </h3>
              <p className="text-sm text-slate-600 mt-1">Interactions quotidiennes</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="connexions" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="Connexions"
              />
              <Bar 
                dataKey="messages" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                name="Messages"
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-slate-600">Connexions</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-slate-600">Messages</span>
            </div>
          </div>
        </div>

        {/* Répartition du mentorat */}
        {mentoringStats && Object.keys(mentoringStats).length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <UserCheck className="h-6 w-6 mr-3 text-purple-600" />
                  Charge de mentorat
                </h3>
                <p className="text-sm text-slate-600 mt-1">Répartition des experts</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mentoringData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mentoringData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [`${value} experts`, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              {mentoringData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-600">{item.value} experts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}