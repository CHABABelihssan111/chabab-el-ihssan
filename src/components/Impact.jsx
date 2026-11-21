import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaUtensils, FaTshirt, FaTruckMoving, FaMoon, FaUsers, FaHeart, FaTint, FaSchool, FaAmbulance, FaHome, FaBoxOpen, FaHandHoldingHeart } from 'react-icons/fa';
import { impact } from '../data/content';
import { getLocalizedContent } from '../utils/languageUtils';

// Icônes proposées dans l'interface /admin (champ « icon »)
const ICONS = {
    meals: FaUtensils, clothes: FaTshirt, moon: FaMoon, caravan: FaTruckMoving,
    people: FaUsers, heart: FaHeart, water: FaTint, school: FaSchool,
    ambulance: FaAmbulance, home: FaHome, basket: FaBoxOpen, donation: FaHandHoldingHeart,
};

import { animate, useInView } from "framer-motion";
import { useEffect, useRef } from 'react';

export const AnimatedNumber = ({ value }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (!inView) return;

        // Extract numeric part and suffix
        const numericValue = parseInt(value.toString().replace(/[^0-9]/g, ''));
        const suffix = value.toString().includes('+') ? '+' : '';

        const controls = animate(0, numericValue, {
            duration: 2.5,
            ease: "easeOut",
            onUpdate(val) {
                if (ref.current) {
                    ref.current.textContent = Math.floor(val).toLocaleString() + suffix;
                }
            }
        });

        return () => controls.stop();
    }, [inView, value]);

    return <span ref={ref}>0</span>;
};

const Impact = () => {
    const { language } = useLanguage();

    // Chiffres, textes et icônes : src/content/impact.json (éditable depuis /admin)
    const stats = (impact.stats || []).map((s) => {
        const Icon = ICONS[s.icon] || FaHeart;
        return { icon: <Icon />, number: String(s.number ?? '0'), text: getLocalizedContent(s.label, language) };
    });

    return (
        <section id="impact" className="relative z-10 -mt-20 md:-mt-28 pb-16 md:pb-20">
            <div className="container mx-auto px-4">
                <div className="impact-panel rounded-[2rem] px-5 py-8 md:px-12 md:py-12">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="font-display text-2xl md:text-4xl text-[var(--brand-navy)] dark:text-white">
                            {getLocalizedContent(impact.title, language)}
                        </h2>
                        {impact.description && getLocalizedContent(impact.description, language) && (
                            <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                {getLocalizedContent(impact.description, language)}
                            </p>
                        )}
                        <div className="heading-bar" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="impact-stat text-center px-2">
                                <div className="mx-auto mb-3 w-14 h-14 md:w-16 md:h-16 rounded-2xl rotate-6 bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-red)] text-[var(--brand-gold)] flex items-center justify-center text-2xl md:text-3xl shadow-lg">
                                    <span className="-rotate-6">{stat.icon}</span>
                                </div>
                                <h3 className="font-display text-3xl md:text-5xl text-[var(--brand-red)] dark:text-white leading-tight" dir="ltr">
                                    <AnimatedNumber value={stat.number} />
                                </h3>
                                <p className="mt-1 text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium leading-snug">
                                    {stat.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Impact;
