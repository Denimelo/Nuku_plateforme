import { useState } from "react";

interface ContactFormSectionProps {
    isVisible: boolean;
}

export function ContactFormSection({ isVisible }: ContactFormSectionProps) {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    type_demande: '',
    sujet: '',
    message: '',
    urgence: 'normale'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Message envoyé ! Nous vous répondrons sous 24h.');
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        type_demande: '',
        sujet: '',
        message: '',
        urgence: 'normale'
      });
    }, 2000);
  };

  return (
    <section
      id="contact-form"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            📝 Contactez-nous
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Remplissez ce formulaire et notre équipe vous répondra rapidement
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulaire */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom et Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-bold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                    placeholder="Votre nom et prénom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Téléphone et Type de demande */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="telephone" className="block text-sm font-bold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                    placeholder="+228 XX XX XX XX"
                  />
                </div>
                <div>
                  <label htmlFor="type_demande" className="block text-sm font-bold text-gray-700 mb-2">
                    Type de demande *
                  </label>
                  <select
                    id="type_demande"
                    name="type_demande"
                    required
                    value={formData.type_demande}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="entrepreneur">Je suis entrepreneur</option>
                    <option value="expert">Je veux devenir expert</option>
                    <option value="partenaire">Partenariat</option>
                    <option value="media">Demande média</option>
                    <option value="support">Support technique</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* Sujet */}
              <div>
                <label htmlFor="sujet" className="block text-sm font-bold text-gray-700 mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  id="sujet"
                  name="sujet"
                  required
                  value={formData.sujet}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                  placeholder="Résumé de votre demande"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200 resize-vertical"
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>

              {/* Urgence */}
              <div>
                <label htmlFor="urgence" className="block text-sm font-bold text-gray-700 mb-2">
                  Niveau d'urgence
                </label>
                <select
                  id="urgence"
                  name="urgence"
                  value={formData.urgence}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent transition-all duration-200"
                >
                  <option value="faible">🟢 Faible - Réponse sous 48h</option>
                  <option value="normale">🟡 Normale - Réponse sous 24h</option>
                  <option value="haute">🟠 Haute - Réponse sous 4h</option>
                  <option value="urgente">🔴 Urgente - Réponse immédiate</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#0B2749] hover:bg-[#0a2240] text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? '📤 Envoi en cours...' : '🚀 Envoyer le message'}
              </button>
            </form>
          </div>

          {/* Informations de contact */}
          <div className="space-y-8">
            {/* Contact direct */}
            <div className="bg-gradient-to-br from-[#0B2749] to-blue-600 p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-6">📞 Contact direct</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <div className="font-semibold">Email général</div>
                    <div className="text-blue-100">contact@nuku.io</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <div className="font-semibold">WhatsApp Business</div>
                    <div className="text-blue-100">+228 XX XX XX XX</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    📍
                  </div>
                  <div>
                    <div className="font-semibold">Adresse</div>
                    <div className="text-blue-100">Quartier Administratif<br />Lomé, Togo</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    🕐
                  </div>
                  <div>
                    <div className="font-semibold">Horaires</div>
                    <div className="text-blue-100">Lun-Ven: 8h-18h<br />Sam: 9h-13h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts spécialisés */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-[#0B2749] mb-4">
                📬 Contacts spécialisés
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Entrepreneurs:</span>
                  <span className="font-medium text-[#0B2749]">entrepreneurs@nuku.io</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experts:</span>
                  <span className="font-medium text-[#0B2749]">experts@nuku.io</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partenariats:</span>
                  <span className="font-medium text-[#0B2749]">partenaires@nuku.io</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Presse:</span>
                  <span className="font-medium text-[#0B2749]">presse@nuku.io</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Support:</span>
                  <span className="font-medium text-[#0B2749]">support@nuku.io</span>
                </div>
              </div>
            </div>

            {/* FAQ rapide */}
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-[#0B2749] mb-4">
                ⚡ Questions fréquentes
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Q:</strong> Combien coûtent les formations ?
                </div>
                <div className="text-gray-600 mb-3">
                  <strong>R:</strong> 65K-75K FCFA avec paiement en 3 fois possible.
                </div>
                <div>
                  <strong>Q:</strong> Puis-je visiter vos bureaux ?
                </div>
                <div className="text-gray-600">
                  <strong>R:</strong> Oui ! Prenez RDV via ce formulaire.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}