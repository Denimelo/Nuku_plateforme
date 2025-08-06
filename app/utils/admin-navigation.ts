import {
  TrendingUp,
  Users,
  Shield,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  UserCheck,
  MessageCircle,
} from "lucide-react";

export function getAdminNavigation(currentPath: string) {
  return [
    {
      name: "Tableau de bord",
      href: "/admin/dashboard",
      icon: TrendingUp,
      current: currentPath === "/admin",
    },
    {
      name: "Utilisateurs",
      href: "/admin/users",
      icon: Users,
      current: currentPath.startsWith("/admin/users"),
    },
    {
      name: "Entrepreneurs",
      href: "/admin/entrepreneurs",
      icon: UserCheck,
      current: currentPath.startsWith("/admin/entrepreneurs"),
    },
    {
      name: "Experts",
      href: "/admin/experts",
      icon: Shield,
      current: currentPath.startsWith("/admin/experts"),
    },
    {
      name: "Programmes",
      href: "/admin/programs",
      icon: BookOpen,
      current: currentPath.startsWith("/admin/programs"),
    },
    {
      name: "Inscriptions",
      href: "/admin/program/enrollments",
      icon: UserCheck,
      current: currentPath.startsWith("/admin/program/enrollments"),
    },
    {
      name: "Appels",
      href: "/admin/calls",
      icon: Calendar,
      current: currentPath.startsWith("/admin/calls"),
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageCircle,
      current: currentPath.startsWith("/messages"),
    },
    {
      name: "Rapports",
      href: "/admin/reports",
      icon: BarChart3,
      current: currentPath.startsWith("/admin/reports"),
    },
    {
      name: "Paramètres",
      href: "/admin/settings",
      icon: Settings,
      current: currentPath.startsWith("/admin/settings"),
    },
  ];
}
