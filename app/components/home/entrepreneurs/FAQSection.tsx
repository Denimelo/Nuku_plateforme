import { useState } from "react";

interface FAQItem {
    isVisible: boolean;
}

export function FAQSection({ isVisible }: FAQItem) {
  const [activeIndex, setActiveIndex] = useState(null);
  
  const faqs = [
    {
      question: "Combien ça coûte de démarrer une entreprise au Togo ?",
      reponse: "Cela dépend du secteur ! En agro-business, vous pouvez commencer avec 50K-200K FCFA. Pour le digital/e-commerce, 25K-100K FCFA suffisent souvent. Nos formations incluent des templates de budget détaillés."
    },
    {
      question: "J'ai pas d'expérience business, puis-je réussir ?",
      reponse: "Absolument ! 73% de nos entrepreneurs n'avaient aucune expérience business avant NUKU. Notre accompagnement progressif et nos mentors sont là pour ça. L'important c'est la motivation et la volonté d'apprendre."
    },
    {
      question: "Quelle est la différence entre les formations gratuites et payantes ?",
      reponse: "Les formations gratuites donnent un aperçu (2 modules par domaine). Les formations complètes incluent 12-15 modules, mentorat personnalisé, accès communauté, templates, et suivi 6 mois post-formation."
    },
    {
      question: "Comment trouvez-vous des financements au Togo ?",
      reponse: "Nous avons des partenariats avec 12 institutions de microfinance togolaises, des business angels locaux, et des programmes de subventions. Nos formations incluent un module spécial 'levée de fonds' avec mise en pratique."
    },
    {
      question: "Combien de temps pour voir les premiers résultats ?",
      reponse: "En moyenne, nos entrepreneurs voient leurs premiers revenus après 3-4 mois. Mais ça dépend du secteur et de votre engagement. Certains commencent à vendre dès le 1er mois, d'autres prennent 6 mois pour bien construire."
    },
    {
      question: "Y a-t-il un accompagnement après la formation ?",
      reponse: "Oui ! Suivi individuel pendant 6 mois, accès à vie à la communauté d'entrepreneurs, événements mensuels, et hotline WhatsApp avec nos mentors. Vous n'êtes jamais seul dans votre aventure !"
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            ❓ Questions fréquentes
          </h2>
          <p className="text-lg text-gray-600">
            Les vraies questions que se posent les futurs entrepreneurs togolais
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left p-6 focus:outline-none hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#0B2749] pr-4">
                    {faq.question}
                  </h3>
                  <span className={`text-2xl text-[#0B2749] transform transition-transform duration-200 ${
                    activeIndex === index ? 'rotate-45' : ''
                  }`}>
                    +
                  </span>
                </div>
              </button>
              
              {activeIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.reponse}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            D'autres questions ? Notre équipe est là pour vous !
          </p>
          <a
            href="/contact"
            className="inline-block border-2 border-[#0B2749] text-[#0B2749] px-6 py-3 rounded-lg font-semibold hover:bg-[#0B2749] hover:text-white transition-all duration-300"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </section>
  );
}