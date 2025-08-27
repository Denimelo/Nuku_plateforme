import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Calendar, BookOpen } from 'lucide-react';

interface ChartsProps {
  stats: any;
  timeRange: string;
}

// Données mockées pour les graphiques (à remplacer par de vraies données)
const userGrowthData = [
  { name: 'Jan', entrepreneurs: 12, experts: 3, total: 15 },
  { name: 'Fév', entrepreneurs: 18, experts: 5, total: 23 },
  { name: 'Mar', entrepreneurs: 25, experts: 7, total: 32 },
  { name: 'Avr', entrepreneurs: 34, experts: 9, total: 43 },
  { name: 'Mai', entrepreneurs: 42, experts: 12, total: 54 },
  { name: 'Juin', entrepreneurs: 51, experts: 14, total: 65 },
];

const activityData = [
  { name: 'Lun', connexions: 24, modules: 12, messages: 45 },
  { name: 'Mar', connexions: 28, modules: 15, messages: 52 },
  { name: 'Mer', connexions: 32, modules: 18, messages: 38 },
  { name: 'Jeu', connexions: 29, modules: 22, messages: 41 },
  { name: 'Ven', connexions: 35, modules: 19, messages: 49 },
  { name: 'Sam', connexions: 18, modules: 8, messages: 25 },
  { name: 'Dim', connexions: 15, modules: 6, messages: 18 },
];

const userTypeData = [
  { name: 'Entrepreneurs', value: 65, color: '#3B82F6' },
  { name: 'Experts', value: 25, color: '#10B981' },
  { name: 'Admins', value: 10, color: '#8B5CF6' },
];

const programCompletionData = [
  { name: 'Prog. A', completed: 85, active: 15 },
  { name: 'Prog. B', completed: 72, active: 28 },
  { name: 'Prog. C', completed: 91, active: 9 },
  { name: 'Prog. D', completed: 68, active: 32 },
  { name: 'Prog. E', completed: 79, active: 21 },
];

export function ChartsSection({ stats, timeRange }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Graphique de croissance des utilisateurs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
              Croissance des utilisateurs
            </h3>
            <p className="text-sm text-slate-600 mt-1">Évolution mensuelle des inscriptions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
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
            <XAxis 
              dataKey="name" 
              stroke="#64748B"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748B"
              fontSize={12}
            />
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
            <Line 
              type="monotone" 
              dataKey="experts" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-slate-600">Connexions</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-slate-600">Modules complétés</span>
          </div>
        </div>
      </div>

      {/* Performance des programmes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center">
              <BookOpen className="h-6 w-6 mr-3 text-purple-600" />
              Performance des programmes
            </h3>
            <p className="text-sm text-slate-600 mt-1">Taux de completion par programme</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={programCompletionData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" stroke="#64748B" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={12} width={60} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="completed" 
              stackId="a"
              fill="#10B981" 
              radius={[0, 4, 4, 0]}
              name="Complétés (%)"
            />
            <Bar 
              dataKey="active" 
              stackId="a"
              fill="#F59E0B" 
              radius={[0, 4, 4, 0]}
              name="En cours (%)"
            />
          </BarChart>
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
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-sm text-slate-600">Experts</span>
          </div>
        </div>
      </div>

      {/* Répartition des types d'utilisateurs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center">
              <Users className="h-6 w-6 mr-3 text-green-600" />
              Répartition utilisateurs
            </h3>
            <p className="text-sm text-slate-600 mt-1">Distribution par type d'utilisateur</p>
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
                dataKey="value"
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value}%`, 'Pourcentage']}
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
              <span className="text-sm font-bold text-slate-600">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activité hebdomadaire */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-orange-600" />
              Activité hebdomadaire
            </h3>
            <p className="text-sm text-slate-600 mt-1">Connexions et interactions par jour</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748B"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748B"
              fontSize={12}
            />
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
              dataKey="modules" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]}
              name="Modules complétés"
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-slate-600">Complétés</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-slate-600">En cours</span>
          </div>
        </div>
      </div>
    </div>
  );
}