import React from "react";
import JewelLogo from "../assets/logoanim";

const PHONE_NUMBER = "201271772724";
const FACEBOOK_URL = "https://www.facebook.com/ozeraskincare";
const INSTAGRAM_URL = "https://www.instagram.com/ozera73?igsh=bGYzb2xtYnp0M2xx";
const TIKTOK_URL = "https://www.tiktok.com/@ozera42?_t=ZS-90jWkQ5qvHF&_r=1";

export default function Footer() {
  const handleCall = () => {
    window.location.href = `tel:+${PHONE_NUMBER}`;
  };

  return (
    <footer className="footer-section bg-primary text-primary-content">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo and Description */}
          <div className="footer-brand text-center md:text-right">
            <div className="footer-logo mb-6 flex justify-center md:justify-start">
              <div className="w-24 h-24">
                <JewelLogo
                  size="100%"
                  color="#ffffff"
                  loopDuration={4}
                  strokeWidth={6}
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">OZERA</h3>
            <p className="text-primary-content opacity-90 text-sm">
              منتجات عناية بالبشرة بالزيوت الطبيعية المعالجة بغاز الاوزون
            </p>
          </div>

          {/* Contact Info */}
          <div className="footer-contact text-center">
            <h4 className="text-lg font-bold mb-4">تواصل معنا</h4>
            <div className="contact-items space-y-3">
              <div className="contact-phone">
                <button
                  onClick={handleCall}
                  className="btn btn-sm btn-ghost text-primary-content hover:bg-primary-content hover:text-primary rounded-lg"
                  aria-label="اتصل بنا"
                >
                  📞 {PHONE_NUMBER.slice(0, 3)}-{PHONE_NUMBER.slice(3)}
                </button>
              </div>
              <div className="contact-location">
                <p className="text-primary-content opacity-90">
                  📍 القاهرة، مصر
                </p>
              </div>
              <div className="contact-owner">
                <p className="text-primary-content font-semibold">
                  صاحب البراند: د.ديدي
                </p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="footer-social text-center md:text-left">
            <h4 className="text-lg font-bold mb-4">تابعنا</h4>
            <div className="social-links flex justify-center md:justify-start gap-4">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-circle btn-ghost text-2xl"
                aria-label="صفحة فيسبوك"
              >
                f
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-circle btn-ghost text-2xl"
                aria-label="صفحة إنستجرام"
              >
                📷
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-circle btn-ghost text-2xl"
                aria-label="صفحة تيك توك"
              >
                🎵
              </a>
            </div>

            <p className="mt-6 text-sm text-primary-content opacity-80">
              تابعنا على وسائل التواصل الاجتماعي
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="divider opacity-30" />

        {/* Bottom Info */}
        <div className="footer-bottom text-center text-sm text-primary-content opacity-75">
          <p>© 2024 OZERA. جميع الحقوق محفوظة.</p>
          <p className="mt-2">
            منتجات عناية بالبشرة بالزيوت الطبيعية المعالجة بغاز الاوزون
          </p>
        </div>
      </div>
    </footer>
  );
}
