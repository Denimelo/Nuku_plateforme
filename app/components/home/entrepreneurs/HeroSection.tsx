

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#0B2749] to-blue-800 px-6 py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-green-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Rejoignez la 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            {" "}révolution{" "}
          </span>
          entrepreneuriale togolaise
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Plus de 2 500 jeunes togolais ont déjà transformé leurs idées en entreprises prospères. 
          Et si c'était votre tour de changer la donne ?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="/signup"
            className="bg-yellow-500 text-[#0B2749] px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            🚀 Démarrer mon aventure
          </a>
          <a
            href="#parcours"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0B2749] transition-all duration-300"
          >
            Découvrir le parcours
          </a>
        </div>

        {/* Stats en temps réel */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">2,547</div>
            <div className="text-blue-100">Entrepreneurs formés</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-green-400">89%</div>
            <div className="text-blue-100">Taux de réussite</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-orange-400">847M</div>
            <div className="text-blue-100">FCFA levés collectivement</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">1,200+</div>
            <div className="text-blue-100">Emplois créés</div>
          </div>
        </div>
      </div>
    </section>
  );
};