import { useState } from "react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireExpert } from "~/utils/auth.server";
import { getExpertNavigation } from "~/utils/expert-navigation";
import { getUserSession } from "~/utils/session.server";
import { modulesServerAPI } from "~/utils/api.server";
import { 
  ArrowLeft,
  FileText,
  Video,
  Headphones,
  Link,
  Upload,
  X,
  CheckCircle,
  XCircle,
  Eye,
  Lightbulb
} from "lucide-react";

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  if (!session) {
    return json({ error: "Session non trouvée" }, { status: 401 });
  }

  const moduleId = params.moduleId;
  if (!moduleId) {
    return json({ error: "ID module manquant" }, { status: 400 });
  }

  const formData = await request.formData();
  const contentType = formData.get("content_type") as string;

  console.log("=== CRÉATION CONTENU MODULE ===");
  console.log("Type de contenu:", contentType);
  console.log("Titre:", formData.get("title"));

  try {
    // Créer un nouveau FormData pour l'API
    const apiFormData = new FormData();
    
    // Ajouter les champs de base
    apiFormData.append("title", formData.get("title") as string);
    apiFormData.append("content_type", contentType);
    apiFormData.append("description", formData.get("description") as string || "");
    apiFormData.append("is_visible", "true");
    apiFormData.append("is_downloadable", formData.get("is_downloadable") as string || "false");
    
    // Gérer les différents types de contenu
    if (contentType === "text" || contentType === "article") {
      const textContent = formData.get("content") as string;
      if (!textContent?.trim()) {
        return json({ error: "Le contenu textuel est requis pour ce type de contenu" }, { status: 400 });
      }
      apiFormData.append("text_content", textContent);
      
    } else if (contentType === "link") {
      const externalLink = formData.get("external_link") as string;
      if (!externalLink?.trim()) {
        return json({ error: "Le lien externe est requis pour ce type de contenu" }, { status: 400 });
      }
      apiFormData.append("external_link", externalLink);
      
    } else if ([
      "video", 
      "audio", 
      "document", 
      // "image", 
      "file"].includes(contentType)) {
      const file = formData.get("file") as File;
      if (!file || file.size === 0) {
        return json({ error: "Un fichier est requis pour ce type de contenu" }, { status: 400 });
      }
      
      // Vérifier la taille du fichier
      const maxSizes = {
        video: 100 * 1024 * 1024, // 100MB
        audio: 50 * 1024 * 1024,  // 50MB
        // image: 10 * 1024 * 1024,  // 10MB
        document: 25 * 1024 * 1024, // 25MB
        file: 50 * 1024 * 1024     // 50MB par défaut
      };
      
      const maxSize = maxSizes[contentType as keyof typeof maxSizes] || maxSizes.file;
      if (file.size > maxSize) {
        return json({ 
          error: `Le fichier est trop volumineux. Taille maximale: ${Math.round(maxSize / (1024 * 1024))}MB` 
        }, { status: 400 });
      }
      
      apiFormData.append("file", file);
    }

    console.log("Données envoyées à l'API:", Object.fromEntries(apiFormData.entries()));

    // Appeler l'API
    const result = await modulesServerAPI.addModuleContent(session.token, moduleId, apiFormData);
    
    console.log("=== SUCCÈS CRÉATION CONTENU ===");
    console.log("Résultat:", result);
    
    // Redirection avec message de succès
    return redirect(`/expert/modulecontent/${moduleId}?success=content_created`);
    
  } catch (error: any) {
    console.error("=== ERREUR CRÉATION CONTENU ===");
    console.error("Erreur complète:", error);
    
    let errorMessage = "Erreur lors de la création du contenu";
    
    if (error.message?.includes("File too large")) {
      errorMessage = "Le fichier est trop volumineux. Réduisez la taille et réessayez.";
    } else if (error.message?.includes("Invalid file type")) {
      errorMessage = "Type de fichier non supporté. Vérifiez le format.";
    } else if (error.message?.includes("validation")) {
      errorMessage = "Erreur de validation. Vérifiez tous les champs obligatoires.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return json({ 
      error: errorMessage,
      details: error.message 
    }, { status: 400 });
  }
}

