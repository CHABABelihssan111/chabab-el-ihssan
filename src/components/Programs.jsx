import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../hooks/useData';
import { FaArrowRight, FaHandHoldingHeart, FaTimes, FaChevronLeft, FaChevronRight, FaExpand, FaImage } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Modal from './Modal';


// Image with a nice fallback (gradient + icon) if the file/URL fails to load
const SafeImg = ({ src, alt, className = '', fit = 'object-cover' }) => {
    const [failed, setFailed] = useState(false);
    if (failed || !src) {
        return (
            <div className={`flex items-center justify-center bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-red)] text-white/60 ${className}`}>
                <FaImage className="text-4xl" />
            </div>
        );
    }
    return <img src={src} alt={alt} className={`${className} ${fit}`} loading="lazy" onError={() => setFailed(true)} />;
};

// Diaporama d'images d'un sous-projet (flèches + points)
const ImageSlider = ({ images, alt }) => {
    const [i, setI] = useState(0);
    const n = images.length;
    const go = (d) => setI((i + d + n) % n);
    const btn = 'absolute top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition';
    return (
        <div className="relative w-full h-64 md:h-[26rem] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <SafeImg src={images[i]} alt={alt} className="w-full h-full" />
            {n > 1 && (
                <>
                    <button type="button" onClick={() => go(-1)} className={`${btn} left-2`} aria-label="Previous image"><FaChevronLeft /></button>
                    <button type="button" onClick={() => go(1)} className={`${btn} right-2`} aria-label="Next image"><FaChevronRight /></button>
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
                        {images.map((_, k) => (
                            <button key={k} type="button" onClick={() => setI(k)} aria-label={`Image ${k + 1}`}
                                className={`w-2.5 h-2.5 rounded-full transition ${k === i ? 'bg-white scale-125' : 'bg-white/50'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// Détail d'un sous-projet : image à droite, description à gauche
const Lightbox = ({ items, index, onChange, onClose, getTitle, getDesc, dir }) => {
    const count = items.length;
    const go = (d) => onChange((index + d + count) % count);

    useEffect(() => {
        const onKey = (e) => {
            if (['Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') go(-1);
            if (e.key === 'ArrowRight') go(1);
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    });

    const item = items[index];
    const desc = getDesc(item);
    const arrowBtn = 'p-3 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/30 text-lg transition';

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-3 sm:p-8"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-5xl max-h-full overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-red-600 transition" aria-label="Close">
                    <FaTimes />
                </button>
                {/* Image à droite, description à gauche (ordre visuel fixe) */}
                <div dir="ltr" className="flex flex-col md:flex-row-reverse gap-6 items-stretch pt-8 md:pt-2">
                    <div className="md:w-1/2 shrink-0">
                        <ImageSlider key={item.id} images={[item.image, ...(item.images || []).map((x) => x.image)].filter(Boolean)} alt={getTitle(item)} />
                    </div>
                    <div dir={dir} className="md:w-1/2 flex flex-col justify-center text-start">
                        <h4 className="text-2xl md:text-3xl font-bold text-[var(--brand-navy)] dark:text-white mb-4">{getTitle(item)}</h4>
                        {desc && <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{desc}</p>}
                        {count > 1 && (
                            <div dir="ltr" className="flex items-center gap-3 mt-6">
                                <button onClick={() => go(-1)} className={arrowBtn} aria-label="Previous"><FaChevronLeft /></button>
                                <span className="text-sm text-gray-500">{index + 1} / {count}</span>
                                <button onClick={() => go(1)} className={arrowBtn} aria-label="Next"><FaChevronRight /></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>,
        document.body
    );
};

// Projets principaux : 7 catégories (unités). Un clic ouvre la catégorie
// et affiche ses sous-projets (فروع). Données : src/data/siteData.js
const Programs = () => {
    const { language, t } = useLanguage();
    const { projectCategories, getLocalizedContent } = useData();
    const [selectedId, setSelectedId] = useState(null);
    const [lightIndex, setLightIndex] = useState(null);

    const selected = projectCategories.find((c) => c.id === selectedId) || null;
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
        <section id="programs" className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300" dir={dir}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl text-[var(--brand-navy)] dark:text-white mb-4">
                        {t.programs_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.programs_desc}
                    </p>
                    <div className="w-24 h-1.5 rounded-full -rotate-2 bg-[var(--brand-red)] mx-auto mt-4"></div>
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                    {projectCategories.map((cat) => (
                        <div
                            key={cat.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedId(cat.id)}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedId(cat.id)}
                            className="bg-white dark:bg-gray-900 rounded-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group flex flex-col w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-sm border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl overflow-hidden"
                        >
                            <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                                <SafeImg
                                    src={cat.image}
                                    alt={getLocalizedContent(cat.title, language)}
                                    className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-16 text-center">
                                    <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow">
                                        {getLocalizedContent(cat.title, language)}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={!!selected}
                onClose={() => { setLightIndex(null); setSelectedId(null); }}
                title={selected ? getLocalizedContent(selected.title, language) : ''}
                heroImage={selected?.image}
                fullScreen
            >
                {selected && (
                    <div dir={dir}>
                        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 text-start">
                            {getLocalizedContent(selected.description, language)}
                        </p>

                        {selected.items.length > 0 && (
                            <>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                                    <FaExpand /> {selected.items.length}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                    {selected.items.map((item, i) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setLightIndex(i)}
                                            className="group text-start rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--brand-red)]/40"
                                        >
                                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                <SafeImg
                                                    src={item.image}
                                                    alt={getLocalizedContent(item.title, language)}
                                                    className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 text-center">
                                                    <h4 className="font-bold text-lg text-white drop-shadow">
                                                        {getLocalizedContent(item.title, language)}
                                                    </h4>
                                                </div>
                                            </div>
</button>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="flex justify-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Link to="/donate" className="btn-brand py-2 px-6 inline-flex items-center gap-2">
                                <FaHandHoldingHeart /> {t.donate}
                            </Link>
                            <Link to="/volunteer" className="btn-brand-light py-2 px-6">{t.volunteer}</Link>
                        </div>
                    </div>
                )}
            </Modal>

            <AnimatePresence>
                {selected && lightIndex !== null && (
                    <Lightbox
                        items={selected.items}
                        index={lightIndex}
                        onChange={setLightIndex}
                        onClose={() => setLightIndex(null)}
                        getTitle={(it) => getLocalizedContent(it.title, language)}
                        getDesc={(it) => getLocalizedContent(it.description, language) || getLocalizedContent(selected.description, language)}
                        dir={dir}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};

export default Programs;
