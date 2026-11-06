/* Home page: project grid + filters, R&D cards, scroll-spy */
(function () {
    const data = window.CC || { projects: [], categories: [] };
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

    // ---- Client projects ----
    const grid = document.getElementById('project-grid');
    const filters = document.getElementById('project-filters');
    const clients = data.projects.filter(p => p.type === 'client');

    if (grid) {
        grid.innerHTML = clients.map(p => `
            <a class="project-card reveal" href="project.html?project=${p.key}" data-cats="${(p.cats || []).join(' ')}">
                <div class="project-cover${p.coverFit === 'contain' ? ' contain' : ''}">
                    <img src="${p.cover}" alt="${esc(p.coverAlt || p.title)}" loading="lazy" decoding="async">
                    <span class="badge">${esc(p.domain)}</span>
                </div>
                <div class="project-body">
                    <div class="project-client"><span>${esc(p.client)}</span><span class="sep"></span><span>${esc(p.periodShort || p.period)}</span></div>
                    <h3>${esc(p.cardTitle || p.title)}</h3>
                    <p>${esc(p.card || p.summary)}</p>
                    ${(p.kpis && p.kpis.length) ? `<div class="project-kpis">${p.kpis.slice(0, 2).map(k => `<div><b>${k.v}</b>${esc(k.l)}</div>`).join('')}</div>` : ''}
                    <div class="project-tags">${(p.tags || []).slice(0, 4).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
                    <span class="project-more">자세히 보기 ${arrow}</span>
                </div>
            </a>`).join('');
    }

    if (filters) {
        const cats = [{ key: 'all', label: '전체' }, ...data.categories];
        filters.innerHTML = cats.map((c, i) => {
            const n = c.key === 'all' ? clients.length : clients.filter(p => (p.cats || []).includes(c.key)).length;
            return n ? `<button class="filter${i === 0 ? ' active' : ''}" data-cat="${c.key}">${esc(c.label)}<span class="count">${n}</span></button>` : '';
        }).join('');
        filters.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter');
            if (!btn) return;
            filters.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === btn));
            const cat = btn.dataset.cat;
            grid.querySelectorAll('.project-card').forEach(card => {
                card.hidden = !(cat === 'all' || card.dataset.cats.split(' ').includes(cat));
            });
        });
    }

    // ---- R&D (all cards the same size: R&D first, then Lab) ----
    const rnd = data.projects.filter(p => p.type === 'rnd');
    const ordered = rnd.filter(p => !p.key.startsWith('lab-')).concat(rnd.filter(p => p.key.startsWith('lab-')));
    const featureEl = document.getElementById('rnd-feature');
    const rndGrid = document.getElementById('rnd-grid');
    if (featureEl) featureEl.remove();
    if (rndGrid) {
        rndGrid.innerHTML = ordered.map(p => `
            <a class="rnd-card reveal" href="project.html?project=${p.key}">
                <div class="thumb"><img src="${p.cover}" alt="${esc(p.coverAlt || p.title)}" loading="lazy"></div>
                <div class="body">
                    <span class="meta">${esc(p.periodShort || p.period)} · ${esc(p.domain)}</span>
                    <h4>${esc(p.cardTitle || p.title)}</h4>
                    <p>${esc(p.card || p.summary)}</p>
                    <div class="chips">${(p.tags || []).slice(0, 4).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
                </div>
            </a>`).join('');
    }

    // ---- Hero stat count-up ----
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
        document.querySelectorAll('.hero-stat .num').forEach(el => {
            const node = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
            if (!node) return;
            const target = parseInt(node.textContent.replace(/[^\d]/g, ''), 10);
            if (!target) return;
            const t0 = performance.now(), dur = 1300;
            const tick = now => {
                const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
                node.textContent = Math.round(target * e).toLocaleString('ko-KR');
                if (k < 1) requestAnimationFrame(tick);
            };
            const final = target.toLocaleString('ko-KR');
            node.textContent = '0';
            requestAnimationFrame(tick);
            setTimeout(() => { node.textContent = final; }, dur + 400);
        });
    }

    window.CCReveal && window.CCReveal();

    // ---- Scroll-spy for nav ----
    const links = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id && !a.classList.contains('nav-cta')));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(s => spy.observe(s));
    }
})();
