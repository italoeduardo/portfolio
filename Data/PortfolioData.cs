using Portfolio.Models;

namespace Portfolio.Data;

/// <summary>
/// Fonte única de verdade do conteúdo do portfólio.
/// Editar aqui reflete automaticamente em todas as seções da página.
/// Obs.: todos os projetos são apresentados como cases com dados fictícios.
/// </summary>
public static class PortfolioData
{
    public const string Nome = "Italo Eduardo";
    public const string Titulo = "Desenvolvedor Full-Stack & Analista de Dados / BI";
    public const string Email = "italoeduardo368@gmail.com";
    public const string LinkedIn = "https://www.linkedin.com/in/italo-eduardo-9614b3273";
    public const string Whatsapp = "https://wa.me/5561982522662";

    public const string Resumo =
        "Desenvolvedor full-stack focado em transformar dados operacionais em sistemas web e " +
        "dashboards que substituem planilhas e relatórios de BI por aplicações vivas — com " +
        "autenticação, metas editáveis e análise assistida por IA. Trabalho de ponta a ponta: " +
        "modelagem de dados em SQL, back-end em C#/.NET e Java, front-end responsivo e deploy em " +
        "produção com Linux, nginx e systemd.";

    public static readonly Estatistica[] Estatisticas =
    {
        new("8", "Projetos entregues"),
        new("6", "Painéis BI → Web"),
        new("5", "Linguagens principais"),
        new("100%", "Full-stack"),
    };

