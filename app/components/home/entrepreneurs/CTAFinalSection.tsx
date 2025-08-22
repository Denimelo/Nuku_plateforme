
interface CTAFinalSectionProps {
    isVisible: boolean;
}

export function CTAFinalSection({ isVisible }: CTAFinalSectionProps) {
  return (
    <section
      id="cta-final"
      data-animate
      className={`px-6 py-20 bg-gradient-to-br from-[#0B2749] to-blue-800 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          🚀 Votre aventure entrepreneuriale commence ici
        </h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          Rejoignez les 2 547 entrepreneurs togolais qui ont choisi NUKU pour transformer leurs rêves en réalité.
          Dans 12 mois, où voulez-vous être ?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="/signup"
            className="bg-yellow-500 text-[#0B2749] px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🎯 Commencer ma formation
          </a>
          <a
            href="/formations"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0B2749] transition-all duration-300"
          >
            Voir les formations gratuites
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">⏱️</div>
            <div className="text-white font-medium">Démarrage en 24h</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-white font-medium">Paiement en 3 fois</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">🎓</div>
            <div className="text-white font-medium">Garantie résultats</div>
          </div>
        </div>
      </div>
    </section>
  );
}