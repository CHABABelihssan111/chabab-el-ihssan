import React, { useEffect, useState } from 'react';
import { FaMoon } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { ramadan as r } from '../data/content';
import { getNow, ramadanState, nextEvent, fmtCountdown, RL } from '../data/ramadanTools';

// Horloge réactive (1 s par défaut)
export const useNow = (ms = 1000) => {
    const [now, setNow] = useState(() => getNow());
    useEffect(() => {
        const id = setInterval(() => setNow(getNow()), ms);
        return () => clearInterval(id);
    }, [ms]);
    return now;
};

// Thème Ramadan : 7 jours avant → 3 jours après. Change les couleurs du site (voir index.css : html[data-ramadan]).
export const RamadanTheme = () => {
    const now = useNow(60000);
    const on = !!ramadanState(r, now)?.themeOn;
    useEffect(() => {
        const root = document.documentElement;
        const meta = document.querySelector('meta[name="theme-color"]');
        if (on) {
            root.dataset.ramadan = 'on';
            if (meta) { meta.dataset.orig = meta.dataset.orig || meta.content; meta.content = '#1d1b4f'; }
        } else {
            delete root.dataset.ramadan;
            if (meta?.dataset.orig) meta.content = meta.dataset.orig;
        }
        return () => { delete root.dataset.ramadan; };
    }, [on]);
    return null;
};

// Petit compteur dans la barre du haut pendant Ramadan
export const RamadanChip = () => {
    const { language } = useLanguage();
    const now = useNow(1000);
    const s = ramadanState(r, now);
    if (!s || s.phase !== 'during') return null;
    const lb = RL[language] || RL.ar;
    const ev = nextEvent(now);
    const label = ev.kind === 'iftar' ? lb.chipIftar : ev.kind === 'suhoor' ? lb.chipSuhoor : lb.chipNight;
    return (
        <span className="ramadan-chip inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy-dark)] font-bold px-2.5 py-0.5 text-[11px] sm:text-sm">
            <FaMoon aria-hidden="true" />
            <span>{label}</span>
            <span dir="ltr" className="tabular-nums">{fmtCountdown(ev.at - now)}</span>
        </span>
    );
};

const TONES = {
    gold: ['#fff3b0', '#f2b705', '#b8780a', '#d99a06', '#9a6406'],
    red: ['#ffd0d6', '#e0334f', '#8f0f27', '#c8102e', '#6e0a1c'],
    green: ['#d6ffe9', '#2fbf7f', '#0d6b45', '#169a62', '#0a4a30'],
};
const Lantern = ({ id, className = '', delay = '0s', tone = 'gold' }) => {
    const [c0, c1, c2, ac, ln] = TONES[tone] || TONES.gold;
    return (
        <svg viewBox="0 0 40 92" className={`ramadan-lantern ${className}`} style={{ animationDelay: delay }} aria-hidden="true" focusable="false">
            <defs>
                <radialGradient id={id} cx="50%" cy="48%" r="60%">
                    <stop offset="0" stopColor={c0} />
                    <stop offset="0.6" stopColor={c1} />
                    <stop offset="1" stopColor={c2} />
                </radialGradient>
            </defs>
            <line x1="20" y1="0" x2="20" y2="14" stroke={ac} strokeWidth="1.6" />
            <circle cx="20" cy="14" r="2.2" fill={ac} />
            <path d="M20 14c-7 0-9 5-9 9h18c0-4-2-9-9-9z" fill={ac} stroke={ln} strokeWidth=".8" />
            <path d="M11 23h18c3.5 7 3.5 24 0 32l-5 6H16l-5-6c-3.5-8-3.5-25 0-32z" fill={`url(#${id})`} stroke={ln} strokeWidth="1.2" />
            <path d="M20 23v38M15 24c-2 9-2 21 1 36M25 24c2 9 2 21-1 36M12 33h16M12 46h16" stroke={ln} strokeWidth=".9" fill="none" opacity=".5" />
            <ellipse className="ramadan-flame" cx="20" cy="41" rx="3.6" ry="6.5" fill="#fffbe0" />
            <path d="M15 61h10l-2 6h-6z" fill={ac} />
            <circle cx="20" cy="72" r="2.4" fill={ac} />
            <path d="M20 74v6" stroke={ac} strokeWidth="1.4" />
            <path d="M20 80l-2.6 5 2.6-1.2 2.6 1.2z" fill={ac} />
        </svg>
    );
};

