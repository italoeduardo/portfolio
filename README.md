# Portfólio — Italo Eduardo

Portfólio pessoal de **desenvolvedor Java full-stack & analista de dados/BI**. Site estático (HTML, CSS e JavaScript), hospedado no **GitHub Pages** com deploy automático via **GitHub Actions**.

🔗 **Ao vivo:** https://italoeduardo.github.io/portfolio/

## Stack

- **HTML5 / CSS3 / JavaScript** — sem framework, sem build
- Design próprio (paleta navy + laranja + cream)
- **GitHub Actions** — CI/CD para o GitHub Pages

## Como rodar localmente

Qualquer servidor estático serve. Por exemplo:

```bash
python -m http.server 5231
```

Depois abra `http://localhost:5231`.

## Como editar o conteúdo

Todo o conteúdo (perfil, skills e projetos) fica em **um arquivo**:

```
js/data.js
```

Edite lá e a página se atualiza sozinha. Para adicionar um projeto, acrescente um objeto na lista `PROJETOS`.

A demonstração interativa (dados fictícios + gráficos) fica em `js/demo.js`, e a renderização/interações da página em `js/portfolio.js`.

## Estrutura

```
portfolio/
├── index.html          → estrutura da página
├── css/app.css         → todo o visual
├── js/data.js          → conteúdo (edite aqui)
├── js/demo.js          → demo DataVision (dados fictícios + dashboard)
├── js/portfolio.js     → renderização + interações
├── 404.html            → redireciona para o início
└── .github/workflows/deploy.yml → deploy automático
```

## Publicar

Cada `git push` na branch `main` republica o site automaticamente (via GitHub Actions → GitHub Pages).
