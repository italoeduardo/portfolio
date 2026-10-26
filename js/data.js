// ============================================================
//  Conteúdo do portfólio — fonte única de verdade.
//  Editar aqui reflete automaticamente na página.
// ============================================================

const HERO_STACK = [
    "Java", "Spring Boot", "Spring Data JPA", "Thymeleaf", "Oracle / SQL", "JavaScript", "Power BI → Web"
];

const STATS = [
    { valor: "18+", rotulo: "Projetos entregues" },
    { valor: "8", rotulo: "Painéis BI → Web" },
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
        descricao: "Painel que mede o percentual de pedidos entregues no prazo E sem corte. Prazo em dias " +
            "úteis por região, com calendário de feriados nacionais (inclusive os móveis, calculados pela " +
            "Páscoa), visão de pedidos em risco e drill-down explicando por que cada pedido falhou.",
        icone: "🎯", categoria: "Logística",
        tecnologias: ["Java 21", "Spring Boot", "Spring Data JPA", "Thymeleaf", "Chart.js", "JUnit 5", "Docker"],
        destaques: [
            "Calendário de dias úteis com feriados móveis",
            "Duas visões: realizado e em risco",
            "25 testes automatizados + CI no GitHub Actions",
        ],
        cor: "#1E3A8A", repo: "https://github.com/italoeduardo/sla-tracker"
    },
    {
        nome: "LogiBoard",
        subtitulo: "Painel de KPIs logísticos com IA",
        descricao: "Painel com os 12 indicadores da operação logística (faturamento, corte, devolução, " +
            "estoque bloqueado, recebimento, retira, manutenção, produtividade…), metas editáveis só pelo " +
            "gestor, projeção de fechamento do mês e uma análise automática que aponta o que precisa de atenção.",
        icone: "📈", categoria: "Logística",
        tecnologias: ["Java 21", "Spring Boot", "Spring Security", "Spring Data JPA", "Thymeleaf", "Chart.js", "JUnit 5"],
        destaques: [
            "12 indicadores com status contra a meta",
            "Análise automática + projeção do mês",
            "Metas editáveis com login, CSRF e auditoria",
        ],
        cor: "#1E3A8A", repo: "https://github.com/italoeduardo/logiboard"
    },
    {
        nome: "FinPanel",
        subtitulo: "DRE + Frete com toggle Competência × Caixa",
        descricao: "DRE gerencial em cascata (faturamento, CMV, margem bruta, despesas por grupo e conta, " +
            "resultado operacional) e painel de fretes, com a chave Competência × Caixa e drill-down de " +
            "qualquer número até o lançamento que o compõe.",
        icone: "💰", categoria: "Financeiro",
        tecnologias: ["Java 21", "Spring Boot", "Spring Data JPA", "Thymeleaf", "Chart.js", "JUnit 5"],
        destaques: [
            "Competência × Caixa num clique",
            "Comparação com o período certo (mês, ano, janela)",
            "Drill-down até o lançamento contábil",
        ],
        cor: "#198754", repo: "https://github.com/italoeduardo/finpanel"
    },
    {
        nome: "WarehouseFlow",
        subtitulo: "Produtividade de separação (WMS)",
        descricao: "Painel de produtividade da separação no armazém: volumes por hora efetivamente separando, " +
            "ranking de separadores, matriz Separador × Setor em mapa de calor, evolução diária por turno e " +
            "o pico de separação ao longo do dia, com filtros por unidade, turno e setor.",
        icone: "📦", categoria: "Operação",
        tecnologias: ["Java 21", "Spring Boot", "Spring Data JPA", "Thymeleaf", "Chart.js", "JUnit 5"],
        destaques: [
            "Matriz Separador × Setor em mapa de calor",
            "Ranking com amostra mínima (sem distorção)",
            "Pico de separação por hora do dia",
        ],
        cor: "#5A3A6F", repo: "https://github.com/italoeduardo/warehouseflow"
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
        nome: "FinPanel · Java Edition",
        subtitulo: "Porte do FinPanel de .NET para Java",
        descricao: "Reescrita completa do FinPanel (DRE + Frete) trocando a stack: mesmo banco, mesmas " +
            "regras de negócio, 100% Java. Exercício deliberado de portabilidade entre linguagens — " +
            "os totais foram validados centavo a centavo contra a versão original.",
        icone: "☕", categoria: "Estudo",
        tecnologias: ["Java 21", "Spring Boot 3", "Thymeleaf", "JDBC", "Virtual Threads", "Caffeine (cache)"],
        destaques: [
            "Migração completa .NET → Java validada ao centavo",
            "Virtual Threads para paralelizar consultas pesadas",
            "Mesma UI e mesmas regras, stack 100% diferente",
        ],
        cor: "#E76B2F"
    },
    {
        nome: "AgendaPro",
        subtitulo: "Sistema de agendamentos para negócio local (cliente real)",
        descricao: "Plataforma completa de agendamento online para um negócio de serviços: site com reserva " +
            "de horários, portal do cliente com histórico e cadastro, e painel administrativo com agenda " +
            "em timeline, detecção automática de conflito de horário e bloqueios personalizados.",
        icone: "📅", categoria: "Atendimento",
        tecnologias: ["Java", "Spring Boot", "Spring Security", "JWT", "JPA", "PostgreSQL", "E-mail transacional"],
        destaques: [
            "Detecção automática de conflito de horário",
            "Multi-seleção de serviços com preço e duração somados",
            "Autenticação, e-mails transacionais e painel administrativo",
        ],
        cor: "#5A3A6F"
    },
    {
        nome: "ClinicSite",
        subtitulo: "Site institucional para clínica (cliente real)",
        descricao: "Site institucional completo para uma clínica médica: páginas de serviços, equipe, blog e " +
            "contato, com PWA instalável, formulário integrado a WhatsApp e otimização de performance " +
            "(imagens comprimidas em até 95%, cache versionado).",
        icone: "🩺", categoria: "Institucional",
        tecnologias: ["HTML5", "CSS3", "JavaScript", "PWA", "Service Worker"],
        destaques: [
            "PWA instalável com cache versionado offline",
            "Performance: ~8,6MB → ~1,5MB de imagens otimizadas",
            "Blog, depoimentos e formulário de contato integrado",
        ],
        cor: "#198754"
    },
    {
        nome: "Transcritor de Reunião",
        subtitulo: "Transcrição de reuniões em tempo real com IA",
        descricao: "Aplicativo desktop que transcreve reuniões ao vivo captando microfone e áudio do sistema " +
            "ao mesmo tempo, rotulando cada locutor. Detecção de fala própria (VAD) separa os trechos e um " +
            "modelo Whisper transcreve, com legenda ao vivo estilo streaming.",
        icone: "🎙️", categoria: "IA & Produtividade",
        tecnologias: ["C#", ".NET 8", "WPF", "NAudio", "Whisper (IA de fala)"],
        destaques: [
            "Legenda ao vivo com detecção de fala/pausa (VAD)",
            "Mistura microfone + áudio do sistema, rotulado por locutor",
            "Fila com descarte de trechos obsoletos para baixa latência",
        ],
        cor: "#0D6EFD", repo: "https://github.com/italoeduardo/transcritor-reuniao"
    },
    {
        nome: "GatePass",
        subtitulo: "Controle de recepção e ativos com QR/coletores",
        descricao: "Sistema de portaria para controle de visitantes/prestadores e rastreamento de " +
            "equipamentos (retirada e devolução), com dashboard de indicadores, exportação para Excel/PDF " +
            "e autenticação de usuários por perfil.",
        icone: "🚪", categoria: "Operação",
        tecnologias: ["Node.js", "Express", "React", "Vite", "Tailwind", "JWT", "SQL"],
        destaques: [
            "Rastreamento completo de retirada/devolução de ativos",
            "Dashboard com gráficos de uso (Recharts)",
            "Exportação para Excel e PDF",
        ],
        cor: "#1E3A8A"
    },
    {
        nome: "TicketFlow",
        subtitulo: "Central de chamados e suporte",
        descricao: "Sistema de abertura e acompanhamento de chamados de suporte, com fluxo de status, " +
            "histórico de interações e painel para a equipe de atendimento gerenciar a fila de tickets.",
        icone: "🎫", categoria: "Suporte",
        tecnologias: ["TypeScript", "Next.js", "Prisma", "React", "Tailwind"],
        destaques: [
            "Fluxo completo de status do chamado",
            "Painel de atendimento com fila priorizada",
            "Stack moderna full TypeScript (front + back)",
        ],
        cor: "#E76B2F"
    },
    {
        nome: "StatusHub",
        subtitulo: "Painel de monitoramento de aplicações",
        descricao: "Painel central que monitora a saúde de todas as outras aplicações internas em tempo " +
            "real (health checks periódicos), com login e histórico de disponibilidade — o \"painel dos " +
            "painéis\" que fecha o ciclo da suíte de sistemas.",
        icone: "🩻", categoria: "Infraestrutura",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "Health checks agendados"],
        destaques: [
            "Monitoramento centralizado de múltiplos sistemas",
            "Health checks agendados automaticamente",
            "Login e histórico de disponibilidade",
        ],
        cor: "#6B7280"
    },
    {
        nome: "PartnerHub",
        subtitulo: "Gestão de clientes por rede de parceiros",
        descricao: "Sistema de CRM simplificado para gerenciar clientes segmentados por rede/parceiro " +
            "comercial, com cadastro, histórico de relacionamento e indicadores por rede.",
        icone: "🤝", categoria: "Comercial",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "Spring Data JPA", "SQL"],
        destaques: [
            "Segmentação de clientes por rede comercial",
            "Indicadores por parceiro",
            "Cadastro e histórico de relacionamento",
        ],
        cor: "#1E3A8A"
    },
    {
        nome: "StockGuard",
        subtitulo: "Pedidos atrasados e estoque bloqueado",
        descricao: "Painel com dois indicadores operacionais críticos: pedidos em atraso e valor de estoque " +
            "bloqueado (avaria), com snapshot diário automático para permitir análise histórica de " +
            "tendência ao longo do tempo.",
        icone: "📉", categoria: "Logística",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "Spring Data JPA", "Job agendado"],
        destaques: [
            "Snapshot diário automático para série histórica",
            "Dois indicadores operacionais críticos num só painel",
            "Job agendado sem intervenção manual",
        ],
        cor: "#DC3545"
    },
    {
        nome: "ExpiryWatch",
        subtitulo: "Alertas de produtos a vencer",
        descricao: "Dashboard que substitui uma planilha manual de controle de validade: KPIs por faixa de " +
            "vencimento, exportação para Excel, análise automática por IA e gestão de usuários por perfil " +
            "(master/usuário).",
        icone: "⏰", categoria: "Estoque",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "Spring Data JPA", "IA generativa", "Chart.js"],
        destaques: [
            "KPIs por faixa de vencimento com auto-refresh",
            "Análise automática com IA generativa",
            "Substituiu processo 100% manual em planilha",
        ],
        cor: "#FFC107"
    },
    {
        nome: "MediClinic ERP",
        subtitulo: "Sistema de gestão para clínicas médicas",
        descricao: "ERP completo para clínicas: agenda com calendário, prontuário eletrônico com busca de " +
            "CID-10 (600+ códigos), prescrições, exames e atestados com PDF, financeiro e relatórios. " +
            "Três perfis de acesso (Admin, Médico, Staff) com dashboards dedicados.",
        icone: "🏥", categoria: "Full-stack",
        tecnologias: ["TypeScript", "React", "Node.js", "Express", "Prisma", "SQLite", "Tailwind", "Docker"],
        destaques: [
            "Prontuário com CID-10 (600+ códigos)",
            "Geração de PDF (prescrições, atestados, notas)",
            "3 perfis com autenticação JWT",
        ],
        cor: "#198754", repo: "https://github.com/italoeduardo/mediclinic-erp"
    },
];
