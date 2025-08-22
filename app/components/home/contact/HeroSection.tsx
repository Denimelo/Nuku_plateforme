

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#0B2749] to-blue-800 px-6 py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-green-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-orange-400 rounded-full animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Parlons de votre 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            {" "}projet
          </span>
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Notre équipe est là pour vous accompagner. Que vous soyez entrepreneur, expert ou partenaire, 
          nous sommes à votre écoute pour construire ensemble l'écosystème entrepreneurial togolais.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#contact-form"
            className="bg-yellow-500 text-[#0B2749] px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            💬 Nous écrire
          </a>
          <a
            href="#equipe"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0B2749] transition-all duration-300"
          >
            Rencontrer l'équipe
          </a>
        </div>

        {/* Stats de contact */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-yellow-400"> 2h</div>
            <div className="text-blue-100">Temps de réponse moyen</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-green-400">98%</div>
            <div className="text-blue-100">Taux de satisfaction</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-orange-400">24/7</div>
            <div className="text-blue-100">WhatsApp Business</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">🇹🇬</div>
            <div className="text-blue-100">Basés à Lomé</div>
          </div>
        </div>
      </div>
    </section>
  );
}