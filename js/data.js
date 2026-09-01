// ============================================================
//  Conteúdo do portfólio — fonte única de verdade.
//  Editar aqui reflete automaticamente na página.
// ============================================================

const HERO_STACK = [
    "Java", "Spring Boot", "Spring Data JPA", "Thymeleaf", "Oracle / SQL", "JavaScript", "Power BI → Web"
];

const STATS = [
    { valor: "8", rotulo: "Projetos entregues" },
    { valor: "6", rotulo: "Painéis BI → Web" },
    { valor: "5", rotulo: "Linguagens principais" },
    { valor: "100%", rotulo: "Full-stack" },
];

const SKILLS = [
    {
        nome: "Back-end", icone: "🧩",
        itens: ["Java", "Spring Boot", "Spring MVC", "Spring Data JPA", "Hibernate", "REST APIs", "Maven"]
    },
    {
        nome: "Front-end", icone: "🎨",
        itens: ["HTML5 & CSS3", "JavaScript", "Thymeleaf", "Bootstrap 5", "Chart.js", "SVG / Data Viz"]
    },
    {
        nome: "Dados & BI", icone: "📊",
        itens: ["SQL avançado", "Oracle", "PostgreSQL", "JPA / Hibernate", "Modelagem de dados", "Power BI → Web", "ETL & integrações"]
    },
    {
        nome: "Testes & Qualidade", icone: "🧪",
        itens: ["JUnit", "Mockito", "Postman", "Swagger / OpenAPI", "Clean Code"]
    },
    {
        nome: "DevOps & Deploy", icone: "🚀",
        itens: ["Linux (Ubuntu)", "nginx (reverse proxy)", "systemd", "Docker", "GitHub Actions", "Git"]
    },
];

