import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { adminServerAPI } from "~/utils/api.server";
import { 
  Shield, 
  Search, 
  CheckCircle, 
  Eye,
  Mail,
  Calendar,
  Plus,
  Star,
  DollarSign,
  Briefcase,
  Globe,
  Activity,
  TrendingUp
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";

  try {
    const expertsData = await adminServerAPI.getExperts(session.token);

    // Filtrer selon la recherche
    let filteredExperts = expertsData;
    
    if (search) {
      filteredExperts = expertsData.filter((expert: any) =>
        expert.user?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        expert.user?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        expert.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        expert.specialization?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return json({ 
      user, 
      experts: filteredExperts,
      search,
      stats: {
        total: expertsData.length,
        active: expertsData.filter((e: any) => e.user?.status === "active").length,
        specializations: [...new Set(expertsData.map((e: any) => e.specialization))].length,
        avgExperience: Math.round(expertsData.reduce((acc: number, e: any) => acc + (e.years_of_experience || 0), 0) / expertsData.length) || 0,
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des experts:", error);
    return json({ 
      user, 
      experts: [], 
      search,
      stats: { total: 0, active: 0, specializations: 0, avgExperience: 0 }
    });
  }
}

export default function AdminExperts() {
  const { user, experts, search, stats } = useLoaderData<typeof loader>();
  const location = useLocation();

  const navigation = getAdminNavigation(location.pathname);

  const getExperienceLevel = (years: number) => {
    if (years < 2) return { label: "Junior", color: "text-blue-600" };
    if (years < 5) return { label: "Confirmé", color: "text-green-600" };
    if (years < 10) return { label: "Senior", color: "text-orange-600" };
    return { label: "Expert", color: "text-purple-600" };
  };

  return (
    <Layout user={user} title="Gestion des experts" navigation={navigation}>
      {/* En-tête avec gradient */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">Gestion des experts</h1>
            <p className="text-xl text-slate-200 mb-6">
              Consultez votre équipe d'experts et accompagnateurs
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <StatBadge label="Total" value={stats.total} color="white" />
              <StatBadge label="Actifs" value={stats.active} color="green" />
              <StatBadge label="Spécialisations" value={stats.specializations} color="blue" />
              <StatBadge label="Exp. moyenne" value={`${stats.avgExperience} ans`} color="purple" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et actions */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Recherche */}
            <div className="flex-1 max-w-lg">
              <form method="get" className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="search"
                  defaultValue={search}
                  type="text"
                  placeholder="Rechercher par nom, email, spécialisation..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl leading-5 bg-white/70 backdrop-blur placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <a
                href="/admin/expert/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-lg transition-all text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvel expert
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des experts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((expert: any) => {
          const experienceLevel = getExperienceLevel(expert.years_of_experience || 0);
          
          return (
            <div key={expert.expert_id} className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="p-6">
                {/* Header avec avatar et info de base */}
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {expert.user?.first_name?.[0]}{expert.user?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {expert.user?.first_name} {expert.user?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {expert.user?.email}
                    </p>
                  </div>
                  
                  {/* Actions - Consultation uniquement */}
                  <div className="flex items-center space-x-1">
                    <a
                      href={`/admin/expert/${expert.expert_id}`}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-all"
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Statut */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">Statut:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    expert.user?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {expert.user?.status === 'active' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Actif
                      </>
                    ) : (
                      expert.user?.status || 'Inconnu'
                    )}
                  </span>
                </div>

                {/* Spécialisation */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {expert.specialization}
                  </span>
                </div>

                {/* Bio */}
                {expert.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 bg-gray-50 p-3 rounded-2xl">
                    {expert.bio}
                  </p>
                )}

                {/* Informations détaillées */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                    <span className="text-gray-600 flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Expérience:
                    </span>
                    <span className={`font-bold ${experienceLevel.color}`}>
                      {expert.years_of_experience || 0} ans ({experienceLevel.label})
                    </span>
                  </div>
                  
                  {expert.hourly_rate && (
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <span className="text-gray-600 flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Tarif horaire:
                      </span>
                      <span className="font-bold text-green-700">
                        {expert.hourly_rate.toLocaleString()} FCFA/h
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Inscription:
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Date(expert.user?.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* LinkedIn si disponible */}
                {expert.linkedin_url && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={expert.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Voir LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucun expert */}
      {experts.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-12">
            <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun expert trouvé</h3>
            <p className="text-gray-500 mb-6">
              {search ? "Essayez de modifier vos critères de recherche." : "Commencez par ajouter votre premier expert."}
            </p>
            {!search && (
              <a
                href="/admin/expert/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier expert
              </a>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorClasses = {
    white: "bg-white/20 text-white",
    green: "bg-green-500/20 text-green-100",
    blue: "bg-blue-500/20 text-blue-100",
    purple: "bg-purple-500/20 text-purple-100",
  };
  
  return (
    <div className={`px-4 py-3 rounded-2xl backdrop-blur ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}