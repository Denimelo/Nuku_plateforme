

interface ReconnaissanceSectionProps {
  isVisible: boolean;
}

export function ReconnaissanceSection ({ isVisible }: ReconnaissanceSectionProps) {
  const prix = [
    {
      annee: "2024",
      prix: "Prix d'Excellence Entrepreneuriale",
      organisme: "Union Africaine",
      description: "Meilleure initiative d'accompagnement entrepreneurial en Afrique de l'Ouest",
      icon: "🏆"
    },
    {
      annee: "2024", 
      prix: "Startup Accelerator of the Year",
      organisme: "Africa Business Awards",
      description: "Reconnaissance de notre impact sur l'écosystème startup africain",
      icon: "🌟"
    },
    {
      annee: "2023",
      prix: "Prix National de l'Innovation",
      organisme: "République Togolaise",
      description: "Innovation pédagogique et impact sur l'emploi des jeunes",
      icon: "🎯"
    },
    {
      annee: "2023",
      prix: "Best Impact Startup",
      organisme: "West Africa Tech Summit",
      description: "Meilleure contribution au développement socio-économique",
      icon: "💎"
    }
  ];

  const partenaires = [
    { nom: "Banque Mondiale", logo: "🏛️", type: "Partenaire financier" },
    { nom: "Union Africaine", logo: "🌍", type: "Partenaire institutionnel" },
    { nom: "FAIEJ", logo: "🇹🇬", type: "Partenaire gouvernemental" },
    { nom: "Tony Elumelu Foundation", logo: "💼", type: "Partenaire développement" },
    { nom: "Université de Lomé", logo: "🎓", type: "Partenaire académique" },
    { nom: "Ecobank Group", logo: "🏦", type: "Partenaire bancaire" }
  ];

  return (
    <section
      id="reconnaissance"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🏆 Reconnaissance internationale
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Notre travail reconnu par les plus grandes institutions africaines et internationales
          </p>
        </div>

        {/* Prix et distinctions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {prix.map((distinction, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 text-center"
            >
              <div className="text-4xl mb-4">{distinction.icon}</div>
              <div className="bg-[#0B2749] text-white px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">
                {distinction.annee}
              </div>
              <h3 className="font-bold text-[#0B2749] mb-2 text-sm">
                {distinction.prix}
              </h3>
              <p className="text-blue-600 text-xs font-medium mb-2">
                {distinction.organisme}
              </p>
              <p className="text-gray-600 text-xs leading-relaxed">
                {distinction.description}
              </p>
            </div>
          ))}
        </div>

        {/* Partenaires stratégiques */}
        <div className="bg-gray-50 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-[#0B2749] text-center mb-8">
            🤝 Nos partenaires stratégiques
          </h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partenaires.map((partenaire, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="text-3xl mb-2">{partenaire.logo}</div>
                <h4 className="font-bold text-[#0B2749] text-xs mb-1">
                  {partenaire.nom}
                </h4>
                <p className="text-gray-500 text-xs">
                  {partenaire.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}