import React, { useState, useEffect } from "react";
import { Header } from "~/components/layout/Header";

// Hook pour les animations au scroll
const useScrollAnimation = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "-50px",
      }
    );

    const sections = document.querySelectorAll("[data-animate]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return visibleSections;
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-purple-900 via-[#0B2749] to-indigo-900 px-6 py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-green-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-blue-400 rounded-full animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Partagez votre 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            {" "}expertise
          </span>
          , transformez des vies
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Rejoignez le réseau d'experts NUKU et accompagnez la nouvelle génération d'entrepreneurs togolais. 
          Votre expérience peut changer le cours d'une startup !
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#devenir-expert"
            className="bg-yellow-500 text-[#0B2749] px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            🎯 Devenir expert NUKU
          </a>
          <a
            href="#nos-experts"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0B2749] transition-all duration-300"
          >
            Découvrir nos experts
          </a>
        </div>

        {/* Stats du réseau d'experts */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">127</div>
            <div className="text-blue-100">Experts actifs</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-green-400">2,547</div>
            <div className="text-blue-100">Entrepreneurs accompagnés</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-orange-400">4.9/5</div>
            <div className="text-blue-100">Satisfaction moyenne</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">15+</div>
            <div className="text-blue-100">Domaines d'expertise</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Section Nos Experts
const NosExpertsSection = ({ isVisible }: { isVisible: boolean }) => {
  const [activeCategory, setActiveCategory] = useState("Tous");
  
  const categories = ["Tous", "Agro-business", "Tech & Digital", "Finance", "Marketing", "Management"];
  
  const experts = [
    {
      nom: "Dr. Kofi Amegatcher",
      specialite: "Agro-business",
      experience: "15 ans",
      entreprise: "Ex-Directeur Technique ICAT",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      expertise: ["Production agricole", "Transformation", "Export"],
      entrepreneurs_accompagnes: 45,
      success_rate: "92%",
      citation: "L'agriculture togolaise a un potentiel énorme. Mon rôle est d'aider les jeunes à le révéler.",
      disponible: true
    },
    {
      nom: "Ama Tessa Kpogo",
      specialite: "Tech & Digital",
      experience: "12 ans",
      entreprise: "Fondatrice TechLomé",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=300&h=300&fit=crop&crop=face",
      expertise: ["E-commerce", "Applications mobiles", "FinTech"],
      entrepreneurs_accompagnes: 38,
      success_rate: "89%",
      citation: "Le digital transforme l'Afrique. Ensemble, créons les solutions de demain.",
      disponible: true
    },
    {
      nom: "Emmanuel Koku",
      specialite: "Finance",
      experience: "18 ans",
      entreprise: "Ex-VP Ecobank Togo",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      expertise: ["Levée de fonds", "Plan financier", "Microfinance"],
      entrepreneurs_accompagnes: 67,
      success_rate: "94%",
      citation: "Un bon plan financier, c'est 50% du succès d'une startup.",
      disponible: false
    },
    {
      nom: "Sarah Ablavi",
      specialite: "Marketing",
      experience: "10 ans",
      entreprise: "Directrice Marketing MTN Togo",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      expertise: ["Stratégie marketing", "Branding", "Communication digitale"],
      entrepreneurs_accompagnes: 52,
      success_rate: "91%",
      citation: "Une marque forte, c'est ce qui différencie une startup qui survit de celle qui prospère.",
      disponible: true
    },
    {
      nom: "Prof. Yao Tetteh",
      specialite: "Management",
      experience: "20 ans",
      entreprise: "Université de Lomé",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face",
      expertise: ["Leadership", "Ressources humaines", "Stratégie d'entreprise"],
      entrepreneurs_accompagnes: 73,
      success_rate: "96%",
      citation: "Diriger une équipe, ça s'apprend. Et c'est la clé pour scaler son business.",
      disponible: true
    },
    {
      nom: "Kossi Agbeko",
      specialite: "Agro-business",
      experience: "14 ans",
      entreprise: "Fondateur AgriTech Solutions",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
      expertise: ["Innovation agricole", "IoT farming", "Supply chain"],
      entrepreneurs_accompagnes: 29,
      success_rate: "88%",
      citation: "L'agriculture 4.0 arrive en Afrique. Soyons les pionniers !",
      disponible: true
    }
  ];

  const expertsFiltered = activeCategory === "Tous" 
    ? experts 
    : experts.filter(expert => expert.specialite === activeCategory);

  return (
    <section
      id="nos-experts"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🌟 Nos experts vous accompagnent
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des professionnels expérimentés, sélectionnés pour leur expertise et leur passion pour l'entrepreneuriat
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-[#0B2749] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid des experts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {expertsFiltered.map((expert, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
            >
              {/* Header avec photo et statut */}
              <div className="relative mb-6">
                <img
                  src={expert.photo}
                  alt={expert.nom}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                />
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                  expert.disponible 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {expert.disponible ? '🟢 Disponible' : '🟠 Complet'}
                </div>
              </div>

              {/* Informations principales */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-[#0B2749] mb-2">
                  {expert.nom}
                </h3>
                <div className="flex justify-center items-center space-x-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {expert.specialite}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">{expert.entreprise}</p>
                <p className="text-gray-500 text-sm">{expert.experience} d'expérience</p>
              </div>

              {/* Domaines d'expertise */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">Expertises :</h4>
                <div className="flex flex-wrap gap-2">
                  {expert.expertise.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0B2749]">
                    {expert.entrepreneurs_accompagnes}
                  </div>
                  <div className="text-xs text-gray-600">Entrepreneurs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {expert.success_rate}
                  </div>
                  <div className="text-xs text-gray-600">Succès</div>
                </div>
              </div>

              {/* Citation */}
              <blockquote className="text-sm text-gray-600 italic text-center mb-4 border-l-4 border-[#0B2749] pl-3">
                "{expert.citation}"
              </blockquote>

              {/* CTA */}
              <button
                disabled={!expert.disponible}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  expert.disponible
                    ? 'bg-[#0B2749] text-white hover:bg-[#0a2240] transform hover:scale-105'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {expert.disponible ? 'Demander un mentorat' : 'Liste d\'attente'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Section Devenir Expert
const DevenirExpertSection = ({ isVisible }: { isVisible: boolean }) => {
  const criteres = [
    {
      titre: "Expérience professionnelle",
      description: "Minimum 8 ans d'expérience dans votre domaine",
      icon: "💼",
      requis: true
    },
    {
      titre: "Expertise sectorielle",
      description: "Maîtrise reconnue d'un secteur stratégique",
      icon: "🎯",
      requis: true
    },
    {
      titre: "Passion pour l'entrepreneuriat",
      description: "Envie genuine de transmettre et d'accompagner",
      icon: "❤️",
      requis: true
    },
    {
      titre: "Réseau professionnel",
      description: "Carnet d'adresses pour aider les entrepreneurs",
      icon: "🤝",
      requis: false
    },
    {
      titre: "Disponibilité",
      description: "4-6h par mois pour accompagner 2-3 entrepreneurs",
      icon: "⏰",
      requis: true
    },
    {
      titre: "Localisation",
      description: "Basé au Togo ou diaspora togolaise engagée",
      icon: "📍",
      requis: false
    }
  ];

  const etapes = [
    {
      numero: "01",
      titre: "Candidature",
      description: "Remplissez notre formulaire détaillé et joignez votre CV",
      duree: "15 min"
    },
    {
      numero: "02", 
      titre: "Évaluation",
      description: "Notre équipe étudie votre profil et vos motivations",
      duree: "3-5 jours"
    },
    {
      numero: "03",
      titre: "Entretien",
      description: "Échange vidéo de 45 min avec notre responsable experts",
      duree: "45 min"
    },
    {
      numero: "04",
      titre: "Formation",
      description: "Module de formation au mentorat entrepreneurial NUKU",
      duree: "2h"
    },
    {
      numero: "05",
      titre: "Intégration",
      description: "Accès plateforme + 1er entrepreneur assigné",
      duree: "Immédiat"
    }
  ];

  return (
    <section
      id="devenir-expert"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🚀 Devenir expert NUKU
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rejoignez une communauté d'experts passionnés et contribuez à l'écosystème entrepreneurial togolais
          </p>
        </div>

        {/* Critères de sélection */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-[#0B2749] text-center mb-12">
            ✅ Profil recherché
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {criteres.map((critere, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                  critere.requis 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{critere.icon}</div>
                  <div>
                    <h4 className="font-bold text-[#0B2749] mb-2 flex items-center">
                      {critere.titre}
                      {critere.requis && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Requis
                        </span>
                      )}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {critere.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processus de candidature */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-[#0B2749] text-center mb-12">
            📋 Processus de sélection
          </h3>
          <div className="relative">
            {/* Ligne de connexion */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#0B2749] to-blue-400 transform -translate-y-1/2"></div>
            
            <div className="grid lg:grid-cols-5 gap-8">
              {etapes.map((etape, index) => (
                <div key={index} className="relative">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#0B2749] to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 relative z-10">
                        {etape.numero}
                      </div>
                      <h4 className="font-bold text-[#0B2749] mb-2">
                        {etape.titre}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {etape.description}
                      </p>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        {etape.duree}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/signup"
            className="inline-block bg-[#0B2749] text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-[#0a2240] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Postuler comme expert
          </a>
          <p className="text-gray-600 text-sm mt-4">
            💼 Processus de sélection rigoureux • 🎓 Formation offerte • 🤝 Réseau d'experts actifs
          </p>
        </div>
      </div>
    </section>
  );
};

// Section Opportunités et Rémunération
const OpportunitesSection = ({ isVisible }: { isVisible: boolean }) => {
  const avantages = [
    {
      titre: "Rémunération attractive",
      description: "25K-75K FCFA par entrepreneur accompagné selon la durée",
      icon: "💰",
      details: "Paiement mensuel + bonus résultats"
    },
    {
      titre: "Développement personnel",
      description: "Formations continues et certification mentorat international",
      icon: "📚",
      details: "Accès gratuit à nos masterclass"
    },
    {
      titre: "Réseau exclusif",
      description: "Connexion avec 127+ experts de tous secteurs",
      icon: "🤝",
      details: "Événements networking trimestriels"
    },
    {
      titre: "Impact social",
      description: "Contribuez directement à l'économie togolaise",
      icon: "🌍",
      details: "Rapports d'impact réguliers"
    },
    {
      titre: "Flexibilité totale",
      description: "Accompagnement 100% à distance, horaires libres",
      icon: "⏰",
      details: "4-6h par mois par entrepreneur"
    },
    {
      titre: "Reconnaissance",
      description: "Certificats, témoignages et visibilité médiatique",
      icon: "🏆",
      details: "Profil public sur notre plateforme"
    }
  ];

  return (
    <section
      id="opportunites"
      data-animate
      className={`px-6 py-20 bg-gradient-to-br from-gray-50 to-blue-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            💎 Pourquoi devenir expert NUKU ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une opportunité unique de partager votre expertise tout en développant votre propre carrière
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {avantages.map((avantage, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
            >
              <div className="text-4xl mb-4 text-center">{avantage.icon}</div>
              <h3 className="text-xl font-bold text-[#0B2749] mb-3 text-center">
                {avantage.titre}
              </h3>
              <p className="text-gray-600 text-center mb-4 leading-relaxed">
                {avantage.description}
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 text-center">
                  💡 {avantage.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Témoignage d'expert */}
        <div className="mt-16 bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <img
              src="https://images.unsplash.com/photo-1494790108755-2616b612b647?w=200&h=200&fit=crop&crop=face"
              alt="Ama Tessa"
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1 text-center lg:text-left">
              <blockquote className="text-lg text-gray-700 italic mb-4 leading-relaxed">
                "Être expert NUKU m'a permis de donner du sens à mon expertise tech tout en développant mes compétences en mentorat. J'ai accompagné 38 entrepreneurs et vu naître de vraies pépites ! La rémunération n'est que le bonus."
              </blockquote>
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div>
                  <div className="font-bold text-[#0B2749]">Ama Tessa Kpogo</div>
                  <div className="text-gray-600 text-sm">Expert Tech & Digital • 38 entrepreneurs accompagnés</div>
                </div>
                <div className="text-2xl text-yellow-500">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Section Domaines Recherchés
const DomainesRechercheSection = ({ isVisible }: { isVisible: boolean }) => {
  const domaines = [
    {
      nom: "Agro-business & AgriTech",
      demande: "Très haute",
      entrepreneurs_en_attente: 47,
      couleur: "bg-green-500",
      description: "Production, transformation, export, innovation agricole",
      urgent: true
    },
    {
      nom: "Tech & Digital",
      demande: "Haute", 
      entrepreneurs_en_attente: 32,
      couleur: "bg-blue-500",
      description: "Développement web/mobile, e-commerce, FinTech",
      urgent: true
    },
    {
      nom: "Finance & Investment",
      demande: "Très haute",
      entrepreneurs_en_attente: 28,
      couleur: "bg-purple-500", 
      description: "Levée de fonds, modélisation financière, comptabilité",
      urgent: true
    },
    {
      nom: "Marketing & Communication",
      demande: "Moyenne",
      entrepreneurs_en_attente: 19,
      couleur: "bg-orange-500",
      description: "Stratégie marketing, branding, digital marketing",
      urgent: false
    },
    {
      nom: "Operations & Supply Chain",
      demande: "Haute",
      entrepreneurs_en_attente: 23,
      couleur: "bg-red-500",
      description: "Logistique, production, processus, qualité",
      urgent: false
    },
    {
      nom: "Legal & Compliance",
      demande: "Moyenne",
      entrepreneurs_en_attente: 12,
      couleur: "bg-gray-500",
      description: "Droit des affaires, conformité, propriété intellectuelle",
      urgent: false
    }
  ];

  return (
    <section
      id="domaines-recherches"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🎯 Domaines d'expertise recherchés
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nous recherchons activement des experts dans ces domaines prioritaires pour répondre à la demande croissante
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domaines.map((domaine, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 relative"
            >
              {domaine.urgent && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  🔥 URGENT
                </div>
              )}
              
              <div className="flex items-center mb-4">
                <div className={`w-4 h-4 ${domaine.couleur} rounded-full mr-3`}></div>
                <h3 className="text-lg font-bold text-[#0B2749]">
                  {domaine.nom}
                </h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {domaine.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Demande:</span>
                  <span className={`text-sm font-bold ${
                    domaine.demande === 'Très haute' ? 'text-red-600' :
                    domaine.demande === 'Haute' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {domaine.demande}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">En attente:</span>
                  <span className="text-sm font-bold text-[#0B2749]">
                    {domaine.entrepreneurs_en_attente} entrepreneurs
                  </span>
                </div>
              </div>
              
              <a
                href="/signup"
                className="block w-full mt-4 bg-[#0B2749] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300"
              >
                Postuler dans ce domaine
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl inline-block">
            <h3 className="font-bold text-[#0B2749] mb-2">
              🚨 Besoin urgent d'experts !
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              <strong>152 entrepreneurs</strong> attendent un mentor dans ces domaines prioritaires
            </p>
            <a
              href="/signup"
              className="bg-yellow-500 text-[#0B2749] px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
            >
              Candidater en priorité
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Section Témoignages d'Experts
const TemoignagesExpertsSection = ({ isVisible }: { isVisible: boolean }) => {
  const temoignages = [
    {
      nom: "Dr. Kofi Amegatcher",
      role: "Expert Agro-business",
      duree_collaboration: "2 ans",
      entrepreneurs_accompagnes: 45,
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      temoignage: "NUKU m'a donné l'opportunité de transmettre 15 ans d'expérience agricole à la nouvelle génération. Voir mes mentorés exporter leurs premiers produits, c'est ma plus grande fierté. La plateforme est intuitive et l'équipe très professionnelle.",
      meilleur_souvenir: "Quand Akossia a exporté ses premières mangues bio vers la France !",
      recommendation: 5
    },
    {
      nom: "Emmanuel Koku",
      role: "Expert Finance",
      duree_collaboration: "18 mois", 
      entrepreneurs_accompagnes: 67,
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      temoignage: "En tant qu'ex-banquier, j'ai toujours voulu aider les jeunes entrepreneurs à structurer leurs projets financièrement. NUKU m'a permis de le faire de manière organisée et impactante. Mes mentorés ont levé plus de 400M FCFA collectivement !",
      meilleur_souvenir: "Le premier entrepreneur qui a décroché un prêt bancaire grâce à son business plan.",
      recommendation: 5
    },
    {
      nom: "Sarah Ablavi", 
      role: "Expert Marketing",
      duree_collaboration: "1 an",
      entrepreneurs_accompagnes: 52,
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      temoignage: "Le marketing digital transforme les business au Togo. Accompagner des entrepreneurs à passer de 0 à 10K followers, optimiser leurs conversions... C'est gratifiant ! Et la rémunération NUKU me permet de financer mes propres projets.",
      meilleur_souvenir: "Une startup que j'ai accompagnée est devenue virale sur TikTok !",
      recommendation: 5
    }
  ];

  return (
    <section
      id="temoignages-experts"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            💬 Ce que disent nos experts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des témoignages authentiques d'experts qui transforment l'écosystème entrepreneurial togolais
          </p>
        </div>

        <div className="space-y-12">
          {temoignages.map((temoignage, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-8 bg-white p-8 rounded-2xl shadow-lg ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="lg:w-1/3">
                <img
                  src={temoignage.photo}
                  alt={temoignage.nom}
                  className="w-48 h-48 rounded-2xl object-cover mx-auto shadow-lg"
                />
              </div>
              
              <div className="lg:w-2/3">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#0B2749] mb-2">
                    {temoignage.nom}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {temoignage.role}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {temoignage.duree_collaboration} chez NUKU
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {temoignage.entrepreneurs_accompagnes} entrepreneurs accompagnés
                    </span>
                  </div>
                </div>

                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 border-l-4 border-[#0B2749] pl-4">
                  "{temoignage.temoignage}"
                </blockquote>

                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <h4 className="font-bold text-[#0B2749] mb-2">💫 Son meilleur souvenir :</h4>
                  <p className="text-gray-700 italic">"{temoignage.meilleur_souvenir}"</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Recommande NUKU :</span>
                    <div className="flex">
                      {[...Array(temoignage.recommendation)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xl">⭐</span>
                      ))}
                    </div>
                  </div>
                  <a
                    href="/signup"
                    className="bg-[#0B2749] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300"
                  >
                    Rejoindre l'équipe
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Section CTA Final
const CTAFinalSection = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <section
      id="cta-final"
      data-animate
      className={`px-6 py-20 bg-gradient-to-br from-[#0B2749] to-purple-800 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          🌟 Votre expertise peut changer des vies
        </h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          152 entrepreneurs togolais attendent votre accompagnement. Rejoignez les 127 experts qui 
          transforment déjà l'écosystème entrepreneurial du Togo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="/signup"
            className="bg-yellow-500 text-[#0B2749] px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🚀 Postuler comme expert
          </a>
          <a
            href="#nos-experts"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0B2749] transition-all duration-300"
          >
            Découvrir nos experts
          </a>
        </div>

        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-white font-medium">Réponse sous 48h</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">🎓</div>
            <div className="text-white font-medium">Formation incluse</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-white font-medium">Rémunération attractive</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">🤝</div>
            <div className="text-white font-medium">Réseau d'experts</div>
          </div>
        </div>

        <p className="text-blue-200 text-sm mt-8">
          💡 Questions ? Contactez notre responsable experts : experts@nuku.io
        </p>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1">
            <img
              src="/images/logo_nuku.webp"
              alt="NUKU Logo"
              className="h-8 w-auto mb-4 filter brightness-0 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Le réseau d'experts qui accompagne les entrepreneurs togolais vers le succès.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Pour experts</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#devenir-expert" className="text-gray-400 hover:text-white transition-colors">Devenir expert</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Opportunités</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Formation mentorat</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Réseau experts</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Guide expert</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ experts</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Contact experts</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>experts@nuku.io</p>
              <p>+228 XX XX XX XX</p>
              <p>Lomé, Maritime<br />Togo</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 NUKU. Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Composant principal
export default function Experts() {
  const visibleSections = useScrollAnimation();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <NosExpertsSection isVisible={visibleSections.has("nos-experts")} />
      <DevenirExpertSection isVisible={visibleSections.has("devenir-expert")} />
      <OpportunitesSection isVisible={visibleSections.has("opportunites")} />
      <DomainesRechercheSection isVisible={visibleSections.has("domaines-recherches")} />
      <TemoignagesExpertsSection isVisible={visibleSections.has("temoignages-experts")} />
      <CTAFinalSection isVisible={visibleSections.has("cta-final")} />
      <Footer />
    </div>
  );
}