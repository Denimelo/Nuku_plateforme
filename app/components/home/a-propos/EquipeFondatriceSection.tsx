import { useState } from "react";

interface EquipeFondatriceSectionProps {
  isVisible: boolean;
}

export function EquipeFondatriceSection ({ isVisible }: EquipeFondatriceSectionProps)  {
  const [activeFounder, setActiveFounder] = useState(0);

  const fondateurs = [
    {
      nom: "Koffi Adjoavi",
      poste: "Fondateur & CEO",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio_courte: "Visionnaire passionné par l'entrepreneuriat africain",
      bio_longue: "Après 8 ans comme consultant chez McKinsey à Paris, Koffi a choisi de rentrer au Togo pour contribuer au développement économique de son pays. Diplômé de HEC Paris et ancien entrepreneur (exit en 2019), il apporte une expertise unique alliant vision internationale et connaissance du terrain africain.",
      parcours: [
        "MBA HEC Paris (2012)",
        "Consultant Senior McKinsey & Company (2013-2020)",
        "Fondateur startup EdTech (vendue en 2019)",
        "Retour au Togo et création NUKU (2022)"
      ],
      expertise: ["Stratégie d'entreprise", "Levée de fonds", "Expansion internationale"],
      citation: "L'Afrique n'a pas besoin de charité, elle a besoin d'entrepreneurs audacieux.",
      contact: "koffi@nuku.io",
      achievements: "847M FCFA levés par ses mentorés"
    },
    {
      nom: "Akossiwa Mensah",
      poste: "Co-fondatrice & Directrice Pédagogique",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=400&h=400&fit=crop&crop=face",
      bio_courte: "PhD en Management, pionnière de la pédagogie entrepreneuriale",
      bio_longue: "Akossiwa est une référence en pédagogie entrepreneuriale en Afrique de l'Ouest. Ancienne professeure à l'Université de Lomé, elle a développé les premiers cursus d'entrepreneuriat du Togo. Son approche innovante mélange théorie académique et pratique terrain.",
      parcours: [
        "PhD Management - Université Sorbonne (2015)",
        "Professeure Université de Lomé (2016-2022)",
        "Consultante UNESCO sur l'éducation entrepreneuriale",
        "Co-fondatrice NUKU et création du curriculum (2022)"
      ],
      expertise: ["Pédagogie entrepreneuriale", "Conception de formations", "Recherche académique"],
      citation: "Enseigner l'entrepreneuriat, c'est donner les clés de l'autonomie économique.",
      contact: "akossiwa@nuku.io",
      achievements: "2,547 entrepreneurs formés avec sa méthode"
    },
    {
      nom: "Edem Kodjo",
      poste: "Co-fondateur & Responsable Écosystème",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio_courte: "15 ans dans l'écosystème startup, connecteur d'élite",
      bio_longue: "Edem est LE connecteur de l'écosystème entrepreneurial togolais. Ex-directeur de l'incubateur national, il connaît personnellement chaque acteur clé du pays. Son réseau exceptionnel et sa passion pour le mentorat font de lui l'artisan des connexions qui transforment les startups.",
      parcours: [
        "Ingénieur ESTACA Paris (2007)",
        "Directeur Incubateur National du Togo (2012-2021)",
        "Créateur du réseau 'Entrepreneurs Togolais' (2018)",
        "Co-fondateur NUKU - développement écosystème (2022)"
      ],
      expertise: ["Développement d'écosystème", "Mentorat", "Partenariats stratégiques"],
      citation: "Un entrepreneur seul va vite, mais ensemble, nous allons loin.",
      contact: "edem@nuku.io",
      achievements: "127 experts recrutés et 200+ partenariats"
    }
  ];

  return (
    <section
      id="equipe-fondatrice"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            👑 L'équipe fondatrice
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trois parcours exceptionnels unis par une vision commune : révéler le potentiel entrepreneurial togolais
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Navigation des fondateurs */}
          <div className="flex overflow-x-auto bg-gray-50 p-4">
            {fondateurs.map((fondateur, index) => (
              <button
                key={index}
                onClick={() => setActiveFounder(index)}
                className={`flex-shrink-0 flex items-center space-x-4 p-4 rounded-lg mr-4 transition-all duration-300 ${
                  activeFounder === index 
                    ? 'bg-[#0B2749] text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <img
                  src={fondateur.photo}
                  alt={fondateur.nom}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-bold">{fondateur.nom}</div>
                  <div className="text-sm opacity-75">{fondateur.poste}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Profil actif */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <img
                  src={fondateurs[activeFounder].photo}
                  alt={fondateurs[activeFounder].nom}
                  className="w-full max-w-sm mx-auto rounded-2xl object-cover shadow-lg"
                />
                <div className="text-center mt-6">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold inline-block">
                    🏆 {fondateurs[activeFounder].achievements}
                  </div>
                </div>
              </div>
              
              <div className="lg:w-2/3">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-[#0B2749] mb-2">
                    {fondateurs[activeFounder].nom}
                  </h3>
                  <p className="text-xl text-blue-600 font-medium mb-4">
                    {fondateurs[activeFounder].poste}
                  </p>
                  <p className="text-gray-500 italic mb-4">
                    {fondateurs[activeFounder].bio_courte}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-[#0B2749] mb-3">📖 Parcours</h4>
                  <div className="space-y-2">
                    {fondateurs[activeFounder].parcours.map((etape, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-[#0B2749] rounded-full mr-3"></span>
                        <span className="text-gray-700 text-sm">{etape}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-[#0B2749] mb-3">🎯 Expertises</h4>
                  <div className="flex flex-wrap gap-2">
                    {fondateurs[activeFounder].expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <blockquote className="border-l-4 border-[#0B2749] pl-4 mb-6">
                  <p className="text-gray-700 italic text-lg leading-relaxed">
                    "{fondateurs[activeFounder].citation}"
                  </p>
                </blockquote>

                <p className="text-gray-600 leading-relaxed mb-6">
                  {fondateurs[activeFounder].bio_longue}
                </p>

                <a
                  href={`mailto:${fondateurs[activeFounder].contact}`}
                  className="inline-block bg-[#0B2749] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300 transform hover:scale-105"
                >
                  📧 Contacter {fondateurs[activeFounder].nom.split(' ')[0]}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}