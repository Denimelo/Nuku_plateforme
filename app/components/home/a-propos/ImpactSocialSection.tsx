

interface ImpactSocialSectionProps {
  isVisible: boolean;   
}

export function ImpactSocialSection ({ isVisible }: ImpactSocialSectionProps)  {
  const impactStats = [
    {
      categorie: "Impact Économique",
      icon: "💰",
      couleur: "from-green-500 to-green-600",
      metriques: [
        { label: "CA cumulé généré", valeur: "2.4Md FCFA", description: "Par nos entrepreneurs" },
        { label: "Emplois directs créés", valeur: "1,247", description: "CDI et permanents" },
        { label: "Emplois indirects", valeur: "3,800+", description: "Estimation filières" },
        { label: "Taxes générées", valeur: "147M FCFA", description: "Contribution fiscale" }
      ]
    },
    {
      categorie: "Impact Social",
      icon: "🤝",
      couleur: "from-blue-500 to-blue-600", 
      metriques: [
        { label: "Jeunes sortis du chômage", valeur: "2,547", description: "Entrepreneurs formés" },
        { label: "Femmes entrepreneures", valeur: "42%", description: "Parité croissante" },
        { label: "Zones rurales touchées", valeur: "67%", description: "Inclusion territoriale" },
        { label: "Familles impactées", valeur: "12,000+", description: "Amélioration revenus" }
      ]
    },
    {
      categorie: "Impact Sectoriel",
      icon: "🌱",
      couleur: "from-orange-500 to-orange-600",
      metriques: [
        { label: "Startups agro créées", valeur: "487", description: "Modernisation agricole" },
        { label: "Solutions digitales", valeur: "156", description: "Innovation tech" },
        { label: "Export développé", valeur: "23%", description: "Ouverture internationale" },
        { label: "Secteurs diversifiés", valeur: "15", description: "Économie variée" }
      ]
    }
  ];

  return (
    <section
      id="impact"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            📊 Notre impact social
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Au-delà des chiffres, NUKU transforme des vies et contribue au développement du Togo
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {impactStats.map((categorie, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className={`bg-gradient-to-r ${categorie.couleur} p-6 text-white text-center`}>
                <div className="text-4xl mb-3">{categorie.icon}</div>
                <h3 className="text-xl font-bold">{categorie.categorie}</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {categorie.metriques.map((metrique, metriqueIndex) => (
                    <div key={metriqueIndex} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-gray-600 text-sm">{metrique.label}:</span>
                        <span className="text-2xl font-bold text-[#0B2749]">{metrique.valeur}</span>
                      </div>
                      <p className="text-xs text-gray-500">{metrique.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Témoignages d'impact */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-[#0B2749] text-center mb-8">
            🗣️ Témoignages d'impact
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face"
                alt="Ministre"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
              />
              <blockquote className="text-gray-700 italic text-sm mb-3">
                "NUKU incarne parfaitement notre vision d'un Togo entrepreneurial. Leur approche pragmatique génère des résultats concrets."
              </blockquote>
              <p className="text-xs text-gray-500">
                <strong>Mme Victoire Dogbé</strong><br />
                Première Ministre du Togo
              </p>
            </div>
            
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                alt="Banquier"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
              />
              <blockquote className="text-gray-700 italic text-sm mb-3">
                "Les entrepreneurs formés par NUKU ont un taux de remboursement de 94%. Leur formation est un gage de qualité."
              </blockquote>
              <p className="text-xs text-gray-500">
                <strong>Jean-Claude Assih</strong><br />
                Directeur Ecobank Togo
              </p>
            </div>
            
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
                alt="Entrepreneur"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
              />
              <blockquote className="text-gray-700 italic text-sm mb-3">
                "Grâce à NUKU, mon entreprise emploie maintenant 15 personnes. J'ai pu sortir ma famille et mes employés de la précarité."
              </blockquote>
              <p className="text-xs text-gray-500">
                <strong>Akossia Tété</strong><br />
                Fondatrice AgriExport Plus
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}