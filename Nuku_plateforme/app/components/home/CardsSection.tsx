import { EntrepreneursCard } from "./EntrepreneursCard";
import { ExpertsCard } from "./ExpertsCard";

export function CardsSection() {
  return (
    <section className="px-6 py-16 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Entrepreneurs Card */}
        <EntrepreneursCard />

        {/* Experts Card */}
        <ExpertsCard />
      </div>
    </section>
  );
}
