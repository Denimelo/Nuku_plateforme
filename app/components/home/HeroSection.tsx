export function HeroSection() {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between px-6 py-16 lg:py-24 max-w-7xl mx-auto">
      <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight font-sora">
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
          className="inline-block bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Commencer dès maintenant
        </a>
      </div>

      <div className="lg:w-1/2">
        <img
          src="../../public/images/banner_hero.webp"
          alt="Équipe NUKU en collaboration"
          className="w-full h-80 lg:h-96 object-cover rounded-lg shadow-lg"
        />
      </div>
    </section>
  );
}
