 export function Footer() {
  return (
    <footer className="bg-gray-900 text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1">
            <img
              src="/images/logo_nuku.webp"
              alt="NUKU Logo"
              className="h-8 w-auto mb-4 filter brightness-0 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              La première plateforme d'accélération entrepreneuriale 100% dédiée aux jeunes togolais.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Pour entrepreneurs</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/formations" className="text-gray-400 hover:text-white transition-colors">Formations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Ressources gratuites</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Communauté</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Événements</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>entrepreneurs@nuku.io</p>
              <p>+228 XX XX XX XX</p>
              <p>Lomé, Maritime<br />Togo</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 NUKU. Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}