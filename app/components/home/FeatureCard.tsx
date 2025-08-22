import React from "react";

interface FeatureCardProps {
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}


export function FeatureCard ({ title, subtitle, description, imageSrc, imageAlt }: FeatureCardProps) {
  return (
    <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
      <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* Image container avec fond beige circulaire */}
        <div className="w-32 h-32 bg-orange-50 rounded-full mx-auto mb-6 flex items-center justify-center p-4 group-hover:bg-orange-100 transition-colors duration-300">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-contain"
          />
        </div>

        <h3 className="text-xl font-bold text-[#0B2749] mb-4 leading-tight">
          {title}
          <br />
          <span className="text-[#0B2749]">{subtitle}</span>
        </h3>

        <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  );
}
