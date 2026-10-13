(function () {
  'use strict';
  function start(D) {
  const MAX = 70;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // ---------- Estado (URL hash > localStorage > padrão) ----------
  const store = {
    get(k) { try { return localStorage.getItem('nin:' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('nin:' + k, v); } catch (e) { /* sem storage */ } }
  };
  const hash = new URLSearchParams(location.hash.slice(1));
  const pick = (val, valid, fallback) => (val && valid.includes(val) ? val : fallback);
  const navLang = (navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';

  const state = {
    lang: pick(hash.get('lang') || store.get('lang'), ['pt', 'en'], navLang),
    village: pick(hash.get('v') || store.get('village'), Object.keys(D.VILLAGES), 'sand'),
    mastery: pick(hash.get('m') || store.get('mastery'), Object.keys(D.MASTERIES), 'fire'),
    level: Math.max(0, Math.min(MAX, parseInt(hash.get('lv'), 10) || 0))
  };

  function set(patch) {
    Object.assign(state, patch);
    store.set('lang', state.lang);
    store.set('village', state.village);
    store.set('mastery', state.mastery);
    const p = new URLSearchParams({ v: state.village, m: state.mastery, lang: state.lang });
    if (state.level > 0) p.set('lv', state.level);
    history.replaceState(null, '', '#' + p.toString());
    if (state.level <= 0) sheetOpen = false;
    update();
  }
  const setLv = (n) => set({ level: Math.max(1, Math.min(MAX, n)) });

  // ---------- Helpers ----------
  const issueUrl = (fields) => {
    const p = new URLSearchParams({ template: 'correcao.yml', ...fields });
    return `https://github.com/${D.config.repo}/issues/new?${p.toString()}`;
  };
  const posOf = (n) => `${(((n - 0.5) / MAX) * 100).toFixed(3)}%`;
  const bracketOf = (lv) => D.BRACKETS.find((b) => lv >= b.from && lv <= b.to);

  // ---------- Elementos estáticos (criados uma vez) ----------
  const villageBtns = Object.keys(D.VILLAGES).map((k) => {
    const v = D.VILLAGES[k];
    const b = el('button', 'vbtn');
    b.type = 'button';
    b.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${v.d}"/></svg>`;
    b.append(v.name);
    b.addEventListener('click', () => set({ village: k }));
    $('villages').append(b);
    return { k, b, svg: b.querySelector('svg') };
  });

  const masteryBtns = Object.keys(D.MASTERIES).map((k) => {
    const m = D.MASTERIES[k];
    const b = el('button', 'mbtn');
    b.type = 'button';
    const dot = el('i');
    dot.style.background = m.color;
    b.append(dot, m.name);
    b.addEventListener('click', () => set({ mastery: k }));
    $('masteries').append(b);
    return { k, b };
  });

  const bracketBtns = D.BRACKETS.map((br) => {
    const b = el('button', 'bbtn');
    b.type = 'button';
    b.style.flexGrow = br.to - br.from + 1;
    const label = el('span');
    const line = el('i');
    b.append(label, line);
    b.addEventListener('click', () => setLv(br.from));
    $('brackets').append(b);
    return { br, b, label, line };
  });

  D.TICKS.forEach((n) => {
    const t = el('div', 'tick');
    t.style.bottom = posOf(n);
    $('ticks').append(t);
  });

  const msBtns = D.BAR_MILESTONES.map((n) => {
    const b = el('button', 'msbtn');
    b.type = 'button';
    b.style.bottom = posOf(n);
    const num = el('b', null, n);
    const name = el('span');
    b.append(el('i'), num, name);
    b.addEventListener('click', () => setLv(n));
    $('milestones').append(b);
    return { n, b, num, name };
  });

  document.querySelectorAll('.flag').forEach((f) =>
    f.addEventListener('click', () => set({ lang: f.dataset.lang })));

  const range = $('range');
  range.addEventListener('input', () => setLv(Number(range.value)));
  $('close').addEventListener('click', () => set({ level: 0 }));
  $('prev').addEventListener('click', () => setLv(state.level - 1));
  $('next').addEventListener('click', () => setLv(state.level + 1));

  // ---------- Render ----------
  function render() {
    const EN = state.lang === 'en';
    const t = D.I18N[state.lang];
    const MS = D.MILESTONES[state.lang];
    const vk = state.village, mk = state.mastery, lv = state.level;
    const vill = D.VILLAGES[vk], mast = D.MASTERIES[mk];
    const tagOf = (b) => (EN ? D.TAG_EN[b.tag] || b.tag : b.tag);
    const tr = (s) => (EN ? D.TEXT_EN[s] || s : s);
    const pickSet = (s) => (s ? s[vk] || s.all : null);
    const spotFor = (b) => (mast.phys && b.phys ? pickSet(b.phys) : null) || pickSet(b.main);

    document.documentElement.lang = EN ? 'en' : 'pt-BR';
    document.title = `Nin Help — ${t.title}`;
    document.querySelectorAll('[data-t]').forEach((n) => { n.textContent = t[n.dataset.t]; });
    $('lang-group').setAttribute('aria-label', t.lang);
    $('close').setAttribute('aria-label', t.close);
    document.querySelectorAll('.flag').forEach((f) =>
      f.setAttribute('aria-pressed', String(f.dataset.lang === state.lang)));

    villageBtns.forEach(({ k, b, svg }) => {
      const on = k === vk;
      b.setAttribute('aria-pressed', String(on));
      svg.setAttribute('stroke', on ? D.VILLAGES[k].color : D.VILLAGES[k].ink);
    });
    masteryBtns.forEach(({ k, b }) => b.setAttribute('aria-pressed', String(k === mk)));

    // Trilha
    const curB = lv > 0 ? bracketOf(lv) : null;
    $('caption').textContent = curB
      ? (EN ? `Level ${lv} of ${MAX} · ${tagOf(curB)}` : `Nível ${lv} de ${MAX} · ${tagOf(curB)}`)
      : (EN ? 'Slide along the path or click a range' : 'Deslize pela trilha ou clique em uma faixa');

    bracketBtns.forEach(({ br, b, label, line }) => {
      const on = curB === br, done = lv > br.to;
      label.textContent = tagOf(br);
      b.title = `${EN ? 'Lv' : 'Nv'} ${br.from}–${br.to}`;
      b.setAttribute('aria-label', `${tagOf(br)}, ${t.level} ${br.from}–${br.to}`);
      b.style.color = on ? '#8a1f12' : '#6a4a24';
      line.style.borderColor = on ? '#b8321f' : done ? vill.ink : '#c4ad78';
    });

    const fill = $('fill');
    fill.style.height = `calc(${lv > 0 ? posOf(lv) : '0%'} + 10px)`;
    fill.style.background = vill.color;

    $('seal').hidden = lv <= 0;
    $('seal').style.bottom = lv > 0 ? posOf(lv) : '0%';
    $('seal-lv').textContent = lv;

    range.value = lv > 0 ? lv : 1;
    range.setAttribute('aria-label', t.selectLevel);
    range.setAttribute('aria-valuetext', `${t.level} ${lv > 0 ? lv : 1}`);

    msBtns.forEach(({ n, num, name }) => {
      name.textContent = MS[n];
      num.style.color = lv >= n ? '#2f6a17' : '#8a3a12';
    });

    // Painel de detalhes
    const details = $('details');
    details.hidden = lv <= 0;
    if (lv <= 0) return;
    details.setAttribute('aria-label', `${t.details} ${lv}`);

    const br = curB;
    $('d-level').textContent = lv;
    $('d-tag').textContent = tagOf(br);
    $('d-range').textContent = `${t.range} ${br.from}–${br.to} · ${EN ? D.PARTY_EN[br.party] || br.party : br.party}`;
    $('prev').disabled = lv <= 1;
    $('next').disabled = lv >= MAX;

    const raw = spotFor(br);
    $('s-mob').textContent = tr(raw[0]);
    $('s-zone').textContent = tr(raw[1]);
    $('s-how').textContent = tr(raw[2]);
    $('d-peek').textContent = `${tr(raw[0])} · ${tr(raw[1])}`;

    let altRaw = pickSet(br.alt);
    if (mast.phys && br.phys) altRaw = pickSet(br.main);
    if (altRaw && altRaw[0] === raw[0]) altRaw = null;
    $('alt').hidden = !altRaw;
    if (altRaw) { $('alt-mob').textContent = tr(altRaw[0]); $('alt-zone').textContent = tr(altRaw[1]); }

    const mapLink = $('map-link');
    mapLink.hidden = !D.config.mapUrl;
    if (D.config.mapUrl) mapLink.href = D.config.mapUrl;

    const altLine = altRaw ? `\nAlternativa: ${altRaw[0]} — ${altRaw[1]}` : '';
    $('suggest').href = issueUrl({
      title: `[Correção] Nível ${lv} · ${vill.name} · ${mast.name}`,
      nivel: String(lv), vila: vill.name, maestria: mast.name,
      atual: `Faixa: ${br.tag} (${br.from}–${br.to}) · ${br.party}\nOnde farmar: ${raw[0]} — ${raw[1]}\nDica: ${raw[2]}${altLine}`
    });

    // Missões
    const forV = D.MISSIONS.filter((m) => !m.v || m.v === vk);
    const now = forV.filter((m) => m.lv <= lv && m.lv >= Math.max(1, br.from - 4));
    const soon = forV.filter((m) => m.lv > lv).slice(0, 3);
    const lvTag = EN ? 'Lv' : 'Nv';

    // Nome da missão vira link para a wiki quando há página (por vila ou geral)
    const mName = (m, cls) => {
      const page = typeof m.wiki === 'string' ? m.wiki : m.wiki && m.wiki[vk];
      if (!page) return el('span', cls, tr(m.name));
      const a = el('a', `${cls} m-wiki`, tr(m.name));
      a.href = D.config.wikiBase + encodeURIComponent(page.replace(/ /g, '_'));
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = `Wiki: ${page}`;
      return a;
    };

    $('m-now').replaceChildren(...now.map((m) => {
      const row = el('div', 'm-row');
      row.append(el('span', 'm-lv', `${lvTag} ${m.lv}`), mName(m, 'm-name'));
      if (m.lv === lv) row.append(el('span', 'm-new', t.isNew));
      return row;
    }));
    $('m-none').hidden = now.length > 0;
    $('m-soon').replaceChildren(...soon.map((m) => {
      const row = el('div', 'm-row');
      row.append(el('span', 'm-lv out', `${lvTag} ${m.lv}`), mName(m, 'm-name muted'));
      return row;
    }));

    // Diárias liberadas neste nível, da que paga mais para a que paga menos; as "evite" vão para o fim
    const num = (n) => n.toLocaleString(EN ? 'en-US' : 'pt-BR');
    const topXp = (d) => (Array.isArray(d.xp) ? d.xp[1] : d.xp);
    const daily = D.DAILIES
      .filter((d) => d.v.includes(vk) && d.from <= lv && lv <= (d.to || MAX))
      .sort((a, b) => (a.verdict === 'avoid') - (b.verdict === 'avoid') || topXp(b) - topXp(a));
    const dlNote = vk === 'rogue' ? t.dailiesRogue
      : [lv < 15 && t.dailiesEarly, lv < 36 && t.dailiesReset].filter(Boolean).join(' ');
    $('dl-note').textContent = dlNote;
    $('dl-note').hidden = !dlNote;
    $('dl-list').replaceChildren(...daily.map((d) => {
      const card = el('div', 'dl-card');
      const head = el('div', 'dl-head');
      head.append(mName(d, 'm-name dl-name'));
      if (d.verdict) head.append(el('span', `dl-verdict ${d.verdict}`, d.verdict === 'avoid' ? t.avoid : t.good));
      const xp = Array.isArray(d.xp) ? `${num(d.xp[0])}–${num(d.xp[1])}` : num(d.xp);
      card.append(head, el('div', 'dl-meta', `${lvTag} ${d.from}${d.to ? `–${d.to}` : '+'} · Rank ${d.rank} · ${xp} XP`));
      for (const [k, sign] of [['pros', '+'], ['cons', '−']]) for (const s of d[k] || []) {
        const line = el('div', `dl-${k}`);
        line.append(el('span', 'dl-sign', sign), el('span', null, tr(s)));
        card.append(line);
      }
      if (d.tip) {
        const tip = el('div', 'dl-tip');
        tip.append(el('strong', null, `${t.playerTip} `), document.createTextNode(tr(d.tip)));
        card.append(tip);
      }
      return card;
    }));
    $('dl-none').hidden = daily.length > 0 || !!dlNote;

    // Build
    $('b-dot').style.background = mast.color;
    $('b-name').textContent = mast.name;
    $('b-village').textContent = `· ${vill.name}`;
    $('b-stat').textContent = mast.stat;
    $('b-tip').textContent = EN ? mast.tipEn : mast.tip;
    $('v-name').textContent = `${vill.name}:`;
    $('v-name').style.color = vill.color;
    $('v-note').textContent = EN ? vill.noteEn : vill.note;

    const sec = D.SECOND[vk];
    let note;
    if (lv < 10) note = EN
      ? 'Your 1st mastery is chosen at level 10. Until then, put points into Agility and a little HP.'
      : 'A 1ª maestria é escolhida no nível 10. Até lá, distribua pontos em Agility e um pouco de HP.';
    else if (lv >= 13 && lv <= 20) note = mast.stat === 'Chakra'
      ? (EN ? 'Medic build (Chakra): soloing is tough; level with a kunai on the melee route (village beasts and Snakes), and a team helps a lot.' : 'Build de médico (Chakra): solar é difícil; upe com kunai na rota corpo a corpo (feras da vila e Snakes), e um time ajuda muito.')
      : mast.phys
      ? (EN ? `Physical build (${mast.stat}): follow the melee route (village beasts and Snakes) in this range.` : `Build física (${mast.stat}): segue a rota corpo a corpo (feras da vila e Snakes) nesta faixa.`)
      : (EN ? 'Intelligence build: from level 16, take your village’s INT route.' : 'Build de Intelligence: a partir do 16 vale a rota INT da sua vila.');
    else if (!sec) note = lv >= 50
      ? (EN ? '2nd mastery unlocked.' : '2ª maestria liberada.')
      : (EN ? 'You choose your 2nd mastery at level 50.' : 'No nível 50 você escolhe a 2ª maestria.');
    else if (lv >= 50) note = EN
      ? `2nd mastery unlocked. ${vill.name} exclusive: ${sec[1]} (${D.MASTERIES[sec[0]].name} path).`
      : `2ª maestria liberada. Exclusivo de ${vill.name}: ${sec[1]} (caminho ${D.MASTERIES[sec[0]].name}).`;
    else note = EN
      ? `You choose your 2nd mastery at level 50. ${vill.name} has access to the exclusive ${sec[1]} path.`
      : `No nível 50 você escolhe a 2ª maestria. ${vill.name} tem acesso ao caminho exclusivo ${sec[1]}.`;
    $('b-note').textContent = note;

    // Próximo marco
    const nextLv = Object.keys(MS).map(Number).find((m) => m > lv);
    const gap = nextLv ? nextLv - lv : 0;
    $('next-text').textContent = nextLv
      ? (EN ? `Next milestone: ${MS[nextLv]} in ${gap} level${gap > 1 ? 's' : ''}` : `Próximo marco: ${MS[nextLv]} em ${gap} níve${gap > 1 ? 'is' : 'l'}`)
      : (EN ? 'Max level reached' : 'Nível máximo alcançado');
  }

  // ---------- Gaveta no celular ----------
  const sheetMQ = window.matchMedia('(max-width: 1000px)');
  let sheetOpen = false;
  const details = $('details'), backdrop = $('backdrop'), toggle = $('sheet-toggle');
  const sheetBody = () => details.querySelectorAll('.d-nav, .d-sec, .next-box, .suggest-link');

  function applySheet() {
    const isSheet = sheetMQ.matches && state.level > 0;
    const open = isSheet && sheetOpen;
    const EN = state.lang === 'en';
    document.body.classList.toggle('has-sheet', isSheet);
    details.classList.toggle('open', open);
    backdrop.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open
      ? (EN ? 'Collapse details' : 'Recolher detalhes')
      : (EN ? 'Expand details' : 'Expandir detalhes'));
    sheetBody().forEach((n) => { n.inert = isSheet && !open; });
    if (!open) details.scrollTop = 0;
  }
  function setSheet(open) { sheetOpen = open; applySheet(); }
  function update() { render(); applySheet(); }

  toggle.addEventListener('click', () => setSheet(!sheetOpen));
  backdrop.addEventListener('click', () => setSheet(false));
  $('d-head').addEventListener('click', (e) => {
    if (sheetMQ.matches && !e.target.closest('button')) setSheet(!sheetOpen);
  });
  sheetMQ.addEventListener('change', applySheet);

  // Arrastar a gaveta para cima/baixo pelo cabeçalho
  let touchY = null;
  $('d-head').addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  $('d-head').addEventListener('touchend', (e) => {
    if (touchY === null || !sheetMQ.matches) return;
    const dy = e.changedTouches[0].clientY - touchY;
    touchY = null;
    if (dy < -30) setSheet(true);
    else if (dy > 30) setSheet(false);
  });

  // Esc recolhe a gaveta; se já estiver recolhida, fecha o painel
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || state.level <= 0) return;
    if (sheetMQ.matches && sheetOpen) { setSheet(false); toggle.focus(); }
    else set({ level: 0 });
  });

  window.addEventListener('hashchange', () => {
    const h = new URLSearchParams(location.hash.slice(1));
    const n = parseInt(h.get('lv'), 10);
    if (n && n !== state.level) setLv(n);
  });

  $('suggest-general').href = issueUrl({ title: '[Correção] ' });
  update();
  }

  fetch('assets/data.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(start)
    .catch((err) => {
      console.error('Falha ao carregar assets/data.json', err);
      const c = document.getElementById('caption');
      c.textContent = 'Não foi possível carregar os dados do guia. Recarregue a página. (Localmente, rode um servidor: python -m http.server)';
      c.style.color = '#8a1f12';
    });
})();
