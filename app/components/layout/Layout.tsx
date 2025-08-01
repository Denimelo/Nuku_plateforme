import { Form, Link } from "@remix-run/react";
import {
  Bell,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Power,
} from "lucide-react";
import { useState } from "react";
import type { User } from "~/utils/types";

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  title?: string;
  navigation: {
    name: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    current?: boolean;
  }[];
}

export function Layout({ user, children, title, navigation }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "admin":
        return "Administrateur";
      case "expert":
        return "Expert";
      case "entrepreneur":
        return "Entrepreneur";
      default:
        return "Utilisateur";
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getBadgeColor = (userType: string) => {
    switch (userType) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-pink-500";
      case "expert":
        return "bg-gradient-to-r from-purple-500 to-indigo-500";
      case "entrepreneur":
        return "bg-gradient-to-r from-blue-500 to-teal-500";
      default:
        return "bg-gradient-to-r from-slate-500 to-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Sidebar mobile */}
      <div
        className={`fixed inset-0 flex z-50 md:hidden ${
          sidebarOpen ? "" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20 bg-white/10 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <Sidebar navigation={navigation} user={user} />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <Sidebar navigation={navigation} user={user} />
      </div>

      {/* Content area */}
      <div className="md:pl-72 flex flex-col flex-1">
        {/* Header moderne */}
        <header className="bg-white/80 backdrop-blur-sm shadow-xl border-b border-white/50 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>

              {/* Page title */}
              <div className="flex-1 md:flex-initial">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-teal-700 bg-clip-text text-transparent">
                  {title || "Dashboard"}
                </h1>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                {/* Search - Desktop only */}
                <div className="hidden lg:flex relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="block w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {/* Messages */}
                <Link
                  to="/messages"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <MessageCircle className="h-6 w-6" />
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <div
                      className={`w-8 h-8 ${getBadgeColor(
                        user.user_type
                      )} rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                    >
                      {getUserInitials(user.first_name, user.last_name)}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-slate-700">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getUserTypeLabel(user.user_type)}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {/* Dropdown menu */}
                  {profileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm ring-1 ring-black ring-opacity-5 border border-white/50">
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-100/80 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Profil
                        </Link>
                        <Form method="post" action="/logout">
                          <button
                            type="submit"
                            className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-100/80 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Se déconnecter
                          </button>
                        </Form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ navigation, user }: { navigation: any[]; user: User }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-slate-800 via-slate-700 to-teal-800 shadow-2xl">
      {/* Logo section amélioré et agrandi */}
      <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
        <div className="flex justify-center flex-shrink-0 px-6 mb-12">
          <div className="relative group">
            {/* Effet de halo lumineux pour sidebar */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
            
            {/* Conteneur principal du logo sidebar agrandi */}
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
              {/* Gradient interne subtil */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
              
              {/* Logo agrandi */}
              <div className="relative z-10">
                <img
                  className="h-12 w-auto filter brightness-110 drop-shadow-2xl"
                  src="../../../images/logo_nuku.webp"
                  alt="NUKU"
                />
              </div>
              
              {/* Points décoratifs pour sidebar */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-60 animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300
                  ${
                    item.current
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm hover:border hover:border-white/20"
                  }
                `}
              >
                {Icon && (
                  <Icon
                    className={`
                      mr-4 flex-shrink-0 h-5 w-5 transition-colors
                      ${
                        item.current
                          ? "text-teal-300"
                          : "text-slate-400 group-hover:text-teal-300"
                      }
                    `}
                  />
                )}
                {item.name}
                {item.current && (
                  <div className="ml-auto w-2 h-2 bg-teal-400 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bouton de déconnexion rouge */}
      <div className="flex-shrink-0 p-4">
        <Form method="post" action="/logout">
          <button
            type="submit"
            className="group w-full flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-red-200/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-red-500/20"
          >
            <Power className="h-5 w-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
            Déconnexion
          </button>
        </Form>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-white/20 p-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>© 2025 NUKU</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>En ligne</span>
          </div>
        </div>
      </div>
    </div> 
  );

  function getUserTypeLabel(userType: string) {
    switch (userType) {
      case "admin":
        return "Administrateur";
      case "expert":
        return "Expert";
      case "entrepreneur":
        return "Entrepreneur";
      default:
        return "Utilisateur";
    }
  }
}