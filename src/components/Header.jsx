import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaHandHoldingHeart, FaHandsHelping, FaMoon, FaSun, FaHome, FaInfoCircle, FaTasks, FaMapMarkerAlt, FaImages, FaEnvelope } from 'react-icons/fa';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import settings from '../data/settings';
import InstallButton from './InstallButton';
import { RamadanChip, RamadanLanterns } from './RamadanKit';

const LOGO = settings.logo_url;

const Header = () => {
    const { language, changeLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
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

    return (
        <>
            {/* Top Bar */}
            <div className="bg-[var(--brand-navy-dark)] text-white text-sm py-1.5">
                <div className="container mx-auto px-3 sm:px-4 flex flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
                        <span className="hidden sm:flex items-center gap-2 text-xs sm:text-base"><FaHandHoldingHeart /> <Link to="/donate" className="hover:text-[var(--brand-gold)] transition">{t.donate}</Link></span>
                        <span className="hidden sm:flex items-center gap-2 text-xs sm:text-base"><FaHandsHelping /> <Link to="/volunteer" className="hover:text-[var(--brand-gold)] transition">{t.volunteer}</Link></span>
                        <InstallButton />
                        <RamadanChip />
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
            <div className="relative bg-gradient-to-b from-white via-rose-50/50 to-transparent dark:from-gray-800 dark:to-gray-900 pt-3 pb-2 md:pt-5 md:pb-3 overflow-hidden">
                <RamadanLanterns />
                <div dir="ltr" className="container mx-auto px-2 sm:px-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:gap-4">
                    <p className="text-center font-display text-[clamp(.8rem,4.1vw,1.25rem)] sm:text-2xl md:text-4xl text-[var(--brand-navy)] dark:text-white leading-snug fade-up" style={{ animationDelay: '.15s' }}>
                        أنفعهم للناس
                    </p>
                    <Link to="/" onClick={handleScrollToTop} className="shrink-0 justify-self-center">
                        <img src={LOGO} alt="شباب الإحسان" fetchpriority="high" decoding="async" className="logo-glow h-[4.5rem] min-[400px]:h-20 sm:h-24 md:h-32 w-auto object-contain" />
                    </Link>
                    <p className="text-center font-display text-[clamp(.8rem,4.1vw,1.25rem)] sm:text-2xl md:text-4xl text-[var(--brand-navy)] dark:text-white leading-snug fade-up" style={{ animationDelay: '.3s' }}>
                        خير الناس
                    </p>
                </div>
                <h1 dir="rtl" className="mx-auto mt-2 w-fit max-w-full px-5 py-1 rounded-full bg-[var(--brand-red)]/10 text-center font-display text-[clamp(.95rem,4.6vw,1.25rem)] sm:text-2xl md:text-3xl text-[var(--brand-red)] fade-up" style={{ animationDelay: '.45s' }}>
                    الجمعية الولائية شباب الإحسان
                </h1>
            </div>

            {/* Sticky navigation bar */}
            <div className="sticky top-0 z-50 px-2 sm:px-4 pt-2">
              <div className="nav-glass container mx-auto rounded-2xl shadow-xl ring-1 ring-white/10">
                <div className="hidden md:flex px-5 py-2.5 justify-between items-center">
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

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="text-[var(--brand-gold)] text-xl p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <FaMoon /> : <FaSun />}
                        </button>
                    </div>
                </div>

                {/* Mobile : barre d'icônes toujours visible */}
                <nav className="md:hidden flex items-stretch justify-between px-1 py-1.5" aria-label="Navigation">
                    {[
                        { k: 'home', icon: <FaHome />, label: t.home, go: (e) => handleNavigation(e, 'home') },
                        { k: 'about', icon: <FaInfoCircle />, label: t.about, go: (e) => handleNavigation(e, 'about') },
                        { k: 'programs', icon: <FaTasks />, label: t.programs, go: (e) => handleNavigation(e, 'programs') },
                        { k: 'branches', icon: <FaMapMarkerAlt />, label: t.branches, go: (e) => handleNavigation(e, 'branches') },
                        { k: 'sadaqa', icon: <FaHandHoldingHeart />, label: sadaqaLabel, to: '/sadaqa-jariya' },
                        { k: 'gallery', icon: <FaImages />, label: t.gallery, to: '/gallery' },
                        { k: 'contact', icon: <FaEnvelope />, label: t.contact_us, go: (e) => handleNavigation(e, 'contact') },
                    ].map(({ k, icon, label, go, to }) => {
                        const cls = 'mnav-item';
                        return to ? (
                            <NavLink key={k} to={to} onClick={handleScrollToTop} className={({ isActive }) => `${cls} ${isActive ? 'on' : ''}`}>{icon}<span>{label}</span></NavLink>
                        ) : (
                            <button key={k} type="button" onClick={go} className={cls}>{icon}<span>{label}</span></button>
                        );
                    })}
                    <button type="button" onClick={toggleTheme} className="mnav-item text-[var(--brand-gold)]" aria-label="Toggle Theme">
                        {theme === 'light' ? <FaMoon /> : <FaSun />}<span>{theme === 'light' ? '🌙' : '☀️'}</span>
                    </button>
                </nav>
              </div>
            </div>
        </>
    );
};

export default Header;
