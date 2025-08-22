
interface RessourcesSectionProps {
  isVisible: boolean;
}

export function RessourcesSection ({ isVisible} : RessourcesSectionProps) {
  const ressources = [
    {
      titre: "Kit de Démarrage Entrepreneur",
      description: "Business model canvas, checklist juridique, templates financiers",
      type: "PDF Guide",
      telechargements: "2,847",
      icon: "📋",
      couleur: "from-blue-500 to-blue-600"
    },
    {
      titre: "Guide des Financements au Togo",
      description: "Microfinance, subventions, investisseurs : toutes les options décryptées",
      type: "E-book",
      telechargements: "1,923",
      icon: "💰",
      couleur: "from-green-500 to-green-600"
    },
    {
      titre: "Template Business Plan Togo",
      description: "Modèle pré-rempli adapté au contexte économique togolais",
      type: "Excel + Word",
      telechargements: "3,156",
      icon: "📊",
      couleur: "from-purple-500 to-purple-600"
    },
    {
      titre: "Checklist Légale Startup",
      description: "Toutes les démarches administratives simplifiées étape par étape",
      type: "PDF Checklist",
      telechargements: "1,675",
      icon: "⚖️",
      couleur: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section
      id="ressources"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🎁 Ressources gratuites pour entrepreneurs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Téléchargez nos outils exclusifs, testés par des centaines d'entrepreneurs togolais
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {ressources.map((ressource, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${ressource.couleur} rounded-lg flex items-center justify-center text-2xl`}>
                  {ressource.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#0B2749] mb-2">
                    {ressource.titre}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {ressource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {ressource.type}
                      </span>
                      <span>
                        📥 {ressource.telechargements} téléchargements
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <a
                href="/signup"
                className="block w-full mt-4 bg-[#0B2749] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300"
              >
                Télécharger gratuitement
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            💡 <strong>Bonus :</strong> Inscrivez-vous et recevez notre newsletter hebdomadaire avec des conseils exclusifs !
          </p>
          <a
            href="/signup"
            className="inline-block bg-yellow-500 text-[#0B2749] px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            S'inscrire et tout télécharger
          </a>
        </div>
      </div>
    </section>
  );
}