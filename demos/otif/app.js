// ============================================================
//  OTIF — versão que roda no navegador.
//  Mesmas regras e mesmo gerador do sistema em Java
//  (github.com/italoeduardo/otif): semente 42, então os pedidos
//  são exatamente os mesmos que o Spring Boot gera.
// ============================================================
(function () {
    "use strict";
    const { JavaRandom, Data, MESES, Calendario, Fmt, Rota, esc } = window.Demo;
    const META_OTIF = 90;

    // ---------- RegraPrazo ----------
    const SUDESTE = ["RJ", "MG", "ES"], SUL = ["PR", "SC", "RS"], CO = ["DF", "GO", "MS", "MT"];
    const NE = ["BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"];
    function regiao(uf) {
        if (uf === "SP") return "SP";
        if (SUDESTE.includes(uf)) return "SE";
        if (SUL.includes(uf)) return "S";
        if (CO.includes(uf)) return "CO";
        if (NE.includes(uf)) return "NE";
        return "N";
    }
    function diasUteisPrazo(uf) {
        return { SP: 2, SE: 3, S: 4, CO: 4, NE: 6 }[regiao(uf)] ?? 8;
    }

    // ---------- GeradorDadosFicticios ----------
    const DESTINOS = [["SP", "São Paulo", 30], ["SP", "Campinas", 8], ["SP", "Ribeirão Preto", 5], ["RJ", "Rio de Janeiro", 9],
        ["RJ", "Niterói", 3], ["MG", "Belo Horizonte", 8], ["MG", "Uberlândia", 3], ["ES", "Vitória", 2], ["PR", "Curitiba", 6],
        ["SC", "Florianópolis", 3], ["SC", "Joinville", 2], ["RS", "Porto Alegre", 5], ["GO", "Goiânia", 4], ["DF", "Brasília", 4],
        ["MS", "Campo Grande", 2], ["MT", "Cuiabá", 2], ["BA", "Salvador", 5], ["PE", "Recife", 4], ["CE", "Fortaleza", 3],
        ["RN", "Natal", 1], ["PA", "Belém", 3], ["AM", "Manaus", 2], ["TO", "Palmas", 1]];
    const TRANSPORTADORAS = [["Expresso Horizonte", 0.05], ["RotaSul Log", 0.09], ["TransVale Cargas", 0.13], ["Ágil Express", 0.17]];
    const PREFIXOS = ["Mercado", "Supermercado", "Empório", "Atacado", "Casa & Construção", "Drogaria", "Hiper", "Distribuidora", "Mercearia", "Loja"];
    const NOMES = ["Bom Preço", "Estrela", "Santa Clara", "Nova Era", "Ponto Certo", "Alvorada", "Sol Nascente", "Primavera", "Boa Vista", "Central", "União", "Progresso"];
    const VENDEDORES = ["Ana Ribeiro", "Bruno Tavares", "Carla Mendes", "Diego Freitas", "Elisa Prado", "Fábio Nunes", "Gabriela Rocha", "Henrique Sales"];

    function gerar(hoje) {
        const rnd = new JavaRandom(42);
        const clientes = [];
        for (let i = 0; i < 45; i++) {
            clientes.push(PREFIXOS[i % PREFIXOS.length] + " " + NOMES[(i * 7) % NOMES.length]
                + (i >= PREFIXOS.length * 2 ? " " + String.fromCharCode(65 + i % 6) : ""));
        }
        const pesoTotal = DESTINOS.reduce((s, d) => s + d[2], 0);
        const sortearDestino = () => {
            let alvo = rnd.nextInt(pesoTotal);
            for (const d of DESTINOS) { alvo -= d[2]; if (alvo < 0) return d; }
            return DESTINOS[0];
        };
        const inicio = Data.comDia(Data.somarMeses(hoje, -5), 1);
        const mesIncidente = Data.comDia(Data.somarMeses(hoje, -2), 1);
        const fimIncidente = Data.somarMeses(mesIncidente, 1);

        const pedidos = [];
        let seq = 10001, id = 1;
        for (let dia = inicio; dia <= hoje; dia++) {
            if (!Calendario.isDiaUtil(dia)) continue;
            const qtdDia = 9 + rnd.nextInt(7);
            for (let k = 0; k < qtdDia; k++) {
                const destino = sortearDestino();
                const uf = destino[0];
                const transp = TRANSPORTADORAS[rnd.nextInt(TRANSPORTADORAS.length)];
                const transportadora = transp[0];

                let chanceAtraso = transp[1];
                const reg = regiao(uf);
                if (reg === "N" || reg === "NE") chanceAtraso += 0.07;
                if (transportadora === "RotaSul Log" && reg === "S") chanceAtraso -= 0.05;
                if (transportadora === "Ágil Express" && dia >= mesIncidente && dia < fimIncidente) chanceAtraso += 0.25;

                const prazo = diasUteisPrazo(uf);
                const prevista = Calendario.somarDiasUteis(dia, prazo);

                let entrega;
                if (rnd.nextDouble() < chanceAtraso) {
                    entrega = Calendario.somarDiasUteis(prevista, 1 + rnd.nextInt(rnd.nextDouble() < 0.8 ? 2 : 5));
                } else {
                    const antecipa = rnd.nextInt(Math.min(prazo, 3));
                    entrega = Calendario.somarDiasUteis(dia, Math.max(1, prazo - antecipa));
                }
                if (entrega > hoje) {
                    entrega = null;
                } else if (!(hoje > Calendario.somarDiasUteis(dia, 10)) && rnd.nextDouble() < 0.06) {
                    entrega = null;
                }

                const qtdPedida = 5 + rnd.nextInt(116);
                let qtdAtendida = qtdPedida;
                if (rnd.nextDouble() < 0.07) {
                    qtdAtendida = qtdPedida - (1 + rnd.nextInt(Math.min(6, qtdPedida - 1)));
                }
                const centavosUnit = (18 + rnd.nextInt(78)) * 100 + rnd.nextInt(100);
                const valor = centavosUnit * qtdPedida / 100;

                pedidos.push({
                    id: id++, numero: "PV-" + seq++,
                    cliente: clientes[rnd.nextInt(clientes.length)],
                    uf, cidade: destino[1], transportadora,
                    vendedor: VENDEDORES[rnd.nextInt(VENDEDORES.length)],
                    dataFaturamento: dia, prazoDiasUteis: prazo, dataPrevista: prevista, dataEntrega: entrega,
                    qtdPedida, qtdAtendida, valor,
                });
            }
        }
        return pedidos;
    }

    // ---------- AvaliadorSla ----------
    const SITUACOES = {
        OTIF: ["No prazo e completo", "success"],
        ATRASADO: ["Atrasado", "warning"],
        INCOMPLETO: ["Com corte", "warning"],
        ATRASADO_E_INCOMPLETO: ["Atrasado e com corte", "danger"],
        EM_ROTA: ["Em rota, dentro do prazo", "secondary"],
        EM_RISCO: ["Em rota, prazo estourado", "danger"],
    };
    const atrasoTexto = (d) => d === 1 ? "1 dia útil" : d + " dias úteis";

    function avaliar(p, hoje) {
        const cortadas = Math.max(0, p.qtdPedida - p.qtdAtendida);
        const inFull = cortadas === 0;
        let a;
        if (p.dataEntrega == null) {
            const atraso = Math.max(0, Calendario.diasUteisEntre(p.dataPrevista, hoje));
            a = { pedido: p, situacao: atraso > 0 ? "EM_RISCO" : "EM_ROTA", onTime: atraso === 0, inFull, diasAtraso: atraso, unidadesCortadas: cortadas };
        } else {
            const atraso = Math.max(0, Calendario.diasUteisEntre(p.dataPrevista, p.dataEntrega));
            const onTime = atraso === 0;
            const s = onTime && inFull ? "OTIF" : (!onTime && !inFull ? "ATRASADO_E_INCOMPLETO" : (!onTime ? "ATRASADO" : "INCOMPLETO"));
            a = { pedido: p, situacao: s, onTime, inFull, diasAtraso: atraso, unidadesCortadas: cortadas };
        }
        a.realizado = p.dataEntrega != null;
        a.otif = a.situacao === "OTIF";
        return a;
    }

    function motivo(a) {
        const q = a.pedido.qtdPedida;
        switch (a.situacao) {
            case "OTIF": return "Entregue no prazo e sem cortes.";
            case "ATRASADO": return `Entregue com ${atrasoTexto(a.diasAtraso)} de atraso.`;
            case "INCOMPLETO": return `Entregue no prazo, mas faltaram ${a.unidadesCortadas} de ${q} unidades.`;
            case "ATRASADO_E_INCOMPLETO": return `Atraso de ${atrasoTexto(a.diasAtraso)} e faltaram ${a.unidadesCortadas} de ${q} unidades.`;
            case "EM_ROTA": return "Ainda em rota e dentro do prazo prometido.";
            default: return `Ainda em rota e já ${atrasoTexto(a.diasAtraso)} além do prazo.`;
        }
    }

    // ---------- PainelService ----------
    const HOJE = Data.hoje();
    const PEDIDOS = gerar(HOJE);
    const POR_ID = new Map(PEDIDOS.map((p) => [p.id, p]));
    const UFS = [...new Set(PEDIDOS.map((p) => p.uf))].sort();
    const TRANSPS = [...new Set(PEDIDOS.map((p) => p.transportadora))].sort();
    // a "consulta" ordena por faturamento e número, do mais recente para o mais antigo
    const ORDENADOS = [...PEDIDOS].sort((a, b) => b.dataFaturamento - a.dataFaturamento || (b.numero < a.numero ? -1 : 1));

    function filtroDe(params) {
        let inicio = Data.deIso(params.get("inicio")), fim = Data.deIso(params.get("fim"));
        if (inicio != null && fim != null && fim < inicio) [inicio, fim] = [fim, inicio];
        return {
            inicio: inicio ?? Data.comDia(Data.somarMeses(HOJE, -5), 1),
            fim: fim ?? HOJE,
            uf: params.get("uf") || null,
            transportadora: params.get("transportadora") || null,
        };
    }
    const query = (f) => ({ inicio: Data.iso(f.inicio), fim: Data.iso(f.fim), uf: f.uf, transportadora: f.transportadora });

    function buscar(f) {
        return ORDENADOS.filter((p) => p.dataFaturamento >= f.inicio && p.dataFaturamento <= f.fim
            && (!f.uf || p.uf === f.uf) && (!f.transportadora || p.transportadora === f.transportadora))
            .map((p) => avaliar(p, HOJE));
    }

    function pct(lista, cond) {
        if (!lista.length) return 0;
        return Math.round(lista.filter(cond).length * 1000 / lista.length) / 10;
    }

    function ranking(realizadas, chave, minimo) {
        const g = new Map();
        realizadas.forEach((a) => { const k = chave(a.pedido); (g.get(k) || g.set(k, []).get(k)).push(a); });
        return [...g.entries()].filter(([, v]) => v.length >= minimo)
            .map(([nome, v]) => ({ nome, entregues: v.length, falhas: v.filter((a) => !a.otif).length, otifPct: pct(v, (a) => a.otif) }))
            .sort((a, b) => a.otifPct - b.otifPct || b.falhas - a.falhas);
    }

    function resumo(f) {
        const todas = buscar(f);
        const realizadas = todas.filter((a) => a.realizado);
        const risco = todas.filter((a) => a.situacao === "EM_RISCO");
        const porMes = new Map();
        realizadas.forEach((a) => { const k = Data.anoMes(a.pedido.dataFaturamento); (porMes.get(k) || porMes.set(k, []).get(k)).push(a); });
        const mensal = [...porMes.keys()].sort((a, b) => a - b).map((k) => {
            const v = porMes.get(k);
            return { mes: MESES[k % 100 - 1] + "/" + String(Math.floor(k / 100)).slice(2), otif: pct(v, (a) => a.otif), onTime: pct(v, (a) => a.onTime), inFull: pct(v, (a) => a.inFull) };
        });
        const conta = (s) => realizadas.filter((a) => a.situacao === s).length;
        return {
            entregues: realizadas.length,
            emRota: todas.filter((a) => a.situacao === "EM_ROTA").length,
            emRisco: risco.length,
            otifPct: pct(realizadas, (a) => a.otif),
            onTimePct: pct(realizadas, (a) => a.onTime),
            inFullPct: pct(realizadas, (a) => a.inFull),
            valorEmRisco: risco.reduce((s, a) => s + a.pedido.valor, 0),
            mensal,
            porUf: ranking(realizadas, (p) => p.uf, 0),
            porTransportadora: ranking(realizadas, (p) => p.transportadora, 0),
            pioresClientes: ranking(realizadas, (p) => p.cliente, 5).slice(0, 8),
            motivos: { atraso: conta("ATRASADO"), corte: conta("INCOMPLETO"), ambos: conta("ATRASADO_E_INCOMPLETO") },
            falhasRecentes: realizadas.filter((a) => !a.otif).slice(0, 40),
        };
    }

    // ---------- Telas ----------
    const app = document.getElementById("app");
    let graficos = [];
    const corPct = (v) => v >= META_OTIF ? "var(--verde)" : (v >= META_OTIF - 5 ? "var(--amarelo)" : "var(--vermelho)");
    const classePct = (v) => v >= META_OTIF ? "ok" : (v >= META_OTIF - 5 ? "alerta" : "ruim");
    const badge = (s, extra) => `<span class="badge-sit text-bg-${SITUACOES[s][1]} ${extra || ""}">${SITUACOES[s][0]}</span>`;
    const linkPedido = (p) => `<a class="link-pedido" href="#/pedidos/${p.id}">${esc(p.numero)}</a>`;

    function filtros(f, pagina) {
        const opt = (lista, sel) => lista.map((v) => `<option value="${esc(v)}"${v === sel ? " selected" : ""}>${esc(v)}</option>`).join("");
        return `
        <form class="filtros card-sla" id="formFiltros">
            <div class="row g-2 align-items-end">
                <div class="col-6 col-md-2"><label class="form-label" for="inicio">Faturados de</label>
                    <input class="form-control form-control-sm" type="date" id="inicio" name="inicio" value="${Data.iso(f.inicio)}"></div>
                <div class="col-6 col-md-2"><label class="form-label" for="fim">até</label>
                    <input class="form-control form-control-sm" type="date" id="fim" name="fim" value="${Data.iso(f.fim)}"></div>
                <div class="col-6 col-md-2"><label class="form-label" for="uf">UF destino</label>
                    <select class="form-select form-select-sm" id="uf" name="uf"><option value="">Todas</option>${opt(UFS, f.uf)}</select></div>
                <div class="col-6 col-md-3"><label class="form-label" for="transportadora">Transportadora</label>
                    <select class="form-select form-select-sm" id="transportadora" name="transportadora"><option value="">Todas</option>${opt(TRANSPS, f.transportadora)}</select></div>
                <div class="col-12 col-md-3 d-flex gap-2">
                    <button class="btn btn-sm btn-primario flex-fill" type="submit">Filtrar</button>
                    <a class="btn btn-sm btn-outline-secondary flex-fill" href="#${pagina}">Limpar</a>
                </div>
            </div>
        </form>`;
    }

    function linhaRanking(x, link) {
        return `<tr>
            <td><a class="link-pedido text-reset" href="${link}">${esc(x.nome)}</a></td>
            <td class="text-end">${Fmt.inteiro(x.entregues)}</td>
            <td class="text-end">${Fmt.inteiro(x.falhas)}</td>
            <td style="width: 40%"><div class="d-flex align-items-center gap-2">
                <div class="barra flex-fill"><span style="width:${x.otifPct}%;background:${corPct(x.otifPct)}"></span></div>
                <b>${Fmt.pct(x.otifPct)}</b></div></td>
        </tr>`;
    }

    function telaPainel(f) {
        const r = resumo(f);
        const q = query(f);
        app.innerHTML = `
        <div class="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3"><div>
            <h1 class="titulo">Painel de OTIF</h1>
            <div class="subtitulo">Pedidos faturados de <b>${Fmt.data(f.inicio)}</b> a <b>${Fmt.data(f.fim)}</b> · meta OTIF <b>${Fmt.pct(META_OTIF)}</b></div>
        </div></div>
        ${filtros(f, "/")}
        <div class="row g-3 mb-3">
            <div class="col-6 col-lg"><div class="card-sla kpi kpi-destaque"><div class="rotulo">OTIF</div>
                <div class="valor ${classePct(r.otifPct)}">${Fmt.pct(r.otifPct)}</div><div class="detalhe">no prazo <b>e</b> completo</div></div></div>
            <div class="col-6 col-lg"><div class="card-sla kpi"><div class="rotulo">On Time</div>
                <div class="valor">${Fmt.pct(r.onTimePct)}</div><div class="detalhe">entregues até a data prevista</div></div></div>
            <div class="col-6 col-lg"><div class="card-sla kpi"><div class="rotulo">In Full</div>
                <div class="valor">${Fmt.pct(r.inFullPct)}</div><div class="detalhe">entregues sem corte</div></div></div>
            <div class="col-6 col-lg"><div class="card-sla kpi"><div class="rotulo">Entregues</div>
                <div class="valor">${Fmt.inteiro(r.entregues)}</div><div class="detalhe"><span>${Fmt.inteiro(r.emRota)}</span> ainda em rota no prazo</div></div></div>
            <div class="col-12 col-lg"><a class="text-decoration-none text-reset" href="${Rota.href("/risco", q)}">
                <div class="card-sla kpi"><div class="rotulo">Em risco</div>
                <div class="valor ${r.emRisco > 0 ? "ruim" : "ok"}">${Fmt.inteiro(r.emRisco)}</div>
                <div class="detalhe"><span>${Fmt.moeda(r.valorEmRisco)}</span> em rota com prazo estourado →</div></div></a></div>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-lg-8"><div class="card-sla"><div class="secao-titulo">Tendência mensal <small>por mês de faturamento</small></div>
                <div class="grafico"><canvas id="graficoMensal"></canvas></div></div></div>
            <div class="col-lg-4"><div class="card-sla h-100"><div class="secao-titulo">Por que os pedidos falham
                <small>${Fmt.inteiro(r.motivos.atraso + r.motivos.corte + r.motivos.ambos)} falhas</small></div>
                <div class="grafico"><canvas id="graficoMotivos"></canvas></div></div></div>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-lg-6"><div class="card-sla h-100"><div class="secao-titulo">OTIF por transportadora <small>pior → melhor</small></div>
                <table class="table tabela"><thead><tr><th>Transportadora</th><th class="text-end">Entregues</th><th class="text-end">Falhas</th><th>OTIF</th></tr></thead>
                <tbody>${r.porTransportadora.map((x) => linhaRanking(x, Rota.href("/", { ...q, transportadora: x.nome }))).join("")}</tbody></table></div></div>
            <div class="col-lg-6"><div class="card-sla h-100"><div class="secao-titulo">OTIF por UF de destino <small>pior → melhor</small></div>
                <div style="max-height: 300px; overflow-y: auto"><table class="table tabela">
                <thead><tr><th>UF</th><th class="text-end">Entregues</th><th class="text-end">Falhas</th><th>OTIF</th></tr></thead>
                <tbody>${r.porUf.map((x) => linhaRanking(x, Rota.href("/", { ...q, uf: x.nome }))).join("")}</tbody></table></div></div></div>
        </div>
        <div class="row g-3">
            <div class="col-lg-4"><div class="card-sla h-100"><div class="secao-titulo">Clientes mais afetados <small>mín. 5 entregas</small></div>
                <table class="table tabela"><thead><tr><th>Cliente</th><th class="text-end">Falhas</th><th class="text-end">OTIF</th></tr></thead>
                <tbody>${r.pioresClientes.map((x) => `<tr><td>${esc(x.nome)}</td><td class="text-end">${x.falhas}/${x.entregues}</td><td class="text-end fw-semibold">${Fmt.pct(x.otifPct)}</td></tr>`).join("")}</tbody></table></div></div>
            <div class="col-lg-8"><div class="card-sla h-100"><div class="secao-titulo">Falhas mais recentes <small>clique no pedido para ver o detalhe</small></div>
                <div style="max-height: 360px; overflow-y: auto"><table class="table tabela table-hover">
                <thead><tr><th>Pedido</th><th>Cliente</th><th>Destino</th><th>Transportadora</th><th>Situação</th><th>Motivo</th></tr></thead>
                <tbody>${r.falhasRecentes.map((a) => `<tr><td>${linkPedido(a.pedido)}</td><td>${esc(a.pedido.cliente)}</td>
                    <td>${esc(a.pedido.cidade + "/" + a.pedido.uf)}</td><td>${esc(a.pedido.transportadora)}</td>
                    <td>${badge(a.situacao)}</td><td class="text-secondary">${esc(motivo(a))}</td></tr>`).join("")}</tbody></table></div></div></div>
        </div>
        <p class="rodape">Versão de demonstração rodando no navegador, com as mesmas regras e os mesmos dados fictícios do sistema em Java.</p>`;
        Rota.formulario(document.getElementById("formFiltros"), "/");

        Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        Chart.defaults.color = "#64748b";
        graficos.push(new Chart(document.getElementById("graficoMensal"), {
            type: "line",
            data: {
                labels: r.mensal.map((m) => m.mes),
                datasets: [
                    { label: "OTIF", data: r.mensal.map((m) => m.otif), borderColor: "#1d4ed8", backgroundColor: "rgba(29,78,216,.08)", borderWidth: 3, fill: true, tension: .3, pointRadius: 4 },
                    { label: "On Time", data: r.mensal.map((m) => m.onTime), borderColor: "#16a34a", borderDash: [6, 4], borderWidth: 2, tension: .3, pointRadius: 2 },
                    { label: "In Full", data: r.mensal.map((m) => m.inFull), borderColor: "#d97706", borderDash: [6, 4], borderWidth: 2, tension: .3, pointRadius: 2 },
                    { label: "Meta", data: r.mensal.map(() => META_OTIF), borderColor: "#dc2626", borderWidth: 1.5, pointRadius: 0, borderDash: [2, 3] },
                ],
            },
            options: {
                maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
                scales: { y: { suggestedMin: 60, suggestedMax: 100, ticks: { callback: (v) => v + "%" } } },
                plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
                    tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y.toLocaleString("pt-BR")}%` } } },
            },
        }));
        graficos.push(new Chart(document.getElementById("graficoMotivos"), {
            type: "doughnut",
            data: { labels: ["Atraso", "Corte", "Atraso + corte"],
                datasets: [{ data: [r.motivos.atraso, r.motivos.corte, r.motivos.ambos], backgroundColor: ["#f59e0b", "#6366f1", "#dc2626"], borderWidth: 0 }] },
            options: { maintainAspectRatio: false, cutout: "62%", plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } } },
        }));
    }

    function telaRisco(f) {
        const lista = buscar(f).filter((a) => a.situacao === "EM_RISCO")
            .sort((a, b) => b.diasAtraso - a.diasAtraso || b.pedido.valor - a.pedido.valor);
        app.innerHTML = `
        <div class="mb-3"><h1 class="titulo">Pedidos em risco</h1>
            <div class="subtitulo">Ainda em rota e já depois da data prevista — a logística precisa agir antes de virar falha.</div></div>
        ${filtros(f, "/risco")}
        <div class="card-sla"><div class="secao-titulo"><span>${lista.length} pedido(s)</span><small>ordenado por dias de atraso</small></div>
        ${lista.length === 0 ? `<div class="text-center text-secondary py-5">Nenhum pedido em risco neste filtro. 🎉</div>` : `
        <div class="table-responsive"><table class="table tabela table-hover"><thead><tr>
            <th>Pedido</th><th>Cliente</th><th>Destino</th><th>Transportadora</th><th>Faturado</th><th>Previsto</th><th class="text-end">Atraso</th><th class="text-end">Valor</th>
        </tr></thead><tbody>${lista.map((a) => `<tr><td>${linkPedido(a.pedido)}</td><td>${esc(a.pedido.cliente)}</td>
            <td>${esc(a.pedido.cidade + "/" + a.pedido.uf)}</td><td>${esc(a.pedido.transportadora)}</td>
            <td>${Fmt.data(a.pedido.dataFaturamento)}</td><td>${Fmt.data(a.pedido.dataPrevista)}</td>
            <td class="text-end"><span class="badge-sit ${a.diasAtraso >= 3 ? "text-bg-danger" : "text-bg-warning"}">${atrasoTexto(a.diasAtraso)}</span></td>
            <td class="text-end">${Fmt.moeda(a.pedido.valor)}</td></tr>`).join("")}</tbody></table></div>`}
        </div>`;
        Rota.formulario(document.getElementById("formFiltros"), "/risco");
    }

    function telaPedido(id) {
        const p = POR_ID.get(id);
        if (!p) { app.innerHTML = `<div class="card-sla text-center py-5">Pedido não encontrado. <a href="#/">Voltar ao painel</a></div>`; return; }
        const a = avaliar(p, HOJE);
        const sim = (v) => `<b class="${v ? "ok" : "ruim"}">${v ? "sim" : "não"}</b>`;
        const classePonto = p.dataEntrega == null ? (a.diasAtraso > 0 ? "ruim pendente" : "pendente") : (a.onTime ? "ok" : "ruim");
        app.style.maxWidth = "980px";
        app.innerHTML = `
        <a class="text-secondary text-decoration-none small" href="javascript:history.back()">← voltar</a>
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mt-2 mb-3">
            <div><h1 class="titulo">Pedido ${esc(p.numero)}</h1><div class="subtitulo">${esc(p.cliente + " · " + p.cidade + "/" + p.uf)}</div></div>
            ${badge(a.situacao, "fs-6")}
        </div>
        <div class="card-sla mb-3"><div class="secao-titulo">Diagnóstico</div>
            <p class="fs-5 mb-1">${esc(motivo(a))}</p>
            <div class="d-flex gap-4 mt-2 small"><span>On Time: ${sim(a.onTime)}</span><span>In Full: ${sim(a.inFull)}</span></div>
            <div class="linha-tempo">
                <div class="marco"><div class="ponto"></div><b>Faturado</b><span>${Fmt.data(p.dataFaturamento)}</span></div>
                <div class="marco"><div class="ponto"></div><b>Prazo prometido</b><span>${Fmt.data(p.dataPrevista)} (D+${p.prazoDiasUteis} úteis)</span></div>
                <div class="marco"><div class="ponto ${classePonto}"></div><b>${p.dataEntrega != null ? "Entregue" : "Em rota"}</b>
                    <span>${p.dataEntrega != null ? Fmt.data(p.dataEntrega) : "hoje é " + Fmt.data(HOJE)}</span></div>
            </div>
        </div>
        <div class="row g-3">
            <div class="col-md-6"><div class="card-sla h-100"><div class="secao-titulo">Quantidades</div><table class="table tabela">
                <tr><td>Pedida</td><td class="text-end fw-semibold">${p.qtdPedida}</td></tr>
                <tr><td>Atendida</td><td class="text-end fw-semibold">${p.qtdAtendida}</td></tr>
                <tr><td>Cortada</td><td class="text-end fw-semibold ${a.unidadesCortadas > 0 ? "ruim" : ""}">${a.unidadesCortadas}</td></tr>
                <tr><td>Valor do pedido</td><td class="text-end fw-semibold">${Fmt.moeda(p.valor)}</td></tr></table></div></div>
            <div class="col-md-6"><div class="card-sla h-100"><div class="secao-titulo">Logística</div><table class="table tabela">
                <tr><td>Transportadora</td><td class="text-end fw-semibold">${esc(p.transportadora)}</td></tr>
                <tr><td>Vendedor</td><td class="text-end fw-semibold">${esc(p.vendedor)}</td></tr>
                <tr><td>Prazo</td><td class="text-end fw-semibold">D+${p.prazoDiasUteis} dias úteis</td></tr>
                <tr><td>Dias úteis de atraso</td><td class="text-end fw-semibold ${a.diasAtraso > 0 ? "ruim" : ""}">${a.diasAtraso}</td></tr></table></div></div>
        </div>`;
    }

    Rota.iniciar(({ caminho, params }) => {
        graficos.forEach((g) => g.destroy());
        graficos = [];
        app.style.maxWidth = "";
        const m = /^\/pedidos\/(\d+)$/.exec(caminho);
        document.getElementById("navPainel").classList.toggle("ativo", caminho === "/");
        document.getElementById("navRisco").classList.toggle("ativo", caminho === "/risco");
        const f = filtroDe(params);
        const q = query(f);
        document.getElementById("navPainel").href = Rota.href("/", q);
        document.getElementById("navRisco").href = Rota.href("/risco", q);
        if (m) { telaPedido(+m[1]); document.title = "OTIF · " + (POR_ID.get(+m[1])?.numero || "Pedido"); }
        else if (caminho === "/risco") { telaRisco(f); document.title = "OTIF · Em risco"; }
        else { telaPainel(f); document.title = "OTIF · Painel"; }
    });
})();
