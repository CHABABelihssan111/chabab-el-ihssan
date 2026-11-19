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

const Lantern = ({ id, className = '', delay = '0s' }) => (
    <svg viewBox="0 0 40 92" className={`ramadan-lantern ${className}`} style={{ animationDelay: delay }} aria-hidden="true" focusable="false">
        <defs>
            <radialGradient id={id} cx="50%" cy="45%" r="60%">
                <stop offset="0" stopColor="#fff3b0" />
                <stop offset="0.6" stopColor="#f2b705" />
                <stop offset="1" stopColor="#b8780a" />
            </radialGradient>
        </defs>
        <line x1="20" y1="0" x2="20" y2="16" stroke="#d99a06" strokeWidth="1.6" />
        <path d="M14 16h12l-2.5 7h-7z" fill="#d99a06" />
        <path d="M11 23h18c3.5 7 3.5 24 0 32l-5 6H16l-5-6c-3.5-8-3.5-25 0-32z" fill={`url(#${id})`} stroke="#9a6406" strokeWidth="1.2" />
        <path d="M20 23v38M15 24c-2 9-2 21 1 36M25 24c2 9 2 21-1 36" stroke="#9a6406" strokeWidth=".9" fill="none" opacity=".55" />
        <path d="M15 61h10l-2 6h-6z" fill="#d99a06" />
        <circle cx="20" cy="72" r="2.4" fill="#d99a06" />
        <path d="M20 74v10" stroke="#d99a06" strokeWidth="1.4" />
    </svg>
);

// Deux fanous suspendus dans l'en-tête (seulement pendant la période du thème)
export const RamadanLanterns = () => {
    const now = useNow(60000);
    if (!ramadanState(r, now)?.themeOn) return null;
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] flex justify-between px-1 sm:px-8 md:px-16">
            <Lantern id="lg1" className="w-5 sm:w-9 md:w-12" />
            <Lantern id="lg2" className="w-5 sm:w-9 md:w-12" delay="-2s" />
        </div>
    );
};
