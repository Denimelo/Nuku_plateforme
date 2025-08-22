

export function EntrepreneursCard() {
  return (
    <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 p-8 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg">
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
          className="bg-blue-900 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-800 transition-colors text-center text-sm"
        >
          Démarrer mon inscription
        </a>
        <a
          href="/formations"
          className="text-blue-900 px-6 py-3 font-medium hover:text-blue-800 transition-colors text-center text-sm underline"
        >
          Découvrir les formations
        </a>
      </div>
    </div>
  );
}
