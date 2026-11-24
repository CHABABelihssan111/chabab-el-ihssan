import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
// removed import { translations } from '../translations';
import settings, { social } from '../data/settings';
import { getLocalizedContent } from '../utils/languageUtils';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaMapMarkerAlt, FaPhone, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer = () => {
    const { t, language } = useLanguage();

    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (e, sectionId) => {
        e.preventDefault();
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
        }
    };

    return (
        <footer id="contact" className="footer-modern text-white pt-14 pb-6">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <span
                        className="text-[var(--brand-gold)] select-none"
                        style={{ fontFamily: "'Amiri Quran', 'Noto Kufi Arabic', serif", fontWeight: 400, fontSize: 'clamp(3rem, 12vw, 5.5rem)', lineHeight: 1.3, textShadow: '0 2px 12px rgba(0,0,0,.35)' }}
                    >
                        أَبْشِرْ
                    </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="font-display text-xl mb-4 footer-title">
                            {t.association_name}
                        </h3>
                        <ul className="space-y-2 mb-5">
                            <li><button onClick={(e) => handleNavigation(e, 'hero')} className="text-gray-400 hover:text-white transition text-start">{t.home}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'about')} className="text-gray-400 hover:text-white transition text-start">{t.about}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'programs')} className="text-gray-400 hover:text-white transition text-start">{t.programs}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'branches')} className="text-gray-400 hover:text-white transition text-start">{t.branches}</button></li>
                            <li><Link to="/sadaqa-jariya" className="text-gray-400 hover:text-white transition">SADAQA JARYA</Link></li>
                            <li><Link to="/gallery" className="text-gray-400 hover:text-white transition">{t.gallery}</Link></li>
                        </ul>
                        <div className="flex flex-row items-center gap-4">
                            <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="social-btn">
                                <FaFacebookF />
                            </a>
                            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="social-btn">
                                <FaInstagram />
                            </a>
                            <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="social-btn">
                                <FaYoutube />
                            </a>
                            <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="social-btn">
                                <FaTiktok />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-display text-xl mb-4 footer-title">
                            {t.help_title}
                        </h3>
                        <ul className="space-y-2">
                            <li><Link to="/volunteer" className="text-gray-400 hover:text-white transition">{t.volunteer}</Link></li>
                            <li><Link to="/donate" className="text-gray-400 hover:text-white transition">{t.donate_money}</Link></li>
                            <li><Link to="/feedback" className="text-gray-400 hover:text-white transition">{{ ar: 'اقتراحات ومشاكل', fr: 'Suggestions et problèmes', en: 'Suggestions & problems' }[language] || 'Feedback'}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display text-xl mb-4 footer-title">
                            {t.contact_us}
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-2">
                                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                <span className="text-gray-400 break-all min-w-0">{getLocalizedContent(settings.address, language) || t.address}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaPhone className="text-gray-400" />
                                <span className="text-gray-400" dir="ltr">{settings.phone_display || t.phone_number}</span>
                            </li>
                            {settings.phone_fixed && (
                                <li className="flex items-center gap-2">
                                    <FaPhoneAlt className="text-gray-400" />
                                    <a href={`tel:+213${String(settings.phone_fixed).replace(/\D/g, '').replace(/^0/, '')}`} className="text-gray-400 hover:text-white transition" dir="ltr">{settings.phone_fixed}</a>
                                </li>
                            )}
                            <li className="flex items-center gap-2">
                                <FaEnvelope className="text-gray-400" />
                                <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-white transition break-all min-w-0">{settings.email}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-brand">
                    <img src="/images/logo-full.png" alt="شباب الإحسان" loading="lazy" decoding="async" className="footer-logo" />
                    <p className="mt-3 text-sm md:text-base text-white/75">{t.association_name}</p>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-400 text-sm text-center">
                        <p>{{ ar: 'جميع الحقوق محفوظة', fr: 'Tous droits réservés', en: 'All rights reserved' }[language] || 'All rights reserved'}</p>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition">{t.privacy_policy}</Link>
                        <Link to="/terms-of-use" className="text-gray-400 hover:text-white text-sm transition">{t.terms_of_use}</Link>
                        <Link to="/report-problem" className="text-gray-400 hover:text-white text-sm transition">{t.report_problem}</Link>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-center text-[11px] text-white/50">
                <p dir="auto">{{ ar: 'المطور', fr: 'Développeur', en: 'Developer' }[language] || 'Developer'}: Ferhat Zehani</p>
            </div>
        </footer>
    );
};

export default Footer;