export default function ExpertModuleContentCreate() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [contentType, setContentType] = useState("text"); // Changer de "article" à "text"
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      
      // Créer un aperçu pour les images
      // if (file.type.startsWith("image/")) {
      //   const reader = new FileReader();
      //   reader.onload = (e) => setFilePreview(e.target?.result as string);
      //   reader.readAsDataURL(file);
      // } else {
      //   setFilePreview(null);
      // }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileName("");
    setFilePreview(null);
    // Reset input file
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Layout user={actionData?.user} title="Ajouter du contenu" navigation={getExpertNavigation("/expert/modules")}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ajouter du contenu</h1>
          <p className="text-gray-600">Remplissez les détails de votre nouveau contenu pédagogique</p>
        </div>

        {/* Messages d'erreur */}
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

        {/* Formulaire */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 p-8">
          <Form 
            method="post" 
            encType="multipart/form-data"
            className="space-y-8"
          >
            {/* Type de contenu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Type de contenu *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { value: "text", label: "Texte", icon: FileText, description: "Article ou cours écrit" },
                  // { value: "image", label: "Image", icon: Image, description: "Photo, illustration" },
                  { value: "video", label: "Vidéo", icon: Video, description: "Contenu vidéo" },
                  { value: "audio", label: "Audio", icon: Headphones, description: "Podcast ou audio" },
                  { value: "document", label: "Document", icon: FileText, description: "PDF, Word, etc." },
                  { value: "link", label: "Lien", icon: Link, description: "Ressource externe" },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-md ${
                      contentType === type.value
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="content_type"
                      value={type.value}
                      checked={contentType === type.value}
                      onChange={(e) => {
                        setContentType(e.target.value);
                        // Reset file when changing type
                        if (!["video", "audio", "document"].includes(e.target.value)) {
                          clearFile();
                        }
                      }}
                      className="sr-only"
                    />
                    <div className="flex items-center mb-2">
                      <type.icon className={`h-6 w-6 mr-3 ${
                        contentType === type.value ? "text-teal-600" : "text-gray-600"
                      }`} />
                      <span className={`font-bold ${
                        contentType === type.value ? "text-teal-900" : "text-gray-900"
                      }`}>
                        {type.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{type.description}</span>
                    {contentType === type.value && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-teal-600" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du contenu *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="Ex: Introduction au marketing digital"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                placeholder="Décrivez brièvement ce contenu..."
              />
            </div>

            {/* Contenu selon le type */}
            {contentType === "text" && (
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu textuel *
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={12}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-all resize-none font-mono text-sm"
                  placeholder="Rédigez votre contenu ici..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  Vous pouvez utiliser du Markdown pour formater votre texte
                </p>
              </div>
            )}

            {contentType === "link" && (
              <div>
                <label htmlFor="external_link" className="block text-sm font-medium text-gray-700 mb-2">
                  Lien externe *
                </label>
                <input
                  id="external_link"
                  name="external_link"
                  type="url"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="https://exemple.com/ressource"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Ajoutez un lien vers une ressource externe (vidéo YouTube, article, etc.)
                </p>
              </div>
            )}

            {[
              "video", 
              "audio", 
              "document", 
              // "image"
            ].includes(contentType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {contentType === "video" ? "Fichier vidéo" : 
                   contentType === "audio" ? "Fichier audio" :
                  //  contentType === "image" ? "Fichier image" : 
                   "Document"} *
                </label>
                
                {selectedFile ? (
                  // Affichage du fichier sélectionné
                  <div className="border-2 border-dashed border-green-300 rounded-2xl p-6 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {filePreview ? (
                            <img src={filePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                          ) : (
                            <div className="h-16 w-16 bg-teal-100 rounded-lg flex items-center justify-center">
                              {contentType === "video" && <Video className="h-8 w-8 text-teal-600" />}
                              {contentType === "audio" && <Headphones className="h-8 w-8 text-teal-600" />}
                              {/* {contentType === "image" && <Image className="h-8 w-8 text-teal-600" />} */}
                              {contentType === "document" && <FileText className="h-8 w-8 text-teal-600" />}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            ✓ Fichier prêt à être uploadé
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-all"
                        title="Supprimer le fichier"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Zone de drop pour sélectionner un fichier
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-teal-400 transition-colors">
                    <div className="space-y-2 text-center">
                      <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                        {contentType === "video" && <Video className="h-8 w-8 text-gray-600" />}
                        {contentType === "audio" && <Headphones className="h-8 w-8 text-gray-600" />}
                        {/* {contentType === "image" && <Image className="h-8 w-8 text-teal-600" />} */}
                        {contentType === "document" && <FileText className="h-8 w-8 text-gray-600" />}
                      </div>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500 px-2"
                        >
                          <span>Choisir un fichier</span>
                          <input
                            id="file-upload"
                            name="file"
                            type="file"
                            required
                            onChange={handleFileChange}
                            className="sr-only"
                            accept={
                              contentType === "video" ? "video/*" :
                              contentType === "audio" ? "audio/*" :
                              contentType === "document" ? ".pdf,.doc,.docx,.ppt,.pptx,.txt" :
                              "*"
                            }
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer ici</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {contentType === "video" && "MP4, AVI, MOV, WMV jusqu'à 100MB"}
                        {contentType === "audio" && "MP3, WAV, AAC, M4A jusqu'à 50MB"}  
                        {contentType === "document" && "PDF, DOC, DOCX, PPT, PPTX jusqu'à 25MB"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Options supplémentaires */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Options du contenu</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="is_downloadable"
                    name="is_downloadable"
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_downloadable" className="ml-3 block text-sm text-gray-700">
                    Permettre le téléchargement
                    <span className="block text-xs text-gray-500">
                      Les participants pourront télécharger ce contenu
                    </span>
                  </label>
                </div>
                
                {/* Info sur la visibilité */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <Eye className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Visibilité du contenu</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Ce contenu sera visible par tous les participants du module une fois ajouté.
                        Vous pourrez modifier sa visibilité plus tard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={
                  !contentType || 
                  (contentType === "text" && !document.querySelector('[name="content"]')?.value) ||
                  (contentType === "link" && !document.querySelector('[name="external_link"]')?.value) ||
                  (["video", 
                    "audio", 
                    "document", 
                    // "image"
                  ].includes(contentType) && !selectedFile)
                }
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-5 w-5 mr-2" />
                {selectedFile && ["video", "audio", "document"].includes(contentType) ? 
                  `Uploader ${contentType === "video" ? "la vidéo" : contentType === "audio" ? "l'audio" : "le document"}` :
                  "Ajouter le contenu"
                }
              </button>
            </div>
          </Form>
        </div>

        {/* Aide contextuelle */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Conseils pour un contenu efficace
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Pour le contenu textuel :</h4>
              <ul className="space-y-1 text-xs">
                <li>• Utilisez des titres et sous-titres clairs</li>
                <li>• Structurez avec des listes et paragraphes courts</li>
                <li>• Ajoutez des exemples concrets</li>
                <li>• Incluez des exercices pratiques</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Pour les fichiers :</h4>
              <ul className="space-y-1 text-xs">
                <li>• Choisissez des noms de fichiers descriptifs</li>
                <li>• Optimisez la qualité vs taille du fichier</li>
                <li>• Testez la compatibilité sur différents appareils</li>
                <li>• Ajoutez des sous-titres pour les vidéos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}