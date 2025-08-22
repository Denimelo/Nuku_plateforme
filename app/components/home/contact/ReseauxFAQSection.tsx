import { useState } from "react";

interface ReseauxFAQSectionProps {
    isVisible: boolean;
}

export function ReseauxFAQSection ({ isVisible }: ReseauxFAQSectionProps) {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const reseaux = [
    {
      nom: "Facebook",
      url: "#",
      followers: "12.5K",
      icon: "📘",
      description: "Actualités et success stories"
    },
    {
      nom: "LinkedIn", 
      url: "#",
      followers: "8.2K",
      icon: "💼",
      description: "Réseau professionnel"
    },
    {
      nom: "Instagram",
      url: "#",
      followers: "15.7K", 
      icon: "📸",
      description: "Coulisses et événements"
    },
    {
      nom: "Twitter",
      url: "#",
      followers: "6.8K",
      icon: "🐦",
      description: "Actualités en temps réel"
    },
    {
      nom: "YouTube",
      url: "#",
      followers: "4.2K",
      icon: "📺",
      description: "Formations et webinaires"
    },
    {
      nom: "WhatsApp",
      url: "#",
      followers: "24/7",
      icon: "💬",
      description: "Support instantané"
    }
  ];

  const faqContact = [
    {
      question: "Quel est le meilleur moyen de vous contacter ?",
      reponse: "Pour une réponse rapide, utilisez notre formulaire de contact ou WhatsApp Business. Pour les demandes complexes, l'email reste idéal."
    },
    {
      question: "Puis-je vous rencontrer sans rendez-vous ?",
      reponse: "Nous recevons sur rendez-vous uniquement pour garantir un accueil de qualité. Utilisez notre formulaire pour planifier votre visite."
    },
    {
      question: "Proposez-vous des consultations gratuites ?",
      reponse: "Oui ! Première consultation de 30 minutes offerte pour tous les futurs entrepreneurs. Idéal pour valider votre projet."
    },
    {
      question: "Répondez-vous en week-end ?",
      reponse: "Notre équipe répond aux urgences le samedi matin. Pour les demandes standards, réponse garantie le lundi suivant."
    },
    {
      question: "Puis-je contacter directement un membre de l'équipe ?",
      reponse: "Nos emails spécialisés vous connectent directement à la bonne personne : entrepreneurs@, experts@, partenaires@, etc."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <section
      id="reseaux-faq"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Réseaux sociaux */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-8">
              🌐 Suivez-nous
            </h2>
            <p className="text-gray-600 mb-8">
              Rejoignez notre communauté sur les réseaux sociaux pour ne rien manquer de l'actualité entrepreneuriale togolaise !
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {reseaux.map((reseau, index) => (
                <a
                  key={index}
                  href={reseau.url}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {reseau.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0B2749]">
                        {reseau.nom}
                      </h4>
                      <p className="text-blue-600 text-sm font-medium">
                        {reseau.followers} {reseau.nom !== 'WhatsApp' ? 'abonnés' : ''}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {reseau.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-xl">
              <h3 className="font-bold text-[#0B2749] mb-2">
                📱 NUKU App (Bientôt)
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Notre application mobile arrive ! Inscrivez-vous pour être notifié du lancement.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button className="bg-[#0B2749] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300 text-sm">
                  Me notifier
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Contact */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-8">
              ❓ FAQ Contact
            </h2>
            
            <div className="space-y-4">
              {faqContact.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-4 focus:outline-none hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#0B2749] pr-4 text-sm">
                        {faq.question}
                      </h3>
                      <span className={`text-xl text-[#0B2749] transform transition-transform duration-200 ${
                        activeFAQ === index ? 'rotate-45' : ''
                      }`}>
                        +
                      </span>
                    </div>
                  </button>
                  
                  {activeFAQ === index && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {faq.reponse}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
              <h3 className="font-bold text-[#0B2749] mb-2">
                🚨 Contact d'urgence
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                Pour les situations urgentes uniquement :
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>📱 WhatsApp urgence:</span>
                  <span className="font-bold">+228 XX XX XX XX</span>
                </div>
                <div className="flex justify-between">
                  <span>📧 Email urgence:</span>
                  <span className="font-bold">urgence@nuku.io</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}