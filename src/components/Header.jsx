import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaHandHoldingHeart, FaHandsHelping, FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import settings from '../data/settings';
import InstallButton from './InstallButton';

const LOGO = settings.logo_url;

const Header = () => {
    const { language, changeLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const handleScrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const sadaqaLabel = { ar: 'الصدقة الجارية', fr: 'Sadaqa Jariya', en: 'Sadaqa Jariya' }[language] || 'Sadaqa Jariya';
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (e, sectionId) => {
        e.preventDefault();
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
        }
    };

    const navBtn = 'nav-link text-white hover:text-[var(--brand-gold)] transition-colors cursor-pointer';
    const navLinkClass = ({ isActive }) =>
        `nav-link text-white transition-colors hover:text-[var(--brand-gold)] ${isActive ? 'active text-[var(--brand-gold)]' : ''}`;
    const mobBtn = 'block w-full py-3 px-2 text-white text-start text-base font-semibold rounded-lg hover:bg-white/10 hover:text-[var(--brand-gold)] transition-colors';
    const mobLink = 'block py-3 px-2 text-white text-base font-semibold rounded-lg hover:bg-white/10 hover:text-[var(--brand-gold)] transition-colors';

    return (
        <>
            {/* Top Bar */}
            <div className="bg-[var(--brand-navy-dark)] text-white text-sm py-2 border-b-[3px] border-[var(--brand-gold)]">
                <div className="container mx-auto px-3 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
                        <span className="flex items-center gap-2 text-xs sm:text-base"><FaHandHoldingHeart /> <Link to="/donate" className="hover:text-[var(--brand-gold)] transition">{t.donate}</Link></span>
                        <span className="flex items-center gap-2 text-xs sm:text-base"><FaHandsHelping /> <Link to="/volunteer" className="hover:text-[var(--brand-gold)] transition">{t.volunteer}</Link></span>
                        <InstallButton />
                    </div>
                    <div className="flex items-center gap-2.5 sm:gap-4 text-xs sm:text-base flex-wrap justify-center">
                        <button className={`hover:text-[var(--brand-gold)] transition ${language === 'ar' ? 'font-bold' : ''}`} onClick={() => changeLanguage('ar')}>العربية</button>
                        <span>|</span>
                        <button className={`hover:text-[var(--brand-gold)] transition ${language === 'fr' ? 'font-bold' : ''}`} onClick={() => changeLanguage('fr')}>Français</button>
                        <span>|</span>
                        <button className={`hover:text-[var(--brand-gold)] transition ${language === 'en' ? 'font-bold' : ''}`} onClick={() => changeLanguage('en')}>English</button>
                    </div>
                </div>
            </div>

            {/* Branding: (right) خير الناس — logo — (left) أنفعهم للناس. Always Arabic, in every language. */}
            <div className="bg-gradient-to-b from-white to-rose-50/60 dark:from-gray-800 dark:to-gray-800 py-3 md:py-5 overflow-hidden">
                <div dir="ltr" className="container mx-auto px-2 sm:px-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:gap-4">
                    <p className="text-center font-display text-[clamp(.8rem,4.1vw,1.25rem)] sm:text-3xl md:text-5xl text-[var(--brand-navy)] dark:text-white leading-snug fade-up" style={{ animationDelay: '.15s' }}>
                        أنفعهم للناس
                    </p>
                    <Link to="/" onClick={handleScrollToTop} className="shrink-0 justify-self-center">
                        <img src={LOGO} alt="شباب الإحسان" fetchpriority="high" decoding="async" className="logo-glow h-[5.5rem] min-[400px]:h-24 sm:h-32 md:h-40 w-auto object-contain" />
                    </Link>
                    <p className="text-center font-display text-[clamp(.8rem,4.1vw,1.25rem)] sm:text-3xl md:text-5xl text-[var(--brand-navy)] dark:text-white leading-snug fade-up" style={{ animationDelay: '.3s' }}>
                        خير الناس
                    </p>
                </div>
                <h1 dir="rtl" className="mt-1 md:mt-2 px-3 text-center font-display text-[clamp(1.05rem,5.4vw,1.5rem)] sm:text-3xl md:text-4xl text-[var(--brand-red)] fade-up" style={{ animationDelay: '.45s' }}>
                    الجمعية الولائية شباب الإحسان
                </h1>
            </div>

            {/* Sticky navigation bar */}
            <div className="nav-glass dark:bg-[var(--brand-navy-dark)] shadow-lg sticky top-0 z-50 border-b-[3px] border-[var(--brand-gold)]">
                <div className="container mx-auto px-3 sm:px-4 py-2 md:py-3 flex justify-between items-center">
                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-5 lg:gap-8">
                            <li><button onClick={(e) => handleNavigation(e, 'hero')} className={navBtn}>{t.home}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'about')} className={navBtn}>{t.about}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'programs')} className={navBtn}>{t.programs}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'branches')} className={navBtn}>{t.branches}</button></li>
                            <li><NavLink to="/sadaqa-jariya" className={navLinkClass} onClick={handleScrollToTop}>{sadaqaLabel}</NavLink></li>
                            <li><NavLink to="/gallery" className={navLinkClass} onClick={handleScrollToTop}>{t.gallery}</NavLink></li>
                            <li><button onClick={(e) => handleNavigation(e, 'contact')} className={navBtn}>{t.contact_us}</button></li>
                        </ul>
                    </nav>

                    <div className="flex items-center gap-4 ms-auto md:ms-0">
                        <button
                            onClick={toggleTheme}
                            className="text-[var(--brand-gold)] text-xl p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <FaMoon /> : <FaSun />}
                        </button>
                        <button className="md:hidden text-white text-2xl p-2 rounded-lg hover:bg-white/10 transition-colors" onClick={toggleMobileMenu} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
                            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="mobile-menu md:hidden w-full py-2 px-3 border-t border-white/20 max-h-[70vh] overflow-y-auto">
                        <ul className="flex flex-col gap-2">
                            <li><button className={mobBtn} onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'hero'); }}>{t.home}</button></li>
                            <li><button className={mobBtn} onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'about'); }}>{t.about}</button></li>
                            <li><button className={mobBtn} onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'programs'); }}>{t.programs}</button></li>
                            <li><button className={mobBtn} onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'branches'); }}>{t.branches}</button></li>
                            <li><NavLink to="/sadaqa-jariya" className={mobLink} onClick={toggleMobileMenu}>{sadaqaLabel}</NavLink></li>
                            <li><NavLink to="/gallery" className={mobLink} onClick={toggleMobileMenu}>{t.gallery}</NavLink></li>
                            <li><button className={mobBtn} onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'contact'); }}>{t.contact_us}</button></li>
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

export default Header;
