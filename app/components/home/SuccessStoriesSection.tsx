import React from "react";  

interface SuccessStoriesSectionProps {
  isVisible: boolean;
}

export function SuccessStoriesSection ({ isVisible } : SuccessStoriesSectionProps) {
  const stories = [
    {
      name: "Marie Dubois",
      company: "EcoTech Solutions",
      testimonial:
        "Grâce à NUKU, j'ai pu transformer mon idée écologique en startup rentable. Le mentorat et les formations pratiques ont été déterminants.",
      funding: "500K fcfa levés",
      avatar:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Thomas Martin",
      company: "HealthApp",
      testimonial:
        "Le programme NUKU m'a donné tous les outils nécessaires pour développer ma solution de santé digitale. Aujourd'hui, nous accompagnons plus de 10 000 patients.",
      funding: "1.2M fcfa levés",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Sophie Chen",
      company: "EdTech Pro",
      testimonial:
        "La mise en relation avec les investisseurs via NUKU a été un tournant. Nous avons pu accélérer notre développement et notre expansion internationale.",
      funding: "800K fcfa levés",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  ];

  return (
    <section
      id="success-stories-section"
      data-animate
      className={`px-6 py-16 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            Ils ont réussi avec NUKU
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les success stories de nos entrepreneurs qui ont
            transformé leurs idées en entreprises prospères.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center mb-6">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold text-[#0B2749]">{story.name}</h3>
                  <p className="text-gray-600 text-sm">{story.company}</p>
                  <p className="text-green-600 text-sm font-semibold">
                    {story.funding}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 italic text-sm leading-relaxed">
                "{story.testimonial}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
