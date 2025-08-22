import React from "react";

interface CTASectionProps {
  isVisible: boolean;
}

export function CTASection ({ isVisible }: CTASectionProps) {
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
}