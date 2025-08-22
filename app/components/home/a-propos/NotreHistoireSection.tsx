

interface NotreHistoireSectionProps {
  isVisible: boolean;
}

export function NotreHistoireSection ({ isVisible }: NotreHistoireSectionProps) {
  const timeline = [
    {
      annee: "2022",
      titre: "L'étincelle",
      description: "Koffi Adjoavi, consultant revenu au pays, constate le manque d'accompagnement pour les jeunes entrepreneurs togolais. L'idée de NUKU germe.",
      icon: "💡",
      couleur: "from-yellow-400 to-orange-500"
    },
    {
      annee: "2023",
      titre: "Les premiers pas", 
      description: "Création officielle de NUKU. Recrutement de l'équipe fondatrice et lancement du premier programme pilote avec 50 entrepreneurs.",
      icon: "🚀",
      couleur: "from-blue-400 to-blue-600"
    },
    {
      annee: "2023",
      titre: "Premiers succès",
      description: "Les 50 entrepreneurs pilotes lèvent collectivement 120M FCFA. La méthode NUKU fait ses preuves. Expansion du programme.",
      icon: "🎯",
      couleur: "from-green-400 to-green-600"
    },
    {
      annee: "2024",
      titre: "Reconnaissance nationale",
      description: "Partenariat avec l'État togolais et les institutions financières. NUKU devient référence en accompagnement entrepreneurial.",
      icon: "🏆",
      couleur: "from-purple-400 to-purple-600"
    },
    {
      annee: "2024",
      titre: "Vision continentale",
      description: "Aujourd'hui, NUKU prépare son expansion en Afrique de l'Ouest tout en consolidant son leadership au Togo.",
      icon: "🌍",
      couleur: "from-indigo-400 to-indigo-600"
    }
  ];

  return (
    <section
      id="notre-histoire"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            📖 Notre histoire
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            De l'idée à la réalité : comment NUKU est devenu le catalyseur de l'entrepreneuriat togolais
          </p>
        </div>

        <div className="relative">
          {/* Ligne verticale */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#0B2749] to-green-500 hidden lg:block"></div>
          
          <div className="space-y-12">
            {timeline.map((etape, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Contenu */}
                <div className="lg:w-5/12">
                  <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 ${
                    index % 2 === 1 ? 'lg:text-right' : ''
                  }`}>
                    <div className={`inline-block bg-gradient-to-r ${etape.couleur} text-white px-4 py-2 rounded-full text-sm font-bold mb-4`}>
                      {etape.annee}
                    </div>
                    <h3 className="text-xl font-bold text-[#0B2749] mb-3">
                      {etape.titre}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {etape.description}
                    </p>
                  </div>
                </div>

                {/* Icône centrale */}
                <div className="lg:w-2/12 flex justify-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg border-4 border-[#0B2749] flex items-center justify-center text-2xl relative z-10">
                    {etape.icon}
                  </div>
                </div>

                {/* Espace pour alternance */}
                <div className="lg:w-5/12 hidden lg:block"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}