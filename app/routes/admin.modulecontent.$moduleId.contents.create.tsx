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
  FileText,
  Video,
  Headphones,
  Image,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Link,
  PlayCircle,
  Eye,
  Plus,
  Layers,
  AlertCircle
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
    // Récupérer les détails du module
    const moduleData = await fetch(`${API_BASE_URL}/modules/${moduleId}`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => {
      if (!res.ok) throw new Error("Module non trouvé");
      return res.json();
    });

    // Récupérer les contenus existants pour déterminer l'ordre
    const contentsData = await fetch(`${API_BASE_URL}/modules/${moduleId}/contents`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => {
      if (!res.ok) return [];
      return res.json();
    }).catch(() => []);

    return json({ user, module: moduleData, existingContents: contentsData, moduleId });
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
  
  const contentData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    content_type: formData.get("content_type") as string,
    file_url: formData.get("file_url") as string || null,
    duration_seconds: formData.get("duration_minutes") ? 
      parseInt(formData.get("duration_minutes") as string) * 60 : null,
    order_index: formData.get("order_index") ? 
      parseInt(formData.get("order_index") as string) : 1,
    content_text: formData.get("content_text") as string || null,
  };

  console.log("=== AJOUT CONTENU MODULE ===");
  console.log("Module ID:", moduleId);
  console.log("Données du contenu:", contentData);

  // Validations
  if (!contentData.title?.trim()) {
    return json({ error: "Le titre du contenu est obligatoire" }, { status: 400 });
  }

  if (!contentData.content_type) {
    return json({ error: "Le type de contenu est obligatoire" }, { status: 400 });
  }

  // Validation spécifique selon le type de contenu
  if ((contentData.content_type === "video" || contentData.content_type === "audio" || contentData.content_type === "document") 
      && !contentData.file_url?.trim()) {
    return json({ error: `Une URL est obligatoire pour le contenu de type ${contentData.content_type}` }, { status: 400 });
  }

  if (contentData.content_type === "text" && !contentData.content_text?.trim()) {
    return json({ error: "Le contenu texte est obligatoire pour ce type" }, { status: 400 });
  }

  if (contentData.duration_seconds && contentData.duration_seconds < 1) {
    return json({ error: "La durée doit être supérieure à 0 minute" }, { status: 400 });
  }

  try {
    const result = await modulesServerAPI.addContent(session.token, moduleId, contentData);
    console.log("=== SUCCÈS AJOUT CONTENU ===");
    console.log("Résultat:", result);
    return redirect(`/admin/module/${moduleId}?success=content_added`);
  } catch (error: any) {
    console.error("=== ERREUR AJOUT CONTENU ===");
    console.error("Erreur complète:", error);
    
    let errorMessage = "Erreur lors de l'ajout du contenu";
    
    if (error.message?.includes("validation")) {
      errorMessage = "Erreur de validation des données. Vérifiez tous les champs obligatoires.";
    } else if (error.message?.includes("not found")) {
      errorMessage = "Module non trouvé.";
    } else if (error.message?.includes("duplicate")) {
      errorMessage = "Un contenu avec ce titre existe déjà dans ce module.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return json({ 
      error: errorMessage,
      details: error.message 
    }, { status: 400 });
  }
}

