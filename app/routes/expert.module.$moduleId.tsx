import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigate, useParams } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireExpert } from "~/utils/auth.server";
import { getExpertNavigation } from "~/utils/expert-navigation";
import { getUserSession } from "~/utils/session.server";
import { modulesServerAPI } from "~/utils/api.server";
import { 
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Users,
  Target,
  FileText,
  Edit3,
  Trash2,
  Plus,
  Eye,
  Settings,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  BarChart3,
  Play,
  PlusCircle,
  MoreVertical
} from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireExpert(request);
  const session = await getUserSession(request);
  const { moduleId } = params;
  
  if (!session || !moduleId) {
    throw new Error("Session ou module ID introuvable");
  }

  try {
    // Récupérer les détails du module
    const [moduleDetails, moduleContents] = await Promise.all([
      modulesServerAPI.getModule(session.token, moduleId),
      modulesServerAPI.getModuleContents(session.token, moduleId).catch(() => [])
    ]);

    // Vérifier que l'expert est bien le créateur du module
    // if (moduleDetails.created_by !== user.user_id) {
    //   throw new Response("Non autorisé", { status: 403 });
    // }

    return json({ 
      user, 
      module: moduleDetails,
      contents: moduleContents 
    });
  } catch (error) {
    console.error("Erreur lors du chargement du module:", error);
    throw new Response("Module non trouvé", { status: 404 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  const { moduleId } = params;
  
  if (!session || !moduleId) {
    return json({ error: "Session ou module ID introuvable" }, { status: 400 });
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    switch (action) {
      case "publish_module":
        await modulesServerAPI.publishModule(session.token, moduleId);
        return json({ success: "Module publié avec succès" });

      case "delete_module":
        await modulesServerAPI.deleteModule(session.token, moduleId);
        return redirect("/expert/modules?success=module_deleted");

      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error: any) {
    return json({ error: error.message || "Erreur lors de l'action" }, { status: 400 });
  }
}

export default function ExpertModuleDetails() {
  const { user, module, contents } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const params = useParams();

  const navigation = getExpertNavigation(`/expert/module/${params.moduleId}`);

  const getModuleTypeConfig = (type: string) => {
    const configs = {
      lesson: { label: "Cours", color: "text-blue-700 bg-blue-100", icon: BookOpen },
      workshop: { label: "Atelier", color: "text-green-700 bg-green-100", icon: Users },
      assessment: { label: "Évaluation", color: "text-purple-700 bg-purple-100", icon: Target },
    };
    return configs[type as keyof typeof configs] || { label: type, color: "text-gray-700 bg-gray-100", icon: FileText };
  };

  const getDifficultyConfig = (level: string) => {
    const configs = {
      beginner: { label: "Débutant", color: "text-green-700 bg-green-100" },
      intermediate: { label: "Intermédiaire", color: "text-yellow-700 bg-yellow-100" },
      advanced: { label: "Avancé", color: "text-red-700 bg-red-100" },
    };
    return configs[level as keyof typeof configs] || { label: level, color: "text-gray-700 bg-gray-100" };
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const typeConfig = getModuleTypeConfig(module.module_type);
  const difficultyConfig = getDifficultyConfig(module.difficulty_level);

  return (
    <Layout user={user} title={module.title} navigation={navigation}>
      {/* Navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/expert/modules")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à mes modules
        </button>
      </div>

      {/* Messages de retour */}
      {actionData?.success && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{actionData.success}</p>
            </div>
          </div>
        </div>
      )}

      {actionData?.error && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{actionData.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* En-tête du module */}
      <div className="bg-gradient-to-r from-slate-800 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${typeConfig.color.replace('text-', 'text-white ').replace('bg-', 'bg-white/20 ')}`}>
                  <typeConfig.icon className="h-4 w-4 mr-2" />
                  {typeConfig.label}
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  module.status === 'published' 
                    ? 'bg-green-500/20 text-green-100' 
                    : 'bg-yellow-500/20 text-yellow-100'
                }`}>
                  {module.status === 'published' ? 'Publié' : 'Brouillon'}
                </div>
                {module.difficulty_level && (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${difficultyConfig.color.replace('text-', 'text-white ').replace('bg-', 'bg-white/20 ')}`}>
                    {difficultyConfig.label}
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-3">{module.title}</h1>
              
              {module.description && (
                <p className="text-xl text-slate-200 mb-4">{module.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <StatBadge 
                  label="Contenus" 
                  value={contents.length} 
                  icon={FileText}
                />
                <StatBadge 
                  label="Durée" 
                  value={module.estimated_duration_minutes ? formatDuration(module.estimated_duration_minutes) : 'Non définie'} 
                  icon={Clock}
                />
                <StatBadge 
                  label="Vues" 
                  value={module.views_count || 0} 
                  icon={Eye}
                />
                <StatBadge 
                  label="Note" 
                  value={module.average_rating ? `${module.average_rating.toFixed(1)}/5` : 'N/A'} 
                  icon={Star}
                />
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center space-x-3">
              <a
                href={`/expert/moduleedit/${module.module_id}`}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur rounded-2xl text-white hover:bg-white/30 transition-all"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier
              </a>
              
              {module.status === 'draft' && (
                <Form method="post" className="inline">
                  <input type="hidden" name="action" value="publish_module" />
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-2xl text-white transition-all"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publier
                  </button>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Objectifs d'apprentissage */}
          {module.learning_objectives && (
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-teal-600" />
                Objectifs d'apprentissage
              </h3>
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{module.learning_objectives}</p>
              </div>
            </div>
          )}

          {/* Contenus du module */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Contenus du module ({contents.length})
              </h3>
              <a
                href={`/expert/modulecontent/${module.module_id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-2xl hover:bg-teal-200 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter du contenu
              </a>
            </div>

            {contents.length > 0 ? (
              <div className="space-y-3">
                {contents.map((content: any, index: number) => (
                  <ContentItem key={content.content_id} content={content} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun contenu ajouté
                </h4>
                <p className="text-gray-500 mb-4">
                  Commencez à enrichir votre module en ajoutant du contenu pédagogique.
                </p>
                <a
                  href={`/expert/modulecontent/create/${module.module_id}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl hover:from-teal-700 hover:to-teal-800 transition-all"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter le premier contenu
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informations</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Créé le:</span>
                <span className="font-medium">{new Date(module.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modifié le:</span>
                <span className="font-medium">{new Date(module.updated_at).toLocaleDateString('fr-FR')}</span>
              </div>
              {module.program_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Programme:</span>
                  <span className="font-medium">{module.program_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium">#{module.order_index || 0}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <a
                href={`/expert/moduleedit/${module.module_id}`}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-teal-700 bg-teal-50 rounded-2xl hover:bg-teal-100 transition-all"
              >
                <Edit3 className="h-4 w-4 mr-3" />
                Modifier le module
              </a>
              
              <a
                href={`/expert/modulecontent/${module.module_id}`}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all"
              >
                <FileText className="h-4 w-4 mr-3" />
                Gérer les contenus
              </a>

              <a
                href={`/expert/modulestats/${module.module_id}`}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-purple-700 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-all"
              >
                <BarChart3 className="h-4 w-4 mr-3" />
                Voir les statistiques
              </a>

              {module.status === 'draft' && (
                <Form method="post" className="w-full">
                  <input type="hidden" name="action" value="publish_module" />
                  <button
                    type="submit"
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-green-700 bg-green-50 rounded-2xl hover:bg-green-100 transition-all"
                  >
                    <CheckCircle className="h-4 w-4 mr-3" />
                    Publier le module
                  </button>
                </Form>
              )}

              <Form method="post" className="w-full">
                <input type="hidden" name="action" value="delete_module" />
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible.')) {
                      e.preventDefault();
                    }
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-700 bg-red-50 rounded-2xl hover:bg-red-100 transition-all"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Supprimer le module
                </button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatBadge({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="bg-white/20 backdrop-blur rounded-2xl p-3">
      <div className="flex items-center text-white/80 text-xs mb-1">
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function ContentItem({ content, index }: { content: any; index: number }) {
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4 text-red-500" />;
      case 'text': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'audio': return <Play className="h-4 w-4 text-green-500" />;
      case 'document': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContentTypeBadge = (type: string) => {
    const configs = {
      video: 'bg-red-100 text-red-700',
      text: 'bg-blue-100 text-blue-700',
      audio: 'bg-green-100 text-green-700',
      document: 'bg-purple-100 text-purple-700',
    };
    return configs[type as keyof typeof configs] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
      <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-sm font-medium text-teal-700 mr-4">
        {index + 1}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="font-medium text-gray-900 truncate">{content.title}</h4>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getContentTypeBadge(content.content_type)}`}>
            {getContentTypeIcon(content.content_type)}
            <span className="ml-1 capitalize">{content.content_type}</span>
          </span>
        </div>
        
        {content.description && (
          <p className="text-sm text-gray-600 truncate">{content.description}</p>
        )}
        
        {content.duration_seconds && (
          <p className="text-xs text-gray-500 mt-1">
            Durée: {Math.ceil(content.duration_seconds / 60)} minutes
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}