// Guirlande : corde + fanous (or / rouge / vert) + croissants et étoiles suspendus
export const RamadanLanterns = () => {
    const now = useNow(60000);
    if (!ramadanState(r, now)?.themeOn) return null;
    const items = [
        ['lg1', 'w-6 sm:w-9 md:w-11', '0s', '', 'gold', 4],
        ['lg2', 'w-5 sm:w-7 md:w-9', '-1.4s', 'hidden sm:block', 'red', 14],
        ['lg3', 'w-6 sm:w-8 md:w-10', '-2.1s', 'hidden md:block', 'green', 0],
        ['lg4', 'w-8 sm:w-12 md:w-16', '-2.6s', '', 'gold', 10],
        ['lg5', 'w-6 sm:w-8 md:w-10', '-0.8s', 'hidden md:block', 'green', 0],
        ['lg6', 'w-5 sm:w-7 md:w-9', '-3.3s', 'hidden sm:block', 'red', 14],
        ['lg7', 'w-6 sm:w-9 md:w-11', '-1.9s', '', 'gold', 4],
    ];
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] ramadan-garland">
            <svg className="absolute inset-x-0 top-0 w-full h-5 text-[#d99a06]" viewBox="0 0 400 20" preserveAspectRatio="none" focusable="false">
                <path d="M0 2 Q100 16 200 2 T400 2" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <div className="relative flex justify-between px-1 sm:px-6 md:px-12">
                {items.map(([id, w, d, vis, tone, mt]) => (
                    <div key={id} className={vis} style={{ marginTop: mt }}><Lantern id={id} className={w} delay={d} tone={tone} /></div>
                ))}
            </div>
        </div>
    );
};

// Ciel étoilé + croissant (couche fixe, uniquement pendant Ramadan)
export const RamadanSky = () => {
    const now = useNow(60000);
    if (!ramadanState(r, now)?.themeOn) return null;
    const stars = [[8, 14], [22, 6], [35, 18], [48, 9], [61, 16], [74, 7], [88, 13], [94, 24], [14, 30], [67, 32], [3, 40], [29, 36], [55, 28], [81, 38], [97, 6]];
    return (
        <div aria-hidden="true" className="ramadan-sky">
            {stars.map(([x, y], i) => (
                <span key={i} className="ramadan-star" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.37) % 3}s` }} />
            ))}
            <svg className="ramadan-moon" viewBox="0 0 64 64" focusable="false"><path d="M44 8a26 26 0 1 0 12 46A22 22 0 0 1 44 8z" fill="#f2b705" /></svg>
        </div>
    );
};

const GREET = {
    ar: { top: 'رمضان مبارك', sub: 'تقبّل الله منا ومنكم صالح الأعمال — ساهموا في إفطار صائم وإدخال الفرحة على الأسر' },
    fr: { top: 'Ramadan Moubarak', sub: 'Que Dieu accepte nos bonnes œuvres — offrez un iftar et apportez la joie aux familles' },
    en: { top: 'Ramadan Mubarak', sub: 'May God accept our good deeds — sponsor an iftar and bring joy to families' },
};
export const RamadanGreeting = () => {
    const now = useNow(60000);
    const { language } = useLanguage();
    if (!ramadanState(r, now)?.themeOn) return null;
    const g = GREET[language] || GREET.en;
    return (
        <section className="ramadan-greeting" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="ramadan-greeting-lamps" aria-hidden="true">
                <Lantern id="gl1" className="w-8 sm:w-12" tone="gold" />
                <Lantern id="gl2" className="w-6 sm:w-9 opacity-90" delay="-1.7s" tone="red" />
            </div>
            <div className="ramadan-greeting-lamps ramadan-greeting-lamps-end" aria-hidden="true">
                <Lantern id="gl3" className="w-6 sm:w-9 opacity-90" delay="-0.9s" tone="green" />
                <Lantern id="gl4" className="w-8 sm:w-12" delay="-2.4s" tone="gold" />
            </div>
            <FaMoon className="ramadan-greeting-moon" />
            <h2 className="ramadan-shimmer font-display text-3xl md:text-5xl">{g.top}</h2>
            <p className="text-white/80 text-sm md:text-base mt-2 max-w-2xl mx-auto px-4">{g.sub}</p>
        </section>
    );
};
