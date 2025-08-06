import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigate, useParams } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireExpert } from "~/utils/auth.server";
import { getExpertNavigation } from "~/utils/expert-navigation";
import { getUserSession } from "~/utils/session.server";
import { modulesServerAPI, programsServerAPI } from "~/utils/api.server";
import { 
  ArrowLeft,
  BookOpen,
  Users,
  Target,
  FileText,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
  Zap,
  AlertTriangle,
  Lightbulb,
  Eye
} from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireExpert(request);
  const session = await getUserSession(request);
  const { moduleId } = params;
  
  if (!session || !moduleId) {
    throw new Error("Session ou module ID introuvable");
  }

  try {
    // Récupérer les détails du module et les programmes
    const [moduleDetails, programsData] = await Promise.all([
      modulesServerAPI.getModule(session.token, moduleId),
      programsServerAPI.getPrograms(session.token, true).catch(() => [])
    ]);

    // Vérifier que l'expert est bien le créateur du module
    // if (moduleDetails.created_by !== user.user_id) {
    //   throw new Response("Non autorisé", { status: 403 });
    // }

    return json({ 
      user, 
      module: moduleDetails,
      programs: programsData 
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

  const user = await requireExpert(request);
  if (!user) {
    return json({ error: "Utilisateur non trouvé" }, { status: 401 });
  }

  const formData = await request.formData();
  
  const moduleData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    learning_objectives: formData.get("learning_objectives") as string || null,
    module_type: formData.get("module_type") as string,
    difficulty_level: formData.get("difficulty_level") as string || "beginner",
    estimated_duration_minutes: formData.get("estimated_duration_minutes") ? 
      parseInt(formData.get("estimated_duration_minutes") as string) : null,
    status: formData.get("status") as string || "draft",
    program_id: formData.get("program_id") as string || null,
    is_mandatory: formData.get("is_mandatory") === "true",
    is_visible: formData.get("is_visible") === "true",
    order_index: formData.get("order_index") ? 
      parseInt(formData.get("order_index") as string) : 0,
  };

  console.log("=== MODIFICATION MODULE EXPERT ===");
  console.log("Données du formulaire:", moduleData);

  // Validations
  if (!moduleData.title?.trim()) {
    return json({ error: "Le titre du module est obligatoire" }, { status: 400 });
  }

  if (!moduleData.module_type) {
    return json({ error: "Le type de module est obligatoire" }, { status: 400 });
  }

  if (!moduleData.program_id) {
    return json({ error: "Vous devez sélectionner un programme" }, { status: 400 });
  }

  if (moduleData.estimated_duration_minutes && moduleData.estimated_duration_minutes < 1) {
    return json({ error: "La durée estimée doit être supérieure à 0 minute" }, { status: 400 });
  }

  try {
    const result = await modulesServerAPI.updateModule(session.token, moduleId, moduleData);
    console.log("=== SUCCÈS MODIFICATION MODULE ===");
    console.log("Résultat:", result);
    return redirect(`/expert/module/${moduleId}?success=module_updated`);
  } catch (error: any) {
    console.error("=== ERREUR MODIFICATION MODULE ===");
    console.error("Erreur complète:", error);
    
    let errorMessage = "Erreur lors de la modification du module";
    
    if (error.message?.includes("validation")) {
      errorMessage = "Erreur de validation des données. Vérifiez tous les champs obligatoires.";
    } else if (error.message?.includes("not found")) {
      errorMessage = "Module non trouvé ou vous n'avez pas les permissions pour le modifier.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return json({ 
      error: errorMessage,
      details: error.message 
    }, { status: 400 });
  }
}

