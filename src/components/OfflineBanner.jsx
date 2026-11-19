import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const TXT = {
    ar: 'أنت غير متصل بالإنترنت — تتصفح النسخة المحفوظة. أرقام الحسابات وصفحة التبرع متاحة.',
    fr: 'Vous êtes hors ligne — version enregistrée affichée. La page de don et les numéros de compte restent disponibles.',
    en: 'You are offline — showing the saved version. The donation page and account numbers are still available.',
};

// Bandeau discret quand il n'y a pas de connexion (l'application installée continue de fonctionner)
const OfflineBanner = () => {
    const { language } = useLanguage();
    const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);
    if (online) return null;
    return (
        <div role="status" className="fixed bottom-0 inset-x-0 z-[350] bg-[var(--brand-navy-dark)] text-white text-center text-xs sm:text-sm px-4 py-2 border-t-2 border-[var(--brand-gold)] fade-up">
            {TXT[language] || TXT.ar}
        </div>
    );
};

export default OfflineBanner;
