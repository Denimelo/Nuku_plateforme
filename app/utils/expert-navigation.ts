import { 
  TrendingUp,
  BookOpen,
  FileText,
  Calendar,
  GraduationCap,
  MessageCircle
} from "lucide-react";

export function getExpertNavigation(currentPath: string) {
  return [
    { 
      name: "Tableau de bord", 
      href: "/expert/dashboard", 
      icon: TrendingUp, 
      current: currentPath === "/expert/dashboard"
    },
    { 
      name: "Mes Modules", 
      href: "/expert/modules", 
      icon: BookOpen,
      current: currentPath.startsWith("/expert/modules") || currentPath.startsWith("/expert/module")
    },
    { 
      name: "Évaluations", 
      href: "/expert/assignments", 
      icon: FileText,
      current: currentPath.startsWith("/expert/assignments")
    },
    { 
      name: "Mes Appels", 
      href: "/expert/calls", 
      icon: Calendar,
      current: currentPath.startsWith("/expert/calls")
    },
    { 
      name: "Mes Étudiants", 
      href: "/expert/students", 
      icon: GraduationCap,
      current: currentPath.startsWith("/expert/students")
    },
    { 
      name: "Messages", 
      href: "/messages", 
      icon: MessageCircle,
      current: currentPath.startsWith("/messages")
    },
  ];
}