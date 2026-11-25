import React, { useEffect, useState } from 'react';

// Page affichée à la place du site quand "تعطيل الموقع" est activé dans /admin.
// Si une date de réouverture (reopen_at) est choisie, un compte à rebours s'affiche (heure d'Alger).
const T = {
    ar: { d: 'يوم', h: 'ساعة', m: 'دقيقة', s: 'ثانية', title: 'نفتح الموقع بعد', now: 'حان موعد الافتتاح!', reload: 'تحديث الصفحة' },
    fr: { d: 'jours', h: 'heures', m: 'min', s: 'sec', title: 'Réouverture dans', now: "C'est l'heure de la réouverture !", reload: 'Actualiser' },
    en: { d: 'days', h: 'hours', m: 'min', s: 'sec', title: 'Reopening in', now: 'We are reopening now!', reload: 'Refresh' },
};

const Box = ({ v, label }) => (
    <div style={{ minWidth: 72, padding: '14px 8px', borderRadius: 16, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(242,183,5,.35)' }}>
        <div dir="ltr" style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: '#f2b705' }}>{String(v).padStart(2, '0')}</div>
        <div style={{ fontSize: '.8rem', marginTop: 6, opacity: .8 }}>{label}</div>
    </div>
);

const Maintenance = ({ message = {}, reopenAt = '' }) => {
    const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('language')) || 'ar';
    const lb = T[lang] || T.ar;
    const text = message[lang] || message.ar || 'الموقع معطّل حالياً';
    const target = reopenAt ? Date.parse(`${String(reopenAt).slice(0, 16)}:00+01:00`) : NaN;
    const hasTimer = !Number.isNaN(target);
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!hasTimer) return undefined;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [hasTimer]);

    const left = hasTimer ? Math.max(0, target - now) : 0;
    const sec = Math.floor(left / 1000);
    const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', background: 'radial-gradient(60rem 30rem at 50% 0, #4a0a20, #0f172a 70%)', color: '#fff' }}>
            <div style={{ maxWidth: 640 }}>
                <div style={{ fontSize: '3.5rem' }}>{hasTimer && left === 0 ? '🎉' : '🛠️'}</div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0 1.5rem', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{text.trim()}</h1>
                {hasTimer && (left > 0 ? (
                    <div role="timer" aria-live="off">
                        <p style={{ fontWeight: 700, marginBottom: 12, color: '#ffe38a' }}>{lb.title}</p>
                        <div dir="ltr" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {d > 0 && <Box v={d} label={lb.d} />}
                            <Box v={h} label={lb.h} />
                            <Box v={m} label={lb.m} />
                            <Box v={s} label={lb.s} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontWeight: 700, marginBottom: 14, color: '#ffe38a' }}>{lb.now}</p>
                        <button type="button" onClick={() => window.location.reload()} style={{ background: '#f2b705', color: '#2a1a00', fontWeight: 800, padding: '12px 28px', borderRadius: 12 }}>{lb.reload}</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Maintenance;
