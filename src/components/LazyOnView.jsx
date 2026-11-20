import React, { useEffect, useRef, useState, Suspense } from 'react';

// يحمّل المكوّن الثقيل (مثل الخريطة + Leaflet) فقط عندما يقترب من الشاشة.
// الحاوية تحتفظ بنفس الحجم، فلا يتغيّر التصميم.
const LazyOnView = ({ children, rootMargin = '400px', className = '', style }) => {
    const ref = useRef(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (show) return undefined;
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            const id = setTimeout(() => setShow(true), 0);
            return () => clearTimeout(id);
        }
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) { setShow(true); io.disconnect(); }
        }, { rootMargin });
        io.observe(el);
        return () => io.disconnect();
    }, [show, rootMargin]);

    const placeholder = <div className="w-full h-full bg-gray-200 dark:bg-gray-600" />;
    return (
        <div ref={ref} className={className} style={{ height: '100%', width: '100%', ...style }}>
            {show ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}
        </div>
    );
};

export default LazyOnView;
