// ============================================================
//  Gestão de Chamados — versão que roda no navegador.
//  Mesmas telas e regras do sistema em Next.js + Prisma
//  (github.com/italoeduardo/gestao-de-chamados): visibilidade por perfil,
//  kanban com arrastar e soltar, histórico de situação, mensagens internas,
//  confirmação de leitura, fila, distribuição em massa e exportação CSV.
//  O "banco" fica no localStorage do visitante.
// ============================================================
(function () {
    "use strict";
    const { Rota, esc, Local } = window.Demo;

    // ---------- Constantes (lib/ticket-constants.ts) ----------
    const STATUS_LABELS = { OPEN: "Novo", IN_PROGRESS: "Em Andamento", PENDING: "Pendente com Solicitante", RESOLVED: "Resolvido", CLOSED: "Encerrado" };
    const STATUS_ORDER = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];
    const PRIORITY_LABELS = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta", URGENT: "Urgente" };
    const PRIORITY_COLORS = { LOW: "bg-slate-100 text-slate-700", MEDIUM: "bg-blue-100 text-blue-700", HIGH: "bg-amber-100 text-amber-700", URGENT: "bg-red-100 text-red-700" };
    const STATUS_THEME = {
        OPEN: { icon: "M12 8v8M8 12h8M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", iconBg: "bg-slate-100", iconText: "text-slate-500", chipBg: "bg-slate-100", chipText: "text-slate-600", cardAccent: "border-l-slate-400", gradient: "from-slate-400 to-slate-500" },
        IN_PROGRESS: { icon: "M21 12a9 9 0 1 1-3-6.7M21 4v5h-5", iconBg: "bg-blue-100", iconText: "text-blue-600", chipBg: "bg-blue-100", chipText: "text-blue-700", cardAccent: "border-l-blue-500", gradient: "from-blue-400 to-blue-600" },
        PENDING: { icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 3", iconBg: "bg-amber-100", iconText: "text-amber-600", chipBg: "bg-amber-100", chipText: "text-amber-700", cardAccent: "border-l-amber-500", gradient: "from-amber-400 to-amber-500" },
        RESOLVED: { icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8 12l3 3 5-6", iconBg: "bg-emerald-100", iconText: "text-emerald-600", chipBg: "bg-emerald-100", chipText: "text-emerald-700", cardAccent: "border-l-emerald-500", gradient: "from-emerald-400 to-emerald-600" },
        CLOSED: { icon: "M4 7h16M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", iconBg: "bg-slate-200", iconText: "text-slate-500", chipBg: "bg-slate-200", chipText: "text-slate-600", cardAccent: "border-l-slate-500", gradient: "from-slate-500 to-slate-600" },
    };
    const ROLE_LABELS = { REQUESTER: "Solicitante", AGENT: "Atendente", MANAGER: "Gestor" };
    const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-cyan-500"];
    const avatarColor = (name) => { let h = 0; for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % AVATAR_COLORS.length; return AVATAR_COLORS[h]; };
    const initials = (name) => name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
    const novoId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

    // ---------- "Banco" (mesmo seed do prisma/seed.ts, com datas relativas a agora) ----------
    const CHAVE = "demo.gestao-chamados.v1";
    function seed() {
        const agora = Date.now(), H = 3600000;
        const ti = { id: "dep-ti", name: "TI" }, rh = { id: "dep-rh", name: "RH" };
        const subjects = [
            { id: "s1", departmentId: ti.id, name: "Computador com defeito", defaultPriority: "HIGH" },
            { id: "s2", departmentId: ti.id, name: "Acesso a sistema", defaultPriority: "MEDIUM" },
            { id: "s3", departmentId: ti.id, name: "Internet / Rede", defaultPriority: "HIGH" },
            { id: "s4", departmentId: ti.id, name: "Instalação de software", defaultPriority: "LOW" },
            { id: "s5", departmentId: rh.id, name: "Dúvida sobre benefícios", defaultPriority: "LOW" },
        ];
        const users = [
            { id: "u-gestor", name: "Gestor TI", email: "gestor@exemplo.com", role: "MANAGER", departmentId: ti.id, active: true },
            { id: "u-atendente", name: "Atendente TI", email: "atendente@exemplo.com", role: "AGENT", departmentId: ti.id, active: true },
            { id: "u-usuario", name: "Usuário Teste", email: "usuario@exemplo.com", role: "REQUESTER", departmentId: null, active: true },
        ];
        const solicitantes = ["Ana Ribeiro", "Bruno Lima", "Carla Mendes", "Diego Souza", "Elisa Martins"].map((nome, i) => {
            const u = { id: "u-sol" + i, name: nome, email: nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(" ", ".") + "@exemplo.com", role: "REQUESTER", departmentId: null, active: true };
            users.push(u);
            return u;
        });
        const news = [{ id: "n1", title: "Bem-vindo à Gestão de Chamados", authorId: "u-gestor", coverImageUrl: null, createdAt: agora - 26 * H,
            content: "Esse é o novo sistema de chamados de TI e RH. Use o menu ao lado para abrir chamados, acompanhar novidades e, se você for gestor, cadastrar pessoas em Configurações." }];
        const demos = [
            ["Notebook não liga após atualização", "Depois da atualização de ontem o notebook não passa da tela preta.", "s1", "IN_PROGRESS", "HIGH", 1],
            ["Sem acesso ao ERP", "Minha senha do ERP expirou e não consigo redefinir.", "s2", "OPEN", "MEDIUM", 0],
            ["Wi-Fi caindo na sala de reunião", "A rede cai a cada 10 minutos na sala 2.", "s3", "PENDING", "HIGH", 3],
            ["Instalar Power BI Desktop", "Preciso do Power BI para os relatórios do mês.", "s4", "RESOLVED", "LOW", 6],
            ["Impressora do financeiro offline", "A impressora aparece como offline para todo o setor.", "s1", "OPEN", "URGENT", 0],
            ["Liberar acesso à pasta de contratos", "Entrei no jurídico e preciso da pasta compartilhada.", "s2", "IN_PROGRESS", "MEDIUM", 2],
            ["Dúvida sobre vale-refeição", "O valor do VR deste mês veio diferente.", "s5", "RESOLVED", "LOW", 8],
            ["VPN não conecta de casa", "Erro de autenticação ao conectar na VPN.", "s3", "OPEN", "HIGH", 1],
            ["Monitor piscando", "O segundo monitor fica piscando de tempos em tempos.", "s1", "CLOSED", "MEDIUM", 12],
            ["Instalar pacote Office", "Máquina nova sem o Office instalado.", "s4", "IN_PROGRESS", "MEDIUM", 2],
            ["Criar usuário para estagiária", "Estagiária começa segunda e precisa de e-mail e ERP.", "s2", "RESOLVED", "MEDIUM", 9],
            ["Internet lenta no estoque", "Coletores demorando para sincronizar no estoque.", "s3", "PENDING", "MEDIUM", 4],
        ];
        const tickets = [], messages = [], events = [];
        demos.forEach(([title, description, sid, status, priority, diasAtras], i) => {
            const criado = agora - diasAtras * 24 * H - (i + 1) * H;
            const s = subjects.find((x) => x.id === sid);
            const sol = solicitantes[i % solicitantes.length];
            const resolvido = status === "RESOLVED" || status === "CLOSED";
            const t = { id: "t" + (1001 + i), number: 1001 + i, title, description, status, priority, departmentId: s.departmentId, subjectId: s.id,
                requesterId: sol.id, assigneeId: status === "OPEN" ? null : "u-atendente", createdAt: criado, updatedAt: criado + (status === "OPEN" ? 0 : H),
                dueAt: criado + (priority === "URGENT" ? 4 : priority === "HIGH" ? 24 : 72) * H, resolvedAt: resolvido ? criado + 20 * H : null };
            tickets.push(t);
            events.push({ id: novoId(), ticketId: t.id, fromStatus: null, toStatus: "OPEN", changedById: sol.id, createdAt: criado });
            if (status !== "OPEN") {
                messages.push({ id: novoId(), ticketId: t.id, authorId: "u-atendente", isInternal: false, createdAt: criado + H, content: "Olá! Já estou verificando, te aviso assim que tiver novidade." });
                events.push({ id: novoId(), ticketId: t.id, fromStatus: "OPEN", toStatus: status, changedById: resolvido ? "u-gestor" : "u-atendente", createdAt: criado + H });
            }
        });
        return { departments: [ti, rh], subjects, users, news, tickets, messages, events, reads: [] };
    }
    let db = Local.ler(CHAVE, null) || seed();
    const salvar = () => Local.gravar(CHAVE, db);
    salvar();

    const user = (id) => db.users.find((u) => u.id === id);
    const dept = (id) => db.departments.find((d) => d.id === id);
    const subj = (id) => db.subjects.find((s) => s.id === id);
    const ticket = (id) => db.tickets.find((t) => t.id === id);
    const porNome = (a, b) => a.name.localeCompare(b.name, "pt-BR");

    // ---------- Sessão ----------
    const sessao = () => { try { const u = user(sessionStorage.getItem("demo.chamados.usuario")); return u && u.active ? u : null; } catch (e) { return null; } };
    const entrar = (id) => { try { sessionStorage.setItem("demo.chamados.usuario", id); } catch (e) { /* sem storage */ } };
    const sair = () => { try { sessionStorage.removeItem("demo.chamados.usuario"); } catch (e) { /* sem storage */ } };

    // ---------- Regras (lib/tickets.ts) ----------
    function visivel(u, t) {
        if (u.role === "MANAGER") return true;
        if (u.role === "AGENT") return t.departmentId === (u.departmentId ?? "__none__");
        return t.requesterId === u.id;
    }
    const recentes = (lista) => [...lista].sort((a, b) => b.createdAt - a.createdAt);
    const listTickets = (u) => recentes(db.tickets.filter((t) => visivel(u, t)));
    const listReceived = (u) => recentes(db.tickets.filter((t) => visivel(u, t) && t.requesterId !== u.id));
    const listSent = (u) => recentes(db.tickets.filter((t) => t.requesterId === u.id));
    const listQueue = (u) => recentes(db.tickets.filter((t) => !t.assigneeId && t.status === "OPEN" && (u.role === "MANAGER" || t.departmentId === (u.departmentId ?? "__none__"))));
    function podeVer(u, t) {
        return u.role === "MANAGER" || (u.role === "AGENT" && t.departmentId === u.departmentId) || t.requesterId === u.id;
    }
    function registrarStatus(ticketId, de, para, por) {
        if (de === para) return;
        db.events.push({ id: novoId(), ticketId, fromStatus: de, toStatus: para, changedById: por, createdAt: Date.now() });
    }
    function marcarLido(userId, ticketId) {
        const r = db.reads.find((x) => x.ticketId === ticketId && x.userId === userId);
        if (r) r.lastReadAt = Date.now(); else db.reads.push({ ticketId, userId, lastReadAt: Date.now() });
    }
    function naoLidos(u) {
        const set = new Set();
        db.tickets.filter((t) => visivel(u, t)).forEach((t) => {
            const msgs = db.messages.filter((m) => m.ticketId === t.id && (u.role !== "REQUESTER" || !m.isInternal));
            const ultimaMsg = msgs.reduce((m, x) => Math.max(m, x.createdAt), 0);
            const atividade = ultimaMsg > t.updatedAt ? ultimaMsg : t.updatedAt;
            const lido = db.reads.find((r) => r.ticketId === t.id && r.userId === u.id);
            if (!lido || atividade > lido.lastReadAt) set.add(t.id);
        });
        return set;
    }
    function mudarStatus(u, t, status) {
        const de = t.status;
        t.status = status;
        if (status === "RESOLVED") t.resolvedAt = Date.now();
        t.updatedAt = Date.now();
        registrarStatus(t.id, de, status, u.id);
        marcarLido(u.id, t.id);
        salvar();
    }
    const atendentes = (u) => db.users.filter((x) => x.active && (x.role === "AGENT" || x.role === "MANAGER") && (u.role !== "AGENT" || x.departmentId === u.departmentId)).sort(porNome);

    // ---------- Datas (date-fns com ptBR) ----------
    const dois = (n) => String(n).padStart(2, "0");
    const fmtData = (ms) => { const d = new Date(ms); return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`; };
    const fmtHora = (ms) => { const d = new Date(ms); return `${dois(d.getHours())}:${dois(d.getMinutes())}`; };
    function distancia(ms) {
        const seg = Math.max(0, (Date.now() - ms) / 1000), min = Math.round(seg / 60);
        let t;
        if (min < 1) t = "menos de um minuto";
        else if (min < 2) t = "1 minuto";
        else if (min < 45) t = `${min} minutos`;
        else if (min < 90) t = "cerca de 1 hora";
        else if (min < 1440) t = `cerca de ${Math.round(min / 60)} horas`;
        else if (min < 2520) t = "1 dia";
        else if (min < 43200) t = `${Math.round(min / 1440)} dias`;
        else t = `cerca de ${Math.round(min / 43200)} meses`;
        return "há " + t;
    }
    function duracao(ms) {
        const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
        if (d > 0) return `${d} dia${d > 1 ? "s" : ""} ${h}h`;
        if (h > 0) return `${h}h ${m}min`;
        if (m > 0) return `${m} min ${s % 60}s`;
        return `${s % 60}s`;
    }

    // ---------- Pedaços de interface ----------
    const svg = (path, cls, sw = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="${path}"/></svg>`;
    const prioridade = (p) => `<span class="rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_COLORS[p]}">${PRIORITY_LABELS[p]}</span>`;
    const app = document.getElementById("app");

    function shell(u, ativo, conteudo) {
        const unread = naoLidos(u).size;
        const itens = [
            ["/home", "Home", "M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"],
            ["/noticias", "Notícias", "M4 5h13a2 2 0 0 1 2 2v11a1 1 0 0 1-1.5.87L15 17H6a2 2 0 0 1-2-2V5Zm0 0v13a1 1 0 0 1-1.7.7L1 17.3M8 9h8M8 13h5"],
            ["/chamados", "Chamados", "M4 4h16v12H7l-3 3V4Z", unread],
        ];
        if (u.role === "MANAGER") itens.push(["/configuracoes", "Configurações", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.15-1.5l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2.6-1.5L14.5 2h-5l-.35 2.7a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5A8 8 0 0 0 4 12c0 .5.05 1 .15 1.5l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2.6 1.5L9.5 22h5l.35-2.7a8 8 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5c.1-.5.15-1 .15-1.5Z"]);
        const roleBadge = { REQUESTER: "bg-white/10 text-slate-300", AGENT: "bg-blue-400/20 text-blue-300", MANAGER: "bg-brand-gold/20 text-brand-gold-light" }[u.role];
        const logo = `<a href="#/home" class="flex items-center gap-2.5"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold-light to-brand-gold text-sm font-bold text-white shadow-sm">G</span><span class="text-base font-semibold tracking-tight text-white">Gestão de Chamados</span></a>`;
        const lateral = `
        <div class="flex h-full flex-col bg-brand-dark">
            <div class="border-b border-white/10 px-4 py-4">${logo}</div>
            <nav class="flex-1 overflow-y-auto px-2.5 py-4"><ul class="flex flex-col gap-0.5">${itens.map(([href, label, path, badge]) => {
                const on = ativo === href || ativo.startsWith(href + "/");
                return `<li><a href="#${href}" class="group relative flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${on ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}">
                    ${on ? `<span class="absolute -left-2.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-brand-gold-light"></span>` : ""}
                    <span class="flex items-center gap-2.5"><span class="${on ? "text-brand-gold-light" : "text-slate-500 group-hover:text-slate-300"}">${svg(path, "h-5 w-5 shrink-0", 1.8)}</span>${label}</span>
                    ${badge ? `<span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">${badge > 9 ? "9+" : badge}</span>` : ""}</a></li>`;
            }).join("")}</ul></nav>
            <div class="border-t border-white/10 px-4 py-3.5">
                <div class="mb-2.5 flex items-center gap-2.5">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">${initials(u.name)}</span>
                    <div class="min-w-0"><p class="truncate text-sm font-medium text-slate-100">${esc(u.name)}</p>
                        <span class="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${roleBadge}">${ROLE_LABELS[u.role]}</span></div>
                </div>
                <button class="text-xs font-medium text-slate-500 transition-colors hover:text-white" data-acao="sair">Sair</button>
                <p class="demo-aviso mt-2">Demonstração · o que você muda fica só neste navegador. <button data-acao="restaurar">Restaurar dados</button></p>
            </div>
        </div>`;
        app.innerHTML = `
        <div class="flex min-h-screen bg-neutral-50">
            <aside class="hidden w-56 shrink-0 sm:block">${lateral}</aside>
            <div class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] sm:hidden" id="veu" hidden></div>
            <aside class="fixed inset-y-0 left-0 z-50 w-64 transform shadow-xl transition-transform duration-200 sm:hidden -translate-x-full" id="gaveta">${lateral}</aside>
            <div class="flex min-w-0 flex-1 flex-col">
                <div class="flex items-center justify-between bg-brand-dark px-4 py-3 sm:hidden">
                    <button aria-label="Abrir menu" id="abrirMenu" class="text-slate-300 transition-colors hover:text-white">${svg("M4 6h16M4 12h16M4 18h16", "h-6 w-6", 1.8)}</button>
                    ${logo}<span class="w-6"></span>
                </div>
                <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">${conteudo}</main>
            </div>
        </div>`;
        const gaveta = document.getElementById("gaveta"), veu = document.getElementById("veu");
        document.getElementById("abrirMenu").onclick = () => { gaveta.classList.replace("-translate-x-full", "translate-x-0"); veu.hidden = false; };
        veu.onclick = () => { gaveta.classList.replace("translate-x-0", "-translate-x-full"); veu.hidden = true; };
        app.querySelectorAll("[data-acao=sair]").forEach((b) => b.onclick = () => { sair(); Rota.ir("/login"); });
        app.querySelectorAll("[data-acao=restaurar]").forEach((b) => b.onclick = () => {
            if (!confirm("Voltar todos os chamados, usuários e notícias ao estado inicial da demonstração?")) return;
            Local.apagar(CHAVE); db = seed(); salvar(); render();
        });
    }

    // ---------- Telas ----------
    function telaLogin(erro) {
        app.innerHTML = `
        <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark px-4">
            <div aria-hidden="true" class="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl"></div>
            <div aria-hidden="true" class="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl"></div>
            <div aria-hidden="true" class="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle,_#ffffff_1px,_transparent_1px)] [background-size:22px_22px]"></div>
            <div class="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-2xl shadow-black/30">
                <div class="mb-6 flex flex-col items-center text-center">
                    <span class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold-light to-brand-gold text-lg font-bold text-white shadow-sm shadow-black/20">G</span>
                    <h1 class="text-xl font-semibold text-slate-900">Gestão de Chamados</h1>
                    <p class="mt-1 text-sm text-slate-500">Entre com seu e-mail e senha para acessar</p>
                </div>
                <form class="flex flex-col gap-4" id="formLogin">
                    <div class="flex flex-col gap-1"><label for="email" class="text-sm font-medium text-slate-700">E-mail</label>
                        <input id="email" name="email" type="email" required autofocus class="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" placeholder="voce@exemplo.com"></div>
                    <div class="flex flex-col gap-1"><label for="password" class="text-sm font-medium text-slate-700">Senha</label>
                        <input id="password" name="password" type="password" required class="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"></div>
                    ${erro ? `<p class="text-sm text-red-600">${esc(erro)}</p>` : ""}
                    <button type="submit" class="mt-2 rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark-hover">Entrar</button>
                </form>
                <div class="demo-dica"><p class="text-xs text-slate-500">Demonstração: senha <b>123456</b>. Ou entre direto como:</p>
                    <div class="demo-perfis"><button data-email="gestor@exemplo.com">Gestor</button><button data-email="atendente@exemplo.com">Atendente</button><button data-email="usuario@exemplo.com">Solicitante</button></div></div>
            </div>
        </div>`;
        const form = document.getElementById("formLogin");
        const tentar = (email, senha) => {
            const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
            if (!u || senha !== "123456") return telaLogin("E-mail ou senha inválidos.");
            if (!u.active) return telaLogin("Usuário desativado.");
            entrar(u.id); Rota.ir("/home");
        };
        form.onsubmit = (e) => { e.preventDefault(); tentar(form.email.value, form.password.value); };
        app.querySelectorAll("[data-email]").forEach((b) => b.onclick = () => tentar(b.dataset.email, "123456"));
    }

    function telaHome(u) {
        const unread = naoLidos(u).size;
        const news = [...db.news].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
        const [destaque, ...resto] = news;
        const apps = [["/noticias", "Notícias", "bg-emerald-500", "M4 5h13a2 2 0 0 1 2 2v11a1 1 0 0 1-1.5.87L15 17H6a2 2 0 0 1-2-2V5Zm0 0v13a1 1 0 0 1-1.7.7L1 17.3M8 9h8M8 13h5"], ["/chamados", "Chamados", "bg-blue-500", "M4 4h16v12H7l-3 3V4Z"]];
        shell(u, "/home", `
        <div class="flex flex-col gap-8">
            <div><h1 class="mb-4 text-lg font-semibold text-slate-900">Meus Aplicativos</h1>
                <div class="flex flex-wrap gap-4">${apps.map(([href, label, cor, path]) => `
                    <a href="#${href}" class="relative flex w-24 flex-col items-center gap-2 text-center">
                        ${href === "/chamados" && unread > 0 ? `<span class="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">${unread > 9 ? "9+" : unread}</span>` : ""}
                        <span class="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-sm transition hover:opacity-90 ${cor}">${svg(path, "h-7 w-7", 1.8)}</span>
                        <span class="text-xs font-medium text-slate-700">${label}</span></a>`).join("")}</div></div>
            ${destaque ? `<div><h2 class="mb-4 text-lg font-semibold text-slate-900">Em destaque</h2>
                <a href="#/noticias/${destaque.id}" class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md sm:flex-row">
                    ${destaque.coverImageUrl ? `<img src="${esc(destaque.coverImageUrl)}" alt="" class="h-48 w-full object-cover sm:h-auto sm:w-72 sm:shrink-0">` : `<div class="h-48 w-full bg-slate-100 sm:h-auto sm:w-72 sm:shrink-0"></div>`}
                    <div class="flex flex-col gap-2 p-5"><h3 class="text-lg font-semibold text-slate-900">${esc(destaque.title)}</h3>
                        <p class="line-clamp-3 text-sm text-slate-600">${esc(destaque.content)}</p>
                        <p class="mt-auto text-xs text-slate-400">${fmtData(destaque.createdAt)} · Publicado por ${esc(user(destaque.authorId)?.name || "")}</p></div></a></div>` : ""}
            <div><div class="mb-4 flex items-center justify-between"><h2 class="text-lg font-semibold text-slate-900">Notícias</h2><a href="#/noticias" class="text-sm font-medium text-slate-500 hover:text-slate-900">Ver todas</a></div>
                ${resto.length === 0 ? `<p class="text-sm text-slate-400">${destaque ? "Sem outras notícias por enquanto." : "Nenhuma notícia publicada ainda."}</p>` : `
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">${resto.map((n) => `<a href="#/noticias/${n.id}" class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                    ${n.coverImageUrl ? `<img src="${esc(n.coverImageUrl)}" alt="" class="h-32 w-full object-cover">` : `<div class="h-32 w-full bg-slate-100"></div>`}
                    <div class="flex flex-1 flex-col gap-2 p-4"><h3 class="line-clamp-2 text-sm font-semibold text-slate-900">${esc(n.title)}</h3><p class="mt-auto text-xs text-slate-400">Publicado por ${esc(user(n.authorId)?.name || "")}</p></div></a>`).join("")}</div>`}
            </div>
        </div>`);
    }

    function telaNoticias(u) {
        const news = [...db.news].sort((a, b) => b.createdAt - a.createdAt);
        shell(u, "/noticias", `
        <div class="mb-6 flex items-center justify-between"><h1 class="text-lg font-semibold text-slate-900">Notícias</h1>
            ${u.role === "MANAGER" ? `<a href="#/noticias/novo" class="rounded-md bg-brand-dark px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark-hover">+ Nova notícia</a>` : ""}</div>
        ${news.length === 0 ? `<p class="text-sm text-slate-400">Nenhuma notícia publicada ainda.</p>` : `
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">${news.map((n) => `<a href="#/noticias/${n.id}" class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
            ${n.coverImageUrl ? `<img src="${esc(n.coverImageUrl)}" alt="" class="h-40 w-full object-cover">` : `<div class="h-40 w-full bg-slate-100"></div>`}
            <div class="flex flex-1 flex-col gap-2 p-4"><h3 class="line-clamp-2 text-sm font-semibold text-slate-900">${esc(n.title)}</h3><p class="line-clamp-2 text-xs text-slate-500">${esc(n.content)}</p>
                <p class="mt-auto text-xs text-slate-400">${fmtData(n.createdAt)} · Publicado por ${esc(user(n.authorId)?.name || "")}</p></div></a>`).join("")}</div>`}`);
    }

    function telaNoticia(u, id) {
        const n = db.news.find((x) => x.id === id);
        if (!n) return telaNaoEncontrado(u, "/noticias");
        shell(u, "/noticias", `
        <div class="mx-auto max-w-3xl">
            ${n.coverImageUrl ? `<img src="${esc(n.coverImageUrl)}" alt="" class="mb-6 h-64 w-full rounded-xl object-cover">` : ""}
            <div class="flex items-start justify-between gap-4"><h1 class="text-2xl font-semibold text-slate-900">${esc(n.title)}</h1>
                ${u.role === "MANAGER" ? `<div class="flex shrink-0 gap-2"><button id="excluirNoticia" class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Excluir</button></div>` : ""}</div>
            <p class="mt-1 text-sm text-slate-400">${fmtData(n.createdAt)} às ${fmtHora(n.createdAt)} · Publicado por ${esc(user(n.authorId)?.name || "")}</p>
            <p class="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">${esc(n.content)}</p>
        </div>`);
        const b = document.getElementById("excluirNoticia");
        if (b) b.onclick = () => { if (confirm("Excluir esta notícia?")) { db.news = db.news.filter((x) => x.id !== id); salvar(); Rota.ir("/noticias"); } };
    }

    function telaNovaNoticia(u) {
        if (u.role !== "MANAGER") return Rota.ir("/noticias");
        shell(u, "/noticias", `
        <div class="max-w-xl"><h1 class="mb-6 text-lg font-semibold text-slate-900">Nova notícia</h1>
            <div class="rounded-xl border border-slate-200 bg-white p-6"><form class="flex flex-col gap-4" id="formNoticia">
                <div class="flex flex-col gap-1"><label class="text-sm font-medium text-slate-700">Título</label><input name="title" required maxlength="150" class="rounded-md border border-slate-300 px-3 py-2 text-sm"></div>
                <div class="flex flex-col gap-1"><label class="text-sm font-medium text-slate-700">URL da imagem de capa (opcional)</label><input name="coverImageUrl" type="url" placeholder="https://..." class="rounded-md border border-slate-300 px-3 py-2 text-sm"></div>
                <div class="flex flex-col gap-1"><label class="text-sm font-medium text-slate-700">Conteúdo</label><textarea name="content" required rows="8" class="rounded-md border border-slate-300 px-3 py-2 text-sm"></textarea></div>
                <button type="submit" class="mt-2 self-start rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark-hover">Publicar</button>
            </form></div></div>`);
        const f = document.getElementById("formNoticia");
        f.onsubmit = (e) => {
            e.preventDefault();
            const n = { id: novoId(), title: f.title.value.trim(), content: f.content.value.trim(), coverImageUrl: f.coverImageUrl.value.trim() || null, authorId: u.id, createdAt: Date.now() };
            if (!n.title || !n.content) return;
            db.news.push(n); salvar(); Rota.ir("/noticias/" + n.id);
        };
    }

    // ----- Chamados: listas -----
    function subNav(ativo) {
        const tabs = [["/chamados", "Recebido"], ["/chamados/enviado", "Enviado"], ["/chamados/todos", "Todos"], ["/chamados/fila", "Fila"], ["/chamados/em-massa", "Em Massa"]];
        return `<div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
            <nav class="flex flex-wrap gap-1">${tabs.map(([href, label]) => `<a href="#${href}" class="border-b-2 px-3 py-2 text-sm font-medium transition-colors ${ativo === href ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-900"}">${label}</a>`).join("")}</nav>
            <div class="flex items-center gap-2"><a href="#/chamados/novo" class="demo-novo">+ Novo chamado</a>
            <button id="exportar" class="mb-2 flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50">${svg("M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2", "h-4 w-4")}Exportar CSV</button></div>
        </div>`;
    }
    function ligarExportar(u) {
        const b = document.getElementById("exportar");
        if (!b) return;
        b.onclick = () => {
            const csvEsc = (v) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
            const linhas = [["Título", "Status", "Prioridade", "Departamento", "Assunto", "Solicitante", "Responsável", "Aberto em", "Atualizado em"],
                ...listTickets(u).map((t) => [t.title, STATUS_LABELS[t.status], PRIORITY_LABELS[t.priority], dept(t.departmentId).name, subj(t.subjectId).name,
                    user(t.requesterId).name, t.assigneeId ? user(t.assigneeId).name : "", fmtData(t.createdAt) + " " + fmtHora(t.createdAt), fmtData(t.updatedAt) + " " + fmtHora(t.updatedAt)])];
            const csv = "﻿" + linhas.map((l) => l.map((c) => csvEsc(String(c))).join(",")).join("\r\n");
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
            const d = new Date();
            a.download = `chamados-${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}.csv`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        };
    }
    function statusStats(tickets) {
        return `<div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">${STATUS_ORDER.map((s) => {
            const th = STATUS_THEME[s];
            return `<div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${th.gradient}"></div>
                <div class="flex items-center gap-2.5"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${th.iconBg} ${th.iconText}">${svg(th.icon, "h-4 w-4")}</span>
                    <div class="min-w-0"><p class="text-xl font-semibold leading-none text-slate-900">${tickets.filter((t) => t.status === s).length}</p><p class="mt-1 truncate text-[11px] text-slate-500">${STATUS_LABELS[s]}</p></div></div></div>`;
        }).join("")}</div>`;
    }
    function board(tickets, editable, unread) {
        const card = (t) => {
            const th = STATUS_THEME[t.status], quem = t.assigneeId ? user(t.assigneeId).name : user(t.requesterId).name;
            return `<div ${editable ? `draggable="true" data-id="${t.id}"` : ""} class="${editable ? "demo-card " : ""}group relative touch-none rounded-lg border-l-4 border-y border-r border-slate-200 bg-white p-3 shadow-sm transition-all ${th.cardAccent} hover:-translate-y-0.5 hover:shadow-md">
                ${unread.has(t.id) ? `<span title="Tem atividade nova" class="absolute -right-1.5 -top-1.5 h-3 w-3 animate-pulse rounded-full bg-blue-500 ring-2 ring-white"></span>` : ""}
                <a href="#/chamados/${t.id}" draggable="false" class="text-sm font-medium text-slate-900 group-hover:text-blue-700">${esc(t.title)}</a>
                <p class="mt-1 line-clamp-2 text-xs text-slate-500">${esc(subj(t.subjectId).name)} · ${esc(dept(t.departmentId).name)}</p>
                <div class="mt-2.5 flex items-center justify-between gap-2">${prioridade(t.priority)}
                    <span class="flex items-center gap-1 truncate text-[11px] text-slate-400"><span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-600">${quem.charAt(0).toUpperCase()}</span>${esc(quem)}</span></div>
            </div>`;
        };
        return `<div class="grid grid-cols-1 gap-4 md:grid-cols-5">${STATUS_ORDER.map((s) => {
            const th = STATUS_THEME[s], lista = tickets.filter((t) => t.status === s);
            return `<div class="flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-2.5">
                <div class="flex items-center justify-between px-0.5"><div class="flex items-center gap-2"><span class="flex h-6 w-6 items-center justify-center rounded-md ${th.iconBg} ${th.iconText}">${svg(th.icon, "h-3.5 w-3.5")}</span>
                    <h2 class="text-sm font-semibold text-slate-700">${STATUS_LABELS[s]}</h2></div>
                    <span class="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${th.chipBg} ${th.chipText}">${lista.length}</span></div>
                <div class="flex min-h-28 flex-col gap-2 rounded-lg p-1 transition" data-coluna="${s}">
                    ${lista.length === 0 ? `<div class="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-300">Vazio</div>` : ""}
                    ${lista.map(card).join("")}</div></div>`;
        }).join("")}</div>`;
    }
    function ligarArrastar(u) {
        let arrastando = null;
        app.querySelectorAll("[data-id][draggable]").forEach((c) => {
            c.addEventListener("dragstart", (e) => { arrastando = c.dataset.id; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", arrastando); setTimeout(() => c.classList.add("demo-arrastando")); });
            c.addEventListener("dragend", () => { c.classList.remove("demo-arrastando"); arrastando = null; });
        });
        app.querySelectorAll("[data-coluna]").forEach((col) => {
            col.addEventListener("dragover", (e) => { if (arrastando) { e.preventDefault(); col.classList.add("demo-sobre"); } });
            col.addEventListener("dragleave", () => col.classList.remove("demo-sobre"));
            col.addEventListener("drop", (e) => {
                e.preventDefault(); col.classList.remove("demo-sobre");
                const t = ticket(e.dataTransfer.getData("text/plain"));
                if (t && t.status !== col.dataset.coluna && podeVer(u, t)) { mudarStatus(u, t, col.dataset.coluna); render(); }
            });
        });
    }
    function telaLista(u, caminho) {
        const req = u.role === "REQUESTER";
        if (req && caminho !== "/chamados") return Rota.ir("/chamados");
        const unread = naoLidos(u);
        let titulo, tickets, editable, vazio = "Nenhum chamado por aqui ainda.";
        if (caminho === "/chamados/enviado") { titulo = "Enviado"; tickets = listSent(u); editable = false; vazio = "Você ainda não abriu nenhum chamado."; }
        else if (caminho === "/chamados/todos") { titulo = "Todos"; tickets = listTickets(u); editable = true; }
        else { titulo = req ? "Meus chamados" : "Recebido"; tickets = req ? listTickets(u) : listReceived(u); editable = !req; }
        shell(u, "/chamados", `<div>${req ? "" : subNav(caminho)}
            ${req ? `<div class="flex items-center justify-between"><h1 class="mb-4 text-lg font-semibold text-slate-900">${titulo}</h1><a href="#/chamados/novo" class="demo-novo">+ Novo chamado</a></div>` : `<h1 class="mb-4 text-lg font-semibold text-slate-900">${titulo}</h1>`}
            ${statusStats(tickets)}
            ${tickets.length === 0 ? `<p class="text-sm text-slate-500">${vazio}</p>` : ""}
            ${board(tickets, editable, unread)}</div>`);
        ligarExportar(u);
        if (editable) ligarArrastar(u);
    }
    function telaFila(u) {
        if (u.role === "REQUESTER") return Rota.ir("/chamados");
        const unread = naoLidos(u), tickets = listQueue(u);
        shell(u, "/chamados", `<div>${subNav("/chamados/fila")}
            <div class="mb-5 flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">${svg("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 3", "h-5 w-5")}</span>
                <div><h1 class="text-lg font-semibold text-slate-900">Fila</h1><p class="text-sm text-slate-500">${tickets.length} chamado(s) novo(s), ainda sem responsável</p></div></div>
            ${tickets.length === 0 ? `<div class="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center"><p class="text-sm text-slate-400">A fila está vazia 🎉</p></div>` : ""}
            <div class="flex flex-col gap-2.5">${tickets.map((t) => `
                <div class="relative flex flex-col gap-3 rounded-xl border-l-4 border-y border-r bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${unread.has(t.id) ? "border-l-blue-500 border-y-blue-200 border-r-blue-200" : "border-l-amber-400 border-y-slate-200 border-r-slate-200"}">
                    <div class="min-w-0"><div class="flex items-center gap-2">${unread.has(t.id) ? `<span title="Tem atividade nova" class="h-2 w-2 shrink-0 animate-pulse rounded-full bg-blue-500"></span>` : ""}
                        <a href="#/chamados/${t.id}" class="text-sm font-medium text-slate-900 hover:text-blue-700">${esc(t.title)}</a></div>
                        <p class="mt-1 text-xs text-slate-500">${esc(subj(t.subjectId).name)} · ${esc(dept(t.departmentId).name)} · aberto por ${esc(user(t.requesterId).name)} · ${distancia(t.createdAt)}</p></div>
                    <div class="flex shrink-0 items-center gap-3">${prioridade(t.priority)}<button data-assumir="${t.id}" class="shrink-0 rounded-md bg-brand-dark px-3 py-1.5 text-sm font-medium text-white shadow-sm shadow-black/20 transition hover:bg-brand-dark-hover">Assumir chamado</button></div>
                </div>`).join("")}</div></div>`);
        ligarExportar(u);
        ligarAssumir(u);
    }
    function ligarAssumir(u) {
        app.querySelectorAll("[data-assumir]").forEach((b) => b.onclick = () => {
            const t = ticket(b.dataset.assumir);
            if (!t || !podeVer(u, t)) return;
            const de = t.status;
            t.assigneeId = u.id; t.status = "IN_PROGRESS"; t.updatedAt = Date.now();
            registrarStatus(t.id, de, "IN_PROGRESS", u.id); marcarLido(u.id, t.id); salvar(); render();
        });
    }
    function telaEmMassa(u) {
        if (u.role === "REQUESTER") return Rota.ir("/chamados");
        const tickets = listReceived(u), agents = atendentes(u);
        const sel = new Set();
        let msg = null;
        const desenhar = () => {
            shell(u, "/chamados", `<div>${subNav("/chamados/em-massa")}
                <h1 class="mb-1 text-lg font-semibold text-slate-900">Em Massa</h1>
                <p class="mb-4 text-sm text-slate-500">Selecione vários chamados e distribua para um atendente de uma vez.</p>
                ${agents.length === 0 ? `<p class="text-sm text-slate-500">Nenhum atendente disponível pra receber chamados.</p>` : `
                <div class="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p class="text-sm text-slate-600">${sel.size} de ${tickets.length} selecionado(s)</p>
                    <div class="flex items-center gap-2"><select id="agente" class="rounded-md border border-slate-300 px-3 py-2 text-sm">${agents.map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select>
                        <button id="distribuir" ${sel.size === 0 ? "disabled" : ""} class="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark-hover disabled:opacity-50">Distribuir</button></div></div>
                ${msg ? `<p class="mb-4 text-sm text-slate-600">${esc(msg)}</p>` : ""}
                <div class="overflow-hidden rounded-xl border border-slate-200 bg-white"><table class="w-full text-sm"><thead><tr class="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th class="w-10 px-4 py-3"><input type="checkbox" id="todos" ${sel.size === tickets.length && tickets.length > 0 ? "checked" : ""}></th><th class="px-4 py-3 font-medium">Título</th><th class="px-4 py-3 font-medium">Status</th><th class="px-4 py-3 font-medium">Prioridade</th><th class="px-4 py-3 font-medium">Responsável atual</th></tr></thead>
                <tbody>${tickets.map((t) => `<tr class="border-b border-slate-100 last:border-0"><td class="px-4 py-3"><input type="checkbox" data-sel="${t.id}" ${sel.has(t.id) ? "checked" : ""}></td>
                    <td class="px-4 py-3"><a href="#/chamados/${t.id}" class="font-medium text-slate-800 hover:underline">${esc(t.title)}</a><p class="text-xs text-slate-400">${esc(subj(t.subjectId).name)} · ${esc(dept(t.departmentId).name)}</p></td>
                    <td class="px-4 py-3 text-slate-600">${STATUS_LABELS[t.status]}</td><td class="px-4 py-3">${prioridade(t.priority)}</td><td class="px-4 py-3 text-slate-600">${t.assigneeId ? esc(user(t.assigneeId).name) : "—"}</td></tr>`).join("")}
                ${tickets.length === 0 ? `<tr><td colspan="5" class="px-4 py-6 text-center text-slate-400">Nenhum chamado por aqui.</td></tr>` : ""}</tbody></table></div>`}</div>`);
            ligarExportar(u);
            const ag = document.getElementById("agente");
            if (!ag) return;
            app.querySelectorAll("[data-sel]").forEach((c) => c.onchange = () => { c.checked ? sel.add(c.dataset.sel) : sel.delete(c.dataset.sel); msg = null; desenhar(); });
            document.getElementById("todos").onchange = () => { if (sel.size === tickets.length) sel.clear(); else tickets.forEach((t) => sel.add(t.id)); msg = null; desenhar(); };
            document.getElementById("distribuir").onclick = () => {
                const agente = ag.value, n = sel.size;
                sel.forEach((id) => { const t = ticket(id); if (!t || !visivel(u, t)) return; const de = t.status; t.assigneeId = agente; t.status = "IN_PROGRESS"; t.updatedAt = Date.now(); registrarStatus(t.id, de, "IN_PROGRESS", u.id); });
                salvar(); sel.clear(); msg = `${n} chamado(s) atribuído(s) com sucesso.`; desenhar();
            };
        };
        desenhar();
    }

    function telaNovo(u) {
        const deps = [...db.departments].sort(porNome);
        shell(u, "/chamados", `
        <div class="max-w-xl"><h1 class="mb-6 text-lg font-semibold text-slate-900">Abrir novo chamado</h1>
            <div class="rounded-xl border border-slate-200 bg-white p-6"><form class="flex flex-col gap-4" id="formNovo">
                <div class="flex flex-col gap-1"><label class="text-sm font-medium text-slate-700">Departamento</label>
                    <select name="departmentId" required class="rounded-md border border-slate-300 px-3 py-2 text-sm">${deps.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join("")}</select></div>
                <div class="flex flex-col gap-1"><label class="text-sm font-medium text-slate-700">Assunto</label><select name="subjectId" required class="rounded-md border border-slate-300 px-3 py-2 text-sm"></select></div>
                <div class="flex flex-col gap-1"><label class="text-sm font-medium text-slate-700">Título</label><input name="title" required maxlength="120" placeholder="Resumo curto do problema" class="rounded-md border border-slate-300 px-3 py-2 text-sm"></div>
                <div class="flex flex-col gap-1"><label class="text-sm font-medium text-slate-700">Descrição</label><textarea name="description" required rows="5" placeholder="Descreva o problema com o máximo de detalhes possível" class="rounded-md border border-slate-300 px-3 py-2 text-sm"></textarea></div>
                <button type="submit" class="mt-2 self-start rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark-hover">Abrir chamado</button>
            </form></div></div>`);
        const f = document.getElementById("formNovo");
        const preencher = () => { f.subjectId.innerHTML = db.subjects.filter((s) => s.departmentId === f.departmentId.value).sort(porNome).map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join(""); };
        f.departmentId.onchange = preencher; preencher();
        f.onsubmit = (e) => {
            e.preventDefault();
            const s = subj(f.subjectId.value), title = f.title.value.trim(), description = f.description.value.trim();
            if (!s || !title || !description) return;
            const agora = Date.now();
            const t = { id: novoId(), number: Math.max(100000, ...db.tickets.map((x) => x.number)) + 1, title, description, status: "OPEN", priority: s.defaultPriority,
                departmentId: f.departmentId.value, subjectId: s.id, requesterId: u.id, assigneeId: null, createdAt: agora, updatedAt: agora, dueAt: null, resolvedAt: null };
            db.tickets.push(t);
            registrarStatus(t.id, null, "OPEN", u.id); marcarLido(u.id, t.id); salvar();
            Rota.ir("/chamados/" + t.id);
        };
    }

    function telaChamado(u, id) {
        const t = ticket(id);
        if (!t || !podeVer(u, t)) return telaNaoEncontrado(u, "/chamados");
        marcarLido(u.id, t.id); salvar(); // MarkRead do original
        const canManage = u.role !== "REQUESTER";
        const msgs = db.messages.filter((m) => m.ticketId === t.id).sort((a, b) => a.createdAt - b.createdAt);
        const visiveis = msgs.filter((m) => canManage || !m.isInternal);
        const audiencia = new Set([t.requesterId, ...(t.assigneeId ? [t.assigneeId] : []), ...msgs.map((m) => m.authorId)]);
        const leituras = new Map(db.reads.filter((r) => r.ticketId === t.id).map((r) => [r.userId, r.lastReadAt]));
        const recibo = (m) => {
            const ids = [...audiencia].filter((uid) => uid !== m.authorId && !(m.isInternal && uid === t.requesterId));
            return { total: ids.length, seen: ids.filter((uid) => leituras.get(uid) >= m.createdAt).length };
        };
        const atrasado = t.dueAt && t.dueAt < Date.now() && t.status !== "RESOLVED" && t.status !== "CLOSED";
        const eventos = db.events.filter((e) => e.ticketId === t.id).sort((a, b) => a.createdAt - b.createdAt).reverse();
        const ACTIVE = { OPEN: "bg-slate-800 border-slate-800 text-white shadow-sm shadow-slate-300", IN_PROGRESS: "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200", PENDING: "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-200", RESOLVED: "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200", CLOSED: "bg-slate-500 border-slate-500 text-white shadow-sm shadow-slate-300" };
        const IDLE = { OPEN: "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50", IN_PROGRESS: "border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50", PENDING: "border-amber-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50", RESOLVED: "border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50", CLOSED: "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50" };
        const dueLocal = t.dueAt ? (() => { const d = new Date(t.dueAt); return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}T${dois(d.getHours())}:${dois(d.getMinutes())}`; })() : "";
        const btnAcao = "rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700";
        const salvarBtn = `<button type="submit" class="rounded-md bg-brand-dark px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark-hover">Salvar</button>`;
        shell(u, "/chamados", `
        <div class="flex flex-col gap-6">
            <div class="flex items-center gap-3"><a href="#/chamados" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">←</a>
                <h1 class="min-w-0 truncate text-lg font-semibold text-slate-900"><span class="text-slate-400">#${t.number}</span> ${esc(t.title)}</h1></div>
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div class="order-2 flex flex-col gap-4 lg:order-1">
                    ${canManage ? `<div class="rounded-xl border border-slate-200 bg-white p-5"><h2 class="mb-3 text-sm font-medium text-slate-700">Ações</h2>
                        <div class="flex flex-col gap-3"><div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <button type="button" data-painel="due" class="${btnAcao}">⏱ Estipular prazo</button><button type="button" data-painel="subject" class="${btnAcao}">🏷 Mudar assunto</button>
                            <button type="button" data-painel="reassign" class="${btnAcao} sm:col-span-2">⇄ Trocar responsável</button></div>
                            <form data-form="due" hidden class="flex items-end gap-2 rounded-md bg-slate-50 p-3"><div class="flex flex-1 flex-col gap-1"><label class="text-xs font-medium text-slate-600">Prazo para resolver</label>
                                <input type="datetime-local" name="dueAt" value="${dueLocal}" class="rounded-md border border-slate-300 px-2 py-1.5 text-sm"></div>${salvarBtn}</form>
                            <form data-form="subject" hidden class="flex items-end gap-2 rounded-md bg-slate-50 p-3"><div class="flex flex-1 flex-col gap-1"><label class="text-xs font-medium text-slate-600">Assunto</label>
                                <select name="subjectId" class="rounded-md border border-slate-300 px-2 py-1.5 text-sm">${db.subjects.filter((s) => s.departmentId === t.departmentId).sort(porNome).map((s) => `<option value="${s.id}"${s.id === t.subjectId ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select></div>${salvarBtn}</form>
                            <form data-form="reassign" hidden class="flex items-end gap-2 rounded-md bg-slate-50 p-3"><div class="flex flex-1 flex-col gap-1"><label class="text-xs font-medium text-slate-600">Novo responsável</label>
                                <select name="assigneeId" class="rounded-md border border-slate-300 px-2 py-1.5 text-sm"><option value="" disabled selected>Selecione...</option>${atendentes(u).map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select></div>${salvarBtn}</form>
                        </div>
                        ${!t.assigneeId ? `<div class="mt-3"><button data-assumir="${t.id}" class="shrink-0 rounded-md bg-brand-dark px-3 py-1.5 text-sm font-medium text-white shadow-sm shadow-black/20 transition hover:bg-brand-dark-hover">Assumir chamado</button></div>` : ""}
                    </div>` : ""}
                    <div class="rounded-xl border border-slate-200 bg-white p-5"><h2 class="mb-3 text-sm font-medium text-slate-700">Status</h2>
                        <dl class="flex flex-col gap-2 text-sm">
                            <div class="flex items-center justify-between"><dt class="text-slate-500">Situação</dt><dd>${prioridade(t.priority)}</dd></div>
                            ${t.dueAt ? `<div class="flex items-center justify-between"><dt class="text-slate-500">Prazo</dt><dd class="flex items-center gap-2 text-slate-800">${fmtData(t.dueAt)} ${fmtHora(t.dueAt)}${atrasado ? `<span class="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">Atrasado</span>` : ""}</dd></div>` : ""}
                            <div class="flex items-center justify-between"><dt class="text-slate-500">Departamento</dt><dd class="text-slate-800">${esc(dept(t.departmentId).name)}</dd></div>
                            <div class="flex items-center justify-between"><dt class="text-slate-500">Assunto</dt><dd class="text-slate-800">${esc(subj(t.subjectId).name)}</dd></div>
                            <div class="flex items-center justify-between"><dt class="text-slate-500">Solicitante</dt><dd class="text-slate-800">${esc(user(t.requesterId).name)}</dd></div>
                            <div class="flex items-center justify-between"><dt class="text-slate-500">Responsável</dt><dd class="text-slate-800">${t.assigneeId ? esc(user(t.assigneeId).name) : "—"}</dd></div>
                        </dl></div>
                    <div class="rounded-xl border border-slate-200 bg-white p-5"><h2 class="mb-3 text-sm font-medium text-slate-700">Histórico de situação</h2>
                        ${eventos.length === 0 ? `<p class="text-sm text-slate-400">Sem histórico ainda.</p>` : `<div class="overflow-x-auto"><table class="w-full text-sm">
                            <thead><tr class="text-left text-xs uppercase tracking-wide text-slate-400"><th class="pb-2 font-medium">Status</th><th class="pb-2 font-medium">Período</th><th class="pb-2 font-medium">Tempo</th></tr></thead>
                            <tbody>${eventos.map((ev, i) => { const prox = eventos[i - 1], fim = prox ? prox.createdAt : Date.now();
                                return `<tr class="border-t border-slate-100"><td class="py-2 pr-3"><span class="text-xs font-medium text-slate-700">${STATUS_LABELS[ev.toStatus]}</span><p class="text-[11px] text-slate-400">${esc(user(ev.changedById)?.name || "")}</p></td>
                                    <td class="py-2 pr-3 text-xs text-slate-500">${fmtData(ev.createdAt)}, ${fmtHora(ev.createdAt)}<p class="text-[11px] text-slate-400">${prox ? `até ${fmtData(fim)} ${fmtHora(fim)}` : "Em aberto"}</p></td>
                                    <td class="py-2 text-xs font-medium text-slate-600">${duracao(fim - ev.createdAt)}</td></tr>`; }).join("")}</tbody></table></div>`}</div>
                </div>
                <div class="order-1 flex flex-col gap-4 lg:order-2 lg:col-span-2">
                    <div class="rounded-xl border border-slate-200 bg-white p-5"><p class="whitespace-pre-wrap text-sm text-slate-700">${esc(t.description)}</p></div>
                    ${canManage ? `<div class="rounded-xl border border-slate-200 bg-white p-4"><div class="flex flex-wrap gap-2">${STATUS_ORDER.map((s) => `
                        <button type="button" data-status="${s}" class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${s === t.status ? ACTIVE[s] : IDLE[s]}">${svg(STATUS_THEME[s].icon, "h-4 w-4")}${STATUS_LABELS[s]}</button>`).join("")}</div></div>` : ""}
                    <div class="rounded-xl border border-slate-200 bg-white p-5"><h2 class="mb-3 text-sm font-medium text-slate-700">Histórico</h2>
                        <div class="flex flex-col gap-3">${visiveis.length === 0 ? `<p class="text-sm text-slate-400">Nenhuma mensagem ainda.</p>` : ""}
                        ${visiveis.map((m) => { const a = user(m.authorId), r = recibo(m);
                            return `<div class="flex gap-3"><div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(a.name)}">${initials(a.name)}</div>
                                <div class="flex-1 rounded-lg border p-3 text-sm ${m.isInternal ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}">
                                    <div class="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500"><span class="font-medium text-slate-700">${esc(a.name)}${m.isInternal ? `<span class="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] text-amber-800">Interna</span>` : ""}</span><span>${distancia(m.createdAt)}</span></div>
                                    <p class="whitespace-pre-wrap text-slate-700">${esc(m.content)}</p>
                                    ${r.total > 0 ? `<p class="mt-2 text-[11px] text-slate-400">${r.seen > 0 ? "✓" : ""} ${r.seen}/${r.total} visto</p>` : ""}</div></div>`; }).join("")}</div>
                        <div class="mt-4 border-t border-slate-100 pt-4"><form class="flex flex-col gap-2" id="formMsg">
                            <textarea name="content" required rows="3" placeholder="Escreva uma resposta..." class="rounded-md border border-slate-300 px-3 py-2 text-sm"></textarea>
                            <div class="flex items-center justify-between">${canManage ? `<label class="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" name="isInternal">Mensagem interna (não visível ao solicitante)</label>` : "<span></span>"}
                                <button type="submit" class="rounded-md bg-brand-dark px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark-hover">Enviar</button></div></form></div>
                    </div>
                </div>
            </div>
        </div>`);
        app.querySelectorAll("[data-painel]").forEach((b) => b.onclick = () => app.querySelectorAll("[data-form]").forEach((f) => { f.hidden = f.dataset.form !== b.dataset.painel || !f.hidden; }));
        const forms = Object.fromEntries([...app.querySelectorAll("[data-form]")].map((f) => [f.dataset.form, f]));
        if (forms.due) forms.due.onsubmit = (e) => { e.preventDefault(); const v = forms.due.dueAt.value; t.dueAt = v ? new Date(v).getTime() : null; t.updatedAt = Date.now(); salvar(); render(); };
        if (forms.subject) forms.subject.onsubmit = (e) => { e.preventDefault(); const s = subj(forms.subject.subjectId.value); if (!s || s.departmentId !== t.departmentId) return alert("Assunto inválido para o departamento deste chamado."); t.subjectId = s.id; t.updatedAt = Date.now(); salvar(); render(); };
        if (forms.reassign) forms.reassign.onsubmit = (e) => {
            e.preventDefault(); const ag = user(forms.reassign.assigneeId.value);
            if (!ag || ag.role === "REQUESTER" || !ag.active) return alert("Atendente inválido.");
            const de = t.status; t.assigneeId = ag.id; if (de === "OPEN") { t.status = "IN_PROGRESS"; registrarStatus(t.id, de, "IN_PROGRESS", u.id); }
            t.updatedAt = Date.now(); salvar(); render();
        };
        app.querySelectorAll("[data-status]").forEach((b) => b.onclick = () => { if (b.dataset.status !== t.status) { mudarStatus(u, t, b.dataset.status); render(); } });
        ligarAssumir(u);
        const fm = document.getElementById("formMsg");
        fm.onsubmit = (e) => {
            e.preventDefault();
            const content = fm.content.value.trim();
            if (!content) return;
            db.messages.push({ id: novoId(), ticketId: t.id, authorId: u.id, content, isInternal: canManage && fm.isInternal?.checked === true, createdAt: Date.now() });
            marcarLido(u.id, t.id); salvar(); render();
        };
    }

    // ----- Configurações -----
    function configNav(ativo) {
        return `<h1 class="mb-4 text-lg font-semibold text-slate-900">Configurações</h1><div class="mb-6 flex gap-1 border-b border-slate-200">${[["/configuracoes/usuarios", "Usuários"], ["/configuracoes/departamentos", "Departamentos e assuntos"]].map(([href, label]) =>
            `<a href="#${href}" class="border-b-2 px-3 py-2 text-sm font-medium transition-colors ${ativo === href ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"}">${label}</a>`).join("")}</div>`;
    }
    function telaUsuarios(u) {
        const users = [...db.users].sort(porNome);
        const BADGE = { REQUESTER: "bg-slate-100 text-slate-600", AGENT: "bg-blue-100 text-blue-700", MANAGER: "bg-violet-100 text-violet-700" };
        shell(u, "/configuracoes", `<div>${configNav("/configuracoes/usuarios")}
            <div class="mb-4 flex items-center justify-between"><p class="text-sm text-slate-500">${users.length} usuário(s)</p></div>
            <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table class="w-full text-sm"><thead><tr class="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th class="px-4 py-3 font-medium">Nome</th><th class="px-4 py-3 font-medium">E-mail</th><th class="px-4 py-3 font-medium">Papel</th><th class="px-4 py-3 font-medium">Departamento</th><th class="px-4 py-3 font-medium">Status</th><th class="px-4 py-3 font-medium"></th></tr></thead>
            <tbody>${users.map((x) => `<tr class="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
                <td class="px-4 py-3"><div class="flex items-center gap-2.5"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${avatarColor(x.name)}">${initials(x.name)}</span><span class="font-medium text-slate-800">${esc(x.name)}</span></div></td>
                <td class="px-4 py-3 text-slate-600">${esc(x.email)}</td>
                <td class="px-4 py-3"><span class="rounded-full px-2 py-0.5 text-[11px] font-medium ${BADGE[x.role]}">${ROLE_LABELS[x.role]}</span></td>
                <td class="px-4 py-3 text-slate-600">${x.departmentId ? esc(dept(x.departmentId)?.name || "—") : "—"}</td>
                <td class="px-4 py-3"><span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${x.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}"><span class="h-1.5 w-1.5 rounded-full ${x.active ? "bg-emerald-500" : "bg-slate-400"}"></span>${x.active ? "Ativo" : "Inativo"}</span></td>
                <td class="px-4 py-3"><div class="flex justify-end gap-2">${x.id === u.id ? `<span class="text-xs text-slate-300">(você)</span>` : `<button data-alternar="${x.id}" class="text-xs font-medium ${x.active ? "text-red-600 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"}">${x.active ? "Desativar" : "Reativar"}</button>`}</div></td>
            </tr>`).join("")}</tbody></table></div></div>`);
        app.querySelectorAll("[data-alternar]").forEach((b) => b.onclick = () => {
            const x = user(b.dataset.alternar);
            if (!confirm(x.active ? "Desativar este usuário? Ele não vai conseguir mais entrar no sistema." : "Reativar este usuário?")) return;
            x.active = !x.active; salvar(); render();
        });
    }
    function telaDepartamentos(u) {
        const deps = [...db.departments].sort(porNome);
        const prioOpts = Object.entries(PRIORITY_LABELS).map(([k, v]) => `<option value="${k}"${k === "MEDIUM" ? " selected" : ""}>${v}</option>`).join("");
        shell(u, "/configuracoes", `<div>${configNav("/configuracoes/departamentos")}<div class="flex flex-col gap-6">
            <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 class="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700"><span class="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-600">+</span>Novo departamento</h2>
                <form id="novoDep" class="flex items-end gap-2"><input name="name" required placeholder="Nome do departamento" class="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"><button type="submit" class="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark-hover">Adicionar</button></form></div>
            ${deps.map((d, i) => { const subs = db.subjects.filter((s) => s.departmentId === d.id).sort(porNome);
                return `<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="h-1 bg-gradient-to-r ${["from-blue-400 to-blue-600", "from-violet-400 to-violet-600", "from-emerald-400 to-emerald-600", "from-amber-400 to-amber-600"][i % 4]}"></div><div class="p-6">
                    <div class="mb-4 flex items-center justify-between"><h2 class="flex items-center gap-2 text-base font-semibold text-slate-900"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">${esc(d.name.charAt(0).toUpperCase())}</span>${esc(d.name)}</h2>
                        <button data-excluir-dep="${d.id}" class="text-xs font-medium text-red-600 hover:text-red-700">Excluir departamento</button></div>
                    <table class="mb-4 w-full text-sm"><thead><tr class="text-left text-xs uppercase tracking-wide text-slate-400"><th class="pb-2 font-medium">Assunto</th><th class="pb-2 font-medium">Prioridade padrão</th><th class="pb-2 font-medium"></th></tr></thead>
                    <tbody>${subs.length === 0 ? `<tr><td colspan="3" class="py-2 text-slate-400">Nenhum assunto cadastrado.</td></tr>` : ""}
                    ${subs.map((s) => `<tr class="border-t border-slate-100"><td class="py-2 text-slate-700">${esc(s.name)}</td><td class="py-2">${prioridade(s.defaultPriority)}</td><td class="py-2 text-right"><button data-excluir-sub="${s.id}" class="text-xs font-medium text-red-600 hover:text-red-700">Excluir</button></td></tr>`).join("")}</tbody></table>
                    <form data-novo-sub="${d.id}" class="flex flex-wrap items-end gap-2"><input name="name" required placeholder="Novo assunto" class="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"><select name="defaultPriority" class="rounded-md border border-slate-300 px-3 py-2 text-sm">${prioOpts}</select><button type="submit" class="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark-hover">Adicionar</button></form>
                </div></div>`; }).join("")}</div></div>`);
        const nd = document.getElementById("novoDep");
        nd.onsubmit = (e) => { e.preventDefault(); const n = nd.name.value.trim(); if (!n) return; if (db.departments.some((d) => d.name.toLowerCase() === n.toLowerCase())) return alert("Já existe um departamento com esse nome."); db.departments.push({ id: novoId(), name: n }); salvar(); render(); };
        app.querySelectorAll("[data-novo-sub]").forEach((f) => f.onsubmit = (e) => { e.preventDefault(); const n = f.name.value.trim(); if (!n) return;
            if (db.subjects.some((s) => s.departmentId === f.dataset.novoSub && s.name.toLowerCase() === n.toLowerCase())) return alert("Esse assunto já existe neste departamento.");
            db.subjects.push({ id: novoId(), departmentId: f.dataset.novoSub, name: n, defaultPriority: f.defaultPriority.value }); salvar(); render(); });
        app.querySelectorAll("[data-excluir-sub]").forEach((b) => b.onclick = () => { const s = subj(b.dataset.excluirSub);
            if (!confirm(`Excluir o assunto "${s.name}"?`)) return;
            if (db.tickets.some((t) => t.subjectId === s.id)) return alert("Não é possível excluir: há chamados com esse assunto.");
            db.subjects = db.subjects.filter((x) => x.id !== s.id); salvar(); render(); });
        app.querySelectorAll("[data-excluir-dep]").forEach((b) => b.onclick = () => { const d = dept(b.dataset.excluirDep);
            if (!confirm(`Excluir o departamento "${d.name}"? Só é possível se não houver assuntos, usuários ou chamados vinculados.`)) return;
            if (db.subjects.some((s) => s.departmentId === d.id) || db.users.some((x) => x.departmentId === d.id) || db.tickets.some((t) => t.departmentId === d.id)) return alert("Não é possível excluir: há assuntos, usuários ou chamados vinculados.");
            db.departments = db.departments.filter((x) => x.id !== d.id); salvar(); render(); });
    }

    function telaNaoEncontrado(u, voltar) {
        shell(u, voltar, `<div class="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center"><p class="text-sm text-slate-400">Não encontrado ou sem permissão.</p><a href="#${voltar}" class="text-sm font-medium text-blue-600 hover:text-blue-800">Voltar</a></div>`);
    }

    // ---------- Roteamento ----------
    function render() {
        const { caminho } = Rota.atual();
        const u = sessao();
        if (!u) { if (caminho !== "/login") return Rota.ir("/login"); return telaLogin(); }
        if (caminho === "/login" || caminho === "/") return Rota.ir("/home");
        if (caminho === "/home") return telaHome(u);
        if (caminho === "/noticias") return telaNoticias(u);
        if (caminho === "/noticias/novo") return telaNovaNoticia(u);
        let m = /^\/noticias\/([^/]+)$/.exec(caminho);
        if (m) return telaNoticia(u, m[1]);
        if (caminho === "/chamados/novo") return telaNovo(u);
        if (caminho === "/chamados/fila") return telaFila(u);
        if (caminho === "/chamados/em-massa") return telaEmMassa(u);
        if (["/chamados", "/chamados/enviado", "/chamados/todos"].includes(caminho)) return telaLista(u, caminho);
        m = /^\/chamados\/([^/]+)$/.exec(caminho);
        if (m) return telaChamado(u, m[1]);
        if (caminho.startsWith("/configuracoes")) {
            if (u.role !== "MANAGER") return Rota.ir("/home");
            if (caminho === "/configuracoes/departamentos") return telaDepartamentos(u);
            if (caminho !== "/configuracoes/usuarios") return Rota.ir("/configuracoes/usuarios");
            return telaUsuarios(u);
        }
        return Rota.ir("/home");
    }
    Rota.iniciar(render);
})();