export default function ExpertModuleEdit() {
  const { user, module, programs } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const params = useParams();
  
  const navigation = getExpertNavigation(`/expert/moduleedit/${params.moduleId}`);

  const [formData, setFormData] = useState({
    title: module.title || "",
    description: module.description || "",
    learning_objectives: module.learning_objectives || "",
    module_type: module.module_type || "lesson",
    difficulty_level: module.difficulty_level || "beginner",
    estimated_duration_minutes: module.estimated_duration_minutes?.toString() || "",
    status: module.status || "draft",
    program_id: module.program_id || "",
    is_mandatory: module.is_mandatory ?? true,
    is_visible: module.is_visible ?? true,
    order_index: module.order_index?.toString() || "0",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const moduleTypes = [
    { value: "lesson", label: "Cours", icon: BookOpen, description: "Contenu théorique et apprentissage", color: "blue" },
    { value: "workshop", label: "Atelier", icon: Users, description: "Session interactive et pratique", color: "green" },
    { value: "assessment", label: "Évaluation", icon: Target, description: "Test ou examen de connaissances", color: "purple" },
  ];

  const difficultyLevels = [
    { value: "beginner", label: "Débutant", color: "text-green-700 bg-green-100", description: "Accessible aux novices" },
    { value: "intermediate", label: "Intermédiaire", color: "text-yellow-700 bg-yellow-100", description: "Quelques prérequis nécessaires" },
    { value: "advanced", label: "Avancé", color: "text-red-700 bg-red-100", description: "Expertise préalable requise" },
  ];

  const formatDuration = (minutes: string) => {
    const mins = parseInt(minutes);
    if (!mins || mins < 60) {
      return `${mins || 0} minutes`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
    }
  };

  return (
    <Layout user={user} title={`Modifier: ${module.title}`} navigation={navigation}>
      {/* En-tête avec navigation */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate(`/expert/module/${module.module_id}`)}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au module
          </button>
          <span className="text-gray-300">•</span>
          <button
            onClick={() => navigate("/expert/modules")}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Mes modules
          </button>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg mr-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Modifier le module</h1>
                <p className="text-xl text-slate-200">
                  {module.title}
                </p>
                <div className="mt-2 flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    module.status === 'published' 
                      ? 'bg-green-500/20 text-green-100' 
                      : 'bg-yellow-500/20 text-yellow-100'
                  }`}>
                    {module.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                  <span className="text-slate-300 text-sm">
                    {module.total_content_count || 0} contenu(s)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages de retour */}
      {actionData?.error && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{actionData.error}</p>
              {actionData.details && (
                <p className="text-xs text-red-600 mt-1">Détails: {actionData.details}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides en haut */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <a
            href={`/expert/module/${module.module_id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-2xl hover:bg-teal-200 transition-all"
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir le module
          </a>
          <a
            href={`/expert/modulecontent/${module.module_id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-2xl hover:bg-blue-200 transition-all"
          >
            <FileText className="h-4 w-4 mr-2" />
            Gérer contenus
          </a>
        </div>
        
        <div className="text-sm text-gray-500">
          Dernière modification: {new Date(module.updated_at).toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* Formulaire principal */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
        <div className="p-8">
          <Form method="post" className="space-y-8">
            {/* Informations de base */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Informations de base
              </h4>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du module *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Ex: Les fondamentaux du marketing digital"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez le contenu et l'approche pédagogique de ce module..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="learning_objectives" className="block text-sm font-medium text-gray-700 mb-2">
                    Objectifs d'apprentissage
                  </label>
                  <textarea
                    id="learning_objectives"
                    name="learning_objectives"
                    rows={3}
                    value={formData.learning_objectives}
                    onChange={handleChange}
                    placeholder="À la fin de ce module, les participants seront capables de..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Listez 3-5 compétences ou connaissances spécifiques que les entrepreneurs acquerront
                  </p>
                </div>

                <div>
                  <label htmlFor="program_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Programme *
                  </label>
                  <select
                    id="program_id"
                    name="program_id"
                    required
                    value={formData.program_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner un programme</option>
                    {programs.map((program: any) => (
                      <option key={program.program_id} value={program.program_id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                  {programs.length === 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      Aucun programme disponible. Contactez un administrateur.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Type de module */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Type de module
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {moduleTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-md ${
                      formData.module_type === type.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="module_type"
                      value={type.value}
                      checked={formData.module_type === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center mb-2">
                      <type.icon className={`h-6 w-6 mr-2 ${
                        formData.module_type === type.value ? 'text-teal-600' : 'text-gray-500'
                      }`} />
                      <span className={`font-bold ${
                        formData.module_type === type.value ? 'text-teal-900' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{type.description}</span>
                    {formData.module_type === type.value && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-teal-600" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Paramètres du module */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Paramètres du module
              </h4>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau de difficulté
                    </label>
                    <select
                      id="difficulty_level"
                      name="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      {difficultyLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label} - {level.description}
                        </option>
                      ))}
                    </select>
                    {formData.difficulty_level && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          difficultyLevels.find(l => l.value === formData.difficulty_level)?.color
                        }`}>
                          {difficultyLevels.find(l => l.value === formData.difficulty_level)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="estimated_duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                      Durée estimée (minutes)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="estimated_duration_minutes"
                        name="estimated_duration_minutes"
                        type="number"
                        min="1"
                        max="600"
                        value={formData.estimated_duration_minutes}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="60"
                      />
                    </div>
                    {formData.estimated_duration_minutes && (
                      <p className="mt-1 text-xs text-gray-500">
                        Durée: {formatDuration(formData.estimated_duration_minutes)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-2">
                      Position dans le programme
                    </label>
                    <input
                      id="order_index"
                      name="order_index"
                      type="number"
                      min="0"
                      value={formData.order_index}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      0 = premier module, ordre croissant
                    </p>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Statut de publication
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.status === "published" ? 
                        "Le module sera visible par les participants" :
                        "Le module restera en mode privé"
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      id="is_mandatory"
                      name="is_mandatory"
                      type="checkbox"
                      checked={formData.is_mandatory}
                      onChange={handleChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_mandatory" className="ml-2 block text-sm text-gray-700">
                      Module obligatoire
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_visible"
                      name="is_visible"
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={handleChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-700">
                      Module visible
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Aperçu des modifications */}
            {formData.title && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Aperçu des modifications
                </h4>
                
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h5>
                      {formData.description && (
                        <p className="text-gray-600 mb-3">{formData.description}</p>
                      )}
                      <div className="flex items-center space-x-3 text-sm">
                        <span className={`px-3 py-1 rounded-full font-medium ${
                          moduleTypes.find(t => t.value === formData.module_type)?.color === 'blue' 
                            ? 'bg-blue-100 text-blue-800'
                            : moduleTypes.find(t => t.value === formData.module_type)?.color === 'green'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {moduleTypes.find(t => t.value === formData.module_type)?.label}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          difficultyLevels.find(l => l.value === formData.difficulty_level)?.color
                        }`}>
                          {difficultyLevels.find(l => l.value === formData.difficulty_level)?.label}
                        </span>

                        {formData.estimated_duration_minutes && (
                          <span className="text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(formData.estimated_duration_minutes)}
                          </span>
                        )}
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          formData.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {formData.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.learning_objectives && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h6 className="font-medium text-gray-900 mb-2">Objectifs d'apprentissage :</h6>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.learning_objectives}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/expert/module/${module.module_id}`)}
                className="px-6 py-3 border border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!formData.title || !formData.program_id}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5 mr-2" />
                Enregistrer les modifications
              </button>
            </div>
          </Form>
        </div>
      </div>
    </Layout>
  );
}