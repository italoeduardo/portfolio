// ============================================================
//  Conteúdo do portfólio — fonte única de verdade.
//  Todos os sistemas usam dados 100% fictícios.
// ============================================================

const PERFIL = {
    nome: "Italo Eduardo",
    cargo: "Desenvolvedor Java Full-Stack & Analista de Dados",
    email: "italoeduardo368@gmail.com",
    linkedin: "https://www.linkedin.com/in/italo-eduardo-9614b3273",
    whatsapp: "https://wa.me/5561982522662",
    github: "https://github.com/italoeduardo",
};

const STATS = [
    { valor: 18, sufixo: "+", rotulo: "sistemas entregues" },
    { valor: 8, sufixo: "", rotulo: "painéis de BI viraram apps" },
    { valor: 72, sufixo: "", rotulo: "testes automatizados públicos" },
    { valor: 9, sufixo: "", rotulo: "repositórios abertos" },
];

// ---------- Vitrine: os sistemas que passam como "vídeo" ----------
// telas: capturas reais dos sistemas rodando com dados fictícios (assets/sistemas)
const VITRINE = [
    {
        id: "sla-tracker",
        nome: "SLA Tracker",
        chamada: "Quantos pedidos chegam no prazo e completos?",
        categoria: "Logística",
        cor: "#3b82f6",
        url: "sla-tracker.app",
        descricao: "Mede o OTIF (On Time In Full) de uma operação de entregas: cada pedido é avaliado contra " +
            "o prazo prometido em dias úteis — com feriados nacionais, inclusive os móveis — e contra a " +
            "quantidade entregue. O painel mostra tendência, transportadoras e regiões com pior desempenho, " +
            "e lista os pedidos que já estouraram o prazo enquanto ainda dá tempo de agir.",
        destaques: [
            "Calendário de dias úteis que calcula a Páscoa e os feriados móveis de qualquer ano",
            "Visão “em risco”: pedidos em rota com prazo estourado, do mais atrasado ao menos",
            "Diagnóstico de cada pedido explicando por que falhou (atraso, corte ou os dois)",
        ],
        numeros: [{ v: "25", r: "testes" }, { v: "1.400+", r: "pedidos simulados" }, { v: "D+2 a D+8", r: "prazos por região" }],
        stack: ["Java 21", "Spring Boot", "Spring Data JPA", "Thymeleaf", "Chart.js", "JUnit 5", "Docker"],
        repo: "https://github.com/italoeduardo/sla-tracker",
        telas: [
            { img: "sla-painel", legenda: "Painel: OTIF, tendência mensal e motivos de falha" },
            { img: "sla-risco", legenda: "Pedidos em risco, ordenados por dias úteis de atraso" },
            { img: "sla-pedido", legenda: "Diagnóstico do pedido com a linha do tempo" },
        ],
    },
    {
        id: "logiboard",
        nome: "LogiBoard",
        chamada: "Os 12 números que dizem se a operação está saudável",
        categoria: "Logística",
        cor: "#14b8a6",
        url: "logiboard.app",
        descricao: "Painel com os 12 indicadores de um centro de distribuição — faturamento, corte, devolução, " +
            "estoque bloqueado, recebimento, retira, manutenção e produtividade. Cada um com meta, status, " +
            "variação contra o período anterior e mini-gráfico. Uma análise automática escreve em português " +
            "o que está fora da meta e projeta o fechamento do mês.",
        destaques: [
            "Análise automática: o pior desvio primeiro, maior melhora e maior piora do período",
            "Projeção do faturamento do mês pelo ritmo dos dias úteis já trabalhados",
            "Metas editáveis só pelo gestor, com Spring Security, CSRF e registro de quem alterou",
        ],
        numeros: [{ v: "12", r: "indicadores" }, { v: "24", r: "testes" }, { v: "2", r: "centros de distribuição" }],
        stack: ["Java 21", "Spring Boot", "Spring Security", "Spring Data JPA", "Thymeleaf", "Chart.js", "JUnit 5"],
        repo: "https://github.com/italoeduardo/logiboard",
        telas: [
            { img: "logiboard-painel", legenda: "Visão geral: análise automática, projeção e os 12 KPIs" },
            { img: "logiboard-recife", legenda: "Filtrando um CD: o que muda quando se olha uma unidade" },
        ],
    },
    {
        id: "finpanel",
        nome: "FinPanel",
        chamada: "A DRE do mês sem abrir planilha nenhuma",
        categoria: "Financeiro",
        cor: "#10b981",
        url: "finpanel.app",
        descricao: "DRE gerencial em cascata — faturamento, custo das mercadorias, margem bruta, despesas por " +
            "grupo e conta, resultado operacional — e um painel de fretes. Uma chave alterna entre competência " +
            "(quando o fato aconteceu) e caixa (quando o dinheiro saiu), e qualquer número abre os lançamentos " +
            "que o compõem.",
        destaques: [
            "Competência × Caixa num clique — o mesmo salário cai em meses diferentes",
            "Compara com o período certo: mês com mês anterior, acumulado com o ano passado",
            "Drill-down de qualquer grupo, conta ou fornecedor até o lançamento contábil",
        ],
        numeros: [{ v: "18", r: "contas no plano" }, { v: "14", r: "testes" }, { v: "~2 anos", r: "de histórico simulado" }],
        stack: ["Java 21", "Spring Boot", "Spring Data JPA", "Thymeleaf", "Chart.js", "JUnit 5"],
        repo: "https://github.com/italoeduardo/finpanel",
        telas: [
            { img: "finpanel-dre", legenda: "DRE em cascata com margem bruta e operacional" },
            { img: "finpanel-frete", legenda: "Fretes: custo por transportadora e por unidade" },
            { img: "finpanel-lancamentos", legenda: "Drill-down até o lançamento, com situação de pagamento" },
        ],
    },
    {
        id: "warehouseflow",
        nome: "WarehouseFlow",
        chamada: "Quem separa mais, em qual setor e em que hora do dia",
        categoria: "Operação",
        cor: "#8b5cf6",
        url: "warehouseflow.app",
        descricao: "Produtividade da separação no armazém: volumes por hora efetivamente separando, ranking dos " +
            "separadores, matriz Separador × Setor em mapa de calor, evolução por turno e o pico de " +
            "separação ao longo do dia — com filtros por unidade, turno e setor.",
        destaques: [
            "Produtividade justa: conta só as horas separando, não as horas de turno",
            "Mapa de calor que mostra especialistas e dependência de uma pessoa só",
            "Simulação com curva de aprendizado de uma separadora recém-contratada",
        ],
        numeros: [{ v: "24", r: "separadores" }, { v: "6", r: "setores" }, { v: "3", r: "turnos" }],
        stack: ["Java 21", "Spring Boot", "Spring Data JPA", "Thymeleaf", "Chart.js", "JUnit 5"],
        repo: "https://github.com/italoeduardo/warehouseflow",
        telas: [
            { img: "warehouse-painel", legenda: "Volumes por turno, pico por hora, ranking e matriz" },
            { img: "warehouse-recife", legenda: "Recorte de uma unidade: a equipe e seus setores" },
        ],
    },
    {
        id: "mediclinic",
        nome: "MediClinic ERP",
        chamada: "Uma clínica inteira: da agenda ao prontuário",
        categoria: "Saúde",
        cor: "#22c55e",
        url: "mediclinic.app",
        descricao: "ERP para clínicas médicas com três perfis de acesso: agenda com fluxo de atendimento, " +
            "prontuário eletrônico com busca de CID-10 e alerta de alergias, receitas, atestados e pedidos de " +
            "exame em PDF, financeiro e notas de serviço. O painel do médico mostra a fila do dia.",
        destaques: [
            "Prontuário com sinais vitais, CID-10 (600+ códigos) e alerta de alergias",
            "Receitas, atestados, laudos e pedidos de exame gerados em PDF",
            "Perfis Administrador, Médico e Recepção, com permissões no back-end",
        ],
        numeros: [{ v: "3", r: "perfis de acesso" }, { v: "600+", r: "códigos CID-10" }, { v: "1", r: "container Docker" }],
        stack: ["TypeScript", "React", "Node.js", "Express", "Prisma", "SQLite", "Tailwind", "Docker"],
        repo: "https://github.com/italoeduardo/mediclinic-erp",
        telas: [
            { img: "mediclinic-painel", legenda: "Painel da clínica com a agenda do dia" },
            { img: "mediclinic-prontuario", legenda: "Prontuário com CID-10, sinais vitais e receita" },
            { img: "mediclinic-agendamentos", legenda: "Agendamentos com o fluxo de atendimento" },
            { img: "mediclinic-financeiro", legenda: "Financeiro: receitas, despesas e saldo" },
        ],
    },
    {
        id: "transcritor",
        nome: "Transcritor de Reunião",
        chamada: "Legenda ao vivo de tudo que se fala na reunião",
        categoria: "IA & Produtividade",
        cor: "#f59e0b",
        url: "Transcritor de Reunião — Windows",
        descricao: "App desktop que capta ao mesmo tempo o microfone (o que você fala) e o som do sistema (o que " +
            "os outros falam no Teams, Meet ou Zoom), separa os trechos com uma detecção de fala própria e " +
            "transcreve com Whisper, mostrando legenda ao vivo e o histórico rotulado por locutor.",
        destaques: [
            "Duas fontes de áudio em paralelo: microfone e loopback do sistema",
            "Detecção de fala por energia: uma pausa de 0,6 s fecha o trecho",
            "Parciais obsoletos são descartados para a legenda não atrasar",
        ],
        numeros: [{ v: "2", r: "fontes de áudio" }, { v: "~1,5 s", r: "por legenda parcial" }, { v: "0,6 s", r: "de pausa fecha a frase" }],
        stack: ["C#", ".NET 8", "WPF", "NAudio", "Whisper (IA de fala)"],
        repo: "https://github.com/italoeduardo/transcritor-reuniao",
        animacao: "transcritor",
    },
];