    public static readonly Skill[] Skills =
    {
        new("Back-end", "🧩", new[]
        {
            "C#", ".NET 8 / ASP.NET Core", "Java", "Spring Boot",
            "Razor Pages", "Blazor WebAssembly", "Node.js", "REST APIs"
        }),
        new("Front-end", "🎨", new[]
        {
            "HTML5 & CSS3", "JavaScript", "TypeScript", "React", "Bootstrap 5",
            "Chart.js", "Razor / Blazor UI"
        }),
        new("Dados & BI", "📊", new[]
        {
            "SQL avançado", "Oracle", "SQLite", "Prisma ORM",
            "Modelagem de dados", "Power BI → Web", "ETL & integrações"
        }),
        new("IA & Automação", "🤖", new[]
        {
            "APIs de IA generativa", "Análise assistida por IA", "Python",
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
            Nome: "DataVision",
            Subtitulo: "Dashboard de análise de dados — DEMO AO VIVO ↓",
            Descricao: "Aplicação de analytics interativa que roda aqui mesmo nesta página: KPIs com comparação " +
                       "de período, gráficos reativos, ranking de SLA e insights automáticos — tudo com dados " +
                       "fictícios gerados em C#. Inclui um showcase do back-end em Java (Spring Boot), C# (.NET) e SQL.",
            Icone: "📊",
            Categoria: "Analytics",
            Tecnologias: new[] { "C#", "Java", "Blazor WASM", "SQL", "SVG", "Data Viz" },
            Destaques: new[]
            {
                "Roda ao vivo no navegador (WebAssembly)",
                "Gráficos em SVG puro, reativos aos filtros",
                "Insights automáticos + showcase de código",
            },
            CorAccent: "#E76B2F",
            Url: "#demo"
        ),
        new(
            Nome: "SLA Tracker",
            Subtitulo: "OTIF — On Time In Full",
            Descricao: "Sistema que mede o percentual de pedidos entregues no prazo E sem corte, cruzando dados " +
                       "do ERP com eventos reais de entrega. Régua de prazo por estado (dias úteis, ignorando " +
                       "feriados), visão gerencial e visão operacional, com drill-down explicando por que cada " +
                       "pedido falhou.",
            Icone: "🎯",
            Categoria: "Logística",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "SQL", "Chart.js", "Bootstrap 5" },
            Destaques: new[]
            {
                "Cálculo de prazo por estado só em dias úteis",
                "Duas visões: realizado e em risco",
                "Drill-down do motivo da falha (atraso × corte)",
            },
            CorAccent: "#1E3A8A"
        ),
        new(
            Nome: "LogiBoard",
            Subtitulo: "Painel de KPIs logísticos com IA",
            Descricao: "Recriação web de um painel de BI: 12 indicadores + KPIs de topo (faturamento, cortes, " +
                       "devoluções, tempo de operação…), metas editáveis por usuário master e um botão de análise " +
                       "com IA que resume o período, aponta riscos e projeta o fechamento.",
            Icone: "📈",
            Categoria: "Logística",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "SQL", "IA generativa", "Chart.js" },
            Destaques: new[]
            {
                "12 indicadores + metas editáveis",
                "Análise automática com IA generativa",
                "Cache inteligente e auto-refresh",
            },
            CorAccent: "#1E3A8A"
        ),
        new(
            Nome: "FinPanel",
            Subtitulo: "DRE + Frete com toggle Competência × Caixa",
            Descricao: "Substitui um painel de BI de DRE. Duas páginas (DRE e Frete) com KPIs comparados ao " +
                       "período anterior, gráficos clicáveis com drill-down até o lançamento, e um toggle " +
                       "Competência/Caixa que reprocessa tudo diretamente no SQL.",
            Icone: "💰",
            Categoria: "Financeiro",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "SQL", "IA generativa", "Chart.js" },
            Destaques: new[]
            {
                "Toggle Competência × Caixa direto no SQL",
                "Drill-down até o lançamento contábil",
                "Comparação automática vs período anterior",
            },
            CorAccent: "#198754"
        ),
        new(
            Nome: "WarehouseFlow",
            Subtitulo: "Produtividade de separação (WMS)",
            Descricao: "Painel que substitui um relatório de BI de produtividade da separação no WMS. Mostra KPIs " +
                       "de ordens de serviço, peso e itens separados, matriz Separador × Setor, ranking de " +
                       "colaboradores e evolução dia a dia, com filtros ágeis por unidade, turno e setor.",
            Icone: "📦",
            Categoria: "Operação",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "SQL", "Chart.js" },
            Destaques: new[]
            {
                "Matriz Separador × Setor",
                "Ranking de colaboradores",
                "Filtros por unidade, turno e setor",
            },
            CorAccent: "#5A3A6F"
        ),
        new(
            Nome: "FleetCheck",
            Subtitulo: "Inspeções de frota via API externa",
            Descricao: "Sincroniza uma API de checklists a cada hora (background worker), persiste no banco e " +
                       "renderiza um painel de inspeções de empilhadeiras/frota: score médio, conformidade, " +
                       "ranking de operadores e itens mais reprovados. Substitui um relatório de BI.",
            Icone: "✅",
            Categoria: "Operação",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "SQL", "REST API", "Chart.js" },
            Destaques: new[]
            {
                "Background worker sincroniza a cada 1h",
                "Integração com API externa (JSON)",
                "Milhares de checklists e itens importados",
            },
            CorAccent: "#0D6EFD"
        ),
        new(
            Nome: "RouteCast",
            Subtitulo: "Projeção de prazos de entrega",
            Descricao: "Consome uma query pesada do ERP e projeta o prazo de cada carga, com dashboard de KPIs, " +
                       "lista pesquisável (busca, ordenação e filtros) e detalhe do pedido com mensagem pronta " +
                       "para o atendimento. Foi o projeto que deu início a todo um padrão de aplicações.",
            Icone: "🚚",
            Categoria: "Logística",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "SQL", "DataTables.js", "Bootstrap 5" },
            Destaques: new[]
            {
                "Cache em memória para respostas em ms",
                "Lista com busca, ordenação e filtros",
                "Mensagem pronta para o atendimento por pedido",
            },
            CorAccent: "#E76B2F"
        ),
        new(
            Nome: "MetaVendas",
            Subtitulo: "Gestão de metas comerciais",
            Descricao: "Aposenta uma planilha de metas com múltiplas abas (diária, positivação e mensal). Grava " +
                       "tudo em tabelas SQL com UPSERT (MERGE), virando fonte de verdade consumida por outros " +
                       "dashboards. Equipes puxadas direto do cadastro de supervisores.",
            Icone: "🎲",
            Categoria: "Comercial",
            Tecnologias: new[] { "C#", ".NET 8", "Razor Pages", "SQL" },
            Destaques: new[]
            {
                "Substituiu planilha Excel por banco",
                "UPSERT (MERGE) idempotente",
                "Fonte de dados para outros painéis",
            },
            CorAccent: "#1E3A8A"
        ),
        new(
            Nome: "MediClinic ERP",
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
            CorAccent: "#198754"
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
            CorAccent: "#E76B2F"
        ),
    };
}
