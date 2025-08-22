import React, { useState, useEffect } from "react";
import { EquipeFondatriceSection } from "~/components/home/a-propos/EquipeFondatriceSection";
import { Footer } from "~/components/home/a-propos/Footer";
import { HeroSection } from "~/components/home/a-propos/HeroSection";
import { ImpactSocialSection } from "~/components/home/a-propos/ImpactSocialSection";
import { MissionVisionSection } from "~/components/home/a-propos/MissionVisionSection";
import { NotreHistoireSection } from "~/components/home/a-propos/NotreHistoireSection";
import { ReconnaissanceSection } from "~/components/home/a-propos/ReconnaissanceSection";
import { VisionFuturSection } from "~/components/home/a-propos/VisionFuturSection";
import { Header } from "~/components/layout/Header";

// Hook pour les animations au scroll
const useScrollAnimation = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "-50px",
      }
    );

    const sections = document.querySelectorAll("[data-animate]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return visibleSections;
};

export default function APropos() {
  const visibleSections = useScrollAnimation();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <NotreHistoireSection isVisible={visibleSections.has("notre-histoire")} />
      <MissionVisionSection isVisible={visibleSections.has("mission-vision")} />
      <EquipeFondatriceSection isVisible={visibleSections.has("equipe-fondatrice")} />
      <ImpactSocialSection isVisible={visibleSections.has("impact")} />
      <ReconnaissanceSection isVisible={visibleSections.has("reconnaissance")} />
      <VisionFuturSection isVisible={visibleSections.has("vision-futur")} />
      <Footer />
    </div>
  );
}