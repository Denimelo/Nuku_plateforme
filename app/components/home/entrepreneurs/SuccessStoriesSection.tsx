import { useState } from "react";

interface SuccessStoriesSectionProps {
  isVisible: boolean;
}

export function SuccessStoriesSection ({ isVisible }: SuccessStoriesSectionProps) {
  const [activeStory, setActiveStory] = useState(0);
  
  const stories = [
    {
      nom: "Akossia Tété",
      age: 24,
      entreprise: "Togo Organic Farm",
      secteur: "Agro-business",
      ville: "Kpalimé",
      photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop&crop=face",
      investissement_initial: "150K FCFA",
      ca_actuel: "2.8M FCFA/mois",
      emplois_crees: 12,
      histoire: "Partie de rien avec 2 hectares hérités de mon grand-père, j'ai transformé une terre abandonnée en ferme bio certifiée. Aujourd'hui, j'exporte vers 3 pays de la sous-région.",
      conseil: "N'attendez pas d'avoir tout l'argent. Commencez petit, mais commencez maintenant !",
      temps_reussite: "18 mois"
    },
    {
      nom: "Koffi Mensah",
      age: 27,
      entreprise: "Lomé Tech Hub",
      secteur: "EdTech",
      ville: "Lomé",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      investissement_initial: "80K FCFA",
      ca_actuel: "1.9M FCFA/mois", 
      emplois_crees: 8,
      histoire: "J'ai créé une plateforme d'apprentissage en ligne pour les étudiants togolais. Parti d'un simple site web, nous accompagnons maintenant 5000+ étudiants.",
      conseil: "Le digital n'a pas de frontières. Pensez local, mais construisez global !",
      temps_reussite: "14 mois"
    },
    {
      nom: "Ama Dzidzor", 
      age: 26,
      entreprise: "Saveurs du Togo",
      secteur: "Agro-alimentaire",
      ville: "Sokodé",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      investissement_initial: "200K FCFA",
      ca_actuel: "3.2M FCFA/mois",
      emplois_crees: 15,
      histoire: "Transformation et commercialisation de produits locaux (igname, manioc, karité). Mes produits sont maintenant dans 40+ supermarchés au Togo et au Ghana.",
      conseil: "Valorisez ce que nous avons déjà ! Le Togo regorge de trésors inexploités.",
      temps_reussite: "22 mois"
    }
  ];

  return (
    <section
      id="success-stories"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🌟 Ils étaient comme vous... Regardez où ils en sont !
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des histoires 100% vraies d'entrepreneurs togolais qui ont osé se lancer
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Navigation des stories */}
          <div className="flex overflow-x-auto bg-gray-50 p-4">
            {stories.map((story, index) => (
              <button
                key={index}
                onClick={() => setActiveStory(index)}
                className={`flex-shrink-0 flex items-center space-x-3 p-4 rounded-lg mr-4 transition-all duration-300 ${
                  activeStory === index 
                    ? 'bg-[#0B2749] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <img
                  src={story.photo}
                  alt={story.nom}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-bold text-sm">{story.nom}</div>
                  <div className="text-xs opacity-75">{story.entreprise}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Story active */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <img
                  src={stories[activeStory].photo}
                  alt={stories[activeStory].nom}
                  className="w-full max-w-sm mx-auto rounded-xl object-cover"
                />
              </div>
              
              <div className="lg:w-2/3">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#0B2749] mb-2">
                    {stories[activeStory].nom}, {stories[activeStory].age} ans
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {stories[activeStory].entreprise}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {stories[activeStory].secteur}
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      📍 {stories[activeStory].ville}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#0B2749]">
                      {stories[activeStory].investissement_initial}
                    </div>
                    <div className="text-sm text-gray-600">Investissement initial</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stories[activeStory].ca_actuel}
                    </div>
                    <div className="text-sm text-gray-600">CA mensuel actuel</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stories[activeStory].emplois_crees}
                    </div>
                    <div className="text-sm text-gray-600">Emplois créés</div>
                  </div>
                </div>

                <blockquote className="border-l-4 border-[#0B2749] pl-4 mb-6">
                  <p className="text-gray-700 italic text-lg leading-relaxed">
                    "{stories[activeStory].histoire}"
                  </p>
                </blockquote>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-[#0B2749] mb-2">💡 Son conseil pour vous :</h4>
                  <p className="text-gray-700 italic">"{stories[activeStory].conseil}"</p>
                  <p className="text-sm text-gray-500 mt-2">
                    ⏱️ Temps jusqu'au succès : {stories[activeStory].temps_reussite}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}