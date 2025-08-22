

interface ParcoursSectionProps {
  isVisible: boolean;
}

export function ParcoursSection({ isVisible }: ParcoursSectionProps) {
  const etapes = [
    {
      phase: "DÉCOUVERTE",
      titre: "De l'idée à la vision",
      duree: "Semaines 1-2",
      icon: "💡",
      points: [
        "Identifier votre passion et vos compétences",
        "Analyser les besoins du marché togolais",
        "Valider votre concept avec de vrais clients",
        "Étude de faisabilité simplifiée"
      ],
      couleur: "from-yellow-400 to-orange-500"
    },
    {
      phase: "PLANIFICATION", 
      titre: "Structurer votre projet",
      duree: "Semaines 3-6",
      icon: "📋",
      points: [
        "Business model canvas adapté au Togo",
        "Plan financier réaliste (bootstrap friendly)",
        "Stratégie de lancement économique",
        "Choix du statut juridique optimal"
      ],
      couleur: "from-blue-400 to-blue-600"
    },
    {
      phase: "LANCEMENT",
      titre: "Passer à l'action",
      duree: "Semaines 7-12",
      icon: "🚀",
      points: [
        "MVP (Produit Minimum Viable) en 4 semaines",
        "Premiers clients et retours terrain",
        "Optimisation continue du produit/service",
        "Mise en place des premiers processus"
      ],
      couleur: "from-green-400 to-green-600"
    },
    {
      phase: "CROISSANCE",
      titre: "Scaler votre business",
      duree: "Mois 4-12",
      icon: "📈",
      points: [
        "Stratégies de croissance organique",
        "Team building et recrutement",
        "Recherche de financement (microfinance, investisseurs)",
        "Expansion géographique (Togo → Sous-région)"
      ],
      couleur: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <section
      id="parcours"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🗺️ Votre parcours entrepreneur en 4 étapes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Un accompagnement progressif et personnalisé, testé par des centaines d'entrepreneurs togolais
          </p>
        </div>

        <div className="space-y-8">
          {etapes.map((etape, index) => (
            <div
              key={index}
              className="flex flex-col lg:flex-row items-center gap-8 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="lg:w-1/3">
                <div className={`bg-gradient-to-r ${etape.couleur} p-8 rounded-xl text-white text-center`}>
                  <div className="text-6xl mb-4">{etape.icon}</div>
                  <div className="text-sm font-bold opacity-90 mb-2">{etape.phase}</div>
                  <h3 className="text-xl font-bold mb-2">{etape.titre}</h3>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {etape.duree}
                  </div>
                </div>
              </div>
              
              <div className="lg:w-2/3">
                <ul className="space-y-3">
                  {etape.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start">
                      <span className="text-green-500 mr-3 text-xl">✓</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/signup"
            className="inline-block bg-[#0B2749] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Commencer mon parcours maintenant
          </a>
        </div>
      </div>
    </section>
  );
}