const PROJETOS = [
    {
        nome: "DataVision",
        subtitulo: "Dashboard de análise de dados — DEMO AO VIVO ↓",
        descricao: "Aplicação de analytics interativa que roda aqui mesmo nesta página: KPIs com comparação " +
            "de período, gráficos reativos, ranking de SLA e insights automáticos — tudo com dados fictícios " +
            "gerados no navegador. Inclui um showcase do back-end em Java (Spring Boot), JPA e SQL.",
        icone: "📊", categoria: "Analytics",
        tecnologias: ["Java", "Spring Boot", "JPA", "SQL", "JavaScript", "SVG"],
        destaques: [
            "Roda ao vivo no navegador",
            "Gráficos em SVG puro, reativos aos filtros",
            "Insights automáticos + showcase de código Java",
        ],
        cor: "#E76B2F", url: "#demo"
    },
    {
        nome: "SLA Tracker",
        subtitulo: "OTIF — On Time In Full",
        descricao: "Sistema que mede o percentual de pedidos entregues no prazo E sem corte, cruzando dados " +
            "do ERP com eventos reais de entrega. Régua de prazo por estado (dias úteis, ignorando feriados), " +
            "visão gerencial e visão operacional, com drill-down explicando por que cada pedido falhou.",
        icone: "🎯", categoria: "Logística",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "Spring Data JPA", "Oracle", "Chart.js"],
        destaques: [
            "Cálculo de prazo por estado só em dias úteis",
            "Duas visões: realizado e em risco",
            "Drill-down do motivo da falha (atraso × corte)",
        ],
        cor: "#1E3A8A"
    },
    {
        nome: "LogiBoard",
        subtitulo: "Painel de KPIs logísticos com IA",
        descricao: "Recriação web de um painel de BI: 12 indicadores + KPIs de topo (faturamento, cortes, " +
            "devoluções, tempo de operação…), metas editáveis por usuário master e um botão de análise " +
            "com IA que resume o período, aponta riscos e projeta o fechamento.",
        icone: "📈", categoria: "Logística",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "Spring Data JPA", "IA generativa", "Chart.js"],
        destaques: [
            "12 indicadores + metas editáveis",
            "Análise automática com IA generativa",
            "Cache inteligente e auto-refresh",
        ],
        cor: "#1E3A8A"
    },
    {
        nome: "FinPanel",
        subtitulo: "DRE + Frete com toggle Competência × Caixa",
        descricao: "Substitui um painel de BI de DRE. Duas páginas (DRE e Frete) com KPIs comparados ao " +
            "período anterior, gráficos clicáveis com drill-down até o lançamento, e um toggle " +
            "Competência/Caixa que reprocessa tudo diretamente no SQL.",
        icone: "💰", categoria: "Financeiro",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "Spring Data JPA", "IA generativa", "Chart.js"],
        destaques: [
            "Toggle Competência × Caixa direto no SQL",
            "Drill-down até o lançamento contábil",
            "Comparação automática vs período anterior",
        ],
        cor: "#198754"
    },
    {
        nome: "WarehouseFlow",
        subtitulo: "Produtividade de separação (WMS)",
        descricao: "Painel que substitui um relatório de BI de produtividade da separação no WMS. Mostra KPIs " +
            "de ordens de serviço, peso e itens separados, matriz Separador × Setor, ranking de colaboradores " +
            "e evolução dia a dia, com filtros ágeis por unidade, turno e setor.",
        icone: "📦", categoria: "Operação",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "Spring Data JPA", "Chart.js"],
        destaques: [
            "Matriz Separador × Setor",
            "Ranking de colaboradores",
            "Filtros por unidade, turno e setor",
        ],
        cor: "#5A3A6F"
    },
    {
        nome: "FleetCheck",
        subtitulo: "Inspeções de frota via API externa",
        descricao: "Sincroniza uma API de checklists a cada hora (job agendado), persiste no banco e " +
            "renderiza um painel de inspeções de empilhadeiras/frota: score médio, conformidade, " +
            "ranking de operadores e itens mais reprovados. Substitui um relatório de BI.",
        icone: "✅", categoria: "Operação",
        tecnologias: ["Java", "Spring Boot", "Spring Scheduler", "REST API", "Spring Data JPA", "Chart.js"],
        destaques: [
            "Job agendado sincroniza a cada 1h",
            "Integração com API externa (JSON)",
            "Milhares de checklists e itens importados",
        ],
        cor: "#0D6EFD"
    },
    {
        nome: "RouteCast",
        subtitulo: "Projeção de prazos de entrega",
        descricao: "Consome uma query pesada do ERP e projeta o prazo de cada carga, com dashboard de KPIs, " +
            "lista pesquisável (busca, ordenação e filtros) e detalhe do pedido com mensagem pronta para o " +
            "atendimento. Foi o projeto que deu início a todo um padrão de aplicações.",
        icone: "🚚", categoria: "Logística",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "Spring Data JPA", "Oracle", "DataTables.js"],
        destaques: [
            "Cache em memória para respostas em ms",
            "Lista com busca, ordenação e filtros",
            "Mensagem pronta para o atendimento por pedido",
        ],
        cor: "#E76B2F"
    },
    {
        nome: "MetaVendas",
        subtitulo: "Gestão de metas comerciais",
        descricao: "Aposenta uma planilha de metas com múltiplas abas (diária, positivação e mensal). Grava " +
            "tudo em tabelas SQL via JPA (upsert idempotente), virando fonte de verdade consumida por outros " +
            "dashboards. Equipes puxadas direto do cadastro de supervisores.",
        icone: "🎲", categoria: "Comercial",
        tecnologias: ["Java", "Spring Boot", "Spring Data JPA", "Oracle"],
        destaques: [
            "Substituiu planilha Excel por banco",
            "Upsert idempotente via JPA",
            "Fonte de dados para outros painéis",
        ],
        cor: "#1E3A8A"
    },
    {
        nome: "MediClinic ERP",
        subtitulo: "Sistema de gestão para clínicas médicas",
        descricao: "ERP completo para clínicas: agenda com calendário, prontuário eletrônico com busca de " +
            "CID-10 (600+ códigos), prescrições, exames e atestados com PDF, financeiro e relatórios. " +
            "Três perfis de acesso (Admin, Médico, Staff) com dashboards dedicados.",
        icone: "🏥", categoria: "Full-stack",
        tecnologias: ["Java", "Spring Boot", "Spring Security", "Thymeleaf", "JPA / Hibernate", "PostgreSQL", "iText (PDF)"],
        destaques: [
            "Prontuário com CID-10 (600+ códigos)",
            "Geração de PDF (prescrições, atestados, notas)",
            "3 perfis com Spring Security",
        ],
        cor: "#198754"
    },
];
