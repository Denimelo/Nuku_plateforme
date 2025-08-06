export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="../../public/images/logo_nuku.webp"
            alt="NUKU Logo"
            className="h-14 w-auto"
          />
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex space-x-6">
          <a
            href="/"
            className="text-gray-600 hover:text-blue-900 transition-colors"
          >
            Accueil
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-900 transition-colors"
          >
            Formations
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-900 transition-colors"
          >
            Entrepreneurs
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-900 transition-colors"
          >
            Experts
          </a>
        </nav>
      </div>

      <a
        href="/login"
        className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
      >
        Connexion
      </a>
    </header>
  );
}
