/* Shared behaviour: header, mobile nav, reveal-on-scroll, lightbox */
(function () {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');

    if (header && !header.classList.contains('is-solid')) {
        const onScroll = () => header.classList.toggle('is-light', window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }));
    }

    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

    // Reveal on scroll
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }) : null;

    window.CCReveal = function (root) {
        (root || document).querySelectorAll('.reveal:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));
    };
    window.CCReveal();

    // Lightbox for figure images
    const lb = document.getElementById('lightbox');
    if (lb) {
        const img = lb.querySelector('img');
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.fig .frame img');
            if (!target) return;
            img.src = target.currentSrc || target.src;
            img.alt = target.alt || '';
            lb.classList.add('open');
        });
        lb.addEventListener('click', () => lb.classList.remove('open'));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.classList.remove('open'); });
    }
})();
