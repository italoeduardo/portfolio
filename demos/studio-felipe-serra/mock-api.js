// ============================================================
//  Studio Felipe Serra — API simulada para a demonstração.
//  O painel do barbeiro é o MESMO arquivo que está em produção
//  (painel.studiofelipeserra.com); aqui as chamadas para a API são
//  respondidas no navegador, com a mesma validação do backend .NET
//  (conflito de horário, serviços do catálogo, status) e uma agenda
//  fictícia salva no localStorage de quem está testando.
// ============================================================
(function () {
    "use strict";
    const { JavaRandom, Data, Local } = window.Demo;
    const API = "https://api.studiofelipeserra.com";
    const CHAVE = "demo.studio.v1";
    const SENHA_DEMO = "demo";

    // Catálogo igual ao ServiceCatalog.cs
    const CATALOGO = [
        ["corte-cabelo", "Corte de cabelo", 50, 30], ["corte-maquina", "Corte máquina", 40, 30], ["corte-barba", "Corte e barba", 90, 60],
        ["barba-express", "Barba express", 20, 30], ["barba-completa", "Barba completa", 50, 30], ["sobrancelha", "Sobrancelha", 20, 30],
        ["epilacao-combo", "Epilação combo nariz e orelha", 30, 30], ["epilacao-nariz", "Epilação nariz", 20, 30], ["epilacao-olheira", "Epilação olheira", 20, 30],
        ["hidratacao-ozonio", "Hidratação do ozônio terapia", 35, 30], ["limpeza-pele", "Limpeza de pele", 30, 30], ["esfoliacao", "Esfoliação", 30, 30],
        ["penteado", "Penteado", 20, 30], ["camuflagem", "Camuflagem", 30, 30], ["relaxamento-capilar", "Relaxamento capilar", 100, 60],
        ["acabamento", "Acabamento", 15, 30], ["barbaterapia", "Barbaterapia", 70, 60],
    ].map(([id, name, price, dur]) => ({ id, name, price, dur }));
    const SERV = Object.fromEntries(CATALOGO.map((s) => [s.id, s]));
    const NOMES = ["Rafael Monteiro", "Lucas Andrade", "Gustavo Pires", "Thiago Nunes", "Mateus Vieira", "Pedro Henrique", "André Lacerda",
        "Bruno Tavares", "Caio Ferraz", "Diego Rocha", "Eduardo Brito", "Felipe Antunes", "Henrique Sales", "Igor Cardoso", "João Vitor", "Leonardo Prado"];
    // Horário de funcionamento (ServiceCatalog.Schedule): seg–sex 9h–20h, sáb 9h–19h, domingo fechado
    const expediente = (dia) => { const w = Data.diaSemana(dia); return w === 7 ? null : [9 * 60, (w === 6 ? 19 : 20) * 60]; };
    const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
    const minutos = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

    function seed() {
        const rnd = new JavaRandom(2026);
        const hoje = Data.hoje(), agoraMin = new Date().getHours() * 60 + new Date().getMinutes();
        const appts = [], blocks = [];
        let id = 1;
        for (let dia = hoje - 6; dia <= hoje + 7; dia++) {
            const ex = expediente(dia);
            if (!ex) continue;
            blocks.push({ id: id++, date: Data.iso(dia), start: "12:00", durationMinutes: 60, reason: "Almoço" });
            for (let m = ex[0]; m < ex[1];) {
                if (m === 12 * 60) { m += 60; continue; }
                if (rnd.nextDouble() < (dia > hoje ? 0.45 : 0.25)) { m += 30; continue; }
                const ids = rnd.nextDouble() < 0.18 ? [CATALOGO[rnd.nextInt(3)].id, "sobrancelha"] : [CATALOGO[[0, 0, 1, 2, 2, 4, 9, 14, 16][rnd.nextInt(9)]].id];
                const dur = ids.reduce((s, x) => s + SERV[x].dur, 0);
                if (m + dur > ex[1] || (m < 13 * 60 && m + dur > 12 * 60)) { m += 30; continue; }
                const passado = dia < hoje || (dia === hoje && m + dur <= agoraMin);
                const sorteio = rnd.nextDouble();
                const status = passado ? (sorteio < 0.86 ? "concluido" : sorteio < 0.93 ? "falta" : "cancelado") : (sorteio < 0.7 ? "confirmado" : "pendente");
                const nome = NOMES[rnd.nextInt(NOMES.length)];
                appts.push({ id: id++, date: Data.iso(dia), start: hhmm(m), serviceIds: ids, durationMinutes: dur, status,
                    price: ids.reduce((s, x) => s + SERV[x].price, 0), notes: null, clientName: nome,
                    clientPhone: "61900000" + String(100 + rnd.nextInt(900)), clientEmail: nome.split(" ")[0].toLowerCase() + "@exemplo.com",
                    temConta: rnd.nextDouble() < 0.6, cancelReason: status === "cancelado" ? "Cliente pediu para remarcar" : null });
                m += dur;
            }
        }
        const futuros = appts.filter((a) => a.date >= Data.iso(hoje) && a.status !== "cancelado").slice(0, 3);
        const notifs = futuros.map((a, i) => ({ id: i + 1, type: ["novo", "remarcado", "novo"][i], clientName: a.clientName,
            serviceName: a.serviceIds.map((x) => SERV[x].name).join(" + "), date: a.date, start: a.start, extra: null, read: false,
            createdAt: new Date(Date.now() - (i + 1) * 47 * 60000).toISOString() }));
        return { appts, blocks, notifs, proxId: id };
    }
    let db = Local.ler(CHAVE, null) || seed();
    const salvar = () => Local.gravar(CHAVE, db);
    salvar();

    // AvailabilityService.HasConflictAsync
    function conflito(date, start, dur, excluir) {
        const s = minutos(start), e = s + dur;
        const ocupados = [
            ...db.appts.filter((a) => a.date === date && a.status !== "cancelado" && a.id !== excluir).map((a) => [minutos(a.start), minutos(a.start) + a.durationMinutes]),
            ...db.blocks.filter((b) => b.date === date).map((b) => [minutos(b.start), minutos(b.start) + b.durationMinutes]),
        ];
        return ocupados.some(([bs, be]) => s < be && e > bs);
    }

    const resposta = (status, corpo) => Promise.resolve(new Response(corpo === undefined ? null : JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } }));
    const autorizado = (init) => /Bearer demo-/.test((init && init.headers && (init.headers.Authorization || init.headers.authorization)) || "");

    function tratar(caminho, init) {
        const metodo = (init && init.method || "GET").toUpperCase();
        const corpo = init && init.body ? JSON.parse(init.body) : {};
        const url = new URL(API + caminho);
        const p = url.pathname;

        if (p === "/api/painel/login" && metodo === "POST") {
            if ((corpo.senha || "") !== SENHA_DEMO) return resposta(401, { message: "Senha incorreta. Tente novamente." });
            return resposta(200, { token: "demo-" + Date.now(), expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() });
        }
        if (!autorizado(init)) return resposta(401);

        if (p === "/api/painel/agenda") {
            const date = url.searchParams.get("date");
            const itens = [
                ...db.appts.filter((a) => a.date === date).map((a) => ({ type: "appt", id: a.id, serviceIds: a.serviceIds,
                    serviceName: a.serviceIds.map((x) => SERV[x]?.name || x).join(" + "), durationMinutes: a.durationMinutes, start: a.start,
                    status: a.status, price: a.price, notes: a.notes, clientName: a.clientName, clientPhone: a.clientPhone, clientEmail: a.clientEmail, temConta: a.temConta })),
                ...db.blocks.filter((b) => b.date === date).map((b) => ({ type: "block", id: b.id, serviceIds: [], serviceName: b.reason,
                    durationMinutes: b.durationMinutes, start: b.start, status: "bloqueio", price: null, notes: null, clientName: null, clientPhone: null, clientEmail: null, temConta: false })),
            ].sort((a, b) => a.start.localeCompare(b.start));
            return resposta(200, itens);
        }
        if (p === "/api/painel/notificacoes") return resposta(200, [...db.notifs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        if (p === "/api/painel/notificacoes/marcar-lidas") {
            let n = 0;
            db.notifs.forEach((x) => { if (!x.read && (!corpo.ids || !corpo.ids.length || corpo.ids.includes(x.id))) { x.read = true; n++; } });
            salvar();
            return resposta(200, { message: "Notificações marcadas como lidas.", count: n });
        }
        if (p === "/api/painel/agendamentos" && metodo === "POST" || /^\/api\/painel\/agendamentos\/\d+$/.test(p) && metodo === "PUT") {
            const editando = metodo === "PUT" ? db.appts.find((a) => a.id === +p.split("/").pop()) : null;
            if (metodo === "PUT" && !editando) return resposta(404);
            if (!corpo.clientName || !corpo.clientName.trim()) return resposta(400, { message: "Nome do cliente é obrigatório." });
            const ids = (corpo.serviceIds || []).filter((x) => SERV[x]);
            if (!ids.length) return resposta(400, { message: "Escolha ao menos um procedimento válido." });
            if (!/^\d{1,2}:\d{2}$/.test(corpo.start || "")) return resposta(400, { message: "Horário inválido." });
            const dur = ids.reduce((s, x) => s + SERV[x].dur, 0);
            if (conflito(corpo.date, corpo.start, dur, editando ? editando.id : null)) return resposta(409, { message: "Esse horário já está ocupado." });
            const dados = { date: corpo.date, start: corpo.start.padStart(5, "0"), serviceIds: ids, durationMinutes: dur, price: corpo.price ?? null, notes: corpo.notes || null,
                clientName: corpo.clientName.trim(), clientPhone: corpo.clientPhone || null, clientEmail: corpo.clientEmail || null };
            if (editando) { Object.assign(editando, dados); salvar(); return resposta(200, { id: editando.id, message: "Agendamento atualizado." }); }
            const novo = { id: db.proxId++, ...dados, status: "confirmado", temConta: false, cancelReason: null }; // feito pelo barbeiro já nasce confirmado
            db.appts.push(novo); salvar();
            return resposta(200, { id: novo.id, message: "Agendamento criado." });
        }
        let m = /^\/api\/painel\/agendamentos\/(\d+)\/status$/.exec(p);
        if (m && metodo === "PATCH") {
            const a = db.appts.find((x) => x.id === +m[1]);
            if (!a) return resposta(404);
            const st = String(corpo.status || "").toLowerCase();
            if (!["pendente", "confirmado", "concluido", "cancelado", "falta"].includes(st)) return resposta(400, { message: "Status inválido." });
            a.status = st; if (st === "cancelado") a.cancelReason = corpo.reason || null; salvar();
            return resposta(200, { message: "Status atualizado." });
        }
        m = /^\/api\/painel\/agendamentos\/(\d+)$/.exec(p);
        if (m && metodo === "DELETE") { db.appts = db.appts.filter((x) => x.id !== +m[1]); salvar(); return resposta(200, { message: "Agendamento excluído." }); }
        if (p === "/api/painel/bloqueios" && metodo === "POST") {
            if (!/^\d{1,2}:\d{2}$/.test(corpo.start || "")) return resposta(400, { message: "Horário inválido." });
            if (conflito(corpo.date, corpo.start, corpo.durationMinutes, null)) return resposta(409, { message: "Esse período conflita com um agendamento existente." });
            const b = { id: db.proxId++, date: corpo.date, start: corpo.start.padStart(5, "0"), durationMinutes: corpo.durationMinutes, reason: corpo.reason && corpo.reason.trim() ? corpo.reason : "Bloqueio" };
            db.blocks.push(b); salvar();
            return resposta(200, { id: b.id });
        }
        m = /^\/api\/painel\/bloqueios\/(\d+)$/.exec(p);
        if (m && metodo === "DELETE") { db.blocks = db.blocks.filter((x) => x.id !== +m[1]); salvar(); return resposta(200, { message: "Bloqueio removido." }); }
        return resposta(404);
    }

    const fetchOriginal = window.fetch.bind(window);
    window.fetch = (entrada, init) => {
        const url = typeof entrada === "string" ? entrada : entrada.url;
        if (url.startsWith(API)) return new Promise((ok) => setTimeout(() => ok(tratar(url.slice(API.length), init)), 120));
        return fetchOriginal(entrada, init);
    };
    // dentro do portfólio não faz sentido pedir permissão de notificação do sistema
    try { Object.defineProperty(window, "Notification", { value: undefined, configurable: true }); } catch (e) { /* ignore */ }
    // o token da demo não vale para o painel real, e vice-versa
    try { const t = JSON.parse(localStorage.getItem("sfs_painel_token") || "null"); if (t && !/^demo-/.test(t.token)) localStorage.removeItem("sfs_painel_token"); } catch (e) { /* ignore */ }

    // dica da senha e botão de restaurar
    document.addEventListener("DOMContentLoaded", () => {
        const erro = document.getElementById("loginErr");
        if (erro) {
            const p = document.createElement("p");
            p.className = "login__sub";
            p.style.marginTop = ".75rem";
            p.innerHTML = 'Demonstração com agenda fictícia · senha: <b style="color:#d4af37">demo</b>';
            erro.after(p);
        }
        const sairBtn = document.getElementById("logout");
        if (sairBtn) {
            const r = document.createElement("button");
            r.className = sairBtn.className;
            r.title = "Restaurar a agenda fictícia";
            r.setAttribute("aria-label", "Restaurar agenda fictícia");
            r.textContent = "↺";
            r.style.fontSize = "1.1rem";
            r.onclick = () => { if (confirm("Voltar a agenda fictícia ao estado inicial?")) { Local.apagar(CHAVE); location.reload(); } };
            sairBtn.before(r);
        }
    });
})();
