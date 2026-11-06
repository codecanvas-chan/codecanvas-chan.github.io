/* Project detail page: metadata from js/data.js + body from projects/*.md */
(function () {
    const app = document.getElementById('app');
    const params = new URLSearchParams(location.search);
    const key = params.get('project');
    const all = (window.CC && window.CC.projects) || [];
    const p = all.find(x => x.key === key);

    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const slug = (s, i) => 'sec-' + i + '-' + s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 40);

    function fail(msg) {
        app.innerHTML = `<div class="state"><p>${esc(msg)}</p><p style="margin-top:1.5rem"><a class="btn btn-outline" href="index.html#projects">프로젝트 목록으로</a></p></div>`;
    }

    if (!p) { fail('프로젝트를 찾을 수 없습니다.'); return; }

    document.title = `${p.title} — 코드캔버스 CodeCanvas`;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', p.summary);

    const listLabel = p.type === 'rnd' ? 'R&D' : 'Projects';
    const listHref = p.type === 'rnd' ? 'index.html#rnd' : 'index.html#projects';
    const meta = [
        [p.type === 'rnd' ? 'Type' : 'Client', p.client],
        ['Period', p.period],
        ['Role', p.role],
        ['Platform', p.platform],
    ].filter(m => m[1]);

    const kpis = (p.kpis || []).slice(0, 4);
    const siblings = all.filter(x => x.type === p.type);
    const idx = siblings.indexOf(p);
    const prev = siblings[(idx - 1 + siblings.length) % siblings.length];
    const next = siblings[(idx + 1) % siblings.length];

    app.innerHTML = `
        <section class="p-hero">
            <div class="container">
                <nav class="crumbs" aria-label="breadcrumb">
                    <a href="index.html">Home</a>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
                    <a href="${listHref}">${listLabel}</a>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
                    <span>${esc(p.domain)}</span>
                </nav>
                <div class="badge-row">
                    <span class="badge">${esc(p.domain)}</span>
                    ${(p.badges || []).map(b => `<span class="badge alt">${esc(b)}</span>`).join('')}
                </div>
                <h1>${esc(p.title)}</h1>
                <p class="summary">${esc(p.summary)}</p>
                <dl class="p-meta">
                    ${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
                </dl>
            </div>
        </section>
        ${kpis.length ? `<section class="p-kpis"><div class="container">
            ${kpis.map(k => `<div class="p-kpi"><b>${k.v}</b><span>${esc(k.l)}</span></div>`).join('')}
        </div></section>` : ''}
        <div class="container p-layout">
            <aside class="toc" aria-label="목차">
                <h5>Contents</h5>
                <nav id="toc"></nav>
                <div class="tags">${(p.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
            </aside>
            <article class="prose" id="content"><p class="state" style="padding:40px 0">본문을 불러오는 중…</p></article>
        </div>
        ${siblings.length > 1 ? `<nav class="p-nav" aria-label="다른 프로젝트"><div class="container">
            <a class="prev" href="project.html?project=${prev.key}"><span>← Previous</span><b>${esc(prev.cardTitle || prev.title)}</b></a>
            <a class="next" href="project.html?project=${next.key}"><span>Next →</span><b>${esc(next.cardTitle || next.title)}</b></a>
        </div></nav>` : ''}
    `;

    const content = document.getElementById('content');
    const toc = document.getElementById('toc');

    fetch(p.md, { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(text => {
            content.innerHTML = marked.parse(text, { gfm: true, breaks: false });

            content.querySelectorAll('table').forEach(t => {
                if (t.parentElement.classList.contains('table-wrap')) return;
                const w = document.createElement('div');
                w.className = 'table-wrap';
                t.replaceWith(w); w.appendChild(t);
            });
            content.querySelectorAll('img').forEach(img => { img.loading = 'lazy'; img.decoding = 'async'; });

            const heads = [...content.querySelectorAll('h2')];
            heads.forEach((h, i) => { h.id = slug(h.textContent, i); });
            toc.innerHTML = heads.map(h => `<a href="#${h.id}">${esc(h.textContent)}</a>`).join('');

            if ('IntersectionObserver' in window && heads.length) {
                const links = [...toc.querySelectorAll('a')];
                const spy = new IntersectionObserver(entries => {
                    entries.forEach(e => {
                        if (!e.isIntersecting) return;
                        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
                    });
                }, { rootMargin: '-20% 0px -70% 0px' });
                heads.forEach(h => spy.observe(h));
            }

            if (location.hash) {
                const t = document.getElementById(location.hash.slice(1));
                if (t) t.scrollIntoView();
            }
        })
        .catch(err => { content.innerHTML = `<p class="state">본문을 불러오지 못했습니다 (${esc(err.message)}).</p>`; });
})();
