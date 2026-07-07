using Portfolio.Models;

namespace Portfolio.Data;

/// <summary>
/// Fonte única de verdade do conteúdo do portfólio.
/// Editar aqui reflete automaticamente em todas as seções da página.
/// </summary>
public static class PortfolioData
{
    public const string Nome = "Italo Eduardo";
    public const string Titulo = "Desenvolvedor .NET & Analista de Dados / BI";
    public const string Email = "italoeduardo368@gmail.com";
    public const string LinkedIn = "https://www.linkedin.com/";
    public const string GitHub = "https://github.com/";

    public const string Resumo =
        "Desenvolvedor full-stack focado em transformar dados operacionais em sistemas web " +
        "e dashboards que substituem planilhas e relatórios de BI por aplicações vivas, com " +
        "autenticação, metas editáveis e análise assistida por IA. Trabalho de ponta a ponta: " +
        "modelagem de dados no Oracle, back-end em C#/.NET, front-end responsivo e deploy em " +
        "produção com nginx + systemd. Já entreguei uma suíte completa de painéis logísticos, " +
        "comerciais e financeiros rodando em produção.";

    public static readonly Estatistica[] Estatisticas =
    {
        new("9+", "Sistemas entregues"),
        new("7", "Apps em produção"),
        new("100%", "Full-stack"),
        new("∞", "Café ☕"),
    };

    public static readonly Skill[] Skills =
    {
        new("Back-end", "🧩", new[]
        {
            "C#", ".NET 8 / ASP.NET Core", "Razor Pages", "Blazor WebAssembly",
            "Java", "Node.js", "REST APIs"
        }),
        new("Front-end", "🎨", new[]
        {
            "HTML5 & CSS3", "JavaScript", "TypeScript", "React", "Bootstrap 5",
            "Chart.js", "Razor / Blazor UI"
        }),
        new("Dados & BI", "📊", new[]
        {
            "Oracle (WinThor)", "SQL avançado", "SQLite", "Prisma ORM",
            "Modelagem de dados", "Power BI → Web", "ETL & integrações"
        }),
        new("IA & Automação", "🤖", new[]
        {
            "Google Gemini API", "Análise assistida por IA", "Python",
            "Background workers", "Integração de APIs externas"
        }),
        new("DevOps & Deploy", "🚀", new[]
        {
            "Linux (Ubuntu)", "nginx (reverse proxy)", "systemd", "SSH / SCP",
            "GitHub Actions", "Cache & performance"
        }),
    };

