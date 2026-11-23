import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// إحصائيات زيارات بدون كوكيز: لا IP ولا هوية. تُرسل: الصفحة، المصدر (referrer أو وسم ?src=)، المنطقة الزمنية، عرض الشاشة، جديد/عائد، ومدة البقاء.
const send = (params) => {
    const body = new URLSearchParams(params);
    try {
        if (!(navigator.sendBeacon && navigator.sendBeacon('/stats/hit.php', body))) {
            fetch('/stats/hit.php', { method: 'POST', body, keepalive: true }).catch(() => {});
        }
    } catch { /* ignore */ }
};

const Tracker = () => {
    const { pathname } = useLocation();
    const t0 = useRef(Date.now());

    useEffect(() => {
        if (!import.meta.env.PROD) return;
        let isVisit = '0';
        const q = new URLSearchParams(window.location.search);
        const p = { p: pathname };
        try {
            if (!sessionStorage.getItem('cei_v')) {
                sessionStorage.setItem('cei_v', '1'); isVisit = '1';
                let ref = '';
                try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* ignore */ }
                const src = q.get('src') || q.get('utm_source') || q.get('ref') || '';
                sessionStorage.setItem('cei_src', JSON.stringify({ r: ref, s: src, c: q.get('utm_campaign') || q.get('c') || '' }));
                let isNew = '1';
                try { if (localStorage.getItem('cei_seen')) isNew = '0'; else localStorage.setItem('cei_seen', '1'); } catch { /* ignore */ }
                Object.assign(p, { n: isNew, r: ref, s: src, c: q.get('utm_campaign') || q.get('c') || '', z: Intl.DateTimeFormat().resolvedOptions().timeZone || '', w: window.innerWidth });
            }
        } catch { /* stockage indisponible */ }
        send({ ...p, v: isVisit });
    }, [pathname]);

    useEffect(() => {
        if (!import.meta.env.PROD) return;
        const end = () => {
            const s = Math.round((Date.now() - t0.current) / 1000);
            if (s >= 2) { send({ e: '1', t: String(s) }); t0.current = Date.now(); }
        };
        const onVis = () => { if (document.visibilityState === 'hidden') end(); };
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);
    return null;
};

export default Tracker;
