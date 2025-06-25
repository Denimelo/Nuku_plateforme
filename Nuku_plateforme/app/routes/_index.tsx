import type { MetaFunction } from "@remix-run/node";
import { CardsSection } from "~/components/home/Cardssection";
import { HeroSection } from "~/components/home/HeroSection";
import { SavoirFaireSection } from "~/components/home/SavoirFaireSection";
import { Header } from "~/components/layout/Header";

export const meta: MetaFunction = () => {
  return [
    { title: "NUKU | Accélérateur de PME" },
    {
      description:
        "De l'idée au financement : votre startup mérite une vraie propulsion.",
    },
  ];
};

export default function Index() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CardsSection />
      <SavoirFaireSection />
    </main>
  );
}
