import React, { useEffect, useRef } from 'react';

// Fine barre dorée de progression de lecture (transform uniquement : très léger).
const ScrollProgress = () => {
    const ref = useRef(null);
    useEffect(() => {
        let raf = 0;
        const upd = () => {
            raf = 0;
            const h = document.documentElement.scrollHeight - window.innerHeight;
            if (ref.current) ref.current.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
        };
        const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
        upd(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
        return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
    }, []);
    return <div className="scroll-progress" aria-hidden="true"><i ref={ref} /></div>;
};

export default ScrollProgress;
