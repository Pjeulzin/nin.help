#!/usr/bin/env node
// Valida assets/data.json. Uso: node scripts/validate.mjs
// Erros fazem o comando falhar (exit 1). Pendências "[... a confirmar]" só geram aviso.
import { readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'data.json');
const MAX = 70;
const VILLAGE_KEYS = ['leaf', 'sand', 'mist', 'rogue']; // rotas obrigatórias quando a faixa não usa "all"
const CI = !!process.env.GITHUB_ACTIONS;
const errors = [];
const pending = [];
const err = (msg) => errors.push(msg);

let D;
const RAW = readFileSync(FILE, 'utf8');
try {
  D = JSON.parse(RAW);
} catch (e) {
  console.error(`${CI ? '::error file=assets/data.json::' : '✗ '}JSON inválido: ${e.message}`);
  process.exit(1);
}

// JSON.parse aceita chave repetida e fica só com a última: procura repetições no texto
{
  const stack = [];
  let path = [];
  const re = /"((?:[^"\\]|\\.)*)"(\s*:)?|[{}[\]]/g;
  let m;
  while ((m = re.exec(RAW))) {
    const tok = m[0];
    if (tok === '{') { stack.push(new Set()); continue; }
    if (tok === '[') { stack.push(null); continue; }
    if (tok === '}' || tok === ']') { stack.pop(); path = path.slice(0, stack.length); continue; }
    const keys = stack[stack.length - 1];
    if (!m[2] || !keys) continue;
    if (keys.has(m[1])) err(`chave "${m[1]}" repetida no mesmo objeto (${[...path.slice(0, stack.length - 1)].join('.') || 'raiz'}); a primeira é ignorada`);
    keys.add(m[1]);
    path[stack.length - 1] = m[1];
  }
}

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isInt = (v, lo = 1, hi = MAX) => Number.isInteger(v) && v >= lo && v <= hi;
const isPlaceholder = (s) => typeof s === 'string' && /\[[^\]]*(confirmar|confirmed)[^\]]*\]/i.test(s);
const need = (obj, keys, where) => keys.forEach((k) => { if (!isStr(obj?.[k])) err(`${where}: campo "${k}" ausente ou vazio`); });

// ---- Seções obrigatórias ----
for (const k of ['config', 'VILLAGES', 'MASTERIES', 'SECOND', 'I18N', 'TAG_EN', 'PARTY_EN', 'TEXT_EN', 'BRACKETS', 'MISSIONS', 'DAILIES', 'MILESTONES', 'BAR_MILESTONES', 'TICKS']) {
  if (!(k in D)) err(`seção "${k}" não existe`);
}
if (errors.length) finish();

