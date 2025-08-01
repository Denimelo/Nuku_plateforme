import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigate } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { modulesServerAPI } from "~/utils/api.server";
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
  AlertTriangle
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const moduleId = params.moduleId;
  if (!moduleId) {
    throw new Error("ID module manquant");
  }

  try {
    // Récupérer les détails du module à modifier
    const moduleData = await fetch(`${API_BASE_URL}/modules/${moduleId}`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => {
      if (!res.ok) throw new Error("Module non trouvé");
      return res.json();
    });

    // Récupérer tous les programmes actifs pour le sélecteur
    const programsData = await fetch(`${API_BASE_URL}/programs/?active_only=true`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => {
      if (!res.ok) return [];
      return res.json();
    }).catch(() => []);

    return json({ user, module: moduleData, programs: programsData, moduleId });
  } catch (error) {
    console.error("Erreur lors du chargement du module:", error);
    throw new Error("Module introuvable");
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  if (!session) {
    return json({ error: "Session non trouvée" }, { status: 401 });
  }

  const user = await requireAdmin(request);
  if (!user) {
    return json({ error: "Utilisateur non trouvé" }, { status: 401 });
  }

  const moduleId = params.moduleId;
  if (!moduleId) {
    return json({ error: "ID module manquant" }, { status: 400 });
  }

  const formData = await request.formData();
  
  const moduleData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    module_type: formData.get("module_type") as string,
    difficulty_level: formData.get("difficulty_level") as string || "beginner",
    estimated_duration_minutes: formData.get("estimated_duration_minutes") ? 
      parseInt(formData.get("estimated_duration_minutes") as string) : null,
    status: formData.get("status") as string || "draft",
    program_id: formData.get("program_id") as string || null,
  };

  console.log("=== MODIFICATION MODULE ===");
  console.log("Module ID:", moduleId);
  console.log("Données du formulaire:", moduleData);

  // Validations
  if (!moduleData.title?.trim()) {
    return json({ error: "Le titre du module est obligatoire" }, { status: 400 });
  }

  if (!moduleData.module_type) {
    return json({ error: "Le type de module est obligatoire" }, { status: 400 });
  }

  if (moduleData.estimated_duration_minutes && moduleData.estimated_duration_minutes < 1) {
    return json({ error: "La durée estimée doit être supérieure à 0 minute" }, { status: 400 });
  }

  try {
    const result = await modulesServerAPI.updateModule(session.token, moduleId, moduleData);
    console.log("=== SUCCÈS MODIFICATION MODULE ===");
    console.log("Résultat:", result);
    return redirect(`/admin/module/${moduleId}?success=module_updated`);
  } catch (error: any) {
    console.error("=== ERREUR MODIFICATION MODULE ===");
    console.error("Erreur complète:", error);
    
    let errorMessage = "Erreur lors de la modification du module";
    
    if (error.message?.includes("validation")) {
      errorMessage = "Erreur de validation des données. Vérifiez tous les champs obligatoires.";
    } else if (error.message?.includes("not found")) {
      errorMessage = "Module non trouvé.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return json({ 
      error: errorMessage,
      details: error.message 
    }, { status: 400 });
  }
}

export default function AdminModuleEdit() {
  const { user, module, programs, moduleId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  
  const navigation = getAdminNavigation("/admin/modules");

  const [formData, setFormData] = useState({
    title: module.title || "",
    description: module.description || "",
    module_type: module.module_type || "lesson",
    difficulty_level: module.difficulty_level || "beginner",
    estimated_duration_minutes: module.estimated_duration_minutes?.toString() || "",
    status: module.status || "draft",
    program_id: module.program_id || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const moduleTypes = [
    { value: "lesson", label: "Cours", icon: BookOpen, description: "Contenu théorique et apprentissage" },
    { value: "workshop", label: "Atelier", icon: Users, description: "Session interactive et pratique" },
    { value: "assessment", label: "Évaluation", icon: Target, description: "Test ou examen de connaissances" },
  ];

  const difficultyLevels = [
    { value: "beginner", label: "Débutant", color: "text-green-700 bg-green-100" },
    { value: "intermediate", label: "Intermédiaire", color: "text-yellow-700 bg-yellow-100" },
    { value: "advanced", label: "Avancé", color: "text-red-700 bg-red-100" },
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
        <button
          onClick={() => navigate(`/admin/module/${moduleId}`)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux détails du module
        </button>

        <div className="bg-gradient-to-r from-slate-800 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg mr-4">
                <Layers className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Modifier le module</h1>
                <p className="text-xl text-slate-200">
                  {module.title}
                </p>
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

      {/* Avertissement pour module publié */}
      {module.status === "published" && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Module publié</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Ce module est actuellement publié et visible par les utilisateurs. Les modifications seront immédiatement appliquées.
              </p>
            </div>
          </div>
        </div>
      )}

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
                    placeholder="Ex: Introduction au Marketing Digital"
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
                    placeholder="Décrivez les objectifs et le contenu de ce module..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="program_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Programme associé
                  </label>
                  <select
                    id="program_id"
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="">Module indépendant</option>
                    {programs.map((program: any) => (
                      <option key={program.program_id} value={program.program_id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Vous pouvez créer un module indépendant ou l'associer à un programme
                  </p>
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
                        {level.label}
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

              <div className="mt-6">
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
                    "Ce module sera visible par tous les utilisateurs" :
                    "Les modules en brouillon ne sont pas visibles par les utilisateurs"
                  }
                </p>
              </div>
            </div>

            {/* Aperçu des modifications */}
            {(formData.title !== module.title || 
              formData.description !== module.description || 
              formData.module_type !== module.module_type ||
              formData.difficulty_level !== module.difficulty_level ||
              formData.status !== module.status) && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Modifications détectées
                </h4>
                
                <div className="space-y-3 text-sm">
                  {formData.title !== module.title && (
                    <div className="flex items-start">
                      <span className="font-medium text-gray-600 w-24 flex-shrink-0">Titre:</span>
                      <div className="flex-1">
                        <div className="text-red-600 line-through">{module.title}</div>
                        <div className="text-green-600 font-medium">{formData.title}</div>
                      </div>
                    </div>
                  )}
                  
                  {formData.module_type !== module.module_type && (
                    <div className="flex items-start">
                      <span className="font-medium text-gray-600 w-24 flex-shrink-0">Type:</span>
                      <div className="flex-1">
                        <div className="text-red-600 line-through">
                          {moduleTypes.find(t => t.value === module.module_type)?.label}
                        </div>
                        <div className="text-green-600 font-medium">
                          {moduleTypes.find(t => t.value === formData.module_type)?.label}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.status !== module.status && (
                    <div className="flex items-start">
                      <span className="font-medium text-gray-600 w-24 flex-shrink-0">Statut:</span>
                      <div className="flex-1">
                        <div className="text-red-600 line-through">
                          {module.status === "published" ? "Publié" : "Brouillon"}
                        </div>
                        <div className="text-green-600 font-medium">
                          {formData.status === "published" ? "Publié" : "Brouillon"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/admin/module/${moduleId}`)}
                className="px-6 py-3 border border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
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