import { EntrepreneursCard } from "./EntrepreneursCard";
import { ExpertsCard } from "./ExpertsCard";

interface CardsSectionProps {
  isVisible: boolean;
}

export function CardsSection ({ isVisible }: CardsSectionProps) {
  return (
    <section
      id="cards-section"
      data-animate
      className={`px-6 py-16 max-w-7xl mx-auto transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Entrepreneurs Card */}
        <EntrepreneursCard />

        {/* Experts Card */}
        <ExpertsCard />
      </div>
    </section>
  );
}
