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

// Composant pour les statistiques animées
const AnimatedStats = ({ stats }: { stats: Array<{region: string, data: Array<{label: string, value: string}>}> }) => {
  const [currentRegion, setCurrentRegion] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRegion((prev) => (prev + 1) % stats.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [stats.length]);

  return (
    <div className="bg-gradient-to-r from-[#0B2749] to-blue-600 p-6 rounded-lg text-white">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold transition-all duration-500">
          📊 {stats[currentRegion].region}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {stats[currentRegion].data.map((stat, index) => (
          <div key={index} className="text-center animate-fade-in">
            <div className="text-2xl font-bold text-yellow-300">{stat.value}</div>
            <div className="text-sm text-blue-100">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {stats.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentRegion === index ? "bg-yellow-300" : "bg-blue-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-20">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-[#0B2749] mb-6 leading-tight">
          Découvrez votre voie 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
            {" "}entrepreneuriale
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          L'Afrique regorge d'opportunités ! Explorez gratuitement deux secteurs 
          en pleine expansion et découvrez celui qui correspond à vos ambitions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#cours-gratuits"
            className="bg-[#0B2749] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Commencer maintenant
          </a>
          <a
            href="/signup"
            className="border-2 border-[#0B2749] text-[#0B2749] px-8 py-4 rounded-lg font-semibold hover:bg-[#0B2749] hover:text-white transition-all duration-300"
          >
            Accéder aux formations complètes
          </a>
        </div>
        
        {/* Statistiques d'impact */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-[#0B2749]">2.5M+</div>
            <div className="text-gray-600">Jeunes entrepreneurs en Afrique</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-green-600">127%</div>
            <div className="text-gray-600">Croissance du e-commerce africain</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-yellow-600">65%</div>
            <div className="text-gray-600">Population togolaise dans l'agriculture</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Section cours gratuits
const CoursGratuitsSection = ({ isVisible }: { isVisible: boolean }) => {
  const agrobusinessStats = [
    {
      region: "🌍 Afrique",
      data: [
        { label: "PIB agricole", value: "$180Md" },
        { label: "Emplois créés", value: "65%" },
        { label: "Croissance annuelle", value: "+4.2%" },
        { label: "Potentiel inexploité", value: "70%" }
      ]
    },
    {
      region: "🇹🇬 Togo", 
      data: [
        { label: "Population rurale", value: "65%" },
        { label: "PIB agricole", value: "28%" },
        { label: "Terres arables", value: "2.2M ha" },
        { label: "Export agricole", value: "$340M" }
      ]
    }
  ];

  const digitalStats = [
    {
      region: "🌍 Afrique",
      data: [
        { label: "Utilisateurs internet", value: "540M" },
        { label: "Croissance e-commerce", value: "+127%" },
        { label: "Paiements mobiles", value: "$495Md" },
        { label: "Startups tech", value: "+22%" }
      ]
    },
    {
      region: "🇹🇬 Togo",
      data: [
        { label: "Pénétration internet", value: "71%" },
        { label: "Utilisateurs mobiles", value: "6.2M" },
        { label: "Croissance digitale", value: "+31%" },
        { label: "Flooz/T-Money", value: "4.8M" }
      ]
    }
  ];

  return (
    <section
      id="cours-gratuits"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🎓 Aperçu gratuit de nos formations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Deux secteurs, deux opportunités immenses. Découvrez celui qui vous correspond !
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Agro-business */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mr-4">
                🌱
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0B2749]">Agro-business</h3>
                <p className="text-green-600 font-medium">Le futur de l'Afrique</p>
              </div>
            </div>

            <AnimatedStats stats={agrobusinessStats} />

            <div className="mt-8 space-y-6">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-bold text-[#0B2749] mb-2">Module 1 : Pourquoi l'agro-business ? (5 min)</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Le Togo, grenier de l'Afrique de l'Ouest</li>
                  <li>• 3 success stories togolaises inspirantes</li>
                  <li>• Opportunités d'export vers l'Europe</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-bold text-[#0B2749] mb-2">Module 2 : Les réalités du terrain (5 min)</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Défis climatiques et solutions modernes</li>
                  <li>• Budget de démarrage : 50K à 500K FCFA</li>
                  <li>• Compétences techniques vs business</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  "J'ai démarré avec 200K FCFA et un hectare. Aujourd'hui, 
                  j'exporte 50 tonnes de mangues vers l'Europe chaque année."
                </p>
                <p className="text-xs text-green-600 mt-2">- Kofi A., entrepreneur agro</p>
              </div>
            </div>

            <a
              href="/signup"
              className="block w-full mt-8 bg-green-600 text-white text-center py-4 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
            >
              Voir le programme complet (12 modules)
            </a>
          </div>

          {/* E-commerce/Digital */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mr-4">
                💻
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0B2749]">E-commerce & Digital</h3>
                <p className="text-blue-600 font-medium">La révolution numérique</p>
              </div>
            </div>

            <AnimatedStats stats={digitalStats} />

            <div className="mt-8 space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-[#0B2749] mb-2">Module 1 : Pourquoi le digital ? (5 min)</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Boom des paiements mobiles au Togo</li>
                  <li>• 3 startups togolaises qui cartonnent</li>
                  <li>• Marché africain : 1.4 milliard de consommateurs</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-bold text-[#0B2749] mb-2">Module 2 : Les réalités du terrain (5 min)</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Défis de livraison et solutions locales</li>
                  <li>• Budget de démarrage : 25K à 200K FCFA</li>
                  <li>• Skills tech vs marketing digital</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  "Parti de rien avec Flooz, je génère maintenant 2M FCFA/mois 
                  en vendant des produits locaux via WhatsApp Business."
                </p>
                <p className="text-xs text-blue-600 mt-2">- Ama K., e-commerçante</p>
              </div>
            </div>

            <a
              href="/signup"
              className="block w-full mt-8 bg-blue-600 text-white text-center py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Voir le programme complet (15 modules)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Section témoignages
const TestimonialsSection = ({ isVisible }: { isVisible: boolean }) => {
  const testimonials = [
    {
      name: "Kossi Mensah",
      business: "Togo Fresh Export",
      sector: "Agro-business",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      testimonial: "Grâce au programme NUKU, j'ai appris à structurer mon business d'export d'ananas. De 2 hectares, je suis passé à 15 hectares en 18 mois.",
      results: "15 hectares • 50 employés • Export Europe"
    },
    {
      name: "Akossiwa Doe", 
      business: "Lomé Digital Services",
      sector: "E-commerce",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
      testimonial: "Le module sur les paiements mobiles m'a ouvert les yeux. Mon e-shop utilise maintenant Flooz et T-Money. Mes ventes ont explosé !",
      results: "500+ clients • 1.8M FCFA/mois • 3 employés"
    },
    {
      name: "Elom Agbeko",
      business: "AgriTech Solutions", 
      sector: "Agro-business + Digital",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      testimonial: "J'ai combiné les deux formations. Aujourd'hui, je connecte les producteurs aux acheteurs via une app mobile. Innovation 100% togolaise !",
      results: "200+ agriculteurs • App mobile • Investissement levé"
    }
  ];

  return (
    <section
      id="testimonials"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🌟 Ils ont transformé leur vision en réalité
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des entrepreneurs togolais qui prouvent que c'est possible !
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold text-[#0B2749]">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.business}</p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full mt-1">
                    {testimonial.sector}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 italic text-sm leading-relaxed mb-4">
                "{testimonial.testimonial}"
              </p>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-700 font-semibold text-sm">
                  📈 {testimonial.results}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Section programmes complets
const ProgrammesSection = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <section
      id="programmes-complets"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            🚀 Nos programmes complets
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Prêt à aller plus loin ? Découvrez nos formations complètes avec mentorat personnalisé.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Formation Agro-business Complète</h3>
              <ul className="space-y-2 mb-8 text-green-100">
                <li>✓ 12 modules approfondis + mentorat</li>
                <li>✓ Étude de marché personnalisée</li>
                <li>✓ Plan d'affaires guidé</li>
                <li>✓ Mise en relation avec investisseurs</li>
                <li>✓ Suivi 6 mois post-formation</li>
              </ul>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold">75 000 FCFA</span>
                  <p className="text-green-200 text-sm">Paiement en 3 fois possible</p>
                </div>
                <span className="bg-yellow-400 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                  🔥 Populaire
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Formation E-commerce & Digital</h3>
              <ul className="space-y-2 mb-8 text-blue-100">
                <li>✓ 15 modules + projets pratiques</li>
                <li>✓ Création de votre e-shop</li>
                <li>✓ Stratégies marketing digital</li>
                <li>✓ Intégration paiements mobiles</li>
                <li>✓ Communauté d'entrepreneurs tech</li>
              </ul>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold">65 000 FCFA</span>
                  <p className="text-blue-200 text-sm">Paiement en 3 fois possible</p>
                </div>
                <span className="bg-yellow-400 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                  ⚡ Nouveau
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/signup"
            className="inline-block bg-[#0B2749] text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-[#0a2240] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Commencer ma formation maintenant
          </a>
          <p className="text-gray-600 text-sm mt-4">
            💳 Garantie satisfait ou remboursé 30 jours • 🎓 Certificat de réussite inclus
          </p>
        </div>
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
              NUKU accompagne les entrepreneurs togolais dans la création et le
              développement de leurs startups.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Formations</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Agro-business</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">E-commerce</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mentorat</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Financement</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>contact@nuku.io</p>
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
              <a href="#" className="text-gray-400 hover:text-white transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Composant principal
export default function Formations() {
  const visibleSections = useScrollAnimation();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CoursGratuitsSection isVisible={visibleSections.has("cours-gratuits")} />
      <TestimonialsSection isVisible={visibleSections.has("testimonials")} />
      <ProgrammesSection isVisible={visibleSections.has("programmes-complets")} />
      <Footer />
      
      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}