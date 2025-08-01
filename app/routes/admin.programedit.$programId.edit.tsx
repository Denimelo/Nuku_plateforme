import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigate } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { programsServerAPI } from "~/utils/api.server";
import { 
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  FileText,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Clock,
  Edit3
} from "lucide-react";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getUserSession(request);
  
  if (!session) {
    throw new Error("Session introuvable");
  }

  const programId = params.programId;
  if (!programId) {
    throw new Error("ID programme manquant");
  }

  try {
    // Récupérer les détails du programme
    const programData = await fetch(`${API_BASE_URL}/programs/${programId}`, {
      headers: { Authorization: `Bearer ${session.token}` }
    }).then(res => {
      if (!res.ok) throw new Error("Programme non trouvé");
      return res.json();
    });

    // Vérifier si le programme peut être modifié (pas encore commencé)
    const now = new Date();
    const startDate = new Date(programData.start_date);
    const canEdit = startDate > now && programData.is_active; // Programme à venir et actif

    if (!canEdit) {
      throw new Error("Ce programme ne peut plus être modifié car il a déjà commencé ou est inactif");
    }

    return json({ 
      user, 
      program: programData,
      programId
    });
  } catch (error) {
    console.error("Erreur lors du chargement du programme:", error);
    throw new Error(error.message || "Programme introuvable ou non modifiable");
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  if (!session) {
    return json({ error: "Session non trouvée" }, { status: 401 });
  }

  const programId = params.programId;
  if (!programId) {
    return json({ error: "ID programme manquant" }, { status: 400 });
  }

  const formData = await request.formData();
  
  const programData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || null,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    max_participants: formData.get("max_participants") ? parseInt(formData.get("max_participants") as string) : null,
    is_active: formData.get("is_active") === "true",
  };

  console.log("=== MODIFICATION PROGRAMME ===");
  console.log("Programme ID:", programId);
  console.log("Données du formulaire:", programData);

  // Validations
  if (!programData.name?.trim()) {
    return json({ error: "Le nom du programme est obligatoire" }, { status: 400 });
  }

  if (!programData.start_date || !programData.end_date) {
    return json({ error: "Les dates de début et de fin sont obligatoires" }, { status: 400 });
  }

  // Vérifier que la date de fin est après la date de début
  const startDate = new Date(programData.start_date);
  const endDate = new Date(programData.end_date);
  
  if (endDate <= startDate) {
    return json({ error: "La date de fin doit être postérieure à la date de début" }, { status: 400 });
  }

  // Vérifier que la date de début n'est pas dans le passé
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (startDate < today) {
    return json({ error: "La date de début ne peut pas être dans le passé" }, { status: 400 });
  }

  if (programData.max_participants && programData.max_participants < 1) {
    return json({ error: "Le nombre maximum de participants doit être supérieur à 0" }, { status: 400 });
  }

  try {
    const result = await programsServerAPI.updateProgram(session.token, programId, programData);
    console.log("=== SUCCÈS MODIFICATION PROGRAMME ===");
    console.log("Résultat:", result);
    return redirect(`/admin/programs/${programId}?success=program_updated`);
  } catch (error: any) {
    console.error("=== ERREUR MODIFICATION PROGRAMME ===");
    console.error("Erreur complète:", error);
    
    let errorMessage = "Erreur lors de la modification du programme";
    
    if (error.message?.includes("validation")) {
      errorMessage = "Erreur de validation des données. Vérifiez tous les champs obligatoires.";
    } else if (error.message?.includes("cannot be modified")) {
      errorMessage = "Ce programme ne peut plus être modifié car il a déjà commencé.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return json({ 
      error: errorMessage,
      details: error.message 
    }, { status: 400 });
  }
}

export default function AdminProgramEdit() {
  const { user, program } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  
  const navigation = getAdminNavigation("/admin/programs");

  const [formData, setFormData] = useState({
    name: program.name || "",
    description: program.description || "",
    start_date: program.start_date ? new Date(program.start_date).toISOString().split('T')[0] : "",
    end_date: program.end_date ? new Date(program.end_date).toISOString().split('T')[0] : "",
    max_participants: program.max_participants?.toString() || "",
    is_active: program.is_active ? "true" : "false",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Calculer la durée estimée
  const getDurationEstimate = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} jours`;
      } else if (diffDays < 365) {
        const months = Math.round(diffDays / 30);
        return `${months} mois`;
      } else {
        const years = Math.round(diffDays / 365);
        return `${years} an${years > 1 ? 's' : ''}`;
      }
    }
    return null;
  };

  const duration = getDurationEstimate();

  return (
    <Layout user={user} title={`Modifier: ${program.name}`} navigation={navigation}>
      {/* En-tête avec navigation */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/admin/programs/${program.program_id}`)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux détails du programme
        </button>

        <div className="bg-gradient-to-r from-slate-800 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg mr-4">
                <Edit3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Modifier le programme</h1>
                <p className="text-xl text-slate-200">
                  Ajustez les paramètres de votre programme
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/10 backdrop-blur rounded-xl">
              <div className="flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-300" />
                <span>Ce programme peut être modifié car il n'a pas encore commencé</span>
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
            </div>
          </div>
        </div>
      )}

      {/* Formulaire principal */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
        <div className="p-8">
          <Form method="post" className="space-y-8">
            {/* Informations générales */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Informations générales
              </h4>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du programme *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Ex: Programme d'Accélération Tech 2024"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Décrivez les objectifs, le contenu et les bénéfices de ce programme..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    id="is_active"
                    name="is_active"
                    value={formData.is_active}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="true">Actif</option>
                    <option value="false">Brouillon (Inactif)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Les programmes inactifs ne sont pas visibles par les entrepreneurs
                  </p>
                </div>
              </div>
            </div>

            {/* Dates et durée */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Dates et durée
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin *
                  </label>
                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Affichage de la durée */}
              {duration && (
                <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-200">
                  <div className="flex items-center text-sm text-blue-700">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">Durée estimée : {duration}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Participants
              </h4>
              
              <div>
                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre maximum de participants
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.max_participants}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Ex: 50"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Laissez vide pour un nombre illimité de participants
                </p>
              </div>
            </div>

            {/* Résumé des modifications */}
            {(formData.name || formData.start_date || formData.end_date) && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Résumé des modifications
                </h4>
                
                <div className="space-y-3 text-sm">
                  {formData.name && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-600 w-24">Nom:</span>
                      <span className="text-gray-900">{formData.name}</span>
                    </div>
                  )}
                  
                  {duration && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-600 w-24">Durée:</span>
                      <span className="text-gray-900">{duration}</span>
                    </div>
                  )}
                  
                  {formData.max_participants && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-600 w-24">Participants:</span>
                      <span className="text-gray-900">Maximum {formData.max_participants}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-24">Statut:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      formData.is_active === "true" 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.is_active === "true" ? "Actif" : "Brouillon"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/admin/program/${program.program_id}`)}
                className="px-6 py-3 border border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
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