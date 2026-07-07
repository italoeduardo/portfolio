# Portfólio — Italo Eduardo

Portfólio pessoal construído em **Blazor WebAssembly** (C# .NET 8 compilado para WebAssembly, rodando 100% no navegador — sem servidor por trás). Hospedado de graça no **GitHub Pages** com deploy automático via **GitHub Actions**.

🔗 **Ao vivo:** _(preencher com a URL após o primeiro deploy)_

## Stack

- **C# / .NET 8** — Blazor WebAssembly
- **HTML5 / CSS3** — design próprio, paleta Condor (navy + laranja + cream)
- **GitHub Actions** — CI/CD para o GitHub Pages

## Como rodar localmente

```bash
dotnet run
```

Abre em `http://localhost:5231`.

## Como editar o conteúdo

Todo o conteúdo (perfil, skills e projetos) fica em **um único arquivo C#**:

```
Data/PortfolioData.cs
```

Edite lá e a página inteira se atualiza sozinha. Para adicionar um projeto, basta acrescentar um `new Projeto(...)` na lista `Projetos`.

## Como publicar (passo a passo)

1. Crie um repositório no GitHub (ex.: `portfolio`).
2. Faça o push deste projeto para a branch `main`.
3. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Pronto. Cada `git push` na `main` republica o site automaticamente.

O workflow em `.github/workflows/deploy.yml` compila, ajusta o `base href` para o nome do repositório e publica.

## Estrutura

```
Portfolio/
├── Data/PortfolioData.cs      → conteúdo (edite aqui)
├── Models/PortfolioModels.cs  → tipos de dados
├── Pages/Home.razor           → a página (hero, sobre, skills, projetos, contato)
├── Layout/MainLayout.razor    → navbar + rodapé
├── wwwroot/
│   ├── css/app.css            → todo o visual
│   ├── index.html             → shell + tela de loading
│   └── 404.html               → roteamento SPA no GitHub Pages
└── .github/workflows/deploy.yml → deploy automático
```
