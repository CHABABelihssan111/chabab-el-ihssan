import React from 'react';

// Page affichée à la place du site quand "تعطيل الموقع" est activé dans /admin
const Maintenance = ({ message = {} }) => {
    const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('language')) || 'ar';
    const text = message[lang] || message.ar || 'الموقع معطّل حالياً';
    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', background: '#0f172a', color: '#fff' }}>
            <div>
                <div style={{ fontSize: '4rem' }}>🛑</div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0' }}>{text}</h1>
            </div>
        </div>
    );
};

export default Maintenance;
