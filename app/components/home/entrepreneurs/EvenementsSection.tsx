
interface EvenementsSectionProps {
  isVisible: boolean;
}

export function EvenementsSection ({ isVisible} : EvenementsSectionProps) {
  const evenements = [
    {
      type: "Webinaire",
      titre: "Secrets du E-commerce au Togo",
      date: "15 Mars 2024",
      heure: "19h00 - 20h30",
      participants: "127 inscrits",
      gratuit: true,
      animateur: "Koffi Mensah, fondateur Lomé Tech Hub"
    },
    {
      type: "Workshop",
      titre: "Pitch Training : Convaincre en 3 minutes",
      date: "22 Mars 2024", 
      heure: "14h00 - 17h00",
      participants: "Limité à 25 personnes",
      gratuit: false,
      animateur: "Équipe NUKU + entrepreneur invité"
    },
    {
      type: "Meetup",
      titre: "Entrepreneurs Togolais Network",
      date: "29 Mars 2024",
      heure: "18h00 - 21h00",
      participants: "80+ entrepreneurs attendus",
      gratuit: true,
      animateur: "Communauté NUKU"
    }
  ];

  return (
    <section
      id="evenements"
      data-animate
      className={`px-6 py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2749] mb-4">
            📅 Événements à venir
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rencontrez d'autres entrepreneurs, apprenez et développez votre réseau
          </p>
        </div>

        <div className="space-y-6">
          {evenements.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="lg:w-2/3">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      event.type === 'Webinaire' ? 'bg-blue-100 text-blue-800' :
                      event.type === 'Workshop' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.type}
                    </span>
                    {event.gratuit && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                        GRATUIT
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#0B2749] mb-2">
                    {event.titre}
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                    <span>📅 {event.date}</span>
                    <span>🕐 {event.heure}</span>
                    <span>👥 {event.participants}</span>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    🎤 Animé par {event.animateur}
                  </p>
                </div>
                
                <div className="lg:w-1/3 lg:text-right mt-4 lg:mt-0">
                  <a
                    href="/signup"
                    className="inline-block bg-[#0B2749] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0a2240] transition-all duration-300 transform hover:scale-105"
                  >
                    S'inscrire
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