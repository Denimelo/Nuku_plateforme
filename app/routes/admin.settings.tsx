function SystemSettingsTab({ settings, fetcher }: { settings: any; fetcher: any }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <Server className="h-6 w-6 mr-3 text-green-600" />
        Paramètres système
      </h3>
      
      <Form method="post" className="space-y-6">
        <input type="hidden" name="_action" value="update_system_settings" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Niveau de log
            </label>
            <select
              name="log_level"
              defaultValue={settings.log_level || "INFO"}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Rétention des logs (jours)
            </label>
            <input
              type="number"
              name="log_retention_days"
              defaultValue={settings.log_retention_days || 30}
              min="1"
              max="365"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Limite de sessions utilisateur
            </label>
            <input
              type="number"
              name="max_user_sessions"
              defaultValue={settings.max_user_sessions || 5}
              min="1"
              max="20"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Délai d'expiration session (minutes)
            </label>
            <input
              type="number"
              name="session_timeout_minutes"
              defaultValue={settings.session_timeout_minutes || 360}
              min="30"
              max="1440"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="debug_mode"
                defaultChecked={settings.debug_mode || false}
                className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
              />
              <span className="text-sm font-semibold text-slate-700">Mode debug activé</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="api_rate_limiting"
                defaultChecked={settings.api_rate_limiting !== false}
                className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
              />
              <span className="text-sm font-semibold text-slate-700">Limitation du taux d'API</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={fetcher.state !== 'idle'}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {fetcher.state === 'submitting' ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>Sauvegarder</span>
          </button>
        </div>
      </Form>
    </div>
  );
}