export default function AdminModuleContentCreate() {
  const { user, module, existingContents, moduleId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  
  const navigation = getAdminNavigation("/admin/modules");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "text",
    file_url: "",
    duration_minutes: "",
    order_index: (existingContents.length + 1).toString(),
    content_text: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contentTypes = [
    { 
      value: "text", 
      label: "Texte", 
      icon: FileText, 
      description: "Article, cours écrit, documentation",
      color: "text-gray-600 bg-gray-100"
    },
    { 
      value: "video", 
      label: "Vidéo", 
      icon: Video, 
      description: "Vidéo explicative, tutoriel, présentation",
      color: "text-red-600 bg-red-100"
    },
    { 
      value: "audio", 
      label: "Audio", 
      icon: Headphones, 
      description: "Podcast, enregistrement, présentation audio",
      color: "text-purple-600 bg-purple-100"
    },
    { 
      value: "document", 
      label: "Document", 
      icon: FileText, 
      description: "PDF, présentation, fiche technique",
      color: "text-blue-600 bg-blue-100"
    },
  ];

  const selectedContentType = contentTypes.find(type => type.value === formData.content_type);

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

  const isUrlRequired = formData.content_type !== "text";
  const isTextRequired = formData.content_type === "text";

  return (
    <Layout user={user} title={`Ajouter du contenu - ${module.title}`} navigation={navigation}>
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
                <Plus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Ajouter du contenu</h1>
                <p className="text-xl text-slate-200">
                  Module: {module.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-white/80 text-sm">
              <div className="flex items-center">
                <Layers className="h-4 w-4 mr-1" />
                {existingContents.length} contenus existants
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Position #{existingContents.length + 1}
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
                    Titre du contenu *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Ex: Introduction aux concepts de base"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez brièvement ce contenu..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-2">
                      Position dans le module
                    </label>
                    <input
                      id="order_index"
                      name="order_index"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.order_index}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Ordre d'affichage dans le module (1 = premier)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                      Durée estimée (minutes)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="duration_minutes"
                        name="duration_minutes"
                        type="number"
                        min="1"
                        max="300"
                        value={formData.duration_minutes}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="15"
                      />
                    </div>
                    {formData.duration_minutes && (
                      <p className="mt-1 text-xs text-gray-500">
                        Durée: {formatDuration(formData.duration_minutes)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Type de contenu */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Type de contenu
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {contentTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-md ${
                      formData.content_type === type.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="content_type"
                      value={type.value}
                      checked={formData.content_type === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-center mb-3">
                      <div className={`p-3 rounded-xl ${
                        formData.content_type === type.value ? 'bg-teal-100' : type.color
                      }`}>
                        <type.icon className={`h-6 w-6 ${
                          formData.content_type === type.value ? 'text-teal-600' : type.color.split(' ')[0]
                        }`} />
                      </div>
                    </div>
                    <div className="text-center">
                      <span className={`font-bold text-sm mb-1 block ${
                        formData.content_type === type.value ? 'text-teal-900' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </span>
                      <span className="text-xs text-gray-600">{type.description}</span>
                    </div>
                    {formData.content_type === type.value && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-teal-600" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Contenu spécifique selon le type */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                {selectedContentType && <selectedContentType.icon className="h-5 w-5 mr-2" />}
                Contenu {selectedContentType?.label.toLowerCase()}
              </h4>

              {/* URL pour vidéo, audio, document */}
              {isUrlRequired && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="file_url" className="block text-sm font-medium text-gray-700 mb-2">
                      URL du {formData.content_type} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Link className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="file_url"
                        name="file_url"
                        type="url"
                        required={isUrlRequired}
                        value={formData.file_url}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder={`https://example.com/${formData.content_type}`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.content_type === "video" && "URL YouTube, Vimeo ou lien direct vers le fichier vidéo"}
                      {formData.content_type === "audio" && "URL Spotify, SoundCloud ou lien direct vers le fichier audio"}
                      {formData.content_type === "document" && "URL Google Drive, Dropbox ou lien direct vers le document"}
                    </p>
                  </div>

                  {/* Aperçu de l'URL */}
                  {formData.file_url && (
                    <div className="p-4 bg-white rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {selectedContentType && <selectedContentType.icon className="h-5 w-5 text-gray-500" />}
                          <div>
                            <p className="text-sm font-medium text-gray-900">Aperçu</p>
                            <p className="text-xs text-gray-500 truncate max-w-md">{formData.file_url}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => window.open(formData.file_url, '_blank')}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {formData.content_type === "video" && (
                            <PlayCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contenu texte */}
              {isTextRequired && (
                <div>
                  <label htmlFor="content_text" className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu texte *
                  </label>
                  <textarea
                    id="content_text"
                    name="content_text"
                    rows={12}
                    required={isTextRequired}
                    value={formData.content_text}
                    onChange={handleChange}
                    placeholder="Rédigez votre contenu ici... Vous pouvez utiliser du markdown pour la mise en forme."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Support du Markdown pour la mise en forme (gras, italique, listes, etc.)
                  </p>

                  {/* Compteur de caractères */}
                  {formData.content_text && (
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <span>{formData.content_text.length} caractères</span>
                      <span>≈ {Math.ceil(formData.content_text.length / 5)} mots</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Aperçu du contenu */}
            {formData.title && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Aperçu du contenu
                </h4>
                
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-600 font-bold text-sm">
                        {formData.order_index}
                      </div>
                      {selectedContentType && (
                        <selectedContentType.icon className={`h-5 w-5 ${selectedContentType.color.split(' ')[0]}`} />
                      )}
                      <div>
                        <h5 className="font-bold text-gray-900">{formData.title}</h5>
                        {formData.description && (
                          <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {formData.duration_minutes && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {formData.duration_minutes} min
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${selectedContentType?.color}`}>
                        {selectedContentType?.label}
                      </span>
                    </div>
                  </div>

                  {formData.content_type === "text" && formData.content_text && (
                    <div className="bg-gray-50 p-4 rounded-xl max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {formData.content_text.slice(0, 200)}
                        {formData.content_text.length > 200 && "..."}
                      </p>
                    </div>
                  )}

                  {isUrlRequired && formData.file_url && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">URL:</span>{" "}
                        <a 
                          href={formData.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline truncate"
                        >
                          {formData.file_url}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informations sur le module parent */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Informations du module
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span className="text-gray-600">Module:</span>
                  <span className="font-medium text-gray-900">{module.title}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{module.module_type}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span className="text-gray-600">Contenus:</span>
                  <span className="font-medium text-gray-900">{existingContents.length} existants</span>
                </div>
              </div>
            </div>

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
                Ajouter le contenu
              </button>
            </div>
          </Form>
        </div>
      </div>
    </Layout>
  );
}