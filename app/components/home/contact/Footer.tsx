
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
              Votre partenaire de confiance pour l'entrepreneuriat togolais. Contactez-nous, nous sommes là pour vous !
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Contact rapide</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:contact@nuku.io" className="text-gray-400 hover:text-white transition-colors">Email général</a></li>
              <li><a href="mailto:entrepreneurs@nuku.io" className="text-gray-400 hover:text-white transition-colors">Pour entrepreneurs</a></li>
              <li><a href="mailto:experts@nuku.io" className="text-gray-400 hover:text-white transition-colors">Pour experts</a></li>
              <li><a href="tel:+228XXXXXXXX" className="text-gray-400 hover:text-white transition-colors">+228 XX XX XX XX</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Nos bureaux</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Quartier Administratif</p>
              <p>Boulevard du 13 Janvier</p>
              <p>Lomé, Togo</p>
              <p className="text-green-400">📍 Ouvert Lun-Ven 8h-18h</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Urgences</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="text-red-400 hover:text-red-300 transition-colors block">
                🚨 WhatsApp urgence
              </a>
              <a href="mailto:urgence@nuku.io" className="text-yellow-400 hover:text-yellow-300 transition-colors block">
                📧 Email urgence
              </a>
              <p className="text-gray-400 text-xs">
                Réponse garantie sous 1h
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 NUKU. Tous droits réservés. 🇹🇬 Fièrement togolais.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}