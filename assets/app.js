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

  // Maestria exclusiva (Gentle Fist, Fan, Bubble) só vale na vila dela; fora dela, volta para a base
  const availFor = (mk, vk) => !D.MASTERIES[mk].v || D.MASTERIES[mk].v.includes(vk);
  const fixMastery = (mk, vk) => (availFor(mk, vk) ? mk : D.MASTERIES[mk].base || 'fire');

  const state = {
    lang: pick(hash.get('lang') || store.get('lang'), ['pt', 'en'], navLang),
    village: pick(hash.get('v') || store.get('village'), Object.keys(D.VILLAGES), 'sand'),
    mastery: pick(hash.get('m') || store.get('mastery'), Object.keys(D.MASTERIES), 'fire'),
    level: Math.max(0, Math.min(MAX, parseInt(hash.get('lv'), 10) || 0))
  };
  state.mastery = fixMastery(state.mastery, state.village);
  if (hash.has('m') && hash.get('m') !== state.mastery) {
    hash.set('m', state.mastery);
    history.replaceState(null, '', '#' + hash.toString());
  }

  function set(patch) {
    Object.assign(state, patch);
    state.mastery = fixMastery(state.mastery, state.village);
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

  // ---------- Abas do painel e checklist de missões ----------
  const TABS = ['farm', 'missions', 'dailies', 'bosses', 'build'];
  let tab = TABS.includes(store.get('tab')) ? store.get('tab') : 'farm';
  function showTab(k) {
    tab = k;
    for (const x of TABS) {
      const on = x === k;
      const b = document.getElementById('tab-' + x);
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      document.getElementById('tp-' + x).hidden = !on;
    }
  }
  TABS.forEach((k, i) => {
    const b = document.getElementById('tab-' + k);
    b.addEventListener('click', () => { store.set('tab', k); showTab(k); });
    b.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: TABS.length - 1 - i }[e.key];
      if (d === undefined) return;
      e.preventDefault();
      const n = TABS[(i + d + TABS.length) % TABS.length];
      store.set('tab', n);
      showTab(n);
      document.getElementById('tab-' + n).focus();
    });
  });

  const missionKey = (m) => `${m.lv}|${m.name}`;
  const done = new Set((() => { try { return JSON.parse(store.get('done') || '[]'); } catch (e) { return []; } })());
  let hideDone = store.get('hideDone') === '1';
  document.getElementById('m-hide').addEventListener('change', (e) => {
    hideDone = e.target.checked;
    store.set('hideDone', hideDone ? '1' : '0');
    update();
  });

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
    renderIntro();
    $('lang-group').setAttribute('aria-label', t.lang);
    $('close').setAttribute('aria-label', t.close);
    document.querySelectorAll('.flag').forEach((f) =>
      f.setAttribute('aria-pressed', String(f.dataset.lang === state.lang)));

    villageBtns.forEach(({ k, b, svg }) => {
      const on = k === vk;
      b.setAttribute('aria-pressed', String(on));
      svg.setAttribute('stroke', on ? D.VILLAGES[k].color : D.VILLAGES[k].ink);
    });
    masteryBtns.forEach(({ k, b }) => {
      b.setAttribute('aria-pressed', String(k === mk));
      b.hidden = !availFor(k, vk);
    });

    // Sobre a vila: passiva, organização exclusiva, invocações e clãs
    $('vinfo-sum').textContent = `${t.vinfo}: ${vill.name}`;
    $('vinfo-list').replaceChildren(...Object.entries(vill.info || {}).flatMap(([k, s]) => {
      const dd = el('dd');
      const page = vill.infoWiki?.[k];
      if (page) {
        const a = el('a', 'vinfo-wiki', tr(s));
        a.href = D.config.wikiBase + encodeURIComponent(page.replace(/ /g, '_'));
        a.target = '_blank';
        a.rel = 'noopener';
        a.title = `Wiki: ${page}`;
        dd.append(a);
      } else dd.textContent = tr(s);
      return [el('dt', null, t['info_' + k]), dd];
    }));
    $('vinfo-common').hidden = vk === 'rogue';

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

    // Checklist: missões marcadas como feitas ficam salvas no navegador
    const fmt = (str, o) => str.replace(/\{(\w+)\}/g, (_, k) => o[k]);
    const isDone = (m) => done.has(missionKey(m));
    const check = (m) => {
      const c = el('input', 'm-check');
      c.type = 'checkbox';
      c.checked = isDone(m);
      c.setAttribute('aria-label', fmt(t.markDone, { name: tr(m.name) }));
      c.addEventListener('change', () => {
        if (c.checked) done.add(missionKey(m)); else done.delete(missionKey(m));
        store.set('done', JSON.stringify([...done]));
        update();
      });
      return c;
    };
    const showNow = hideDone ? now.filter((m) => !isDone(m)) : now;
    const showSoon = hideDone ? soon.filter((m) => !isDone(m)) : soon;
    $('m-hide').checked = hideDone;
    $('m-count').textContent = now.length ? fmt(t.doneCount, { done: now.filter(isDone).length, total: now.length }) : '';
    $('m-now').replaceChildren(...showNow.map((m) => {
      const row = el('div', 'm-row' + (isDone(m) ? ' done' : ''));
      row.append(check(m), el('span', 'm-lv', `${lvTag} ${m.lv}`), mName(m, 'm-name'));
      if (m.lv === lv) row.append(el('span', 'm-new', t.isNew));
      return row;
    }));
    $('m-none').hidden = showNow.length > 0;
    $('m-soon').replaceChildren(...showSoon.map((m) => {
      const row = el('div', 'm-row' + (isDone(m) ? ' done' : ''));
      row.append(check(m), el('span', 'm-lv out', `${lvTag} ${m.lv}`), mName(m, 'm-name muted'));
      return row;
    }));

    // Diárias liberadas neste nível, da que paga mais para a que paga menos; as "evite" vão para o fim
    const num = (n) => n.toLocaleString(EN ? 'en-US' : 'pt-BR');
    const topXp = (d) => (Array.isArray(d.xp) ? d.xp[1] : d.xp || 0);
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
      const xp = Array.isArray(d.xp) ? `${num(d.xp[0])}–${num(d.xp[1])} XP` : d.xp ? `${num(d.xp)} XP` : t.xpUnknown;
      card.append(head, el('div', 'dl-meta', `${lvTag} ${d.from}${d.to ? `–${d.to}` : '+'} · Rank ${d.rank} · ${xp}`));
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

    // Mobs enfurecidos da vila (até o 22), sem os que ficaram mais de 5 níveis abaixo
    const elites = lv <= 22 ? D.ELITES.filter((e) => e.v.includes(vk) && (!e.lv || e.lv >= lv - 5)) : [];
    $('el-sec').hidden = !elites.length;
    $('el-list').replaceChildren(...elites.map((e) => {
      const card = el('div', 'dl-card');
      const head = el('div', 'dl-head');
      head.append(mName(e, 'm-name dl-name'));
      const stats = e.lv ? `${lvTag} ${e.lv} · ${num(e.xp)} XP` : t.eliteUnknown;
      card.append(head, el('div', 'dl-meta', `${stats} · ${t.eliteOf} ${e.base}`), el('div', 'bs-map', e.map));
      return card;
    }));

    // Chefes de 5 níveis abaixo a 10 acima (em time, a XP só vale até 10 níveis de diferença)
    const bosses = D.BOSSES.filter((b) => b.lv >= lv - 5 && b.lv <= lv + 10);
    $('bs-list').replaceChildren(...bosses.map((b) => {
      const card = el('div', 'dl-card');
      const head = el('div', 'dl-head');
      head.append(mName(b, 'm-name dl-name'));
      if (b.war) head.append(el('span', 'dl-verdict avoid', t.warZone));
      const resp = b.respawn ? ` · ${t.respawn} ${b.respawn} min` : '';
      card.append(head, el('div', 'dl-meta', `${lvTag} ${b.lv} · ${num(b.xp)} XP${resp}`));
      card.append(el('div', 'bs-map', tr(b.map)), el('div', 'bs-note', tr(b.note)));
      return card;
    }));
    $('bs-none').hidden = bosses.length > 0;

    // XP para o próximo nível e comparações com o que o nível oferece
    const need = D.XP_TABLE[lv];
    const pct = (x) => Math.max(1, Math.round((x / need) * 100));
    $('xp-need').textContent = lv >= MAX ? t.xpMax : need ? fmt(t.xpNeed, { xp: num(need), a: lv, b: lv + 1 }) : t.xpNone;
    const cmp = [];
    if (need) {
      const bestDaily = daily.filter((d) => typeof d.xp === 'number' && d.verdict !== 'avoid').sort((a, b) => b.xp - a.xp)[0];
      if (bestDaily) cmp.push(fmt(t.xpDaily, { name: bestDaily.name, pct: pct(bestDaily.xp) }));
      const bestElite = elites.filter((e) => e.xp).sort((a, b) => b.xp - a.xp)[0];
      if (bestElite) cmp.push(fmt(t.xpElite, { name: bestElite.name, n: num(Math.ceil(need / bestElite.xp)) }));
      const bestBoss = bosses.filter((b) => b.lv <= lv + 10).sort((a, b) => b.xp - a.xp)[0];
      if (bestBoss) cmp.push(fmt(t.xpBoss, { name: bestBoss.name, pct: pct(bestBoss.xp) }));
    }
    $('xp-cmp').replaceChildren(...cmp.map((c) => el('p', 'xp-line', c)));

    // Abas: contadores e a aba escolhida
    const counts = { missions: now.length, dailies: daily.length, bosses: bosses.length };
    for (const k of TABS) $('tn-' + k).textContent = counts[k] ? counts[k] : '';
    showTab(tab);

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
    else note = (EN
      ? (lv >= 50 ? '2nd mastery unlocked. ' : 'You choose your 2nd mastery at level 50. ') + `${vill.name} exclusive since level 10: ${sec[1]} (${D.MASTERIES[sec[0]].name} branch, scales with Strength).`
      : (lv >= 50 ? '2ª maestria liberada. ' : 'No nível 50 você escolhe a 2ª maestria. ') + `Exclusiva de ${vill.name} desde o 10: ${sec[1]} (ramo do ${D.MASTERIES[sec[0]].name}, escala com Strength).`);
    $('b-note').textContent = note;

    // Atributos sugeridos: a meta já alcançada (abaixo do 10, nenhuma) e a próxima
    const plan = D.BUILDS[mast.stat] || [];
    const reached = plan.filter((r) => r.lv <= lv);
    const cur = reached[reached.length - 1];
    const next = plan.find((r) => r.lv > lv);
    const statLine = (label, r) => {
      const p = el('p', 'bs-line');
      p.append(el('strong', null, `${label} (${lvTag} ${r.lv}): `), el('span', 'bs-stats', r.stats), document.createTextNode(` — ${tr(r.tip)}`));
      return p;
    };
    $('b-stats').hidden = !plan.length;
    $('b-stats').replaceChildren(...[cur && statLine(t.statsNow, cur), next && statLine(t.statsNext, next), el('p', 'bs-src', t.statsSource)].filter(Boolean));

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

  // ---------- Registro Ninja: escolher vila e maestria antes do pergaminho ----------
  const intro = { step: 0, village: null, mastery: null };
  const STAT_ORDER = ['Intelligence', 'Strength', 'Agility', 'Chakra'];
  const emblem = (v, size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${v.d}"/></svg>`;

  function showIntro(on) {
    $('intro').hidden = !on;
    document.querySelector('main.page').hidden = on;
    document.body.classList.toggle('intro-on', on);
    if (on) { intro.step = 0; renderIntro(); window.scrollTo(0, 0); }
  }
  function leaveIntro(apply) {
    store.set('onboarded', '1');
    showIntro(false);
    if (apply && intro.village && intro.mastery) set({ village: intro.village, mastery: intro.mastery, level: 1 });
    else update();
    window.scrollTo(0, 0);
  }
  function goStep(n) {
    intro.step = n;
    renderIntro();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    $('intro-body').focus({ preventScroll: true });
  }

  function renderIntro() {
    if ($('intro').hidden) return;
    const EN = state.lang === 'en';
    const t = D.I18N[state.lang];
    const tr = (s) => (EN ? D.TEXT_EN[s] || s : s);
    const body = $('intro-body');
    const vk = intro.village, vill = vk && D.VILLAGES[vk];
    document.querySelectorAll('#intro-steps li').forEach((li, i) => {
      li.classList.toggle('on', i === intro.step);
      li.classList.toggle('done', i < intro.step);
    });
    $('intro').style.setProperty('--glow', vill ? vill.color : '#f0a93c');
    $('intro-back').hidden = intro.step === 0;
    const last = intro.step === 2;
    $('intro-next').textContent = last ? t.open : t.introNext;
    $('intro-next').disabled = (intro.step === 0 && !vk) || (intro.step === 1 && !intro.mastery);

    const head = (q, note) => {
      const h = el('div', 'intro-q');
      h.append(el('h2', null, q), el('p', null, note));
      return h;
    };
    const infoList = (v, keys) => {
      const dl = el('dl', 'vc-info');
      for (const k of keys) if (v.info?.[k]) dl.append(el('dt', null, t['info_' + k]), el('dd', null, tr(v.info[k])));
      return dl;
    };

    if (intro.step === 0) {
      const grid = el('div', 'vc-grid');
      for (const k of ['leaf', 'sand', 'mist', 'rogue']) {
        const v = D.VILLAGES[k];
        const b = el('button', `vcard${k === 'rogue' ? ' rogue' : ''}`);
        b.type = 'button';
        b.style.setProperty('--vc', v.color);
        b.setAttribute('aria-pressed', String(k === vk));
        const top = el('div', 'vc-top');
        top.innerHTML = emblem(v, k === 'rogue' ? 30 : 44);
        top.append(el('span', 'vc-name', k === 'rogue' ? t.rogueCard : v.name));
        b.append(top, el('p', 'vc-note', k === 'rogue' ? t.rogueTag : (EN ? v.noteEn : v.note)));
        if (k !== 'rogue') b.append(infoList(v, ['passive', 'mastery', 'org', 'items', 'summons']));
        b.append(el('span', 'hanko', t.chosen));
        b.addEventListener('click', () => {
          intro.village = k;
          if (intro.mastery) intro.mastery = fixMastery(intro.mastery, k);
          renderIntro();
        });
        grid.append(b);
      }
      body.replaceChildren(head(t.askVillage, t.askVillageNote), grid);
    }

    if (intro.step === 1) {
      const groups = el('div', 'mc-groups');
      for (const stat of STAT_ORDER) {
        const keys = Object.keys(D.MASTERIES).filter((k) => D.MASTERIES[k].stat === stat && availFor(k, vk));
        if (!keys.length) continue;
        const g = el('section', 'mc-group');
        g.append(el('h3', null, `${t.scales} ${stat}`));
        const grid = el('div', 'mc-grid');
        for (const k of keys) {
          const m = D.MASTERIES[k];
          const b = el('button', 'mcard');
          b.type = 'button';
          b.style.setProperty('--mc', m.color);
          b.setAttribute('aria-pressed', String(k === intro.mastery));
          const top = el('div', 'mc-top');
          top.append(el('i', 'mc-dot'), el('span', 'mc-name', m.name), el('span', 'mc-route', m.phys ? t.routeMelee : t.routeInt));
          b.append(top, el('p', 'mc-tip', EN ? m.tipEn : m.tip));
          for (const [f, label] of [['pros', t.strong], ['cons', t.weak]]) if (m[f]) {
            const p = el('p', `mc-${f}`);
            p.append(el('b', null, `${label}: `), document.createTextNode(tr(m[f])));
            b.append(p);
          }
          if (m.v) b.append(el('p', 'mc-excl', `${t.unlocks50} · ${t.scales} ${m.stat}`));
          b.append(el('span', 'hanko', t.chosen));
          b.addEventListener('click', () => { intro.mastery = k; renderIntro(); });
          grid.append(b);
        }
        g.append(grid);
        groups.append(g);
      }
      body.replaceChildren(head(t.askMastery, t.askMasteryNote), groups);
    }

    if (last) {
      const m = D.MASTERIES[intro.mastery];
      const sec = D.SECOND[vk];
      const route = (s) => (s ? s[vk] || s.all : null);
      const first = route(D.BRACKETS[0].main);
      const stats10 = (D.BUILDS[m.stat] || []).find((r) => r.lv === 10);
      const card = el('article', 'ficha');
      card.style.setProperty('--vc', vill.color);
      const side = el('div', 'ficha-side');
      side.innerHTML = emblem(vill, 72);
      side.append(el('span', 'ficha-kanji', '忍'));
      const main = el('div', 'ficha-main');
      main.append(el('h2', null, t.sheetTitle));
      const dl = el('dl', 'ficha-fields');
      const field = (k, v) => dl.append(el('dt', null, k), el('dd', null, v));
      field(t.sheetVillage, vk === 'rogue' ? t.rogueCard : vill.name);
      field(t.sheetMastery, `${m.name} · ${t.scales} ${m.stat}`);
      if (vill.info?.passive) field(t.info_passive, tr(vill.info.passive));
      if (sec) field(t.unlocks50, `${sec[1]} (${D.MASTERIES[sec[0]].name})`);
      main.append(dl, el('h3', null, t.sheetFirst));
      const ul = el('ul', 'ficha-steps');
      if (first) ul.append(el('li', null, `${t.firstRoute}: ${first[0]} · ${first[1]}`));
      if (stats10) ul.append(el('li', null, `${t.firstStats}: ${stats10.stats}`));
      ul.append(el('li', null, `${t.firstDailies}: ${vk === 'rogue' ? t.dailiesRogue : t.dailiesEarly}`));
      main.append(ul);
      card.append(side, main, el('span', 'hanko big', t.chosen));
      body.replaceChildren(card);
    }
  }

  $('intro-next').addEventListener('click', () => (intro.step === 2 ? leaveIntro(true) : goStep(intro.step + 1)));
  $('intro-back').addEventListener('click', () => goStep(intro.step - 1));
  $('intro-skip').addEventListener('click', () => leaveIntro(false));
  $('restart').addEventListener('click', () => {
    intro.village = state.village;
    intro.mastery = state.mastery;
    showIntro(true);
  });

  // Mostra o registro só para quem chega sem filtros no link e ainda não passou por ele
  const linked = ['v', 'm', 'lv'].some((k) => hash.has(k));
  if (!linked && !store.get('onboarded')) showIntro(true);

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
