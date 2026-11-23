import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// إحصائيات زيارات بدون كوكيز: يرسل إشارة صغيرة عند كل صفحة (بدون IP ولا هوية).
const Tracker = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        if (!import.meta.env.PROD) return;
        let isVisit = '0';
        try {
            if (!sessionStorage.getItem('cei_v')) { sessionStorage.setItem('cei_v', '1'); isVisit = '1'; }
        } catch { /* stockage indisponible */ }
        const body = new URLSearchParams({ v: isVisit, p: pathname });
        try {
            if (!(navigator.sendBeacon && navigator.sendBeacon('/stats/hit.php', body))) {
                fetch('/stats/hit.php', { method: 'POST', body, keepalive: true }).catch(() => {});
            }
        } catch { /* ignore */ }
    }, [pathname]);
    return null;
};

export default Tracker;