// ---------- Outros projetos (grade compacta) ----------
const PROJETOS = [
    {
        nome: "RouteCast", icone: "🚚", categoria: "Logística",
        descricao: "Projeta o prazo de cada carga a partir do ERP, com lista pesquisável e detalhe do pedido " +
            "com mensagem pronta para o atendimento. Deu início ao padrão de toda a suíte.",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "JPA", "DataTables.js"],
    },
    {
        nome: "MetaVendas", icone: "🎯", categoria: "Comercial",
        descricao: "Aposentou uma planilha de metas com várias abas: grava metas diárias, de positivação e " +
            "mensais no banco com upsert idempotente, virando fonte para outros painéis.",
        tecnologias: ["Java", "Spring Boot", "JPA", "SQL"],
    },
    {
        nome: "FleetCheck", icone: "✅", categoria: "Operação",
        descricao: "Sincroniza de hora em hora uma API externa de checklists de frota e mostra score, " +
            "conformidade, ranking de operadores e itens mais reprovados.",
        tecnologias: ["Java", "Spring Boot", "Scheduler", "REST API", "JPA"],
    },
    {
        nome: "ExpiryWatch", icone: "⏰", categoria: "Estoque",
        descricao: "Substituiu o controle manual de validade: faixas de vencimento, exportação para Excel, " +
            "análise automática e usuários por perfil.",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "JPA", "Chart.js"],
    },
    {
        nome: "StockGuard", icone: "📉", categoria: "Logística",
        descricao: "Pedidos atrasados e estoque bloqueado num só painel, com fotografia diária automática " +
            "para análise de tendência.",
        tecnologias: ["Java", "Spring Boot", "JPA", "Job agendado"],
    },
    {
        nome: "GatePass", icone: "🚪", categoria: "Operação",
        descricao: "Portaria com controle de retirada e devolução de equipamentos, indicadores de uso e " +
            "exportação para Excel e PDF.",
        tecnologias: ["Node.js", "Express", "React", "Tailwind", "JWT"],
    },
    {
        nome: "Gestão de Chamados", icone: "🎫", categoria: "Suporte",
        descricao: "Central de chamados com quadro kanban de arrastar e soltar, fluxo de status, histórico " +
            "de interações e login por perfil.",
        tecnologias: ["TypeScript", "Next.js", "Prisma", "NextAuth", "React"],
        repo: "https://github.com/italoeduardo/gestao-de-chamados",
    },
    {
        nome: "StatusHub", icone: "🩺", categoria: "Infraestrutura",
        descricao: "Monitora a saúde das outras aplicações com health checks periódicos e histórico de " +
            "disponibilidade — o “painel dos painéis”.",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf"],
    },
    {
        nome: "PartnerHub", icone: "🤝", categoria: "Comercial",
        descricao: "CRM simplificado para clientes segmentados por rede de parceiros, com histórico e " +
            "indicadores por rede.",
        tecnologias: ["Java", "Spring Boot", "JPA", "SQL"],
    },
    {
        nome: "Studio Felipe Serra", icone: "💈", categoria: "Cliente",
        descricao: "Site e sistema de agendamento de uma barbearia em Brasília: reservas online, portal do " +
            "cliente, painel do barbeiro com agenda do dia e confirmação por e-mail.",
        tecnologias: [".NET 8", "ASP.NET Core", "EF Core", "PostgreSQL", "JWT", "Docker"],
        link: "https://studiofelipeserra.com",
        repo: "https://github.com/italoeduardo/studio-felipe-serra",
    },
    {
        nome: "Imperdata", icone: "⛽", categoria: "Cliente",
        descricao: "Site institucional de uma empresa de tecnologia para postos de combustíveis, com o " +
            "conceito de “planta do posto” interativa e página de trabalhe conosco.",
        tecnologias: ["HTML5", "CSS3", "JavaScript", "SVG", "PHP"],
        link: "https://imperdata.com.br",
        repo: "https://github.com/italoeduardo/imperdata",
    },
    {
        nome: "ClinicSite", icone: "🌐", categoria: "Institucional",
        descricao: "Site institucional de clínica como PWA instalável, com blog e contato. Imagens caíram de " +
            "~8,6 MB para ~1,5 MB.",
        tecnologias: ["HTML5", "CSS3", "JavaScript", "PWA"],
    },
];

const SKILLS = [
    { nome: "Back-end", icone: "⚙️", itens: ["Java 21", "Spring Boot", "Spring Security", "Spring Data JPA", "Hibernate", "REST APIs", "Maven", "C# / .NET", "Node.js"] },
    { nome: "Dados & BI", icone: "📊", itens: ["SQL avançado", "Oracle", "PostgreSQL", "SQLite", "Modelagem de dados", "Power BI → Web", "ETL"] },
    { nome: "Front-end", icone: "🎨", itens: ["HTML & CSS", "JavaScript", "TypeScript", "React", "Thymeleaf", "Chart.js", "SVG"] },
    { nome: "Qualidade", icone: "🧪", itens: ["JUnit 5", "MockMvc", "Testes de regra de negócio", "Clean Code"] },
    { nome: "DevOps", icone: "🚀", itens: ["Docker", "GitHub Actions", "Linux", "nginx", "systemd", "Git"] },
];
