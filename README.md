# nin.help — Pergaminho do Leveling

Guia de leveling do **Nin Online** (nível 1 ao 70): onde farmar, missões e dicas de build por vila e maestria. Site estático em HTML/CSS/JS puro, sem build, pronto para o GitHub Pages.

## Estrutura

```
index.html                       página
assets/style.css                 visual
assets/data.json                 TODOS os dados (rotas, missões, textos) — edite aqui
assets/app.js                    lógica da interface
scripts/validate.mjs             confere o data.json
.github/workflows/validate.yml   roda o validador a cada push/PR
.github/ISSUE_TEMPLATE/          formulário "Sugerir correção"
.nojekyll                        faz o GitHub Pages servir os arquivos como estão
```

## Rodar localmente

Os dados são carregados com `fetch`, então abrir o `index.html` direto (file://) não funciona. Use um servidor:

```bash
python -m http.server 8000
# http://localhost:8000
```

## Editar o guia

Tudo fica em `assets/data.json` (dá para editar direto pelo site do GitHub, no ícone de lápis).

- **Faixas (`BRACKETS`)**: `from`/`to` precisam cobrir 1–70 sem buracos. Cada faixa tem `main` (obrigatório), `phys` (rota de builds físicas, opcional) e `alt` (alternativa, opcional).
  - Rota: `["mob", "mapa", "dica"]` · Alternativa: `["mob", "mapa"]`
  - Por vila: `{ "leaf": [...], "sand": [...], "mist": [...], "rogue": [...] }`, ou `{ "all": [...] }` para todas. Em `main`, as quatro são obrigatórias.
- **Missões (`MISSIONS`)**: `{ "lv": 23, "name": "..." }`, em ordem de nível. Use `"v": "leaf"` para missão exclusiva de uma vila.
  - Link para a wiki: `"wiki": "Nome da Página"` (título exato da página em `config.wikiBase`), ou `{ "leaf": "...", "sand": "..." }` quando muda por vila. Sem `wiki`, o nome aparece como texto.
- **Diárias (`DAILIES`)**: `{ "from": 21, "to": 35, "name": "...", "wiki": "...", "rank": "B", "xp": 78100, "v": ["leaf","sand","mist"], "pros": [...], "cons": [...] }`. Sem `to`, vale até o 70. `xp` pode ser `[mín, máx]`. Use `"verdict": "avoid"` (Evite) ou `"good"` (Vale a pena) só com uma dica de jogador em `"tip"` explicando o motivo. Prós, contras e dicas precisam de tradução em `TEXT_EN`.
- **Inglês (`TEXT_EN`)**: `{ "texto em português": "English text" }` traduz mob, mapa, dica, nome de missão e textos das diárias. Ao mudar um texto em português, mude também a chave em `TEXT_EN`; o validador acusa chave órfã e dica sem tradução. Nomes do jogo (mobs, mapas) não precisam de entrada.
- **Pendências**: escreva `[... a confirmar]` onde ainda não há dado; o validador lista essas pendências como aviso.
- **Mapa**: preencha `config.mapUrl` para mostrar o botão "Abrir no Mapa da Região".

Antes de publicar:

```bash
node scripts/validate.mjs
```

Ele falha (e o GitHub Actions marca ❌) se faltar rota para uma vila, se houver buraco ou sobreposição entre níveis, tradução faltando etc. O resumo da Action lista as pendências de conteúdo.

## Correções da comunidade

O painel de cada nível tem **"Sugerir correção para este nível"**, que abre uma issue no GitHub com nível, vila, maestria e o texto atual já preenchidos (formulário em `.github/ISSUE_TEMPLATE/correcao.yml`). Crie a label `dados` no repositório para elas virem marcadas. O repositório usado nos links fica em `config.repo`.

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "Pergaminho do Leveling"
git branch -M main
git remote add origin https://github.com/<seu-usuario>/nin.help.git
git push -u origin main
```

No GitHub: **Settings › Pages › Build and deployment › Source: Deploy from a branch**, branch `main`, pasta `/ (root)`. O site fica em `https://<seu-usuario>.github.io/nin.help/`.

### Domínio próprio (opcional)

Se for usar `nin.help`: em **Settings › Pages › Custom domain** digite `nin.help` (isso cria o arquivo `CNAME`) e no DNS do domínio aponte os registros `A` para `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Depois marque **Enforce HTTPS**.

## Links compartilháveis

O estado vai na URL: `#v=sand&m=fire&lang=pt&lv=14`.
- `v`: leaf | sand | mist | rogue
- `m`: fire | wind | lightning | earth | water | medical | weapon | taijutsu
- `lang`: pt | en
- `lv`: 1–70

## Pendências de conteúdo

- Níveis 61–70: tamanho do grupo ("Time recomendado" é palpite) e mapa dos Tengu Guards. Fonte: [wiki Land of Spirits](https://ninonline.fandom.com/wiki/Land_of_Spirits)
- `config.mapUrl` em `assets/data.json` (botão "Abrir no Mapa da Região" fica oculto enquanto for `null`)