// ---- Config ----
if (!/^[\w.-]+\/[\w.-]+$/.test(D.config.repo || '')) err('config.repo deve ser "usuario/repositorio"');
if (D.config.mapUrl !== null && !/^https?:\/\//.test(D.config.mapUrl || '')) err('config.mapUrl deve ser null ou uma URL http(s)');

// ---- Vilas e maestrias ----
const villages = Object.keys(D.VILLAGES);
for (const k of VILLAGE_KEYS) if (!villages.includes(k)) err(`VILLAGES: falta a vila "${k}"`);
for (const [k, v] of Object.entries(D.VILLAGES)) {
  need(v, ['name', 'color', 'ink', 'd', 'note', 'noteEn'], `VILLAGES.${k}`);
  for (const c of ['color', 'ink']) if (!/^#[0-9a-f]{6}$/i.test(v[c] || '')) err(`VILLAGES.${k}.${c} deve ser uma cor #rrggbb`);
  for (const [f, s] of Object.entries(v.info || {})) {
    if (!['passive', 'mastery', 'org', 'items', 'summons', 'clans', 'become'].includes(f)) err(`VILLAGES.${k}.info: campo "${f}" desconhecido (use passive, mastery, org, items, summons, clans ou become)`);
    if (!isStr(s)) err(`VILLAGES.${k}.info.${f}: texto vazio`);
    else if (!isStr(D.TEXT_EN?.[s])) pending.push(`VILLAGES.${k}.info.${f}: sem tradução em TEXT_EN`);
  }
  for (const [f, p] of Object.entries(v.infoWiki || {})) {
    if (!(f in (v.info || {}))) err(`VILLAGES.${k}.infoWiki.${f}: não existe "${f}" em info`);
    if (!isStr(p)) err(`VILLAGES.${k}.infoWiki.${f}: página vazia`);
  }
}
const masteries = Object.keys(D.MASTERIES);
for (const [k, m] of Object.entries(D.MASTERIES)) {
  need(m, ['name', 'color', 'tip', 'tipEn'], `MASTERIES.${k}`);
  if (!['Intelligence', 'Chakra', 'Strength', 'Agility'].includes(m.stat)) err(`MASTERIES.${k}.stat deve ser Intelligence, Chakra, Strength ou Agility`);
  if (typeof m.phys !== 'boolean') err(`MASTERIES.${k}.phys deve ser true ou false`);
}
for (const [v, pair] of Object.entries(D.SECOND)) {
  if (!villages.includes(v)) err(`SECOND.${v}: vila desconhecida`);
  if (!Array.isArray(pair) || !masteries.includes(pair[0]) || !isStr(pair[1])) err(`SECOND.${v} deve ser ["maestria", "nome"]`);
}

// ---- Textos (pt e en com as mesmas chaves) ----
const ptKeys = Object.keys(D.I18N.pt || {}), enKeys = Object.keys(D.I18N.en || {});
for (const k of ptKeys) if (!isStr(D.I18N.en?.[k])) err(`I18N.en: falta a tradução de "${k}"`);
for (const k of enKeys) if (!isStr(D.I18N.pt?.[k])) err(`I18N.pt: falta o texto de "${k}"`);

// ---- Faixas: cobrem 1–70 sem buracos nem sobreposição ----
const spot = (arr, len, where) => {
  if (!Array.isArray(arr) || arr.length !== len || !arr.every(isStr)) {
    err(`${where} deve ser [${len === 3 ? 'mob, mapa, dica' : 'mob, mapa'}] com textos preenchidos`);
    return;
  }
  arr.forEach((s) => { if (isPlaceholder(s)) pending.push(`${where}: ${s}`); });
};
const checkSet = (set, len, where, required) => {
  if (set == null) return;
  if (typeof set !== 'object' || Array.isArray(set)) return err(`${where} deve ser um objeto { leaf, sand, mist, rogue } ou { all }`);
  for (const k of Object.keys(set)) {
    if (k !== 'all' && !villages.includes(k)) err(`${where}: chave desconhecida "${k}" (use leaf, sand, mist, rogue ou all)`);
    spot(set[k], len, `${where}.${k}`);
  }
  if (required && !set.all) for (const v of VILLAGE_KEYS) if (!set[v]) err(`${where}: falta rota para "${v}" (ou use "all")`);
};

let expected = 1;
D.BRACKETS.forEach((b, i) => {
  const where = `BRACKETS[${i}] (${b.tag ?? '?'} ${b.from}–${b.to})`;
  if (!isInt(b.from) || !isInt(b.to) || b.from > b.to) return err(`${where}: from/to inválidos`);
  if (b.from !== expected) err(b.from > expected ? `${where}: buraco nos níveis ${expected}–${b.from - 1}` : `${where}: sobrepõe a faixa anterior (esperado começar no ${expected})`);
  expected = b.to + 1;
  need(b, ['tag', 'party'], where);
  if (isPlaceholder(b.party)) pending.push(`${where}.party: ${b.party}`);
  checkSet(b.main, 3, `${where}.main`, true);
  checkSet(b.phys, 3, `${where}.phys`, false);
  checkSet(b.alt, 2, `${where}.alt`, false);
  if (b.party && !(b.party in D.PARTY_EN)) err(`${where}: "${b.party}" sem tradução em PARTY_EN`);
});
if (expected !== MAX + 1) err(`BRACKETS termina no nível ${expected - 1}; deve ir até ${MAX}`);

// ---- Missões ----
D.MISSIONS.forEach((m, i) => {
  const where = `MISSIONS[${i}]`;
  if (!isInt(m.lv)) err(`${where}: lv deve ser um inteiro de 1 a ${MAX}`);
  if (!isStr(m.name)) err(`${where}: name vazio`);
  if (m.v !== undefined && !villages.includes(m.v)) err(`${where}: vila "${m.v}" desconhecida`);
  if (isPlaceholder(m.name)) pending.push(`${where}: ${m.name}`);
  if (m.wiki !== undefined) {
    if (!isStr(D.config?.wikiBase)) err(`${where}: tem "wiki" mas falta config.wikiBase`);
    const pages = typeof m.wiki === 'string' ? [m.wiki] : m.wiki && typeof m.wiki === 'object' ? Object.entries(m.wiki) : null;
    if (!pages) err(`${where}: "wiki" deve ser o nome da página ou { vila: página }`);
    else if (typeof m.wiki !== 'string') for (const [k, p] of pages) {
      if (!villages.includes(k)) err(`${where}.wiki: vila "${k}" desconhecida`);
      if (!isStr(p)) err(`${where}.wiki.${k}: página vazia`);
    } else if (!isStr(m.wiki)) err(`${where}.wiki: página vazia`);
  }
  if (i > 0 && m.lv < D.MISSIONS[i - 1].lv) err(`${where} (Nv ${m.lv}): fora de ordem; mantenha as missões em ordem de nível`);
});

// ---- Diárias ----
const RANKS = ['D', 'C', 'B', 'A', 'S'];
const VERDICTS = ['avoid', 'good'];
const dailyTexts = [];
(D.DAILIES || []).forEach((d, i) => {
  const where = `DAILIES[${i}] (${d.name ?? '?'})`;
  if (!isInt(d.from)) err(`${where}: from deve ser um inteiro de 1 a ${MAX}`);
  if (d.to !== undefined && (!isInt(d.to) || d.to < d.from)) err(`${where}: to deve ser um inteiro >= from`);
  if (!isStr(d.name)) err(`${where}: name vazio`);
  if (!RANKS.includes(d.rank)) err(`${where}: rank deve ser ${RANKS.join(', ')}`);
  const xpOk = (n) => Number.isInteger(n) && n > 0;
  if (!(xpOk(d.xp) || (Array.isArray(d.xp) && d.xp.length === 2 && d.xp.every(xpOk) && d.xp[0] < d.xp[1]))) err(`${where}: xp deve ser um número ou [mínimo, máximo]`);
  if (!Array.isArray(d.v) || !d.v.length || d.v.some((v) => !villages.includes(v))) err(`${where}: v deve listar vilas (${villages.join(', ')})`);
  if (d.wiki !== undefined && !isStr(d.wiki)) err(`${where}: wiki vazia`);
  if (d.verdict !== undefined && !VERDICTS.includes(d.verdict)) err(`${where}: verdict deve ser ${VERDICTS.join(' ou ')}`);
  if (d.verdict !== undefined && !isStr(d.tip)) err(`${where}: verdict precisa de uma dica (tip) explicando o motivo`);
  for (const k of ['pros', 'cons']) if (d[k] !== undefined && (!Array.isArray(d[k]) || !d[k].every(isStr))) err(`${where}: ${k} deve ser uma lista de textos`);
  for (const t of [...(d.pros || []), ...(d.cons || []), ...(isStr(d.tip) ? [d.tip] : [])]) {
    dailyTexts.push(t);
    if (!isStr(D.TEXT_EN?.[t])) pending.push(`${where}: "${t.slice(0, 40)}" sem tradução em TEXT_EN`);
  }
});
for (const k of ['dailies', 'dailiesEarly', 'dailiesReset', 'dailiesRogue', 'noDailies', 'avoid', 'good', 'playerTip', 'vinfo', 'vinfoCommon', 'info_passive', 'info_mastery', 'info_org', 'info_items', 'info_summons', 'info_clans', 'info_become'])
  if (!isStr(D.I18N.pt?.[k])) err(`I18N.pt: falta o texto "${k}" usado pelo painel`);

// ---- Traduções (TEXT_EN: texto em português -> inglês) ----
const villageTexts = Object.values(D.VILLAGES).flatMap((v) => Object.values(v.info || {}));
const texts = new Set([...D.MISSIONS.map((m) => m.name), ...dailyTexts, ...villageTexts]);
D.BRACKETS.forEach((b, i) => {
  for (const k of ['main', 'phys', 'alt']) for (const [v, arr] of Object.entries(b[k] || {})) {
    if (!Array.isArray(arr)) continue;
    arr.forEach((s) => texts.add(s));
    if (k !== 'alt' && isStr(arr[2]) && !isStr(D.TEXT_EN?.[arr[2]])) pending.push(`BRACKETS[${i}].${k}.${v}: dica sem tradução em TEXT_EN`);
  }
});
for (const [k, v] of Object.entries(D.TEXT_EN || {})) {
  if (!texts.has(k)) err(`TEXT_EN: "${k.slice(0, 50)}" não aparece em nenhuma rota, missão ou diária (texto mudou? atualize a chave)`);
  if (!isStr(v)) err(`TEXT_EN: tradução vazia para "${k.slice(0, 50)}"`);
}

// ---- Marcos e marcações ----
for (const lang of ['pt', 'en']) {
  for (const n of Object.keys(D.MILESTONES[lang] || {})) if (!isInt(Number(n))) err(`MILESTONES.${lang}: nível ${n} fora de 1–${MAX}`);
}
for (const n of Object.keys(D.MILESTONES.pt || {})) if (!D.MILESTONES.en?.[n]) err(`MILESTONES.en: falta o marco do nível ${n}`);
for (const n of D.BAR_MILESTONES) if (!D.MILESTONES.pt?.[n]) err(`BAR_MILESTONES: nível ${n} não existe em MILESTONES`);
for (const n of D.TICKS) if (!isInt(n)) err(`TICKS: ${n} fora de 1–${MAX}`);

finish();

function finish() {
  for (const e of errors) console.log(CI ? `::error file=assets/data.json::${e}` : `✗ ${e}`);
  for (const p of pending) console.log(CI ? `::warning file=assets/data.json::Pendente: ${p}` : `! pendente: ${p}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [`## Validação do guia`, errors.length ? `❌ ${errors.length} erro(s)` : '✅ Dados válidos', ''];
    if (errors.length) lines.push(...errors.map((e) => `- ${e}`), '');
    lines.push(`### Pendências de conteúdo (${pending.length})`, ...pending.map((p) => `- ${p}`), '');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'));
  }
  console.log(errors.length
    ? `\n${errors.length} erro(s). Corrija antes de publicar.`
    : `\n✓ data.json válido · ${D.BRACKETS?.length} faixas cobrindo 1–${MAX} · ${D.MISSIONS?.length} missões · ${D.DAILIES?.length} diárias · ${pending.length} pendência(s)`);
  process.exit(errors.length ? 1 : 0);
}
