import { useState } from "react";

interface NewsletterCTASectionProps {
    isVisible: boolean;
}


export function NewsletterCTASection ({ isVisible } : NewsletterCTASectionProps) {
  const [emailNewsletter, setEmailNewsletter] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    
    setTimeout(() => {
      setIsSubscribing(false);
      alert('Merci ! Vous êtes inscrit à notre newsletter.');
      setEmailNewsletter('');
    }, 1500);
  };

  return (
    <section
      id="newsletter-cta"
      data-animate
      className={`px-6 py-20 bg-gradient-to-br from-[#0B2749] to-purple-800 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          📬 Restez connecté avec NUKU
        </h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          Recevez nos conseils exclusifs, success stories et opportunités directement dans votre boîte mail.
          Plus de 8 500 entrepreneurs nous font déjà confiance !
        </p>
        
        {/* Newsletter */}
        <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto mb-12">
          <div className="flex gap-2">
            <input
              type="email"
              value={emailNewsletter}
              onChange={(e) => setEmailNewsletter(e.target.value)}
              placeholder="votre@email.com"
              required
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                isSubscribing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 text-[#0B2749] hover:bg-yellow-400 transform hover:scale-105'
              }`}
            >
              {isSubscribing ? '📤' : '📬 S\'abonner'}
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-2">
            📧 Newsletter hebdomadaire • 🚫 Désabonnement en 1 clic • 🔒 Pas de spam
          </p>
        </form>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="/signup"
            className="bg-yellow-500 text-[#0B2749] px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🚀 Commencer maintenant
          </a>
          <a
            href="#contact-form"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0B2749] transition-all duration-300"
          >
            💬 Nous contacter
          </a>
        </div>

        {/* Stats finales */}
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-white font-medium">Réponse  2h</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-white font-medium">98% satisfaction</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">🇹🇬</div>
            <div className="text-white font-medium">100% togolais</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-2xl mb-2">🤝</div>
            <div className="text-white font-medium">À votre écoute</div>
          </div>
        </div>
      </div>
    </section>
  );
}