

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
              NUKU : révéler le potentiel entrepreneurial togolais depuis 2022. 
              Fièrement togolais, résolument africain.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Notre mission</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#mission-vision" className="text-gray-400 hover:text-white transition-colors">Mission & Vision</a></li>
              <li><a href="#equipe-fondatrice" className="text-gray-400 hover:text-white transition-colors">Équipe fondatrice</a></li>
              <li><a href="#impact" className="text-gray-400 hover:text-white transition-colors">Notre impact</a></li>
              <li><a href="#vision-futur" className="text-gray-400 hover:text-white transition-colors">Vision 2025</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Reconnaissance</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-400">🏆 Prix UA 2024</span></li>
              <li><span className="text-gray-400">🌟 Africa Business Awards</span></li>
              <li><span className="text-gray-400">🎯 Prix National Innovation</span></li>
              <li><span className="text-gray-400">💎 Best Impact Startup</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Nous rejoindre</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p><a href="/entrepreneurs" className="hover:text-white transition-colors">👨‍💼 Entrepreneurs</a></p>
              <p><a href="/experts" className="hover:text-white transition-colors">🎓 Experts & Mentors</a></p>
              <p><a href="/contact" className="hover:text-white transition-colors">🤝 Partenaires</a></p>
              <p><a href="/contact" className="hover:text-white transition-colors">📧 contact@nuku.io</a></p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 NUKU. Tous droits réservés. 🇹🇬 Made with ❤️ in Togo.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}