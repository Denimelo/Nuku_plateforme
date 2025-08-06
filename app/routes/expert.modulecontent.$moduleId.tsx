import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigate, useParams } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireExpert } from "~/utils/auth.server";
import { getExpertNavigation } from "~/utils/expert-navigation";
import { getUserSession } from "~/utils/session.server";
import { modulesServerAPI, expertsServerAPI } from "~/utils/api.server";
import { 
  ArrowLeft,
  Plus,
  FileText,
  Video,
  Headphones,
  File,
  Link,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle,
  Upload,
  Save,
  Move,
  Play,
  GripVertical,
  X,
  Image
} from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireExpert(request);
  const session = await getUserSession(request);
  const { moduleId } = params;
  
  if (!session || !moduleId) {
    throw new Error("Session ou module ID introuvable");
  }

  const url = new URL(request.url);
  const successMessage = url.searchParams.get("success");

  try {
    const [moduleDetails, moduleContents] = await Promise.all([
      modulesServerAPI.getModule(session.token, moduleId),
      modulesServerAPI.getModuleContents(session.token, moduleId).catch(() => [])
    ]);

    return json({ 
      user, 
      module: moduleDetails,
      contents: moduleContents,
      successMessage // AJOUTER cette ligne
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
      case "add_content":
        const contentData = new FormData();
        contentData.append("title", formData.get("title") as string);
        contentData.append("description", formData.get("description") as string || "");
        contentData.append("content_type", formData.get("content_type") as string);
        contentData.append("text_content", formData.get("text_content") as string || "");
        contentData.append("external_link", formData.get("external_link") as string || "");
        contentData.append("order_index", formData.get("order_index") as string || "0");
        contentData.append("is_visible", formData.get("is_visible") as string || "true");
        contentData.append("is_downloadable", formData.get("is_downloadable") as string || "false");
        
        const file = formData.get("file") as File;
        if (file && file.size > 0) {
          contentData.append("file", file);
        }

        await modulesServerAPI.addModuleContent(session.token, moduleId, contentData);
        return json({ success: "Contenu ajouté avec succès" });

      case "update_content":
        const contentId = formData.get("contentId") as string;
        const updateData = {
          title: formData.get("title") as string,
          description: formData.get("description") as string || null,
          text_content: formData.get("text_content") as string || null,
          external_link: formData.get("external_link") as string || null,
          is_visible: formData.get("is_visible") === "true",
          is_downloadable: formData.get("is_downloadable") === "true",
        };
        
        await modulesServerAPI.updateModuleContent(session.token, contentId, updateData);
        return json({ success: "Contenu modifié avec succès" });

      case "delete_content":
        const deleteContentId = formData.get("contentId") as string;
        await modulesServerAPI.deleteModuleContent(session.token, deleteContentId);
        return json({ success: "Contenu supprimé avec succès" });

      case "reorder_contents":
        const contentOrders = JSON.parse(formData.get("contentOrders") as string);
        await modulesServerAPI.reorderModuleContents(session.token, moduleId, contentOrders);
        return json({ success: "Ordre des contenus mis à jour" });

      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error: any) {
    return json({ error: error.message || "Erreur lors de l'action" }, { status: 400 });
  }
}

export default function ExpertModuleContent() {
  const { user, module, contents, successMessage } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const params = useParams();

  const [showAddContent, setShowAddContent] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const navigation = getExpertNavigation(`/expert/modulecontent/${params.moduleId}`);

  const contentTypes = [
    { value: "text", label: "Texte", icon: FileText, description: "Article, cours écrit", color: "blue" },
    { value: "video", label: "Vidéo", icon: Video, description: "Vidéo éducative", color: "red" },
    { value: "audio", label: "Audio", icon: Headphones, description: "Podcast, audio", color: "green" },
    // { value: "image", label: "Image", icon: Image, description: "Photo, illustration", color: "pink" },
    { value: "document", label: "Document", icon: File, description: "PDF, Word", color: "purple" },
    { value: "link", label: "Lien", icon: Link, description: "Ressource externe", color: "orange" },
  ];

  const getContentTypeIcon = (type: string) => {
    const config = contentTypes.find(t => t.value === type);
    if (!config) return <FileText className="h-4 w-4" />;
    const IconComponent = config.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  const getContentTypeBadge = (type: string) => {
    const config = contentTypes.find(t => t.value === type);
    if (!config) return { label: type, color: "bg-gray-100 text-gray-700" };
    
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    green: "bg-green-100 text-green-700",
    pink: "bg-pink-100 text-pink-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
  };
    
    return { label: config.label, color: colors[config.color as keyof typeof colors] };
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Layout user={user} title={`Contenus: ${module.title}`} navigation={navigation}>
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Gestion des contenus</h1>
                <p className="text-xl text-slate-200 mb-2">{module.title}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                    {contents.length} contenu(s)
                  </span>
                  <span className={`px-3 py-1 rounded-full ${
                    module.status === 'published' 
                      ? 'bg-green-500/20 text-green-100' 
                      : 'bg-yellow-500/20 text-yellow-100'
                  }`}>
                    {module.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShowAddContent(true)}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur rounded-2xl text-white hover:bg-white/30 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter du contenu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AJOUTER cette section pour les messages de succès depuis l'URL */}
      {successMessage && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">
                {successMessage === 'content_created' && 'Contenu ajouté avec succès !'}
                {successMessage === 'content_updated' && 'Contenu modifié avec succès !'}
                {successMessage === 'content_deleted' && 'Contenu supprimé avec succès !'}
                {!['content_created', 'content_updated', 'content_deleted'].includes(successMessage) && 'Opération réussie !'}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Liste des contenus */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Contenus du module ({contents.length})
            </h3>
            {!showAddContent && (
              <button
                onClick={() => setShowAddContent(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-2xl hover:bg-teal-200 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter du contenu
              </button>
            )}
          </div>

          {/* Formulaire d'ajout de contenu */}
          {showAddContent && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Ajouter un nouveau contenu</h4>
              <AddContentForm
                contentTypes={contentTypes}
                onCancel={() => setShowAddContent(false)}
              />
            </div>
          )}

          {/* Liste des contenus existants */}
          {contents.length > 0 ? (
            <div className="space-y-4">
              {contents
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((content: any, index: number) => (
                <ContentItem
                  key={content.content_id}
                  content={content}
                  index={index}
                  getContentTypeIcon={getContentTypeIcon}
                  getContentTypeBadge={getContentTypeBadge}
                  formatFileSize={formatFileSize}
                  formatDuration={formatDuration}
                  onEdit={setEditingContent}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Aucun contenu ajouté
              </h4>
              <p className="text-gray-500 mb-6">
                Commencez à enrichir votre module en ajoutant du contenu pédagogique.
              </p>
              <button
                onClick={() => setShowAddContent(true)}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier contenu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {editingContent && (
        <EditContentModal
          content={editingContent}
          contentTypes={contentTypes}
          onClose={() => setEditingContent(null)}
        />
      )}
    </Layout>
  );
}

function AddContentForm({ contentTypes, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "text",
    text_content: "",
    external_link: "",
    is_visible: true,
    is_downloadable: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Créer un aperçu pour les images
      // if (file.type.startsWith('image/')) {
      //   const reader = new FileReader();
      //   reader.onload = (e) => setFilePreview(e.target?.result as string);
      //   reader.readAsDataURL(file);
      // } else {
      //   setFilePreview(null);
      // }
    }
  };

  return (
    <Form method="post" encType="multipart/form-data" className="space-y-6">
      <input type="hidden" name="action" value="add_content" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholder="Ex: Introduction au marketing digital"
          />
        </div>

        <div>
          <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 mb-2">
            Type de contenu *
          </label>
          <select
            id="content_type"
            name="content_type"
            required
            value={formData.content_type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          >
            {contentTypes.map((type: any) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
        </div>
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

      {/* Contenu spécifique selon le type */}
      {formData.content_type === "text" && (
        <div>
          <label htmlFor="text_content" className="block text-sm font-medium text-gray-700 mb-2">
            Contenu textuel *
          </label>
          <textarea
            id="text_content"
            name="text_content"
            rows={8}
            required
            value={formData.text_content}
            onChange={handleChange}
            placeholder="Rédigez votre contenu ici..."
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
          />
        </div>
      )}

      {formData.content_type === "link" && (
        <div>
          <label htmlFor="external_link" className="block text-sm font-medium text-gray-700 mb-2">
            Lien externe *
          </label>
          <input
            id="external_link"
            name="external_link"
            type="url"
            required
            value={formData.external_link}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            placeholder="https://..."
          />
        </div>
      )}

        {["video", "audio", "document", "image"].includes(formData.content_type) && (
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Fichier *
            </label>
            
            {/* Afficher le fichier sélectionné s'il y en a un */}
            {selectedFile ? (
              <div className="border-2 border-dashed border-green-300 rounded-2xl p-6 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                      // Reset input file
                      const fileInput = document.getElementById('file') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                    >
                      <span>Télécharger un fichier</span>
                      <input 
                        id="file" 
                        name="file" 
                        type="file" 
                        className="sr-only"
                        onChange={handleFileChange}
                        accept={
                          formData.content_type === "video" ? "video/*" :
                          formData.content_type === "audio" ? "audio/*" :
                          formData.content_type === "image" ? "image/*" :
                          formData.content_type === "document" ? ".pdf,.doc,.docx,.ppt,.pptx" :
                          "*"
                        }
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.content_type === "video" && "MP4, AVI, MOV jusqu'à 100MB"}
                    {formData.content_type === "audio" && "MP3, WAV, AAC jusqu'à 50MB"}
                    {formData.content_type === "image" && "JPG, PNG, GIF, WEBP jusqu'à 10MB"}
                    {formData.content_type === "document" && "PDF, DOC, DOCX jusqu'à 25MB"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}   

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            Contenu visible
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="is_downloadable"
            name="is_downloadable"
            type="checkbox"
            checked={formData.is_downloadable}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="is_downloadable" className="ml-2 block text-sm text-gray-700">
            Téléchargeable
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!formData.title}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5 mr-2" />
          Ajouter le contenu
        </button>
      </div>
    </Form>
  );
}

function ContentItem({ content, index, getContentTypeIcon, getContentTypeBadge, formatFileSize, formatDuration, onEdit }: any) {
  const [showActions, setShowActions] = useState(false);
  const typeBadge = getContentTypeBadge(content.content_type);

  return (
    <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all">
      {/* Poignée de glissement */}
      <div className="flex-shrink-0 mr-4">
        <div className="flex items-center space-x-3">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-sm font-medium text-teal-700">
            {index + 1}
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h4 className="font-medium text-gray-900">{content.title}</h4>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeBadge.color}`}>
            {getContentTypeIcon(content.content_type)}
            <span className="ml-1">{typeBadge.label}</span>
          </span>
          
          {!content.is_visible && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <EyeOff className="h-3 w-3 mr-1" />
              Masqué
            </span>
          )}
          
          {content.is_downloadable && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
              <Download className="h-3 w-3 mr-1" />
              Téléchargeable
            </span>
          )}
        </div>
        
        {content.description && (
          <p className="text-sm text-gray-600 mb-2">{content.description}</p>
        )}

        {/* AJOUTER cette section pour afficher les fichiers */}
        {content.file_url && (
          <div className="mb-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {content.content_type === 'video' && <Video className="h-5 w-5 text-blue-600" />}
                {content.content_type === 'audio' && <Headphones className="h-5 w-5 text-green-600" />}
                {content.content_type === 'document' && <FileText className="h-5 w-5 text-purple-600" />}
                {content.content_type === 'image' && <Image className="h-5 w-5 text-orange-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 truncate">
                  {content.original_filename || 'Fichier uploadé'}
                </p>
                <div className="flex items-center space-x-2 text-xs text-blue-700">
                  {content.file_size && (
                    <span>{formatFileSize(content.file_size)}</span>
                  )}
                  {content.duration_seconds && (
                    <span>• {formatDuration(content.duration_seconds)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={content.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                  title="Voir le fichier"
                >
                  <Eye className="h-4 w-4" />
                </a>
                {content.is_downloadable && (
                  <a
                    href={content.file_url}
                    download
                    className="text-green-600 hover:text-green-800 p-1 rounded"
                    title="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenu textuel ou lien */}
        {content.text_content && (
          <div className="mb-2 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700 line-clamp-3">{content.text_content}</p>
          </div>
        )}

        {content.external_link && (
          <div className="mb-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <a
              href={content.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Link className="h-4 w-4 mr-2" />
              {content.external_link}
            </a>
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>
            Créé le {new Date(content.created_at).toLocaleDateString('fr-FR')}
          </span>
          {content.updated_at && content.updated_at !== content.created_at && (
            <span>
              • Modifié le {new Date(content.updated_at).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>


      {/* Actions */}
      <div className="flex-shrink-0 relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
        
        {showActions && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 z-10">
            <div className="p-2">
              {content.file_url && (
                <a
                  href={content.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Prévisualiser
                </a>
              )}
              
              <button
                onClick={() => {
                  onEdit(content);
                  setShowActions(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-teal-700 hover:bg-teal-50 rounded-xl"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier
              </button>

              <button
                onClick={() => {
                  // TODO: Implémenter duplication
                  setShowActions(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-xl"
              >
                <FileText className="h-4 w-4 mr-2" />
                Dupliquer
              </button>
              
              <Form method="post" className="inline">
                <input type="hidden" name="action" value="delete_content" />
                <input type="hidden" name="contentId" value={content.content_id} />
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
                      e.preventDefault();
                    }
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditContentModal({ content, contentTypes, onClose }: any) {
  const [formData, setFormData] = useState({
    title: content.title || "",
    description: content.description || "",
    text_content: content.text_content || "",
    external_link: content.external_link || "",
    is_visible: content.is_visible ?? true,
    is_downloadable: content.is_downloadable ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-3xl bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Modifier le contenu
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <Form method="post" className="space-y-6">
            <input type="hidden" name="action" value="update_content" />
            <input type="hidden" name="contentId" value={content.content_id} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="edit_title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du contenu *
                </label>
                <input
                  id="edit_title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    id="edit_is_visible"
                    name="is_visible"
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit_is_visible" className="ml-2 block text-sm text-gray-700">
                    Visible
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="edit_is_downloadable"
                    name="is_downloadable"
                    type="checkbox"
                    checked={formData.is_downloadable}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit_is_downloadable" className="ml-2 block text-sm text-gray-700">
                    Téléchargeable
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="edit_description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="edit_description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {content.content_type === "text" && (
              <div>
                <label htmlFor="edit_text_content" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu textuel
                </label>
                <textarea
                  id="edit_text_content"
                  name="text_content"
                  rows={8}
                  value={formData.text_content}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            )}

            {content.content_type === "link" && (
              <div>
                <label htmlFor="edit_external_link" className="block text-sm font-medium text-gray-700 mb-2">
                  Lien externe
                </label>
                <input
                  id="edit_external_link"
                  name="external_link"
                  type="url"
                  value={formData.external_link}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {content.file_url && (
              <div className="bg-gray-50 p-4 rounded-2xl">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Fichier actuel</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {contentTypes.find((t: any) => t.value === content.content_type)?.icon && 
                      React.createElement(contentTypes.find((t: any) => t.value === content.content_type).icon, { className: "h-4 w-4 text-gray-600" })
                    }
                    <span className="text-sm text-gray-700">{content.title}</span>
                  </div>
                  {content.file_size && (
                    <span className="text-xs text-gray-500">
                      {formatFileSize(content.file_size)}
                    </span>
                  )}
                  <a
                    href={content.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    Voir le fichier
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 transition-all"
              >
                <Save className="h-5 w-5 mr-2" />
                Enregistrer les modifications
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}