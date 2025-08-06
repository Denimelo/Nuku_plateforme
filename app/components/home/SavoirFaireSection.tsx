import { FeatureCard } from "./FeatureCard";

export function SavoirFaireSection() {
  return (
    <section className="px-6 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
          Savoir. Faire. Savoir-faire.
        </h2>
        <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
          Avec NUKU, découvrez une nouvelle façon d'apprendre : 20% de théorie,
          80% de pratique.
        </p>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <FeatureCard
            title="Apprenez"
            subtitle="où que vous soyez"
            description="Accédez à votre formation 100% en ligne au bureau, à la maison, en ville, à la montagne... Partout !"
            imageSrc="../../public/images/icone_apprendre_en_ligne.webp"
            imageAlt="Apprentissage en ligne partout"
          />

          <FeatureCard
            title="Un mentor"
            subtitle="pour vous accompagner"
            description="Bénéficiez des conseils d'un expert du métier qui vous aide à progresser tout au long de votre formation."
            imageSrc="../../public/images/icone_mentor.webp"
            imageAlt="Mentor pour accompagnement"
          />

          <FeatureCard
            title="Travaillez sur"
            subtitle="des projets professionnalisants"
            description="Réalisez des projets concrets, issus de scénarios métiers, directement applicables dans le monde du travail."
            imageSrc="../../public/images/icone_projets.webp"
            imageAlt="Projets professionnalisants"
          />
        </div>
      </div>
    </section>
  );
}
