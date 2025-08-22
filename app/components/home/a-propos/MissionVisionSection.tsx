
interface MissionVisionSectionProps {
  isVisible: boolean;
}

export function MissionVisionSection ({ isVisible }: MissionVisionSectionProps)  {
  return (
    <section
      id="mission-vision"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🎯 Ce qui nous guide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nos convictions profondes qui orientent chaque décision et action chez NUKU
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Mission */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div className="text-6xl text-center mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-[#0B2749] text-center mb-4">
              Notre Mission
            </h3>
            <p className="text-gray-600 leading-relaxed text-center">
              Révéler et accompagner les talents entrepreneuriaux togolais en leur offrant 
              formation, mentorat et accès au financement pour créer un écosystème 
              économique durable et inclusif.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div className="text-6xl text-center mb-6">🌟</div>
            <h3 className="text-2xl font-bold text-[#0B2749] text-center mb-4">
              Notre Vision
            </h3>
            <p className="text-gray-600 leading-relaxed text-center">
              Faire du Togo le hub entrepreneurial de l'Afrique de l'Ouest, où chaque 
              jeune avec une idée trouve les outils pour la transformer en entreprise 
              prospère et créatrice d'emplois.
            </p>
          </div>

          {/* Impact */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div className="text-6xl text-center mb-6">💎</div>
            <h3 className="text-2xl font-bold text-[#0B2749] text-center mb-4">
              Notre Impact
            </h3>
            <p className="text-gray-600 leading-relaxed text-center">
              Contribuer à la réduction du chômage des jeunes, à la diversification 
              économique du Togo et à l'émergence d'une nouvelle génération 
              d'entrepreneurs africains influents.
            </p>
          </div>
        </div>

        {/* Nos valeurs */}
        <div className="bg-gradient-to-r from-[#0B2749] to-blue-600 p-8 rounded-2xl text-white">
          <h3 className="text-2xl font-bold text-center mb-8">
            🔥 Nos valeurs fondamentales
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🤝</div>
              <h4 className="font-bold mb-2">Solidarité</h4>
              <p className="text-blue-100 text-sm">Nous croyons en la force du collectif et de l'entraide entre entrepreneurs.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-bold mb-2">Excellence</h4>
              <p className="text-blue-100 text-sm">Nous visons l'excellence dans chaque formation et accompagnement.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🌱</div>
              <h4 className="font-bold mb-2">Durabilité</h4>
              <p className="text-blue-100 text-sm">Nous construisons un écosystème entrepreneurial pérenne et responsable.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔓</div>
              <h4 className="font-bold mb-2">Accessibilité</h4>
              <p className="text-blue-100 text-sm">L'entrepreneuriat doit être accessible à tous, peu importe le background.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}