import React, { useState, useEffect } from "react";

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

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="../../images/logo_nuku.webp"
            alt="NUKU Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation Menu Desktop */}
        <nav className="hidden md:flex space-x-6">
          <a
            href="#"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300"
          >
            Accueil
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300"
          >
            Formations
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300"
          >
            Entrepreneurs
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300"
          >
            Experts
          </a>
        </nav>

        {/* Menu Mobile */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <a
        href="/login"
        className="bg-[#0B2749] text-white px-6 py-2 rounded-lg hover:bg-[#0a2240] transition-all duration-300 transform hover:scale-105"
      >
        Connexion
      </a>

      {/* Menu Mobile Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden">
          <nav className="flex flex-col space-y-4 p-6">
            <a href="#" className="text-gray-600 hover:text-[#0B2749]">
              Accueil
            </a>
            <a href="#" className="text-gray-600 hover:text-[#0B2749]">
              Formations
            </a>
            <a href="#" className="text-gray-600 hover:text-[#0B2749]">
              Entrepreneurs
            </a>
            <a href="#" className="text-gray-600 hover:text-[#0B2749]">
              Experts
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between px-6 py-16 lg:py-24 max-w-7xl mx-auto">
      <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
        <h1
          className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          NUKU, de l'idée au financement : votre startup mérite une vraie
          propulsion.
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Rejoignez nos programmes d'accompagnement sur mesure, animés par des
          experts du terrain. Formations, mentorat, ressources et mise en
          relation avec investisseurs.
        </p>
        <a
          href="/signup"
          className="inline-block bg-[#0B2749] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Commencer dès maintenant
        </a>
      </div>

      <div className="lg:w-1/2">
        <img
          src="../../images/banner_hero.webp"
          alt="Équipe NUKU en collaboration"
          className="w-full h-80 lg:h-96 object-cover rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-500"
        />
      </div>
    </section>
  );
};

// Cards Section Component
const CardsSection = ({ isVisible }) => {
  return (
    <section
      id="cards-section"
      data-animate
      className={`px-6 py-16 max-w-7xl mx-auto transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Entrepreneurs Card */}
        <EntrepreneursCard />

        {/* Experts Card */}
        <ExpertsCard />
      </div>
    </section>
  );
};

// Entrepreneurs Card Component
const EntrepreneursCard = () => {
  return (
    <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 p-8 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
      {/* Barre supérieure jaune foncé */}
      <div className="bg-yellow-500 -mx-8 -mt-8 mb-6 h-2 rounded-t-lg"></div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4">Entrepreneurs</h3>
      <p className="text-gray-800 mb-8 leading-relaxed text-sm">
        Transformez votre idée en entreprise solide. Accédez à nos parcours de
        formation, mentorat et ressources pour lancer votre activité en toute
        confiance.
      </p>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <a
          href="/signup"
          className="bg-[#0B2749] text-white px-6 py-3 rounded-md font-medium hover:bg-[#0a2240] transition-all duration-300 text-center text-sm transform hover:scale-105"
        >
          Démarrer mon inscription
        </a>
        <a
          href="#"
          className="text-[#0B2749] px-6 py-3 font-medium hover:text-[#0a2240] transition-colors text-center text-sm underline hover:no-underline"
        >
          Découvrir les formations
        </a>
      </div>
    </div>
  );
};

// Experts Card Component
const ExpertsCard = () => {
  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-8 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
      {/* Barre supérieure bleue foncée */}
      <div className="bg-[#0B2749] -mx-8 -mt-8 mb-6 h-2 rounded-t-lg"></div>

      <h3 className="text-2xl font-bold text-white mb-4">Experts</h3>
      <p className="text-blue-50 mb-8 leading-relaxed text-sm">
        Collaborez avec des talents formés et prêts à contribuer. Rejoignez
        notre réseau d'experts qui boosteront votre startup.
      </p>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <a
          href="#"
          className="bg-[#0B2749] text-white px-6 py-3 rounded-md font-medium hover:bg-[#0a2240] transition-all duration-300 text-center text-sm transform hover:scale-105"
        >
          Explorer l'espace expert
        </a>
        <a
          href="#"
          className="text-white px-6 py-3 font-medium hover:text-blue-100 transition-colors text-center text-sm underline hover:no-underline"
        >
          Découvrir nos solutions
        </a>
      </div>
    </div>
  );
};

