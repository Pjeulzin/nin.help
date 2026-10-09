/*
 * Dados do Pergaminho do Leveling (Nin Online).
 * Edite este arquivo para atualizar rotas, missões e textos.
 * Spots: [mob, mapa, dica]  ·  Alternativas: [mob, mapa]
 * Chaves por vila: leaf | sand | mist  ·  "all" vale para todas.
 */
window.NIN = {
  // Link do mapa da região. Deixe null para esconder o botão.
  MAP_URL: null,

  VILLAGES: {
    leaf: { name: 'Leaf', color: '#6cc25a', ink: '#2f6a17', d: 'M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 16-9 17zM4 21c4-4 7-7 10-10',
      note: 'Rota mais difícil: exige sair cedo da vila e farmar em Danger Zones nos níveis mais altos.',
      noteEn: 'Hardest route: you have to leave the village early and farm in Danger Zones at higher levels.' },
    sand: { name: 'Sand', color: '#e8a83c', ink: '#8a5a12', d: 'M6 3h12M6 21h12M7 3c0 6 10 7 10 18M17 3c0 6-10 7-10 18',
      note: 'Grind mais fácil: as áreas de treino ficam perto da vila.',
      noteEn: 'Easiest grind: training areas are close to the village.' },
    mist: { name: 'Mist', color: '#5aaee0', ink: '#1f5f8a', d: 'M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z',
      note: 'Segunda mais fácil, mas isolada (5 min de barco). Não há seals locais: os de Leaf e Sand são feitos fora.',
      noteEn: 'Second easiest, but isolated (5 min by boat). No local seals: Leaf and Sand seals are done outside.' },
    rogue: { name: 'Rogue', color: '#d0503f', ink: '#7a1c10', d: 'M3 9h18v6H3zM6 19L18 5',
      note: 'Ninja sem vila. Onde não há rota específica de Rogue, mostramos a rota neutra. [Confirmar rotas Rogue]',
      noteEn: 'Village-less ninja. Where there is no Rogue-specific route, the neutral route is shown. [Confirm Rogue routes]' }
  },

  MASTERIES: {
    fire: { name: 'Fire', color: '#ef6a3d', phys: false, tip: 'Multi-alvo e dano alto: junte grupos de mobs e limpe em área.', tipEn: 'Multi-target and high damage: pull groups of mobs and clear them with AoE.' },
    wind: { name: 'Wind', color: '#8fd3a0', phys: false, tip: 'Rápido, afiado e letal: ótimo para rotacionar spawns sozinho.', tipEn: 'Fast, sharp and lethal: great for rotating spawns solo.' },
    lightning: { name: 'Lightning', color: '#f2d04b', phys: false, tip: 'Dano alto e imobilização: prenda o mob enquanto ataca.', tipEn: 'High damage and immobilization: lock the mob down while you attack.' },
    earth: { name: 'Earth', color: '#c39a62', phys: false, tip: 'Área ampla e controle de grupo: segura vários mobs de uma vez.', tipEn: 'Wide AoE and crowd control: holds several mobs at once.' },
    water: { name: 'Water', color: '#4ea6dc', phys: false, tip: 'Equilibrado e versátil: rende bem em qualquer zona.', tipEn: 'Balanced and versatile: performs well in any zone.' },
    medical: { name: 'Medical', color: '#ec7aa6', phys: true, tip: 'Cura, revive e veneno: rende mais em time, principalmente nos arcos.', tipEn: 'Healing, revive and poison: best in a team, especially during arcs.' },
    weapon: { name: 'Weapon', color: '#b3bcc8', phys: true, tip: 'Técnicas de armas e ferramentas ninja.', tipEn: 'Weapon techniques and ninja tools.' },
    taijutsu: { name: 'Taijutsu', color: '#f0a93c', phys: true, tip: 'Combate corpo a corpo puro.', tipEn: 'Pure hand-to-hand combat.' }
  },

  // 2ª maestria exclusiva por vila: [caminho, nome]
  SECOND: { leaf: ['taijutsu', 'Gentle Fist'], sand: ['wind', 'Fan'], mist: ['water', 'Bubble'] },

  ROGUE_SPOT: ['[Rota Rogue a confirmar]', '[Mapa a confirmar]', 'Sem dados públicos de rota para Rogue nesta faixa. Preencha com os dados do Nin DB.'],

  I18N: {
    pt: {
      lang: 'Idioma', title: 'Pergaminho do Leveling', subtitle: 'Escolha vila e maestria, depois clique em um nível.',
      village: 'VILA', mastery: 'MAESTRIA', path: 'Caminho do Ninja', footer: 'Rotas de guias da comunidade (fórum Nin Online e Steam). Confirme no jogo.',
      details: 'Detalhes do nível', levelCaps: 'NÍVEL', range: 'Faixa', close: 'Fechar detalhes', prev: '← Nível anterior', next: 'Próximo nível →',
      where: 'ONDE FARMAR', alt: 'ALTERNATIVA', openMap: 'Abrir no Mapa da Região', missions: 'MISSÕES & QUESTS', isNew: 'NOVO',
      noMissions: 'Nenhuma missão nesta faixa: foco no grind e nas dailies.', soon: 'EM BREVE', build: 'SUA BUILD',
      selectLevel: 'Selecionar nível', level: 'Nível'
    },
    en: {
      lang: 'Language', title: 'Leveling Scroll', subtitle: 'Pick your village and mastery, then choose a level.',
      village: 'VILLAGE', mastery: 'MASTERY', path: 'Ninja Path', footer: 'Routes from community guides (Nin Online forum and Steam). Check in game.',
      details: 'Level details', levelCaps: 'LEVEL', range: 'Range', close: 'Close details', prev: '← Previous level', next: 'Next level →',
      where: 'WHERE TO FARM', alt: 'ALTERNATIVE', openMap: 'Open in Region Map', missions: 'MISSIONS & QUESTS', isNew: 'NEW',
      noMissions: 'No missions in this range: focus on grinding and dailies.', soon: 'COMING UP', build: 'YOUR BUILD',
      selectLevel: 'Select level', level: 'Level'
    }
  },

  TAG_EN: { 'Academia': 'Academy', 'Arredores': 'Outskirts', 'Feras': 'Beasts', 'Rota INT': 'INT Route', 'Grandes feras': 'Big Beasts', 'Selva': 'Wilds' },
  PARTY_EN: { 'Solo': 'Solo', 'Solo ou dupla': 'Solo or duo', 'Time p/ Kuraken': 'Team for Kuraken', 'Time recomendado': 'Team recommended', '[A confirmar]': '[To be confirmed]' },

  BRACKETS: [
    { from: 1, to: 3, tag: 'Academia', party: 'Solo',
      main: { leaf: ['Larva', 'Mountain Side', 'Suba pela escada perto da academia e vá para a direita. Zona segura.'],
              sand: ['Larva', 'Crestfallen Tree', 'Saída sul, na bifurcação ao sul do escritório do Kage. Zona segura.'],
              mist: ['Larva', 'Silky Carter', 'Saída leste, no início da bifurcação. Zona segura.'] } },
    { from: 4, to: 8, tag: 'Arredores', party: 'Solo',
      main: { leaf: ['Spiders', 'Mountain Side / Mountain Peak', 'Mesma rota da academia. Bom para subir jutsus também.'],
              sand: ['Scorpions', 'Crestfallen Tree / Howling Canyon', 'Guarde Scorpion Tails para missões futuras.'],
              mist: ['Dragonflies', 'Silky Carter / Windy Pond', 'Zona segura com ants e foxes por perto.'] } },
    { from: 9, to: 10, tag: 'Feras', party: 'Solo',
      main: { leaf: ['Wolves', 'Mountain Side / Mountain Peak', 'Último passo antes de escolher a maestria no 10.'],
              sand: ['Stingers → Coyotes', 'Howling Canyon', 'Stingers até o 10, depois Coyotes.'],
              mist: ['Foxes', 'Silky Carter / Windy Pond', 'Último passo antes de escolher a maestria no 10.'] } },
    { from: 11, to: 12, tag: 'Seals', party: 'Solo',
      main: { leaf: ['Leaf Seals → Sand Seals', 'Missões de Selo', 'Leaf Seals no 10–11 e Sand Seals no 11.'],
              sand: ['Sand Seals → Leaf Seals', 'Missões de Selo', 'Sand Seals no 10–11, Leaf Seals no 11–12. Os de Sand ficam fora dos limites da vila.'],
              mist: ['Sand Seals → Leaf Seals', 'Missões de Selo (fora da vila)', 'Mist não tem seals próprios: faça os de Sand e depois os de Leaf.'] } },
    { from: 13, to: 15, tag: 'Abandoned Lair', party: 'Solo',
      main: { all: ['Snakes', 'Abandoned Lair', 'Melhor grind da faixa: cerca de 200–300k XP/h, variando com as Danger Zones.'] },
      phys: { leaf: ['Wolves', 'Mountain Side / Mountain Peak', 'Builds corpo a corpo seguem nas feras da vila até o 15.'],
              sand: ['Coyotes', 'Howling Canyon', 'Builds corpo a corpo seguem nas feras da vila até o 15.'],
              mist: ['Foxes', 'Silky Carter / Windy Pond', 'Builds corpo a corpo seguem nas feras da vila até o 15.'] },
      alt: { all: ['Snakes', 'Abandoned Lair'] } },
    { from: 16, to: 18, tag: 'Rota INT', party: 'Solo',
      main: { leaf: ['Tigers / White Tigers', 'Arredores de Leaf', 'Rota de Intelligence para maestrias elementais.'],
              sand: ['Small Scarabs', 'Deserto de Sand', 'Rota de Intelligence para maestrias elementais.'],
              mist: ['Ghosts', 'Haunted Temple', 'Rota de Intelligence para maestrias elementais.'] },
      phys: { all: ['Snakes', 'Abandoned Lair', 'Corpo a corpo continua nas Snakes até o 19.'] },
      alt: { all: ['Snakes', 'Abandoned Lair'] } },
    { from: 19, to: 20, tag: 'Grandes feras', party: 'Solo',
      main: { leaf: ['Tigers', 'Arredores de Leaf', 'Tigers até o 20.'],
              sand: ['Big Scarabs', 'Deserto de Sand', 'Big Scarabs levam do 17/18 até 25+.'],
              mist: ['Giant Fire Ants / Giant Ants', 'Arredores de Mist', 'Só se você conseguir kitar.'] } },
    { from: 21, to: 25, tag: 'Land of Waves', party: 'Solo ou dupla',
      main: { all: ['Mobs do Trem', 'Land of Waves — Train Arc', 'Arco rende 3–4 níveis (+1 com World Blessing). Farme os mobs dentro do trem.'] },
      alt: { leaf: ['Hornets / Bees', 'Perto de Tanzaku (kite)'], sand: ['Big Scarabs', 'Deserto de Sand'], mist: ['Giant Fire Ants', 'Arredores de Mist (kite)'] } },
    { from: 26, to: 30, tag: 'Selva', party: 'Solo',
      main: { leaf: ['Snakes / Bears', 'Florestas de Leaf', 'Guarde Bear Paws: valem missões depois.'],
              sand: ['Snakes, Bees, Hornets', 'Rota de Tanzaku', 'Combine com as dailies e o RP Mission IV.'],
              mist: ['Snakes, Bees, Hornets', 'Rota de Tanzaku', 'Combine com as dailies e o RP Mission IV.'] } },
    { from: 31, to: 40, tag: 'Land of Toads', party: 'Time p/ Kuraken',
      main: { all: ['Arco Land of Toads', 'Toad Mountain', 'Rende 3–4 níveis. Cuidado no puzzle: os últimos tiles matam na hora.'] },
      alt: { all: ['Bears', 'Missão Demon Claws (40 Bears)'] } },
    { from: 41, to: 50, tag: 'Bandit Arc', party: 'Time recomendado',
      main: { all: ['Bandit Arc', 'Ninja General Map', 'Aceite no balcão da vila. Rende 2–3 níveis com Blessing. Os 40 são a faixa mais lenta: dailies ajudam muito.'] },
      alt: { all: ['Glacial Bears', 'Missão Light Work'] } },
    { from: 51, to: 60, tag: 'Land of Iron', party: 'Time recomendado',
      main: { all: ['Arco Land of Iron', 'Iron City', 'Questline mais difícil em tempo e mobs, mas os chefes dropam as melhores armas.'] },
      alt: { all: ['Dailies', 'Fonte principal de XP fora do arco'] } },
    { from: 61, to: 70, tag: 'Endgame', party: '[A confirmar]',
      main: { all: ['[Mob a confirmar]', '[Mapa a confirmar]', 'Os guias públicos não cobrem 61–70. Preencha com os dados do Nin DB.'] } }
  ],

  // v: só aparece para essa vila
  MISSIONS: [
    { lv: 1, name: 'Tutoriais da Academia + Welcome Questline' },
    { lv: 1, v: 'leaf', name: 'Esconde-esconde com as crianças no Playground' },
    { lv: 1, v: 'sand', name: 'Estátua da Cabaça: entregar Kazecola / Sand Up às crianças' },
    { lv: 1, v: 'mist', name: 'Missão Gold Bars' },
    { lv: 10, name: 'Missões de Selo da vila' },
    { lv: 10, name: 'Yuu Questline em Takumi (3 missões, até ~15)' },
    { lv: 12, name: 'RP Mission I: 11.600 XP (precisa de Chuunin+ e 3 jogadores)' },
    { lv: 15, name: 'Mobster Questline em Tanzaku' },
    { lv: 17, name: 'RP Mission II: 34.850 XP' },
    { lv: 20, name: 'Land of Waves Arc (Train)' },
    { lv: 20, name: 'Dull Edges and Sharp Minds: derrotar Guren (nível grátis)' },
    { lv: 20, name: 'Yozo the Bozo (aposta, RNG)' },
    { lv: 22, name: "Kiari's Parcel" },
    { lv: 23, name: 'The Venomous Requirement: 100 Snake Venom' },
    { lv: 25, name: 'Honey Hive Hunt · libera Invocação' },
    { lv: 27, name: 'RP Mission IV: 98.400 XP' },
    { lv: 27, name: "Lover's Quarrel (Asoki Port)" },
    { lv: 30, name: "Okada's Debt (aposta, RNG)" },
    { lv: 30, name: "Haji's Sword (porão do Snake Lair)" },
    { lv: 31, name: 'Land of Toads Arc' },
    { lv: 33, name: 'Demon Claws: derrotar 40 Bears' },
    { lv: 36, name: 'Blocked Entry: derrotar Koji' },
    { lv: 38, name: 'Revenge on Kuraken: 8 tentáculos (mais fácil para Mist)' },
    { lv: 40, name: "Gobori's Odd Request: 23 caudas de Raccoon, Scorpion e Rat" },
    { lv: 40, name: 'Bandit Arc (balcão da vila)' },
    { lv: 43, name: 'Light Work: 5 Gray Bear Paws (Glacial Bears)' },
    { lv: 50, name: 'Questline final + 2ª maestria' },
    { lv: 51, name: 'Land of Iron Arc' },
    { lv: 61, name: '[Missões 61–70 a confirmar]' }
  ],

  MILESTONES: {
    pt: { 10: '1ª Maestria', 20: 'Waves', 25: 'Invocação', 31: 'Toads', 40: 'Bandit Arc', 50: '2ª Maestria', 51: 'Iron', 70: 'Máximo' },
    en: { 10: '1st Mastery', 20: 'Waves', 25: 'Summoning', 31: 'Toads', 40: 'Bandit Arc', 50: '2nd Mastery', 51: 'Iron', 70: 'Max level' }
  },
  BAR_MILESTONES: [10, 20, 25, 31, 40, 50, 70],
  TICKS: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]
};
