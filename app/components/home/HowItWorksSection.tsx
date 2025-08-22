import React from "react";

interface HowItWorksSectionProps {
  isVisible: boolean;
}

export function HowItWorksSection({ isVisible }: HowItWorksSectionProps) {
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
}