    public static readonly Projeto[] Projetos =
    {
        new(
            Nome: "OTIF",
            Subtitulo: "On Time In Full — SLA logístico",
            Descricao: "Sistema que mede o percentual de pedidos entregues no prazo E sem corte, " +
                       "cruzando dados do ERP com eventos reais de entrega. Régua de prazo por UF " +
                       "(D+dias úteis, ignorando feriados), visão 'Realizado' para gerência e 'Em Risco' " +
                       "para a logística agir, com drill-down explicando por que cada pedido falhou.",
            Icone: "🎯",
            Categoria: "Logística",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "Oracle", "Chart.js", "Bootstrap 5" },
            Destaques: new[]
            {
                "Cálculo de prazo por UF só em dias úteis",
                "Duas visões: OTIF Realizado e OTIF em Risco",
                "Drill-down do motivo da falha (atraso × corte)",
            },
            CorAccent: "#E76B2F",
            Url: "https://otif.condorbrasil.com.br"
        ),
        new(
            Nome: "GEROT",
            Subtitulo: "Painel de KPIs logísticos com IA",
            Descricao: "Recriação web de um painel de Power BI: 12 cards de indicadores + KPIs de topo " +
                       "(faturamento, cortes, devoluções, tempo de retira…), metas editáveis por usuário master " +
                       "e um botão de análise com IA que resume o período, aponta riscos e projeta o fechamento.",
            Icone: "📈",
            Categoria: "Logística",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "Oracle", "SQLite", "Gemini AI", "Chart.js" },
            Destaques: new[]
            {
                "12 indicadores + metas editáveis (SQLite)",
                "Análise automática com Google Gemini",
                "Cache inteligente e auto-refresh",
            },
            CorAccent: "#1E3A8A",
            Url: "https://gerot.condorbrasil.com.br"
        ),
        new(
            Nome: "Painel de Despesas",
            Subtitulo: "DRE + Frete com toggle Competência × Caixa",
            Descricao: "Substitui o Power BI de DRE. Duas páginas (DRE e Frete) com KPIs comparados ao " +
                       "período anterior, gráficos clicáveis com drill-down até o lançamento, e um toggle " +
                       "Competência/Caixa que reprocessa tudo no SQL. Faturamento validado batendo exato com o BI.",
            Icone: "💰",
            Categoria: "Financeiro",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "Oracle", "Gemini AI", "Chart.js" },
            Destaques: new[]
            {
                "Toggle Competência × Caixa direto no SQL",
                "Drill-down até o lançamento contábil",
                "Faturamento validado 100% vs Power BI",
            },
            CorAccent: "#198754",
            Url: "https://paineldespesas.condorbrasil.com.br"
        ),
        new(
            Nome: "Produtividade",
            Subtitulo: "Separação WMS em tempo quase real",
            Descricao: "Painel que substitui o Power BI de produtividade da separação no WMS. Mostra KPIs de OS, " +
                       "peso e itens separados, matriz Separador × Setor, ranking de colaboradores e evolução " +
                       "dia a dia, com filtros ágeis por unidade, turno, setor e colaborador.",
            Icone: "📦",
            Categoria: "Operação",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "Oracle", "Chart.js" },
            Destaques: new[]
            {
                "Matriz Separador × Setor",
                "Ranking de colaboradores",
                "Filtros por unidade, turno e setor",
            },
            CorAccent: "#5A3A6F",
            Url: "https://produtividade.condorbrasil.com.br"
        ),
        new(
            Nome: "Checklist",
            Subtitulo: "Inspeções de frota via API Checkbits",
            Descricao: "Sincroniza a API do Checkbits a cada hora (background worker), persiste no Oracle e " +
                       "renderiza um painel de inspeções de empilhadeiras/frota: score médio, conformidade, " +
                       "ranking de operadores e itens mais reprovados. Substitui o relatório de Power BI.",
            Icone: "✅",
            Categoria: "Operação",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "Oracle", "REST API", "Chart.js" },
            Destaques: new[]
            {
                "Background worker sincroniza a cada 1h",
                "Integração com API externa (Checkbits)",
                "3.500+ checklists e 45 mil itens importados",
            },
            CorAccent: "#0D6EFD",
            Url: "https://checklist.condorbrasil.com.br"
        ),
        new(
            Nome: "Projeção de Cargas",
            Subtitulo: "Projeção de prazos de entrega",
            Descricao: "Primeiro app da suíte: consome uma query pesada do ERP e projeta o prazo de cada carga, " +
                       "com dashboard de KPIs, lista pesquisável (DataTables) e detalhe do pedido com mensagem " +
                       "pronta para o SAC. Deu início ao padrão de todas as apps seguintes.",
            Icone: "🚚",
            Categoria: "Logística",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "Oracle", "DataTables.js", "Bootstrap 5" },
            Destaques: new[]
            {
                "Cache em memória para respostas em ms",
                "Lista com busca, ordenação e filtros",
                "Mensagem pronta para o SAC por pedido",
            },
            CorAccent: "#E76B2F",
            Url: "https://projecaovendas.condorbrasil.com.br"
        ),
        new(
            Nome: "FMeta",
            Subtitulo: "Cadastro de metas de vendas",
            Descricao: "Aposenta uma planilha de metas com 3 abas (diária, positivação e mensal). Grava tudo " +
                       "em tabelas Oracle com UPSERT (MERGE), virando fonte de verdade consumida por outros " +
                       "dashboards. Equipes puxadas direto do cadastro de supervisores do ERP.",
            Icone: "🎲",
            Categoria: "Comercial",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "Oracle" },
            Destaques: new[]
            {
                "Substituiu planilha Excel por banco",
                "UPSERT (MERGE) idempotente",
                "Fonte de dados para outros painéis",
            },
            CorAccent: "#1E3A8A",
            Url: "https://metas.condorbrasil.com.br"
        ),
        new(
            Nome: "CMA ERP",
            Subtitulo: "Sistema de gestão para clínicas médicas",
            Descricao: "ERP completo para clínicas: agenda com calendário visual, prontuário eletrônico com " +
                       "busca de CID-10 (600+ códigos), prescrições, exames e atestados com PDF, financeiro e " +
                       "relatórios. Três perfis de acesso (Admin, Médico, Staff) com dashboards dedicados.",
            Icone: "🏥",
            Categoria: "Full-stack",
            Tecnologias: new[] { "React", "TypeScript", "Node.js", "Express", "Prisma", "SQLite", "Tailwind" },
            Destaques: new[]
            {
                "Prontuário com CID-10 (600+ códigos)",
                "Geração de PDF (prescrições, atestados, notas)",
                "3 perfis com dashboards dedicados",
            },
            CorAccent: "#198754",
            EmProducao: false
        ),
        new(
            Nome: "Este Portfólio",
            Subtitulo: "Blazor WebAssembly — C# rodando no navegador",
            Descricao: "O site que você está vendo é uma aplicação Blazor WebAssembly: C# .NET 8 compilado para " +
                       "WebAssembly, rodando 100% no seu navegador, sem servidor por trás. Hospedado de graça no " +
                       "GitHub Pages via GitHub Actions. Meta-projeto: a stack se demonstra sozinha.",
            Icone: "💠",
            Categoria: "Full-stack",
            Tecnologias: new[] { "C#", ".NET 8", "Blazor WebAssembly", "WebAssembly", "GitHub Actions" },
            Destaques: new[]
            {
                "C# rodando no navegador via WebAssembly",
                "Deploy automático (CI/CD) no GitHub Pages",
                "Zero servidor — 100% estático",
            },
            CorAccent: "#E76B2F",
            Repo: GitHub
        ),
    };
}
