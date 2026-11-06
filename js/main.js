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

    // ---- R&D ----
    const rnd = data.projects.filter(p => p.type === 'rnd');
    const featureEl = document.getElementById('rnd-feature');
    const rndGrid = document.getElementById('rnd-grid');
    const feat = rnd.find(p => p.featured) || rnd[0];

    if (featureEl && feat) {
        featureEl.innerHTML = `
            <div class="media"><img src="${feat.cover}" alt="${esc(feat.coverAlt || feat.title)}" loading="lazy"></div>
            <div class="content">
                <span class="eyebrow">Featured R&amp;D · ${esc(feat.periodShort || feat.period)}</span>
                <h3>${esc(feat.title)}</h3>
                <p>${esc(feat.card || feat.summary)}</p>
                <div class="rnd-metrics">${(feat.kpis || []).slice(0, 3).map(k => `<div><b>${k.v}</b><span>${esc(k.l)}</span></div>`).join('')}</div>
                <div class="chips">${(feat.tags || []).slice(0, 7).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
                <a class="btn btn-primary" href="project.html?project=${feat.key}">기술 상세 보기 ${arrow}</a>
            </div>`;
    }
    if (rndGrid) {
        rndGrid.innerHTML = rnd.filter(p => p !== feat).map(p => `
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
