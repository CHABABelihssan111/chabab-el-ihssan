import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { FaPlay, FaHandHoldingHeart, FaHandsHelping } from 'react-icons/fa';
import { heroVideo, heroSlides as allSlides } from '../data/media';

// Mode léger : صورة واحدة فقط، بدون سلايدر ولا جزيئات
const LITE = typeof document !== 'undefined' && document.documentElement.classList.contains('lite');
const heroSlides = LITE ? allSlides.slice(0, 1) : allSlides;
import VideoModal from './VideoModal';

const INTERVAL = 5200;
const DOTS = Array.from({ length: 14 }, (_, i) => ({ x: (i * 37) % 100, s: 4 + ((i * 5) % 8), d: 8 + ((i * 3) % 9), t: -((i * 2.3) % 10) }));

const REDUCED = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
// Mouvement Ken Burns : chaque photo a son propre cadrage (origine + dérive) pour un rendu « cinéma ».
const KB = [['50% 40%', '-1.5%', '-1%'], ['20% 60%', '1.8%', '-1.2%'], ['80% 35%', '-1.8%', '1%'], ['55% 70%', '1.2%', '1.4%'], ['30% 30%', '-1%', '1.6%']];

// Titre statique : affiché directement (sans effet machine à écrire) ; la dernière phrase reste soulignée.
const StaticTitle = ({ words }) => (
    <span aria-hidden="true">
        {words.map((w, i) => <span key={i} className={`inline-block${w.key ? ' hero-mark' : ''}`}>{w.text}&nbsp;</span>)}
    </span>
);

// Indicateur de défilement intelligent : disparaît dès qu'on descend, et mène à la section suivante.
const ScrollCue = ({ label, targetId }) => {
    const [hide, setHide] = useState(false);
    useEffect(() => {
        const f = () => setHide(window.scrollY > 90);
        f(); window.addEventListener('scroll', f, { passive: true });
        return () => window.removeEventListener('scroll', f);
    }, []);
    const go = () => {
        const el = document.getElementById(targetId)?.nextElementSibling;
        el?.scrollIntoView({ behavior: REDUCED() ? 'auto' : 'smooth', block: 'start' });
    };
    return (
        <button type="button" onClick={go} aria-label={label} tabIndex={hide ? -1 : 0} className={`scroll-cue${hide ? ' is-hidden' : ''}`}>
            <span>{label}</span><i><b /></i>
        </button>
    );
};

