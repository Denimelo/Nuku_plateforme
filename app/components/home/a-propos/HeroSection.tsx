

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-600 via-[#0B2749] to-yellow-600 px-6 py-20 overflow-hidden">
      {/* Background pattern togolais */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-500 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-10 right-1/3 w-16 h-16 bg-white rounded-full"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <span className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-white font-medium text-lg mb-4">
            🇹🇬 Fièrement togolais depuis 2022
          </span>
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          L'entrepreneuriat togolais a trouvé sa 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
            {" "}voix
          </span>
        </h1>
        <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          NUKU est né d'une conviction : le Togo regorge de talents entrepreneuriaux qui ne demandent qu'à être révélés. 
          Notre mission ? Transformer chaque idée en succès, chaque rêve en réalité économique.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#notre-histoire"
            className="bg-white text-[#0B2749] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            📖 Notre histoire
          </a>
          <a
            href="#impact"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0B2749] transition-all duration-300"
          >
            Voir notre impact
          </a>
        </div>

        {/* Stats d'impact depuis la création */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-yellow-300">2,547</div>
            <div className="text-green-100">Entrepreneurs formés</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-green-300">847M</div>
            <div className="text-green-100">FCFA levés collectivement</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-orange-300">1,200+</div>
            <div className="text-green-100">Emplois créés</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-yellow-300">14</div>
            <div className="text-green-100">Régions touchées</div>
          </div>
        </div>
      </div>
    </section>
  );
}