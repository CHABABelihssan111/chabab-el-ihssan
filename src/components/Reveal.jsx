import { useEffect } from 'react';

// Animations du site : apparition des sections + cartes en cascade + barre de progression du défilement.
// Aucun élément déjà visible n'est caché, et les classes sont retirées après l'animation.
const CSS = `
.rv{opacity:0;transform:translateY(32px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1);will-change:opacity,transform}
.rv.rv-l{transform:translate3d(-40px,0,0)}
.rv.rv-r{transform:translate3d(40px,0,0)}
.rv.rv-s{transform:scale(.92)}
@media (max-width:1023px){.rv.rv-l,.rv.rv-r{transform:translate3d(0,28px,0)}}
.rv.rv-in{opacity:1;transform:none}
#scroll-bar{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#f2b705,#c8102e);z-index:400;pointer-events:none}
.btn-brand,.btn-brand-light{transition:transform .2s ease,box-shadow .2s ease}
.btn-brand:hover,.btn-brand-light:hover{transform:translateY(-2px) scale(1.03)}
@keyframes cei-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
header img[src*="logo"],.logo-glow{animation:cei-float 4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.rv{opacity:1!important;transform:none!important;transition:none}#scroll-bar{display:none}header img[src*="logo"]{animation:none}}
`;

const Reveal = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);

        const bar = document.createElement('div');
        bar.id = 'scroll-bar';
        document.body.appendChild(bar);
        const onScroll = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (!en.isIntersecting) return;
                const el = en.target;
                io.unobserve(el);
                setTimeout(() => el.classList.add('rv-in'), Number(el.dataset.rvd || 0));
                // on rend l'élément à son état normal après l'animation (garde les effets hover d'origine)
                setTimeout(() => el.classList.remove('rv', 'rv-l', 'rv-r', 'rv-s', 'rv-in'), Number(el.dataset.rvd || 0) + 1100);
            });
        }, { threshold: 0.08 });

        const hidden = (el) => el.getBoundingClientRect().top >= window.innerHeight * 0.9;
        const prep = (el, cls, delay) => {
            el.setAttribute('data-rv', '1');
            if (!hidden(el)) return;
            el.classList.add('rv');
            if (cls) el.classList.add(cls);
            el.dataset.rvd = String(delay);
            io.observe(el);
        };

        const scan = () => {
            document.querySelectorAll('main section:not([data-rv])').forEach((sec) => {
                prep(sec, '', 0);
                // cartes / éléments des grilles : cascade + alternance gauche/droite
                sec.querySelectorAll('.grid > *:not([data-rv]), .flex-wrap > *:not([data-rv])').forEach((c, i) => {
                    prep(c, i % 3 === 0 ? 'rv-l' : i % 3 === 1 ? 'rv-s' : 'rv-r', Math.min(i, 8) * 90);
                });
            });
        };
        scan();
        const mo = new MutationObserver(scan);
        mo.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });

        return () => {
            mo.disconnect(); io.disconnect(); style.remove(); bar.remove();
            window.removeEventListener('scroll', onScroll);
        };
    }, []);
    return null;
};

export default Reveal;