// Accueil : fond en fondu + zoom lent, texte à gauche/droite, pile de photos qui tournent.
const Hero = () => {
    const { language, t } = useLanguage();
    const [playing, setPlaying] = useState(false);
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const n = heroSlides.length;
    const tilt = useRef(null);
    const onMove = (e) => {
        const el = tilt.current;
        if (!el || e.pointerType === 'touch') return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`);
        el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`);
    };
    const onLeave = () => { setPaused(false); tilt.current?.style.setProperty('--rx', '0deg'); tilt.current?.style.setProperty('--ry', '0deg'); };
    // Phrase clé du titre (dernière phrase) : soulignée en rouge avec une animation de tracé.
    const titleWords = (() => {
        const parts = String(t.hero_title).match(/[^.؟?!]+[.؟?!]?/g) || [String(t.hero_title)];
        const last = parts.length > 1 ? parts.length - 1 : -1;
        return parts.flatMap((p, pi) => p.trim().split(/\s+/).filter(Boolean).map((text) => ({ text, key: pi === last })));
    })();
    const hasVideo = !!(heroVideo.src || heroVideo.youtubeId);
    const watchLabel = { ar: 'شاهد الفيديو', fr: 'Voir la vidéo', en: 'Watch the video' }[language] || 'Watch the video';

    useEffect(() => {
        if (paused || n < 2) return undefined;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
        const id = setTimeout(() => setIdx((i) => (i + 1) % n), INTERVAL);
        return () => clearTimeout(id);
    }, [idx, paused, n]);

    // Position de chaque carte dans la pile : 0 = devant, 1-2 = derrière, le reste caché.
    const cardStyle = (i) => {
        const o = (i - idx + n) % n;
        const pos = [
            'translate3d(0,0,0) rotate(0deg) scale(1)',
            'translate3d(7%,-5%,0) rotate(6deg) scale(.92)',
            'translate3d(-7%,-9%,0) rotate(-6deg) scale(.85)',
        ][o] || 'translate3d(0,-12%,0) scale(.75)';
        return { transform: pos, opacity: o === 0 ? 1 : o < 3 ? 0.9 - o * 0.2 : 0, zIndex: n - o };
    };

    return (
        <section id="home" className="hero relative isolate overflow-hidden text-white pt-12 pb-32 md:pt-20 md:pb-44">
            {/* Fond : photo courante + dégradé bordeaux + halos */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[var(--brand-navy-dark)]">
                {heroSlides.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt=""
                        width="1280"
                        height="960"
                        decoding="async"
                        fetchPriority={i === 0 ? 'high' : 'auto'}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        className={`hero-bg ${i === idx ? 'is-on' : ''}`}
                        style={{ transformOrigin: KB[i % KB.length][0], '--kx': KB[i % KB.length][1], '--ky': KB[i % KB.length][2] }}
                    />
                ))}
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(77,10,33,.94)_8%,rgba(122,16,52,.78)_55%,rgba(77,10,33,.55))]" />
                <div className="hero-blob -top-24 -start-24 w-[26rem] h-[26rem] bg-[var(--brand-red)]" />
                <div className="hero-blob top-1/2 -end-32 w-[24rem] h-[24rem] bg-[var(--brand-gold)] opacity-20" style={{ animationDelay: '-6s' }} />
                {!LITE && DOTS.map((d, i) => (
                    <i key={i} className="hero-dot" style={{ left: `${d.x}%`, width: d.s, height: d.s, animationDuration: `${d.d}s`, animationDelay: `${d.t}s` }} />
                ))}
                <div className="hero-vignette" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--hero-fade)] to-transparent" />
            </div>

            <div className="container mx-auto px-4 grid lg:grid-cols-2 items-center gap-12 lg:gap-8">
                <div className="hero-rise">
                    <span className="hero-badge inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-sm font-semibold ring-1 ring-white/20">
                        <span className="w-2 h-2 rounded-full bg-[var(--brand-gold)] animate-pulse" />
                        {t.association_name}
                    </span>
                    <h2 className="font-display hero-title mt-5 text-[clamp(1.9rem,6.2vw,3.6rem)] leading-[1.35]" aria-label={t.hero_title}>
                        <StaticTitle key={t.hero_title} words={titleWords} />
                    </h2>
                    <div className="mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-red)]" />
                    <p className="mt-5 max-w-xl text-base md:text-lg text-white/85 leading-relaxed">{t.hero_desc}</p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link to="/donate" className="btn-brand btn-pulse py-3 px-8 text-center text-lg inline-flex items-center justify-center gap-2">
                            <FaHandHoldingHeart /> {t.donate}
                        </Link>
                        <Link to="/volunteer" className="btn-glass py-3 px-8 text-center text-lg inline-flex items-center justify-center gap-2">
                            <FaHandsHelping /> {t.join_us}
                        </Link>
                    </div>
                </div>

                <div className="hero-rise flex flex-col items-center" style={{ animationDelay: '.15s' }}>
                    <div
                        ref={tilt}
                        className="hero-tilt relative w-full max-w-md aspect-[4/3]"
                        onMouseEnter={() => setPaused(true)}
                        onMouseMove={onMove}
                        onMouseLeave={onLeave}
                        onTouchStart={() => setPaused(true)}
                        onTouchEnd={() => setPaused(false)}
                    >
                        {heroSlides.map((src, i) => (
                            <button
                                key={src}
                                type="button"
                                tabIndex={i === idx ? 0 : -1}
                                aria-label={`${i + 1} / ${n}`}
                                onClick={() => setIdx((i === idx ? idx + 1 : i) % n)}
                                style={cardStyle(i)}
                                className="hero-card absolute inset-0 rounded-3xl overflow-hidden ring-[6px] ring-white/90 shadow-2xl"
                            >
                                <img src={src} alt={i === idx ? t.hero_title : ''} width="1280" height="960" decoding="async" fetchPriority={i === 0 ? 'high' : 'auto'} loading={i < 2 ? 'eager' : 'lazy'} className="w-full h-full object-cover" />
                            </button>
                        ))}
                        {hasVideo && (
                            <button
                                type="button"
                                onClick={() => setPlaying(true)}
                                aria-label={watchLabel}
                                className="absolute z-20 bottom-4 end-4 flex items-center gap-2 rounded-full bg-[var(--brand-red)] px-4 py-2 text-sm font-bold shadow-xl hover:scale-105 transition"
                            >
                                <FaPlay /> {watchLabel}
                            </button>
                        )}
                    </div>
                    <div className={`mt-8 flex gap-2 w-full max-w-xs${LITE ? ' hidden' : ''}`} role="tablist">
                        {heroSlides.map((_, i) => (
                            <button key={i} type="button" role="tab" aria-selected={i === idx} aria-label={`${i + 1} / ${n}`} onClick={() => setIdx(i)} className="hero-bar">
                                <i style={i === idx ? { animationDuration: `${INTERVAL}ms`, animationPlayState: paused ? 'paused' : 'running' } : undefined} className={i === idx ? 'on' : i < idx ? 'done' : ''} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <ScrollCue targetId="home" label={{ ar: 'تابع الاستكشاف', fr: 'Découvrir', en: 'Explore' }[language] || 'Explore'} />
            {playing && <VideoModal video={heroVideo} onClose={() => setPlaying(false)} />}
        </section>
    );
};

export default Hero;
