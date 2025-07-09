import { Link, useLocation } from "@remix-run/react";
import { useState } from "react";
import {
  Home,
  Users,
  BookOpen,
  CheckSquare,
  BarChart3,
  Upload,
  MessageSquare,
  Calendar,
  Phone,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  User,
} from "lucide-react";

type LayoutProps = {
  children: React.ReactNode;
  user: {
    first_name: string;
    last_name: string;
    email?: string;
    user_type: "admin" | "expert" | "entrepreneur";
    avatar?: string;
  };
};

// Configuration des menus par rôle
const menuConfig = {
  admin: [
    { icon: Home, label: "Tableau de bord", href: "/dashboard" },
    { icon: Users, label: "Utilisateurs", href: "/users" },
    { icon: Upload, label: "Contenu", href: "/admin/content" },
    { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
    { icon: Users, label: "Validation", href: "/admin/validation" },
    { icon: BookOpen, label: "Programmes", href: "/admin/programs" },
    { icon: BarChart3, label: "Rapports", href: "/admin/reports" },
    { icon: Settings, label: "Paramètres", href: "/admin/settings" },
  ],
  expert: [
    { icon: Home, label: "Tableau de bord", href: "/dashboard" },
    { icon: BookOpen, label: "Mes modules", href: "/expert/modules" },
    { icon: Upload, label: "Contenu", href: "/expert/content" },
    { icon: MessageSquare, label: "Feedback", href: "/expert/feedback" },
    { icon: Calendar, label: "Calls", href: "/expert/calls" },
  ],
  entrepreneur: [
    { icon: Home, label: "Tableau de bord", href: "/dashboard" },
    { icon: BookOpen, label: "Mon programme", href: "/entrepreneur/program" },
    { icon: Phone, label: "Appels", href: "/entrepreneur/calls" },
    { icon: CheckSquare, label: "Exercices", href: "/entrepreneur/exercises" },
    { icon: MessageSquare, label: "Messages", href: "/entrepreneur/messages" },
  ],
};

export default function Layout({ children, user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();

  const menuItems = menuConfig[user.user_type] || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "expert":
        return "bg-blue-100 text-blue-800";
      case "entrepreneur":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "expert":
        return "Expert";
      case "entrepreneur":
        return "Entrepreneur";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <img
                src="/app/assets/images/logo_nuku.webp"
                alt="NUKU Logo"
                className="h-8 w-auto"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                    user.user_type
                  )}`}
                >
                  {getRoleName(user.user_type)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#0B2749] text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-[#0B2749]"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-6 py-4 border-t border-gray-200">
            <Link
              to="/logout"
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Se déconnecter
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2749] focus:border-transparent text-sm w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#0B2749] to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user.first_name?.[0]}
                    {user.last_name?.[0]}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mon profil
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </Link>
                  <hr className="my-1" />
                  <Link
                    to="/logout"
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
