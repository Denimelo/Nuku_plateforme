

interface LocalisationSectionProps {
    isVisible: boolean;
}

export function LocalisationSection ({ isVisible }: LocalisationSectionProps) {
  const partenaires = [
    {
      nom: "Ecobank Togo",
      type: "Partenaire financier",
      logo: "🏦",
      description: "Solutions de financement pour entrepreneurs"
    },
    {
      nom: "Université de Lomé",
      type: "Partenaire académique", 
      logo: "🎓",
      description: "Recherche et développement pédagogique"
    },
    {
      nom: "FAIEJ",
      type: "Partenaire institutionnel",
      logo: "🏛️",
      description: "Soutien aux initiatives jeunesse"
    },
    {
      nom: "Tech Hub Lomé",
      type: "Partenaire tech",
      logo: "💻",
      description: "Écosystème numérique togolais"
    },
    {
      nom: "AgriTech Togo",
      type: "Partenaire sectoriel",
      logo: "🌱",
      description: "Innovation agricole et agro-business"
    },
    {
      nom: "Entrepreneurship Togo",
      type: "Partenaire réseau",
      logo: "🤝",
      description: "Communauté d'entrepreneurs togolais"
    }
  ];

  return (
    <section
      id="localisation"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Localisation */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-8">
              📍 Où nous trouver
            </h2>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
              <h3 className="text-xl font-bold text-[#0B2749] mb-4">
                🏢 Siège social
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <div className="font-semibold">Adresse</div>
                    <div className="text-gray-600">
                      Immeuble NUKU<br />
                      Boulevard du 13 Janvier<br />
                      Quartier Administratif<br />
                      BP 1234, Lomé - Togo
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">🚗</span>
                  <div>
                    <div className="font-semibold">Comment venir</div>
                    <div className="text-gray-600">
                      • En taxi: "Quartier Administratif, près de la Présidence"<br />
                      • En bus: Arrêt "Boulevard 13 Janvier"<br />
                      • Parking gratuit disponible
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">🕐</span>
                  <div>
                    <div className="font-semibold">Horaires d'ouverture</div>
                    <div className="text-gray-600">
                      Lundi - Vendredi: 8h00 - 18h00<br />
                      Samedi: 9h00 - 13h00<br />
                      Dimanche: Fermé
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
              <h3 className="font-bold text-[#0B2749] mb-2">
                💡 Vous préférez le virtuel ?
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Nous organisons des rendez-vous en visioconférence pour votre convenance.
              </p>
              <a
                href="#contact-form"
                className="inline-block bg-[#0B2749] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300 text-sm"
              >
                Prendre RDV en ligne
              </a>
            </div>
          </div>

          {/* Partenaires */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-8">
              🤝 Nos partenaires
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {partenaires.map((partenaire, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{partenaire.logo}</div>
                    <div>
                      <h4 className="font-bold text-[#0B2749] text-sm">
                        {partenaire.nom}
                      </h4>
                      <p className="text-blue-600 text-xs font-medium mb-1">
                        {partenaire.type}
                      </p>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {partenaire.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-xl">
              <h3 className="font-bold text-[#0B2749] mb-2">
                🌟 Devenir partenaire
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Vous souhaitez rejoindre notre écosystème et soutenir l'entrepreneuriat togolais ?
              </p>
              <a
                href="mailto:partenaires@nuku.io"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 text-sm"
              >
                Proposer un partenariat
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}