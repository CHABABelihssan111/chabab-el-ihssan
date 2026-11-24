import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLightbulb, FaBug, FaHeart } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import FeedbackBox from '../components/FeedbackBox';

const L = {
    ar: { title: 'اقتراحات ومشاكل', subtitle: 'رأيك يساعدنا على تحسين الموقع والجمعية', cards: [['اقترح فكرة', 'شاركنا ما تراه مفيداً للجمعية أو للموقع.'], ['بلّغ عن مشكلة', 'خطأ في صفحة أو رابط لا يعمل؟ أخبرنا.'], ['قل لنا كلمة', 'كلمة شكر أو ملاحظة تسعدنا.']], back: 'العودة للرئيسية' },
    fr: { title: 'Suggestions et problèmes', subtitle: 'Votre avis nous aide à améliorer le site et l’association', cards: [['Proposer une idée', 'Dites-nous ce qui serait utile à l’association ou au site.'], ['Signaler un problème', 'Une erreur ou un lien cassé ? Informez-nous.'], ['Un mot pour nous', 'Un remerciement ou une remarque nous fait plaisir.']], back: 'Retour à l’accueil' },
    en: { title: 'Suggestions & problems', subtitle: 'Your input helps us improve the site and the association', cards: [['Suggest an idea', 'Tell us what would help the association or the site.'], ['Report a problem', 'An error or a broken link? Let us know.'], ['Say a word', 'A thank-you or a remark makes our day.']], back: 'Back to home' },
};
const ICONS = [FaLightbulb, FaBug, FaHeart];

const FeedbackPage = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.en;
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} dir={language === 'ar' ? 'rtl' : 'ltr'} className="bg-white dark:bg-gray-900 min-h-screen font-arabic flex flex-col transition-colors duration-300">
            <header className="bg-[var(--brand-navy)] text-white border-b-4 border-[var(--brand-gold)]">
                <div className="container mx-auto px-4 py-14 md:py-20 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight">{lb.title}</h1>
                    <p className="mt-4 text-white/85 md:text-lg">{lb.subtitle}</p>
                </div>
            </header>

            <section className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {lb.cards.map(([h, p], i) => {
                        const Icon = ICONS[i];
                        return (
                            <div key={h} className="text-center px-4">
                                <div className="mx-auto mb-4 w-14 h-14 rounded-full border-2 border-[var(--brand-navy)] text-[var(--brand-navy)] dark:text-white dark:border-white flex items-center justify-center text-xl"><Icon /></div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{h}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{p}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <FeedbackBox showHeading={false} />

            <div className="bg-[var(--brand-navy-dark)] text-center py-8">
                <Link to="/" className="btn-brand-light py-3 px-8 inline-block">{lb.back}</Link>
            </div>
        </motion.div>
    );
};

export default FeedbackPage;
