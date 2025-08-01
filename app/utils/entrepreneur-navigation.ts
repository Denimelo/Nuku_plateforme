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
      href: "/entrepreneur", 
      icon: TrendingUp, 
      current: currentPath === "/entrepreneur" 
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
      href: "/entrepreneur/messages", 
      icon: MessageCircle, // J'ai remplacé Users par MessageCircle pour plus de cohérence
      current: currentPath.startsWith("/entrepreneur/messages")
    },
  ];
}