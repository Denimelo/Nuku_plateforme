import React, { useState, useEffect } from "react";
import { CTAFinalSection } from "~/components/home/entrepreneurs/CTAFinalSection";
import { EvenementsSection } from "~/components/home/entrepreneurs/EvenementsSection";
import { FAQSection } from "~/components/home/entrepreneurs/FAQSection";
import { Footer } from "~/components/home/entrepreneurs/Footer";
import { HeroSection } from "~/components/home/entrepreneurs/HeroSection";
import { ParcoursSection } from "~/components/home/entrepreneurs/ParcoursSection";
import { RessourcesSection } from "~/components/home/entrepreneurs/RessourcesSection";
import { SuccessStoriesSection } from "~/components/home/entrepreneurs/SuccessStoriesSection";
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

export default function Entrepreneurs() {
  const visibleSections = useScrollAnimation();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ParcoursSection isVisible={visibleSections.has("parcours")} />
      <SuccessStoriesSection isVisible={visibleSections.has("success-stories")} />
      <RessourcesSection isVisible={visibleSections.has("ressources")} />
      <EvenementsSection isVisible={visibleSections.has("evenements")} />
      <FAQSection isVisible={visibleSections.has("faq")} />
      <CTAFinalSection isVisible={visibleSections.has("cta-final")} />
      <Footer />
    </div>
  );
}