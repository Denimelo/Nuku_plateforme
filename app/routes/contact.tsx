import React, { useState, useEffect } from "react";
import { ContactFormSection } from "~/components/home/contact/ContactFormSection";
import { EquipeSection } from "~/components/home/contact/EquipeSection";
import { Footer } from "~/components/home/contact/Footer";
import { HeroSection } from "~/components/home/contact/HeroSection";
import { LocalisationSection } from "~/components/home/contact/LocalisationSection";
import { NewsletterCTASection } from "~/components/home/contact/NewsletterCTASection";
import { ReseauxFAQSection } from "~/components/home/contact/ReseauxFAQSection";
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

export default function Contact() {
  const visibleSections = useScrollAnimation();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ContactFormSection isVisible={visibleSections.has("contact-form")} />
      <EquipeSection isVisible={visibleSections.has("equipe")} />
      <LocalisationSection isVisible={visibleSections.has("localisation")} />
      <ReseauxFAQSection isVisible={visibleSections.has("reseaux-faq")} />
      <NewsletterCTASection isVisible={visibleSections.has("newsletter-cta")} />
      <Footer />
    </div>
  );
}