// Savoir-Faire Section Component
const SavoirFaireSection = ({ isVisible }) => {
  return (
    <section
      id="savoir-faire-section"
      data-animate
      className={`px-6 py-16 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
          Savoir. Faire. Savoir-faire.
        </h2>
        <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
          Avec NUKU, découvrez une nouvelle façon d'apprendre : 20% de théorie,
          80% de pratique.
        </p>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <FeatureCard
            title="Apprenez"
            subtitle="où que vous soyez"
            description="Accédez à votre formation 100% en ligne au bureau, à la maison, en ville, à la montagne... Partout !"
            imageSrc="../../images/icone_apprendre_en_ligne.webp"
            imageAlt="Apprentissage en ligne partout"
          />

          <FeatureCard
            title="Un mentor"
            subtitle="pour vous accompagner"
            description="Bénéficiez des conseils d'un expert du métier qui vous aide à progresser tout au long de votre formation."
            imageSrc="../../images/icone_mentor.webp"
            imageAlt="Mentor pour accompagnement"
          />

          <FeatureCard
            title="Travaillez sur"
            subtitle="des projets professionnalisants"
            description="Réalisez des projets concrets, issus de scénarios métiers, directement applicables dans le monde du travail."
            imageSrc="../../images/icone_projets.webp"
            imageAlt="Projets professionnalisants"
          />
        </div>
      </div>
    </section>
  );
};

// Feature Card Component
const FeatureCard = ({ title, subtitle, description, imageSrc, imageAlt }) => {
  return (
    <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
      <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* Image container avec fond beige circulaire */}
        <div className="w-32 h-32 bg-orange-50 rounded-full mx-auto mb-6 flex items-center justify-center p-4 group-hover:bg-orange-100 transition-colors duration-300">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-contain"
          />
        </div>

        <h3 className="text-xl font-bold text-[#0B2749] mb-4 leading-tight">
          {title}
          <br />
          <span className="text-[#0B2749]">{subtitle}</span>
        </h3>

        <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  );
};

// Comment ça marche Section
const HowItWorksSection = ({ isVisible }) => {
  const steps = [
    {
      step: "01",
      title: "Inscription",
      description:
        "Créez votre compte et choisissez votre parcours d'accompagnement selon vos besoins.",
    },
    {
      step: "02",
      title: "Formation",
      description:
        "Suivez nos modules de formation pratiques avec un mentor dédié à vos côtés.",
    },
    {
      step: "03",
      title: "Mise en pratique",
      description:
        "Travaillez sur des projets réels et construisez votre entreprise étape par étape.",
    },
    {
      step: "04",
      title: "Financement",
      description:
        "Accédez à notre réseau d'investisseurs et décrochez le financement pour votre startup.",
    },
  ];

  return (
    <section
      id="how-it-works-section"
      data-animate
      className={`px-6 py-16 max-w-7xl mx-auto transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
          Comment ça marche ?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Un processus simple et efficace pour transformer votre idée en
          entreprise prospère.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="text-center group">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">
                  {step.step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-200">
                  <div className="h-full bg-gradient-to-r from-[#0B2749] to-transparent w-1/2"></div>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-[#0B2749] mb-3">
              {step.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// Success Stories Section
const SuccessStoriesSection = ({ isVisible }) => {
  const stories = [
    {
      name: "Marie Dubois",
      company: "EcoTech Solutions",
      testimonial:
        "Grâce à NUKU, j'ai pu transformer mon idée écologique en startup rentable. Le mentorat et les formations pratiques ont été déterminants.",
      funding: "500K fcfa levés",
      avatar:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Thomas Martin",
      company: "HealthApp",
      testimonial:
        "Le programme NUKU m'a donné tous les outils nécessaires pour développer ma solution de santé digitale. Aujourd'hui, nous accompagnons plus de 10 000 patients.",
      funding: "1.2M fcfa levés",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Sophie Chen",
      company: "EdTech Pro",
      testimonial:
        "La mise en relation avec les investisseurs via NUKU a été un tournant. Nous avons pu accélérer notre développement et notre expansion internationale.",
      funding: "800K fcfa levés",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  ];

  return (
    <section
      id="success-stories-section"
      data-animate
      className={`px-6 py-16 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            Ils ont réussi avec NUKU
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les success stories de nos entrepreneurs qui ont
            transformé leurs idées en entreprises prospères.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center mb-6">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold text-[#0B2749]">{story.name}</h3>
                  <p className="text-gray-600 text-sm">{story.company}</p>
                  <p className="text-green-600 text-sm font-semibold">
                    {story.funding}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 italic text-sm leading-relaxed">
                "{story.testimonial}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = ({ isVisible }) => {
  return (
    <section
      id="cta-section"
      data-animate
      className={`px-6 py-20 bg-gradient-to-br from-[#0B2749] to-blue-600 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          Prêt à transformer votre idée en succès ?
        </h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          Rejoignez les centaines d'entrepreneurs qui ont choisi NUKU pour
          développer leur startup.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signup"
            className="bg-white text-[#0B2749] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Commencer maintenant
          </a>
          <a
            href="#"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0B2749] transition-all duration-300"
          >
            En savoir plus
          </a>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo et description */}
          <div className="col-span-1">
            <img
              src="../../images/logo_nuku.webp"
              alt="NUKU Logo"
              className="h-8 w-auto mb-4 filter invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              NUKU accompagne les entrepreneurs dans la création et le
              développement de leurs startups avec des programmes sur mesure.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-bold text-white mb-4">Plateforme</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Formations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Mentorat
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Financement
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Réseau
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Centre d'aide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>contact@nuku.io</p>
              <p>+33 1 23 45 67 89</p>
              <p>
                123 Rue de l'Innovation
                <br />
                75001 Paris, France
              </p>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 NUKU. Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Mentions légales
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Politique de confidentialité
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                CGU
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main HomePage Component
const HomePage = () => {
  const visibleSections = useScrollAnimation();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CardsSection isVisible={visibleSections.has("cards-section")} />
      <SavoirFaireSection
        isVisible={visibleSections.has("savoir-faire-section")}
      />
      <HowItWorksSection
        isVisible={visibleSections.has("how-it-works-section")}
      />
      <SuccessStoriesSection
        isVisible={visibleSections.has("success-stories-section")}
      />
      <CTASection isVisible={visibleSections.has("cta-section")} />
      <Footer />
    </div>
  );
};

export default HomePage;
