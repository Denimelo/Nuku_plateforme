import {
  TrendingUp,
  BookOpen,
  FileText,
  Calendar,
  Users,
  MessageCircle
} from "lucide-react";

export function getEntrepreneurNavigation(currentPath: string) {
  return [
    { 
      name: "Tableau de bord", 
      href: "/entrepreneur/dashboard", 
      icon: TrendingUp, 
      current: currentPath === "/entrepreneur/dashboard" 
    },
    { 
      name: "Formations", 
      href: "/entrepreneur/modules", 
      icon: BookOpen,
      current: currentPath.startsWith("/entrepreneur/modules")
    },
    { 
      name: "Devoirs", 
      href: "/entrepreneur/assignments", 
      icon: FileText,
      current: currentPath.startsWith("/entrepreneur/assignments")
    },
    { 
      name: "Rendez-vous", 
      href: "/entrepreneur/calls", 
      icon: Calendar,
      current: currentPath.startsWith("/entrepreneur/calls")
    },
    { 
      name: "Programmes", 
      href: "/entrepreneur/programs", 
      icon: Users,
      current: currentPath.startsWith("/entrepreneur/programs")
    },
    { 
      name: "Messages", 
      href: "/messages", 
      icon: MessageCircle, // J'ai remplacé Users par MessageCircle pour plus de cohérence
      current: currentPath.startsWith("/messages")
    },
  ];
}