function EmailSettingsTab({ settings, fetcher, showPassword, setShowPassword }: any) {
  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
          <Mail className="h-6 w-6 mr-3 text-purple-600" />
          Configuration email
        </h3>
        
        <Form method="post" className="space-y-6">
          <input type="hidden" name="_action" value="update_email_settings" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Serveur SMTP
              </label>
              <input
                type="text"
                name="smtp_server"
                defaultValue={settings.smtp_server || "smtp.gmail.com"}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Port SMTP
              </label>
              <input
                type="number"
                name="smtp_port"
                defaultValue={settings.smtp_port || 587}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email expéditeur
              </label>
              <input
                type="email"
                name="sender_email"
                defaultValue={settings.sender_email || "noreply@nuku.tg"}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom expéditeur
              </label>
              <input
                type="text"
                name="sender_name"
                defaultValue={settings.sender_name || "NUKU Platform"}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom d'utilisateur SMTP
              </label>
              <input
                type="text"
                name="smtp_username"
                defaultValue={settings.smtp_username || ""}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mot de passe SMTP
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="smtp_password"
                  defaultValue={settings.smtp_password || ""}
                  className="w-full p-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="use_tls"
                  defaultChecked={settings.use_tls !== false}
                  className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-semibold text-slate-700">Utiliser TLS</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="use_ssl"
                  defaultChecked={settings.use_ssl || false}
                  className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-semibold text-slate-700">Utiliser SSL</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={fetcher.state !== 'idle'}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {fetcher.state === 'submitting' ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>Sauvegarder</span>
            </button>
          </div>
        </Form>
      </div>

      {/* Test de configuration email */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <h4 className="text-lg font-bold text-slate-800 mb-4">Tester la configuration</h4>
        
        <Form method="post" className="flex gap-4">
          <input type="hidden" name="_action" value="test_email" />
          <input
            type="email"
            name="test_email"
            placeholder="Adresse email de test"
            className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={fetcher.state !== 'idle'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            Tester
          </button>
        </Form>
      </div>
    </div>
  );
}

function DatabaseSettingsTab({ fetcher }: { fetcher: any }) {
  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
          <Database className="h-6 w-6 mr-3 text-orange-600" />
          Gestion de la base de données
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations base de données */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800">Informations</h4>
            
            <div className="space-y-3">
              <InfoItem label="Type" value="PostgreSQL (Supabase)" />
              <InfoItem label="État" value="Connecté" status="success" />
              <InfoItem label="Tables" value="15" />
              <InfoItem label="Dernière sauvegarde" value="Pas encore configuré" status="warning" />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800">Actions</h4>
            
            <div className="space-y-3">
              <Form method="post">
                <input type="hidden" name="_action" value="create_backup" />
                <button
                  type="submit"
                  disabled={fetcher.state !== 'idle'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Créer une sauvegarde</span>
                </button>
              </Form>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Note importante</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Les sauvegardes automatiques sont gérées par Supabase. 
                      Cette fonction créera une sauvegarde manuelle des données utilisateur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecuritySettingsTab({ fetcher }: { fetcher: any }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <Shield className="h-6 w-6 mr-3 text-red-600" />
        Paramètres de sécurité
      </h3>
      
      <div className="space-y-8">
        {/* Statut de sécurité */}
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-4">État de la sécurité</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SecurityStatus 
              label="Authentification"
              status="success"
              description="JWT sécurisé activé"
            />
            <SecurityStatus 
              label="HTTPS"
              status="success"
              description="SSL/TLS activé"
            />
            <SecurityStatus 
              label="Base de données"
              status="success"
              description="Connexion chiffrée"
            />
          </div>
        </div>

        {/* Politiques de mot de passe */}
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Politique des mots de passe</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Longueur minimale" value="8 caractères" />
            <InfoItem label="Complexité" value="Lettres, chiffres, symboles" />
            <InfoItem label="Expiration" value="Jamais" />
            <InfoItem label="Historique" value="5 derniers mots de passe" />
          </div>
        </div>

        {/* Actions de sécurité */}
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Actions</h4>
          
          <div className="space-y-3">
            <Form method="post">
              <input type="hidden" name="_action" value="clear_cache" />
              <button
                type="submit"
                disabled={fetcher.state !== 'idle'}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Vider le cache</span>
              </button>
            </Form>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Informations</p>
                  <p className="text-sm text-blue-700 mt-1">
                    La sécurité est principalement gérée par Supabase et les services externes.
                    Les paramètres avancés sont configurés au niveau infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StorageSettingsTab({ storageStats, fetcher }: { storageStats: any; fetcher: any }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <HardDrive className="h-6 w-6 mr-3 text-indigo-600" />
        Gestion du stockage
      </h3>
      
      <div className="space-y-8">
        {/* Statistiques de stockage */}
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Utilisation du stockage</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StorageCard 
              label="Documents"
              value={storageStats.documents_size || "0 MB"}
              color="blue"
            />
            <StorageCard 
              label="Avatars"
              value={storageStats.avatars_size || "0 MB"}
              color="green"
            />
            <StorageCard 
              label="Modules"
              value={storageStats.modules_size || "0 MB"}
              color="purple"
            />
            <StorageCard 
              label="Total"
              value={storageStats.total_size || "0 MB"}
              color="gray"
            />
          </div>
        </div>

        {/* Informations sur les buckets Supabase */}
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Buckets de stockage</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Bucket</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Taille</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Fichiers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">documents</td>
                  <td className="py-3 px-4 text-slate-600">Documents utilisateurs</td>
                  <td className="py-3 px-4">{storageStats.documents_size || "0 MB"}</td>
                  <td className="py-3 px-4">{storageStats.documents_count || "0"}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">avatars</td>
                  <td className="py-3 px-4 text-slate-600">Photos de profil</td>
                  <td className="py-3 px-4">{storageStats.avatars_size || "0 MB"}</td>
                  <td className="py-3 px-4">{storageStats.avatars_count || "0"}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">modules</td>
                  <td className="py-3 px-4 text-slate-600">Contenu pédagogique</td>
                  <td className="py-3 px-4">{storageStats.modules_size || "0 MB"}</td>
                  <td className="py-3 px-4">{storageStats.modules_count || "0"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Stockage géré par Supabase</p>
              <p className="text-sm text-green-700 mt-1">
                Le stockage des fichiers est automatiquement géré par Supabase Storage 
                avec réplication et sauvegardes automatiques.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants utilitaires
function InfoItem({ label, value, status }: { label: string; value: string; status?: 'success' | 'warning' | 'error' }) {
  const statusColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`text-sm font-semibold ${status ? statusColors[status] : 'text-slate-600'}`}>
        {value}
      </span>
    </div>
  );
}

function SecurityStatus({ label, status, description }: any) {
  const statusConfig = {
    success: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle },
    error: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.bg} ${config.border}`}>
      <div className="flex items-center space-x-3 mb-2">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <span className="font-semibold text-slate-800">{label}</span>
      </div>
      <p className={`text-sm ${config.color}`}>{description}</p>
    </div>
  );
}

function StorageCard({ label, value, color }: any) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    gray: 'from-gray-500 to-gray-600'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <HardDrive className="h-6 w-6 text-white" />
      </div>
      <p className="text-sm font-semibold text-slate-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation, useFetcher, Form } from "@remix-run/react";
import { useState } from "react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { settingsServerAPI } from "~/utils/api.server";
import { 
  Settings,
  Database,
  Mail,
  Server,
  Shield,
  HardDrive,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Bell,
  Globe,
  Users,
  Lock,
  Eye,
  EyeOff,
  Save
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  try {
    const [systemSettings, platformSettings, emailSettings, storageStats] = await Promise.all([
      settingsServerAPI.getSystemSettings(session.token).catch(() => ({})),
      settingsServerAPI.getPlatformSettings(session.token).catch(() => ({})),
      settingsServerAPI.getEmailSettings(session.token).catch(() => ({})),
      settingsServerAPI.getStorageStats(session.token).catch(() => ({}))
    ]);

    return json({ 
      user, 
      systemSettings: systemSettings || {},
      platformSettings: platformSettings || {},
      emailSettings: emailSettings || {},
      storageStats: storageStats || {}
    });
  } catch (error) {
    console.error("Erreur lors du chargement des paramètres:", error);
    return json({ 
      user, 
      systemSettings: {},
      platformSettings: {},
      emailSettings: {},
      storageStats: {},
      error: "Erreur lors du chargement des paramètres"
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw json({ error: "Session introuvable" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get('_action');

  try {
    switch (action) {
      case 'update_system_settings': {
        const settings = Object.fromEntries(
          Array.from(formData.entries())
            .filter(([key]) => key !== '_action')
        );
        
        await settingsServerAPI.updateSystemSettings(session.token, settings);
        return json({ success: true, message: "Paramètres système mis à jour" });
      }
      
      case 'update_platform_settings': {
        const settings = Object.fromEntries(
          Array.from(formData.entries())
            .filter(([key]) => key !== '_action')
        );
        
        await settingsServerAPI.updatePlatformSettings(session.token, settings);
        return json({ success: true, message: "Paramètres plateforme mis à jour" });
      }
      
      case 'update_email_settings': {
        const settings = Object.fromEntries(
          Array.from(formData.entries())
            .filter(([key]) => key !== '_action')
        );
        
        await settingsServerAPI.updateEmailSettings(session.token, settings);
        return json({ success: true, message: "Paramètres email mis à jour" });
      }
      
      case 'test_email': {
        const testEmail = formData.get('test_email') as string;
        await settingsServerAPI.testEmailConfiguration(session.token, testEmail);
        return json({ success: true, message: "Email de test envoyé avec succès" });
      }
      
      case 'create_backup': {
        await settingsServerAPI.createBackup(session.token);
        return json({ success: true, message: "Sauvegarde créée avec succès" });
      }
      
      case 'clear_cache': {
        const cacheType = formData.get('cache_type') as string;
        await settingsServerAPI.clearCache(session.token, cacheType);
        return json({ success: true, message: `Cache ${cacheType || 'général'} vidé` });
      }
      
      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error) {
    return json({ error: `Erreur: ${error}` }, { status: 500 });
  }
}

export default function AdminSettings() {
  const { user, systemSettings, platformSettings, emailSettings, storageStats, error } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = getAdminNavigation(location.pathname);
  const fetcher = useFetcher();

  const [activeTab, setActiveTab] = useState('platform');
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  const tabs = [
    { id: 'platform', label: 'Plateforme', icon: Globe },
    { id: 'system', label: 'Système', icon: Server },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'Base de données', icon: Database },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'storage', label: 'Stockage', icon: HardDrive },
  ];

  return (
    <Layout user={user} title="Paramètres" navigation={navigation}>
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-slate-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-slate-400/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">
              Paramètres système
            </h1>
            <p className="text-xl text-slate-200">
              Configurez et gérez les paramètres de la plateforme NUKU
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {fetcher.data?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          {fetcher.data.message}
        </div>
      )}

      {fetcher.data?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {fetcher.data.error}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 mb-8">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 whitespace-nowrap font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'platform' && (
          <PlatformSettingsTab 
            settings={platformSettings} 
            fetcher={fetcher} 
          />
        )}
        
        {activeTab === 'system' && (
          <SystemSettingsTab 
            settings={systemSettings} 
            fetcher={fetcher} 
          />
        )}
        
        {activeTab === 'email' && (
          <EmailSettingsTab 
            settings={emailSettings} 
            fetcher={fetcher}
            showPassword={showEmailPassword}
            setShowPassword={setShowEmailPassword}
          />
        )}
        
        {activeTab === 'database' && (
          <DatabaseSettingsTab 
            fetcher={fetcher} 
          />
        )}
        
        {activeTab === 'security' && (
          <SecuritySettingsTab 
            fetcher={fetcher} 
          />
        )}
        
        {activeTab === 'storage' && (
          <StorageSettingsTab 
            storageStats={storageStats} 
            fetcher={fetcher} 
          />
        )}
      </div>
    </Layout>
  );
}

function PlatformSettingsTab({ settings, fetcher }: { settings: any; fetcher: any }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <Globe className="h-6 w-6 mr-3 text-blue-600" />
        Paramètres de la plateforme
      </h3>
      
      <Form method="post" className="space-y-6">
        <input type="hidden" name="_action" value="update_platform_settings" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nom de la plateforme
            </label>
            <input
              type="text"
              name="platform_name"
              defaultValue={settings.platform_name || "NUKU"}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              URL de base
            </label>
            <input
              type="url"
              name="base_url"
              defaultValue={settings.base_url || "https://nuku.vercel.app"}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={settings.description || "Plateforme d'accélération pour MPME"}
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Langue par défaut
            </label>
            <select
              name="default_language"
              defaultValue={settings.default_language || "fr"}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fuseau horaire
            </label>
            <select
              name="timezone"
              defaultValue={settings.timezone || "Africa/Lome"}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Africa/Lome">Afrique/Lomé</option>
              <option value="UTC">UTC</option>
              <option value="Europe/Paris">Europe/Paris</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mode maintenance
            </label>
            <select
              name="maintenance_mode"
              defaultValue={settings.maintenance_mode ? "true" : "false"}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="false">Désactivé</option>
              <option value="true">Activé</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Message de maintenance
          </label>
          <textarea
            name="maintenance_message"
            rows={2}
            defaultValue={settings.maintenance_message || "La plateforme est en cours de maintenance. Nous reviendrons bientôt."}
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={fetcher.state !== 'idle'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {fetcher.state === 'submitting' ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>Sauvegarder</span>
          </button>
        </div>
      </Form>
    </div>
  );
}