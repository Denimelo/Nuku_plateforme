import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigate } from "@remix-run/react";
import { Layout } from "~/components/layout/Layout";
import { requireAdmin } from "~/utils/auth.server";
import { getAdminNavigation } from "~/utils/admin-navigation";
import { getUserSession } from "~/utils/session.server";
import { adminServerAPI } from "~/utils/api.server";
import { 
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Globe,
  FileText,
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Shield
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  if (!session) {
    return json({ error: "Session non trouvée" }, { status: 401 });
  }

  const formData = await request.formData();
  
  const expertData = {
    user: {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || null,
      user_type: "expert" // Ajout obligatoire
    },
    specialization: formData.get("specialization") as string,
    bio: formData.get("bio") as string || null,
    experience_years: parseInt(formData.get("experience_years") as string) || 0, // Correctement nommé
    linkedin_url: formData.get("linkedin_url") as string || null,
    hourly_rate: formData.get("hourly_rate") ? parseFloat(formData.get("hourly_rate") as string) : null,
  };

  console.log("Données du formulaire:", expertData); // Debug

  // Validation des champs obligatoires
  if (!expertData.user.first_name?.trim() || !expertData.user.last_name?.trim() || !expertData.user.email?.trim() || !expertData.specialization?.trim()) {
    return json({ error: "Les champs marqués d'un * sont obligatoires" }, { status: 400 });
  }

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(expertData.user.email)) {
    return json({ error: "L'adresse email n'est pas valide" }, { status: 400 });
  }

  // Validation spécialisation
  const allowedSpecializations = [
    "Marketing Digital", "Développement Commercial", "Finance & Comptabilité", 
    "Ressources Humaines", "Stratégie d'Entreprise", "Technologie & Innovation",
    "Operations & Logistique", "Juridique & Compliance", "Leadership & Management", "Autre"
  ];
  
  if (!allowedSpecializations.includes(expertData.specialization)) {
    return json({ error: "Spécialisation non valide" }, { status: 400 });
  }

  console.log("=== CRÉATION EXPERT - DONNÉES VALIDÉES ===");
  console.log("Données du formulaire:", JSON.stringify(expertData, null, 2));

  try {
    const result = await adminServerAPI.createExpert(session.token, expertData);
    console.log("=== SUCCÈS CRÉATION EXPERT ===");
    console.log("Résultat:", result);
    return redirect("/admin/experts?success=expert_created");
  } catch (error: any) {
    console.error("=== ERREUR CRÉATION EXPERT ===");
    console.error("Erreur complète:", error);
    console.error("Message d'erreur:", error.message);
    console.error("Stack trace:", error.stack);
    
    // Messages d'erreur plus spécifiques
    let errorMessage = "Erreur lors de la création de l'expert";
    
    if (error.message?.includes("Email déjà utilisé")) {
      errorMessage = "Cette adresse email est déjà utilisée par un autre utilisateur";
    } else if (error.message?.includes("validation")) {
      errorMessage = "Erreur de validation des données. Vérifiez tous les champs obligatoires.";
    } else if (error.message?.includes("422")) {
      errorMessage = "Données invalides. Vérifiez le format des champs (email, années d'expérience, tarif).";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return json({ 
      error: errorMessage,
      details: error.message,
      debugData: expertData // Pour debug uniquement
    }, { status: 400 });
  }
}

export default function AdminExpertsCreate() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  
  const navigation = getAdminNavigation("/admin/experts");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialization: "",
    bio: "",
    experience_years: "0",
    linkedin_url: "",
    hourly_rate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout user={user} title="Créer un nouvel expert" navigation={navigation}>
      {/* En-tête avec navigation */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/experts")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la liste des experts
        </button>

        <div className="bg-gradient-to-r from-slate-800 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg mr-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Créer un nouvel expert</h1>
                <p className="text-xl text-slate-200">
                  Ajoutez un expert à votre équipe d'accompagnement
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
            </div>
          </div>
        </div>
      )}

      {/* Formulaire principal */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50">
        <div className="p-8">
          <Form method="post" className="space-y-8">
            {/* Informations personnelles */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Prénom de l'expert"
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nom de l'expert"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="expert@exemple.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+228 XX XX XX XX"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informations professionnelles */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Informations professionnelles
              </h4>
              <div className="space-y-6">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                    Spécialisation *
                  </label>
                  <select
                    id="specialization"
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionnez une spécialisation</option>
                    <option value="Marketing Digital">Marketing Digital</option>
                    <option value="Développement Commercial">Développement Commercial</option>
                    <option value="Finance & Comptabilité">Finance & Comptabilité</option>
                    <option value="Ressources Humaines">Ressources Humaines</option>
                    <option value="Stratégie d'Entreprise">Stratégie d'Entreprise</option>
                    <option value="Technologie & Innovation">Technologie & Innovation</option>
                    <option value="Operations & Logistique">Operations & Logistique</option>
                    <option value="Juridique & Compliance">Juridique & Compliance</option>
                    <option value="Leadership & Management">Leadership & Management</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-2">
                      Années d'expérience
                    </label>
                    <input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-2">
                      Tarif horaire (FCFA)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="hourly_rate"
                        name="hourly_rate"
                        type="number"
                        min="0"
                        step="500"
                        value={formData.hourly_rate}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Profil LinkedIn
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="linkedin_url"
                      name="linkedin_url"
                      type="url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Biographie
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Décrivez l'expérience et les compétences de cet expert..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin/experts")}
                className="px-6 py-3 border border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                <Save className="h-5 w-5 mr-2" />
                Créer l'expert
              </button>
            </div>
          </Form>
        </div>
      </div>
    </Layout>
  );
}