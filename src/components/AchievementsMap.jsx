import React, { lazy } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { achievementPlaces } from '../data/media';
import { getLocalizedContent } from '../utils/languageUtils';
import SectionHeading from './SectionHeading';
import LazyOnView from './LazyOnView';

const AchievementsMapInner = lazy(() => import('./AchievementsMapInner'));

const L = {
    ar: { eyebrow: 'حضورنا في الميدان', title: 'خريطة إنجازاتنا', subtitle: 'الولايات التي وصلتها حملاتنا وقوافلنا.', note: (places) => `بتوفيق من الله وفقنا لـ 28 قافلة إحسان للجنوب نحو الولايات المعلَّمة على الخريطة (${places}).` },
    fr: { eyebrow: 'Notre présence sur le terrain', title: 'Carte de nos réalisations', subtitle: 'Les wilayas atteintes par nos campagnes et nos caravanes.', note: (places) => `Par la grâce de Dieu, nous avons réalisé 28 caravanes de bienfaisance vers le Sud, dans les wilayas indiquées sur la carte (${places}).` },
    en: { eyebrow: 'Our presence on the ground', title: 'Map of our achievements', subtitle: 'The provinces reached by our campaigns and caravans.', note: (places) => `By the grace of God, we completed 28 charity caravans to the South, reaching the provinces marked on the map (${places}).` },
};


const AchievementsMap = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.en;
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const placesList = achievementPlaces
        .map((p) => getLocalizedContent(p.name, language))
        .filter(Boolean)
        .join(language === 'ar' ? '، ' : ', ');

    return (
        <section id="achievements-map" dir={dir} className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <SectionHeading eyebrow={lb.eyebrow} title={lb.title} subtitle={lb.subtitle} />

                <div dir="ltr" className="max-w-5xl mx-auto h-[420px] md:h-[620px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md relative z-0">
                    <LazyOnView>
                        <AchievementsMapInner />
                    </LazyOnView>
                </div>

                <p className="text-center font-arabic text-lg md:text-xl font-bold text-[var(--brand-navy)] dark:text-white mt-8 max-w-3xl mx-auto leading-relaxed">
                    {lb.note(placesList)}
                </p>
            </div>
        </section>
    );
};

export default AchievementsMap;
