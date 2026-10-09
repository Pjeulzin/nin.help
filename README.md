# nin.help — Pergaminho do Leveling

Guia de leveling do **Nin Online** (nível 1 ao 70): onde farmar, missões e dicas de build por vila e maestria. Site estático em HTML/CSS/JS puro, sem build, pronto para o GitHub Pages.

## Estrutura

```
index.html        página
assets/style.css  visual
assets/data.js    TODOS os dados (rotas, missões, textos) — edite aqui
assets/app.js     lógica da interface
.nojekyll         faz o GitHub Pages servir os arquivos como estão
```

## Rodar localmente

Abra `index.html` no navegador, ou:

```bash
python -m http.server 8000
# http://localhost:8000
```

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

- Níveis 61–70 (mob, mapa, missões, tamanho do grupo)
- Rotas específicas de Rogue
- `MAP_URL` em `assets/data.js` (botão "Abrir no Mapa da Região" fica oculto enquanto for `null`)
- Dicas de farm (`main`/`alt`) só estão em português
