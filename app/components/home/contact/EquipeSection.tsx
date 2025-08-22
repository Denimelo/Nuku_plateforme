

interface EquipeSectionProps {
    isVisible: boolean;
}

export function EquipeSection ({ isVisible }: EquipeSectionProps){
  const equipe = [
    {
      nom: "Koffi Adjoavi",
      poste: "Fondateur & CEO",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Ex-consultant McKinsey, passionné d'entrepreneuriat africain. 8 ans d'expérience dans l'accompagnement de startups.",
      email: "koffi@nuku.io",
      linkedin: "#",
      specialites: ["Stratégie", "Levée de fonds", "Expansion"]
    },
    {
      nom: "Akossiwa Mensah",
      poste: "Directrice Pédagogique",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=300&h=300&fit=crop&crop=face",
      bio: "PhD en Management, ex-professeure à l'Université de Lomé. Spécialiste en pédagogie entrepreneuriale.",
      email: "akossiwa@nuku.io",
      linkedin: "#",
      specialites: ["Formation", "Pédagogie", "Curriculum"]
    },
    {
      nom: "Edem Kodjo",
      poste: "Responsable Experts",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "15 ans dans l'écosystème startup togolais. Réseau de 200+ experts dans tous secteurs.",
      email: "edem@nuku.io", 
      linkedin: "#",
      specialites: ["Recrutement", "Mentorat", "Réseau"]
    },
    {
      nom: "Ama Tété",
      poste: "Responsable Entrepreneurs",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "Ex-entrepreneuse (AgriTech), accompagne maintenant les futurs entrepreneurs dans leur parcours.",
      email: "ama@nuku.io",
      linkedin: "#",
      specialites: ["Accompagnement", "Business plan", "Terrain"]
    }
  ];

  return (
    <section
      id="equipe"
      data-animate
      className={`px-6 py-20 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            👥 Notre équipe
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des professionnels passionnés, dédiés au succès de l'entrepreneuriat togolais
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {equipe.map((membre, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
            >
              <div className="text-center">
                <img
                  src={membre.photo}
                  alt={membre.nom}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-100"
                />
                <h3 className="text-xl font-bold text-[#0B2749] mb-1">
                  {membre.nom}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {membre.poste}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {membre.bio}
                </p>
                
                {/* Spécialités */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {membre.specialites.map((spec, specIndex) => (
                    <span
                      key={specIndex}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Contact */}
                <div className="flex justify-center space-x-4">
                  <a
                    href={`mailto:${membre.email}`}
                    className="w-10 h-10 bg-[#0B2749] text-white rounded-full flex items-center justify-center hover:bg-[#0a2240] transition-colors duration-200"
                    title="Email"
                  >
                    📧
                  </a>
                  <a
                    href={membre.linkedin}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
                    title="LinkedIn"
                  >
                    💼
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}