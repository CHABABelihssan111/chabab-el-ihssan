import React, { useEffect, useState } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

// Petit bouton « تنزيل التطبيق » (installation PWA). Sur iPhone : explication Safari.
const TEXT = {
    ar: { btn: 'تنزيل التطبيق', ios: 'في Safari: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»' },
    fr: { btn: "Installer l'app", ios: "Dans Safari : Partager, puis « Sur l'écran d'accueil »" },
    en: { btn: 'Install app', ios: 'In Safari: tap Share, then “Add to Home Screen”' },
};

const InstallButton = () => {
    const { language } = useLanguage();
    const tx = TEXT[language] || TEXT.ar;
    const [prompt, setPrompt] = useState(null);
    const [hidden, setHidden] = useState(false);
    const [tip, setTip] = useState(false);

    const standalone = typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
    const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

    useEffect(() => {
        const onPrompt = (e) => { e.preventDefault(); setPrompt(e); };
        const onInstalled = () => { setPrompt(null); setHidden(true); };
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    if (standalone || hidden || (!prompt && !isIOS)) return null;

    const click = async () => {
        if (prompt) {
            prompt.prompt();
            await prompt.userChoice.catch(() => {});
            setPrompt(null);
        } else setTip((v) => !v);
    };

    return (
        <span className="relative inline-flex">
            <span className="inline-flex items-center rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy-dark)] text-xs font-bold overflow-hidden shadow">
                <button onClick={click} className="flex items-center gap-1.5 py-1 px-3 hover:brightness-95">
                    <FaDownload /> {tx.btn}
                </button>
                <button onClick={() => setHidden(true)} className="py-1 px-2 border-s border-black/20 hover:bg-black/10" aria-label="Close">
                    <FaTimes />
                </button>
            </span>
            {tip && <span className="absolute top-full mt-2 start-0 z-50 w-56 text-xs bg-white text-gray-800 rounded-lg shadow-lg p-3 font-normal">{tx.ios}</span>}
        </span>
    );
};

export default InstallButton;
