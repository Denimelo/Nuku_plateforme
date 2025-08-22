import React, { useState, useEffect } from "react";
import { Header } from "~/components/layout/Header";
import { HeroSection } from "~/components/home/HeroSection";
import { CardsSection } from "~/components/home/CardsSection";
import { SavoirFaireSection } from "~/components/home/SavoirFaireSection";

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

// Comment ça marche Section
const HowItWorksSection = ({ isVisible }: { isVisible: boolean }) => {
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
const SuccessStoriesSection = ({ isVisible }: { isVisible: boolean }) => {
  const stories = [
    {
      name: "Marie Dubois",
      company: "EcoTech Solutions",
      testimonial:
        "Grâce à NUKU, j'ai pu transformer mon idée écologique en startup rentable. Le mentorat et les formations pratiques ont été déterminants.",
      funding: "500K FCFA levés",
      avatar:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Thomas Martin",
      company: "HealthApp",
      testimonial:
        "Le programme NUKU m'a donné tous les outils nécessaires pour développer ma solution de santé digitale. Aujourd'hui, nous accompagnons plus de 10 000 patients.",
      funding: "1.2M FCFA levés",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Sophie Chen",
      company: "EdTech Pro",
      testimonial:
        "La mise en relation avec les investisseurs via NUKU a été un tournant. Nous avons pu accélérer notre développement et notre expansion internationale.",
      funding: "800K FCFA levés",
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
const CTASection = ({ isVisible }: { isVisible: boolean }) => {
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
              src="/images/logo_nuku.webp"
              alt="NUKU Logo"
              className="h-8 w-auto mb-4 filter brightness-0 invert"
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
              <p>+228 XX XX XX XX</p>
              <p>
                Lomé, Maritime
                <br />
                Togo
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
export default function Index() {
  const visibleSections = useScrollAnimation();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CardsSection />
      <SavoirFaireSection />
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
}