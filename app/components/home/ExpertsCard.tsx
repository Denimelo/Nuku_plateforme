export function ExpertsCard() {
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
          href="/expert"
          className="bg-[#0B2749] text-white px-6 py-3 rounded-md font-medium hover:bg-[#0a2240] transition-all duration-300 text-center text-sm transform hover:scale-105"
        >
          Explorer l'espace expert
        </a>
        <a
          href="/a-propos"
          className="text-white px-6 py-3 font-medium hover:text-blue-100 transition-colors text-center text-sm underline hover:no-underline"
        >
          Découvrir nos solutions
        </a>
      </div>
    </div>
  );
}