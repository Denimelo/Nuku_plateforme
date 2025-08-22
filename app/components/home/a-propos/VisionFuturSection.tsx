



interface VisionFuturSectionProps {
  isVisible: boolean;   
}

export function VisionFuturSection ({ isVisible }: VisionFuturSectionProps) {
  const objectifs2025 = [
    {
      titre: "5 000 entrepreneurs formés",
      description: "Doubler notre impact au Togo",
      icon: "👥",
      progress: 51
    },
    {
      titre: "Expansion sous-régionale",
      description: "Burkina Faso et Bénin",
      icon: "🌍", 
      progress: 23
    },
    {
      titre: "NUKU University",
      description: "Campus physique à Lomé",
      icon: "🏫",
      progress: 67
    },
    {
      titre: "Fonds d'investissement",
      description: "10Md FCFA pour startups",
      icon: "💰",
      progress: 34
    }
  ];

  return (
    <section
      id="vision-futur"
      data-animate
      className={`px-6 py-20 bg-gradient-to-br from-[#0B2749] to-purple-800 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          🚀 Vision 2025 : NUKU, catalyseur continental
        </h2>
        <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Notre ambition est claire : faire de NUKU la référence en accompagnement entrepreneurial 
          en Afrique de l'Ouest, tout en restant fidèles à nos racines togolaises.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {objectifs2025.map((objectif, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{objectif.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">
                {objectif.titre}
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                {objectif.description}
              </p>
              {/* Barre de progression */}
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${objectif.progress}%` }}
                ></div>
              </div>
              <p className="text-yellow-300 text-xs font-medium">
                {objectif.progress}% réalisé
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">
            🌟 Notre rêve pour l'Afrique
          </h3>
          <p className="text-blue-100 leading-relaxed text-lg mb-6">
            En 2030, nous imaginons une Afrique où chaque jeune avec une idée entrepreneuriale 
            trouve localement l'écosystème pour la transformer en success story. NUKU sera 
            l'un des maillons essentiels de cette chaîne de valeur continentale.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="font-bold text-yellow-300 mb-2">🎯 Impact</div>
              <div className="text-blue-100">50 000 entrepreneurs accompagnés en Afrique de l'Ouest</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="font-bold text-yellow-300 mb-2">🌍 Présence</div>
              <div className="text-blue-100">8 pays couverts avec des hubs locaux</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="font-bold text-yellow-300 mb-2">💼 Écosystème</div>
              <div className="text-blue-100">Réseau de 1000+ experts et mentors</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signup"
            className="bg-yellow-500 text-[#0B2749] px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🚀 Rejoindre l'aventure
          </a>
          <a
            href="/contact"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0B2749] transition-all duration-300"
          >
            💬 Devenir partenaire
          </a>
        </div>
      </div>
    </section>
  );
}
