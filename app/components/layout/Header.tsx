import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/">
            <img
              src="/images/logo_nuku.webp"
              alt="NUKU Logo"
              className="h-8 w-auto hover:scale-105 transition-transform duration-200"
            />
          </a>
        </div>

        {/* Navigation Menu Desktop */}
        <nav className="hidden md:flex space-x-6">
          <a
            href="/"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300 font-medium"
          >
            Accueil
          </a>
          <a
            href="/formations"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300 font-medium"
          >
            Formations
          </a>
          <a
            href="/entrepreneurs"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300 font-medium"
          >
            Entrepreneurs
          </a>
          <a
            href="/experts"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300 font-medium"
          >
            Experts
          </a>
          <a
            href="/a-propos"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300 font-medium"
          >
            À propos
          </a>
          <a
            href="/contact"
            className="text-gray-600 hover:text-[#0B2749] transition-colors duration-300 font-medium"
          >
            Contact
          </a>
        </nav>

        {/* Menu Mobile Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu mobile"
        >
          <svg
            className={`w-6 h-6 transform transition-transform duration-200 ${
              isMenuOpen ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* CTA Button */}
      <div className="flex items-center space-x-3">
        <a
          href="/login"
          className="hidden sm:inline-block text-[#0B2749] hover:text-[#0a2240] transition-colors duration-300 font-medium"
        >
          Connexion
        </a>
        <a
          href="/signup"
          className="bg-[#0B2749] text-white px-6 py-2 rounded-lg hover:bg-[#0a2240] transition-all duration-300 transform hover:scale-105 font-semibold shadow-sm hover:shadow-md"
        >
          S'inscrire
        </a>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 md:hidden z-40">
          <nav className="flex flex-col py-4">
            <a 
              href="/" 
              className="px-6 py-3 text-gray-600 hover:text-[#0B2749] hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 Accueil
            </a>
            <a 
              href="/formations" 
              className="px-6 py-3 text-gray-600 hover:text-[#0B2749] hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              🎓 Formations
            </a>
            <a 
              href="/entrepreneurs" 
              className="px-6 py-3 text-gray-600 hover:text-[#0B2749] hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              👨‍💼 Entrepreneurs
            </a>
            <a 
              href="/experts" 
              className="px-6 py-3 text-gray-600 hover:text-[#0B2749] hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              🎯 Experts
            </a>
            <a 
              href="/a-propos" 
              className="px-6 py-3 text-gray-600 hover:text-[#0B2749] hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              ℹ️ À propos
            </a>
            <a 
              href="/contact" 
              className="px-6 py-3 text-gray-600 hover:text-[#0B2749] hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              📞 Contact
            </a>
            
            {/* Séparateur */}
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* Actions mobiles */}
            <a 
              href="/login" 
              className="px-6 py-3 text-gray-600 hover:text-[#0B2749] hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              🔐 Connexion
            </a>
            <a 
              href="/signup" 
              className="mx-6 my-2 bg-[#0B2749] text-white px-4 py-3 rounded-lg hover:bg-[#0a2240] transition-all duration-300 text-center font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              ✨ S'inscrire maintenant
            </a>
          </nav>
        </div>
      )}

      {/* Overlay pour fermer le menu mobile */}
      {isMenuOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Fermer le menu mobile"
          className="fixed inset-0 bg-black bg-opacity-20 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsMenuOpen(false);
            }
          }}
        ></div>
      )}
    </header>
  );
}