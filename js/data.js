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
        id: "otif",
        nome: "OTIF",
        chamada: "Quantos pedidos chegam no prazo e completos?",
        categoria: "Logística",
        cor: "#3b82f6",
        url: "otif.app",
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
        repo: "https://github.com/italoeduardo/otif",
        telas: [
            { img: "otif-painel", legenda: "Painel: OTIF, tendência mensal e motivos de falha" },
            { img: "otif-risco", legenda: "Pedidos em risco, ordenados por dias úteis de atraso" },
            { img: "otif-pedido", legenda: "Diagnóstico do pedido com a linha do tempo" },
        ],
    },
    {
        id: "gerot",
        nome: "GEROT",
        chamada: "Os 12 números que dizem se a operação está saudável",
        categoria: "Logística",
        cor: "#14b8a6",
        url: "gerot.app",
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
        repo: "https://github.com/italoeduardo/gerot",
        telas: [
            { img: "gerot-painel", legenda: "Visão geral: análise automática, projeção e os 12 KPIs" },
            { img: "gerot-recife", legenda: "Filtrando um CD: o que muda quando se olha uma unidade" },
        ],
    },
    {
        id: "painel-de-despesas",
        nome: "Painel de Despesas",
        chamada: "A DRE do mês sem abrir planilha nenhuma",
        categoria: "Financeiro",
        cor: "#10b981",
        url: "painel-de-despesas.app",
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
        repo: "https://github.com/italoeduardo/painel-de-despesas",
        telas: [
            { img: "despesas-dre", legenda: "DRE em cascata com margem bruta e operacional" },
            { img: "despesas-frete", legenda: "Fretes: custo por transportadora e por unidade" },
            { img: "despesas-lancamentos", legenda: "Drill-down até o lançamento, com situação de pagamento" },
        ],
    },
    {
        id: "produtividade",
        nome: "Produtividade",
        chamada: "Quem separa mais, em qual setor e em que hora do dia",
        categoria: "Operação",
        cor: "#8b5cf6",
        url: "produtividade.app",
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
        repo: "https://github.com/italoeduardo/produtividade",
        telas: [
            { img: "produtividade-painel", legenda: "Volumes por turno, pico por hora, ranking e matriz" },
            { img: "produtividade-recife", legenda: "Recorte de uma unidade: a equipe e seus setores" },
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
        id: "gestao-de-chamados",
        nome: "Gestão de Chamados",
        chamada: "Todo pedido de TI e RH num quadro só, com prazo e histórico",
        categoria: "Suporte",
        cor: "#d4a12a",
        url: "gestao-de-chamados.app",
        descricao: "Central de chamados com quadro kanban por situação, filas de atendimento e ações em massa. " +
            "Cada chamado tem prazo calculado pela prioridade, conversa com mensagens internas que o " +
            "solicitante não vê e um histórico que mostra quanto tempo ele ficou em cada etapa.",
        destaques: [
            "Prazo automático por prioridade, com selo de atrasado",
            "Histórico de situação: quem mudou e quanto tempo ficou em cada etapa",
            "Perfis de solicitante, atendente e gestor, com exportação para CSV",
        ],
        numeros: [{ v: "5", r: "etapas no kanban" }, { v: "4", r: "prioridades com prazo" }, { v: "3", r: "perfis de acesso" }],
        stack: ["TypeScript", "Next.js 16", "React 19", "Prisma", "SQLite", "Auth.js", "Tailwind"],
        repo: "https://github.com/italoeduardo/gestao-de-chamados",
        telas: [
            { img: "chamados-kanban", legenda: "Quadro kanban com os contadores por situação" },
            { img: "chamados-detalhe", legenda: "Chamado: prazo, conversa e histórico de situação" },
            { img: "chamados-todos", legenda: "Todos os chamados, com filtros e exportação" },
        ],
    },
    {
        id: "studio-felipe-serra",
        nome: "Studio Felipe Serra",
        chamada: "Barbearia com agenda online, do site ao painel do barbeiro",
        categoria: "Cliente",
        cor: "#d4af37",
        url: "studiofelipeserra.com",
        descricao: "Sistema completo de uma barbearia em Brasília, no ar: site com vídeo e serviços, portal onde o " +
            "cliente cria conta e marca o horário (os horários livres saem da duração dos serviços escolhidos) " +
            "e o painel do barbeiro com a agenda do dia, bloqueios e avisos em tempo real.",
        destaques: [
            "Vários serviços num horário só, com duração e preço somados pelo catálogo",
            "O barbeiro marca quem ligou ou chegou sem conta; se a pessoa criar conta depois, o histórico aparece",
            "Login do painel validado no servidor, com limite de tentativas",
        ],
        numeros: [{ v: "3", r: "partes: site, portal e painel" }, { v: "20", r: "serviços no catálogo" }, { v: "5,0 ★", r: "nota no Google" }],
        stack: [".NET 8", "ASP.NET Core", "EF Core", "PostgreSQL", "JWT", "HTML/CSS/JS", "Docker"],
        repo: "https://github.com/italoeduardo/studio-felipe-serra",
        link: "https://studiofelipeserra.com",
        telas: [
            { img: "studio-inicio", legenda: "Site: vídeo de abertura e apresentação do studio" },
            { img: "studio-servicos", legenda: "Serviços com duração e galeria de trabalhos" },
            { img: "studio-painel", legenda: "Painel do barbeiro: agenda do dia e resumo (dados fictícios)" },
            { img: "studio-horarios", legenda: "Avaliações, horário de funcionamento e contato" },
        ],
    },
    {
        id: "imperdata",
        nome: "Imperdata",
        chamada: "Site de tecnologia para postos, com a planta do posto viva",
        categoria: "Cliente",
        cor: "#e30613",
        url: "imperdata.com.br",
        descricao: "Site institucional de uma empresa de tecnologia e gestão para postos de combustíveis. O topo é uma " +
            "planta técnica do posto desenhada em SVG: bombas, tanques, conveniência e totem de preços acendem " +
            "conforme a solução escolhida. Feito sem framework e com LGPD de verdade.",
        destaques: [
            "Planta do posto interativa em SVG, ligada à lista de soluções",
            "Trabalhe conosco com envio de currículo que não fica gravado no servidor",
            "Cookies com consentimento por categoria e política de privacidade própria",
        ],
        numeros: [{ v: "9", r: "soluções na planta" }, { v: "0", r: "frameworks" }, { v: "LGPD", r: "consentimento de cookies" }],
        stack: ["HTML5", "CSS3", "JavaScript", "SVG", "PHP"],
        repo: "https://github.com/italoeduardo/imperdata",
        link: "https://imperdata.com.br",
        telas: [
            { img: "imperdata-inicio", legenda: "Abertura com a planta do posto e o dia a dia da operação" },
            { img: "imperdata-solucoes", legenda: "Soluções, integrações e o ecossistema do posto" },
            { img: "imperdata-metodo", legenda: "Como a empresa trabalha e seus diferenciais" },
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
        nome: "Projeção de Cargas", icone: "🚚", categoria: "Logística",
        descricao: "Projeta o prazo de cada carga a partir do ERP, com lista pesquisável e detalhe do pedido " +
            "com mensagem pronta para o atendimento. Deu início ao padrão de toda a suíte.",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "JPA", "DataTables.js"],
    },
    {
        nome: "FMeta", icone: "🎯", categoria: "Comercial",
        descricao: "Aposentou uma planilha de metas com várias abas: grava metas diárias, de positivação e " +
            "mensais no banco com upsert idempotente, virando fonte para outros painéis.",
        tecnologias: ["Java", "Spring Boot", "JPA", "SQL"],
    },
    {
        nome: "Checklist", icone: "✅", categoria: "Operação",
        descricao: "Sincroniza de hora em hora uma API externa de checklists de frota e mostra score, " +
            "conformidade, ranking de operadores e itens mais reprovados.",
        tecnologias: ["Java", "Spring Boot", "Scheduler", "REST API", "JPA"],
    },
    {
        nome: "Alertas de Vencimento", icone: "⏰", categoria: "Estoque",
        descricao: "Substituiu o controle manual de validade: faixas de vencimento, exportação para Excel, " +
            "análise automática e usuários por perfil.",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf", "JPA", "Chart.js"],
    },
    {
        nome: "Indicadores Logísticos", icone: "📉", categoria: "Logística",
        descricao: "Pedidos atrasados e estoque bloqueado num só painel, com fotografia diária automática " +
            "para análise de tendência.",
        tecnologias: ["Java", "Spring Boot", "JPA", "Job agendado"],
    },
    {
        nome: "Portaria", icone: "🚪", categoria: "Operação",
        descricao: "Portaria com controle de retirada e devolução de equipamentos, indicadores de uso e " +
            "exportação para Excel e PDF.",
        tecnologias: ["Node.js", "Express", "React", "Tailwind", "JWT"],
    },
    {
        nome: "Status das Aplicações", icone: "🩺", categoria: "Infraestrutura",
        descricao: "Monitora a saúde das outras aplicações com health checks periódicos e histórico de " +
            "disponibilidade — o “painel dos painéis”.",
        tecnologias: ["Java", "Spring Boot", "Thymeleaf"],
    },
    {
        nome: "Redes Parceiras", icone: "🤝", categoria: "Comercial",
        descricao: "CRM simplificado para clientes segmentados por rede de parceiros, com histórico e " +
            "indicadores por rede.",
        tecnologias: ["Java", "Spring Boot", "JPA", "SQL"],
    },
    {
        nome: "Site da Clínica", icone: "🌐", categoria: "Institucional",
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

// ---------- Laboratório: sistemas que rodam no navegador (pasta demos/) ----------
// dica: o que fazer primeiro; login: credenciais de demonstração (quando há)
const LAB = {
    "otif": { dica: "Clique numa transportadora ou UF para filtrar e abra um pedido para ver o diagnóstico." },
    "gerot": { dica: "Troque o CD e o período. Em Metas, mude uma meta e veja o painel reagir.", login: "gestor / gestor123 (só para editar metas)" },
    "painel-de-despesas": { dica: "Alterne Competência × Caixa e clique em qualquer despesa para chegar aos lançamentos." },
    "produtividade": { dica: "Filtre por unidade, turno e setor, ou clique num setor da tabela." },
    "gestao-de-chamados": { dica: "Entre como Gestor, Atendente ou Solicitante, arraste chamados entre as colunas e responda um chamado.", login: "botões de perfil na tela de login (senha 123456)" },
    "mediclinic": { dica: "Agenda, pacientes, prontuário com CID-10, receitas em PDF e financeiro.", login: "admin@mediclinic.dev · medico@mediclinic.dev · recepcao@mediclinic.dev (senha 123456)" },
    "studio-felipe-serra": { dica: "Painel do barbeiro com agenda fictícia: marque, confirme, bloqueie horários.", login: "senha demo", rotulo: "Studio Felipe Serra · painel" },
};
