import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Écran d'accueil de 2 secondes aux couleurs de l'association
const Splash = () => {
    const [show, setShow] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setShow(false), 1200);
        return () => clearTimeout(t);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center font-arabic"
                    style={{ background: 'linear-gradient(160deg, #7a1034 0%, #4d0a21 100%)' }}
                >
                    <div dir="rtl" className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 px-4">
                        <motion.span
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-4xl sm:text-5xl font-bold" style={{ color: '#f2b705' }}
                        >
                            خير الناس
                        </motion.span>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', damping: 14, stiffness: 120, duration: 0.8 }}
                            className="rounded-full bg-white p-4 shadow-2xl"
                            style={{ boxShadow: '0 0 0 5px #f2b705, 0 20px 50px rgba(0,0,0,.4)' }}
                        >
                            <img src="/images/logo.png" alt="" width="220" height="249" decoding="async" className="w-28 h-28 sm:w-36 sm:h-36 object-contain" />
                        </motion.div>
                        <motion.span
                            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-4xl sm:text-5xl font-bold text-white"
                        >
                            أنفعهم للناس
                        </motion.span>
                    </div>
                    <motion.div
                        initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-1" style={{ background: '#f2b705' }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Splash;
