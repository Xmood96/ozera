import React from "react";
import JewelLogo from "../assets/logoanim";

interface HeroSectionProps {
  onShopClick: () => void;
  onWhatsAppClick: () => void;
}

export default function HeroSection({
  onShopClick,
  onWhatsAppClick,
}: HeroSectionProps) {
  return (
    <section className="hero-section relative min-h-screen bg-gradient-to-b from-accent to-base-100 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary opacity-5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary opacity-5 rounded-full blur-3xl" />

      <div className="hero-content container mx-auto px-4 py-12 lg:py-20 flex flex-col items-center justify-center relative z-10">
        {/* Logo */}
        <div className="hero-logo mb-8 lg:mb-12">
          <div className="logo-wrapper w-40 h-40 lg:w-56 lg:h-56">
            <JewelLogo
              size="100%"
              color="#164e2a"
              loopDuration={5}
              strokeWidth={8}
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="hero-text text-center max-w-2xl">
          <h1 className="hero-title text-3xl lg:text-5xl font-bold text-primary mb-4 leading-tight">
            منتجات عناية بالبشرة
          </h1>

          <p className="hero-subtitle text-lg lg:text-2xl text-secondary font-semibold mb-6">
            بالزيوت الطبيعيه المعالجة بغاز الاوزون
          </p>

          <p className="hero-description text-base lg:text-lg text-base-content opacity-80 mb-8">
            عناية فاخرة لبشرة صحية ونقية
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onShopClick}
              className="btn-shop btn btn-lg btn-primary rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow"
            >
              🛍️ تسوق الآن
            </button>

            <button
              onClick={onWhatsAppClick}
              className="btn-whatsapp btn btn-lg btn-outline btn-secondary rounded-xl font-bold"
            >
              💬 تواصل عبر واتساب
            </button>
          </div>

          {/* Contact Info */}
          <div className="hero-contact mt-12 pt-8 border-t border-primary border-opacity-20">
            <p className="text-base-content opacity-75">
              📍 الموقع: القاهرة، مصر
            </p>
            <p className="text-lg font-semibold text-primary mt-2">
              د.ديدي
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
