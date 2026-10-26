// ============================================================
//  GEROT — versão que roda no navegador.
//  Porta das regras do sistema em Java (github.com/italoeduardo/gerot):
//  mesmo gerador (semente 7), mesmos 12 indicadores, mesma análise
//  automática e mesma projeção. As metas alteradas ficam salvas só
//  no navegador de quem está testando.
// ============================================================
(function () {
    "use strict";
    const { JavaRandom, Data, Calendario, Rota, esc, Local, somaJava, arredHalfUp } = window.Demo;

    // ---------- Gerador (mesma ordem de sorteios do Java) ----------
    const PERFIS = [
        { cd: "CD Campinas", faturamento: 196000, ticket: 452, corte: 0.0036, devolucao: 0.015, estoque: 18400000, bloqueado: 0.024,
            recebimentos: 36, recebFinalizado: 0.988, pendencias: 0, retira: 16.5, os: 3, preventivoInicial: 0.83, preventivoFinal: 0.86, produtividade: 93 },
        { cd: "CD Recife", faturamento: 171000, ticket: 418, corte: 0.0068, devolucao: 0.023, estoque: 9300000, bloqueado: 0.036,
            recebimentos: 23, recebFinalizado: 0.962, pendencias: 2, retira: 23.0, os: 6, preventivoInicial: 0.66, preventivoFinal: 0.79, produtividade: 79 },
    ];

    function gerar(hoje) {
        const rnd = new JavaRandom(7);
        const ruido = (amp) => 1 + (rnd.nextDouble() * 2 - 1) * amp;
        const dinheiro = (v) => arredHalfUp(v, 2);
        const inicio = Data.comDia(Data.somarMeses(hoje, -6), 1);
        const totalDias = hoje - inicio;
        const out = [];
        for (let dia = inicio; dia <= hoje; dia++) {
            if (!Calendario.isDiaUtil(dia)) continue;
            const progresso = (dia - inicio) / totalDias;
            const fatorDia = Data.diaSemana(dia) === 1 ? 1.12 : 1.0;
            for (const p of PERFIS) {
                const fat = p.faturamento * fatorDia * ruido(0.10);
                const pedidos = Math.round(fat / (p.ticket * ruido(0.04)));
                const itens = pedidos * (11 + rnd.nextInt(3));
                const cortados = Math.round(itens * p.corte * ruido(0.45));
                const estoque = p.estoque * ruido(0.02);
                const bloqueado = estoque * p.bloqueado * ruido(0.12);
                const receb = Math.round(p.recebimentos * ruido(0.2));
                const finalizados = Math.min(receb, Math.round(receb * p.recebFinalizado * ruido(0.02)));
                const pend = Math.max(0, p.pendencias + rnd.nextInt(3) - 1);
                const retira = p.retira * ruido(0.15);
                const os = Math.max(0, p.os + rnd.nextInt(5) - 2);
                const prevPct = p.preventivoInicial + (p.preventivoFinal - p.preventivoInicial) * progresso;
                const abastecimentos = 120 + rnd.nextInt(60);
                const preventivos = Math.round(abastecimentos * Math.min(0.98, prevPct * ruido(0.05)));
                const volumes = pedidos * (6 + rnd.nextInt(3));
                const horas = volumes / (p.produtividade * ruido(0.07));
                // no Java a devolução é sorteada por último, dentro da cadeia de construção
                const devolvido = dinheiro(fat * p.devolucao * ruido(0.35));
                out.push({
                    data: dia, cd: p.cd, faturamento: dinheiro(fat),
                    pedidosExpedidos: pedidos, itensPedidos: itens, itensCortados: cortados, valorDevolvido: devolvido,
                    valorEstoque: dinheiro(estoque), valorEstoqueBloqueado: dinheiro(bloqueado),
                    recebimentos: receb, recebimentosFinalizados: finalizados, pendencias48h: pend,
                    tempoMedioRetiraMin: Math.round(retira * 10) / 10, osAbertas: os,
                    abastecimentosPreventivos: preventivos, abastecimentosCorretivos: abastecimentos - preventivos,
                    volumesSeparados: volumes, horasSeparacao: Math.round(horas * 10) / 10,
                });
            }
        }
        return out;
    }

    // ---------- Indicadores ----------
    const soma = (dias, campo) => somaJava(dias.map(campo));
    const razao = (num, den, fator) => den === 0 ? 0 : num / den * fator;
    const ultimaData = (dias) => dias.reduce((m, d) => Math.max(m, d.data), -Infinity);
    const doUltimoDia = (dias) => { const u = ultimaData(dias); return dias.filter((d) => d.data === u); };

    const IND = [
        ["FATURAMENTO", "Faturamento", "MOEDA", true, 185000, true, "Soma faturada no período (meta por dia útil, por CD).",
            (d) => soma(d, (x) => x.faturamento)],
        ["PEDIDOS", "Pedidos expedidos", "INTEIRO", true, 420, true, "Pedidos que saíram do CD (meta por dia útil, por CD).",
            (d) => soma(d, (x) => x.pedidosExpedidos)],
        ["TICKET_MEDIO", "Ticket médio", "MOEDA", true, 430, false, "Faturamento dividido pelos pedidos expedidos.",
            (d) => razao(soma(d, (x) => x.faturamento), soma(d, (x) => x.pedidosExpedidos), 1)],
        ["CORTE", "Taxa de corte", "PERCENTUAL", false, 0.5, false, "Itens pedidos que não foram atendidos.",
            (d) => razao(soma(d, (x) => x.itensCortados), soma(d, (x) => x.itensPedidos), 100)],
        ["DEVOLUCAO", "Devolução", "PERCENTUAL", false, 2.0, false, "Valor devolvido sobre o faturamento.",
            (d) => razao(soma(d, (x) => x.valorDevolvido), soma(d, (x) => x.faturamento), 100)],
        ["ESTOQUE_BLOQUEADO", "Estoque bloqueado", "PERCENTUAL", false, 3.0, false, "Fotografia do último dia: estoque bloqueado sobre o total.",
            (d) => { const u = doUltimoDia(d); return razao(soma(u, (x) => x.valorEstoqueBloqueado), soma(u, (x) => x.valorEstoque), 100); }],
        ["RECEBIMENTO", "Recebimento finalizado", "PERCENTUAL", true, 98.0, false, "Recebimentos conferidos e finalizados no mesmo dia.",
            (d) => razao(soma(d, (x) => x.recebimentosFinalizados), soma(d, (x) => x.recebimentos), 100)],
        ["PENDENCIAS_48H", "Pendências > 48h", "INTEIRO", false, 0, false, "Recebimentos parados há mais de 48 horas (último dia).",
            (d) => soma(doUltimoDia(d), (x) => x.pendencias48h)],
        ["TEMPO_RETIRA", "Tempo médio de retira", "MINUTOS", false, 20, false, "Minutos entre a chegada do cliente e a liberação da carga.",
            (d) => soma(d, (x) => x.tempoMedioRetiraMin) / d.length],
        ["OS_ABERTAS", "OS de manutenção abertas", "INTEIRO", false, 5, false, "Ordens de serviço de equipamentos em aberto (último dia).",
            (d) => soma(doUltimoDia(d), (x) => x.osAbertas)],
        ["ABASTECIMENTO_PREVENTIVO", "Abastecimento preventivo", "PERCENTUAL", true, 80, false, "Reposições do picking feitas antes de faltar produto.",
            (d) => razao(soma(d, (x) => x.abastecimentosPreventivos), soma(d, (x) => x.abastecimentosPreventivos + x.abastecimentosCorretivos), 100)],
        ["PRODUTIVIDADE", "Produtividade da separação", "POR_HORA", true, 85, false, "Volumes separados por hora trabalhada.",
            (d) => razao(soma(d, (x) => x.volumesSeparados), soma(d, (x) => x.horasSeparacao), 1)],
    ].map(([id, nome, unidade, maiorMelhor, metaPadrao, metaPorDiaUtil, descricao, calculo]) => ({
        id, nome, unidade, maiorMelhor, metaPadrao, metaPorDiaUtil, descricao,
        calcular: (dias) => dias.length === 0 ? 0 : calculo(dias),
        metaDoPeriodo: (meta, fechamentos) => metaPorDiaUtil ? meta * fechamentos : meta,
        status(valor, meta) {
            if (maiorMelhor) return valor >= meta ? "OK" : (valor >= meta * 0.95 ? "ATENCAO" : "CRITICO");
            if (valor <= meta) return "OK";
            return valor <= (meta === 0 ? 3 : meta * 1.15) ? "ATENCAO" : "CRITICO";
        },
    }));
    const IND_POR_ID = Object.fromEntries(IND.map((i) => [i.id, i]));
    const STATUS = { OK: ["Dentro da meta", "ok"], ATENCAO: ["Perto da meta", "atencao"], CRITICO: ["Fora da meta", "critico"] };

    // ---------- Formatos (igual ao @fmt do Java) ----------
    const num = Demo.Fmt.num;
    const fmt = {
        num,
        pct(v) { const a = Math.abs(v); return num(v, a > 0 && a < 1 ? 2 : 1) + "%"; },
        moeda: Demo.Fmt.moeda,
        moedaCurta(v) {
            const a = Math.abs(v);
            if (a >= 1000000) return "R$ " + num(v / 1000000, 2) + " mi";
            if (a >= 10000) return "R$ " + num(v / 1000, 0) + " mil";
            return fmt.moeda(v);
        },
        inteiro: (v) => num(Math.round(v), 0),
        valor(ind, v) {
            switch (ind.unidade) {
                case "MOEDA": return v >= 10000 ? fmt.moedaCurta(v) : fmt.moeda(v);
                case "INTEIRO": return fmt.inteiro(v);
                case "PERCENTUAL": return fmt.pct(v);
                case "MINUTOS": return num(v, 1) + " min";
                default: return num(v, 1) + " vol/h";
            }
        },
    };

    // ---------- Metas (ficam no navegador do visitante) ----------
    const CHAVE_METAS = "demo.gerot.metas";
    const metasSalvas = () => Local.ler(CHAVE_METAS, {});
    const metaValores = () => { const s = metasSalvas(); return Object.fromEntries(IND.map((i) => [i.id, s[i.id]?.valor ?? i.metaPadrao])); };

    // ---------- PainelService ----------
    const HOJE = Data.hoje();
    const DIAS = gerar(HOJE);
    const CDS = [...new Set(DIAS.map((d) => d.cd))].sort();
    const buscar = (ini, fim, cd) => DIAS.filter((d) => d.data >= ini && d.data <= fim && (!cd || d.cd === cd));

    function filtroDe(params) {
        let inicio = Data.deIso(params.get("inicio")), fim = Data.deIso(params.get("fim"));
        if (inicio != null && fim != null && fim < inicio) [inicio, fim] = [fim, inicio];
        return { inicio: inicio ?? Data.comDia(HOJE, 1), fim: fim ?? HOJE, cd: params.get("cd") || null };
    }

    function variacao(ind, atual, anterior, diasAtual, diasAnterior) {
        if (anterior.length === 0 || diasAtual === 0) return null;
        let a = ind.calcular(atual), b = ind.calcular(anterior);
        if (ind.metaPorDiaUtil) { a /= diasAtual; b /= diasAnterior; }
        if (b === 0) return null;
        return Math.round((a - b) / Math.abs(b) * 1000) / 10;
    }

    function projecao(f, metaDiaria) {
        const primeiro = Data.comDia(HOJE, 1);
        if (f.fim < primeiro || f.inicio > HOJE) return null;
        const doMes = buscar(primeiro, HOJE, f.cd);
        const passados = new Set(doMes.map((d) => d.data)).size;
        if (passados === 0) return null;
        const p = Data.partes(HOJE);
        let uteisMes = 0;
        for (let d = primeiro; d < primeiro + Data.diasNoMes(p.ano, p.mes); d++) if (Calendario.isDiaUtil(d)) uteisMes++;
        const realizado = IND_POR_ID.FATURAMENTO.calcular(doMes);
        const projetado = realizado / passados * uteisMes;
        const cds = f.cd == null ? Math.max(1, CDS.length) : 1;
        const metaMes = metaDiaria * uteisMes * cds;
        const pctMeta = metaMes === 0 ? 0 : projetado / metaMes * 100;
        return { realizado, projetado, metaMes, diasUteisPassados: passados, diasUteisMes: uteisMes, pctMeta, pctBarra: Math.min(100, pctMeta) };
    }

    function analisar(kpis, proj) {
        const out = [];
        const criticos = kpis.filter((k) => k.status === "CRITICO").sort((a, b) => b.desvioRuim - a.desvioRuim);
        criticos.forEach((k) => out.push(["ALERTA", `${k.ind.nome} fora da meta: ${fmt.valor(k.ind, k.valor)} contra ${fmt.valor(k.ind, k.meta)}.`]));
        const atencao = kpis.filter((k) => k.status === "ATENCAO");
        if (atencao.length) {
            const n = atencao.map((k) => k.ind.nome.toLowerCase());
            out.push(["ATENCAO", "Perto do limite: " + (n.length === 1 ? n[0] : n.slice(0, -1).join(", ") + " e " + n[n.length - 1]) + "."]);
        }
        const sinal = (v) => (v > 0 ? "+" : "") + fmt.pct(v);
        const maior = (lista) => lista.reduce((m, k) => (m == null || Math.abs(k.variacaoPct) > Math.abs(m.variacaoPct) ? k : m), null);
        const relevantes = kpis.filter((k) => k.variacaoPct != null && Math.abs(k.variacaoPct) >= 5);
        const melhor = maior(relevantes.filter((k) => k.variacaoBoa));
        if (melhor) out.push(["MELHORA", `Maior melhora contra o período anterior: ${melhor.ind.nome} (${sinal(melhor.variacaoPct)}).`]);
        const pior = maior(relevantes.filter((k) => !k.variacaoBoa));
        if (pior) out.push(["PIORA", `Maior piora contra o período anterior: ${pior.ind.nome} (${sinal(pior.variacaoPct)}).`]);
        if (proj) {
            out.push(["PROJECAO", `Mantido o ritmo de ${proj.diasUteisPassados} dias úteis, o faturamento do mês fecha em ${fmt.moedaCurta(proj.projetado)} `
                + `(${fmt.pct(proj.pctMeta)} da meta, ${proj.pctMeta >= 100 ? "acima da meta" : "abaixo da meta"}).`]);
        }
        if (!criticos.length && !atencao.length) out.unshift(["POSITIVO", "Todos os 12 indicadores estão dentro da meta no período."]);
        return out;
    }
    const INSIGHT = { ALERTA: ["⚠️", "critico"], ATENCAO: ["🟡", "atencao"], MELHORA: ["📈", "ok"], PIORA: ["📉", "critico"], PROJECAO: ["🎯", "info"], POSITIVO: ["✅", "ok"] };

    function montar(f) {
        const dias = buscar(f.inicio, f.fim, f.cd);
        const nDias = f.fim - f.inicio + 1;
        const anteriores = buscar(f.inicio - nDias, f.inicio - 1, f.cd);
        const metas = metaValores();
        const porData = new Map();
        dias.forEach((d) => (porData.get(d.data) || porData.set(d.data, []).get(d.data)).push(d));
        const datasOrdem = [...porData.keys()].sort((a, b) => a - b);
        const diasUteis = datasOrdem.length;
        const diasUteisAnt = new Set(anteriores.map((d) => d.data)).size;
        const kpis = IND.map((ind) => {
            const valor = ind.calcular(dias);
            const meta = ind.metaDoPeriodo(metas[ind.id], dias.length);
            const v = variacao(ind, dias, anteriores, diasUteis, diasUteisAnt);
            const rel = meta === 0 ? null : (valor - meta) / meta;
            return {
                ind, valor, meta, status: ind.status(valor, meta), variacaoPct: v,
                variacaoBoa: v == null || v === 0 ? true : ind.maiorMelhor === v > 0,
                desvioRuim: meta === 0 ? (ind.maiorMelhor ? 0 : valor) : (ind.maiorMelhor ? -rel : rel),
                serie: datasOrdem.map((d) => ind.calcular(porData.get(d))),
            };
        });
        const proj = projecao(f, metas.FATURAMENTO);
        return { f, diasUteis, kpis, datas: datasOrdem.map((d) => Data.br(d).slice(0, 5)), proj, insights: analisar(kpis, proj) };
    }

    // ---------- Telas ----------
    const app = document.getElementById("app");
    let graficos = [];
    const logado = () => sessionStorageGet("demo.gerot.logado") === "1";
    function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function sessionStorageSet(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
    let flash = null;

    function telaPainel(f) {
        const p = montar(f);
        const conta = (s) => p.kpis.filter((k) => k.status === s).length;
        const pr = p.proj;
        app.innerHTML = `
        <div class="cabecalho"><div>
            <h1 class="titulo">Operação logística</h1>
            <div class="subtitulo"><span>${Data.br(f.inicio)} a ${Data.br(f.fim)}</span> · <span>${esc(f.cd || "todos os CDs")}</span> · <span>${p.diasUteis} dias úteis</span></div>
        </div>
        <div class="placar"><span class="chip ok">${conta("OK")} na meta</span><span class="chip atencao">${conta("ATENCAO")} perto</span><span class="chip critico">${conta("CRITICO")} fora</span></div></div>

        <form class="filtros caixa" id="formFiltros">
            <div><label for="inicio">De</label><input type="date" id="inicio" name="inicio" class="form-control form-control-sm" value="${Data.iso(f.inicio)}"></div>
            <div><label for="fim">Até</label><input type="date" id="fim" name="fim" class="form-control form-control-sm" value="${Data.iso(f.fim)}"></div>
            <div><label for="cd">Centro de distribuição</label><select id="cd" name="cd" class="form-select form-select-sm"><option value="">Todos</option>
                ${CDS.map((c) => `<option value="${esc(c)}"${c === f.cd ? " selected" : ""}>${esc(c)}</option>`).join("")}</select></div>
            <div class="filtros-botoes"><button class="btn btn-sm btn-destaque" type="submit">Aplicar</button><a class="btn btn-sm btn-outline-secondary" href="#/">Mês atual</a></div>
        </form>

        <div class="row g-3 mb-3">
            <div class="col-lg-8"><section class="caixa h-100"><h2 class="secao">🧠 Análise automática do período</h2>
                <ul class="insights">${p.insights.map(([t, txt]) => `<li class="${INSIGHT[t][1]}"><span class="insight-icone">${INSIGHT[t][0]}</span><span>${esc(txt)}</span></li>`).join("")}</ul></section></div>
            <div class="col-lg-4">${pr ? `<section class="caixa h-100 projecao"><h2 class="secao">🎯 Projeção do mês</h2>
                <div class="projecao-valor">${fmt.moedaCurta(pr.projetado)}</div>
                <div class="projecao-meta">meta <b>${fmt.moedaCurta(pr.metaMes)}</b></div>
                <div class="barra-grande"><span style="width:${pr.pctBarra}%" class="${pr.pctMeta >= 100 ? "ok" : (pr.pctMeta >= 95 ? "atencao" : "critico")}"></span></div>
                <div class="projecao-rodape"><b>${fmt.pct(pr.pctMeta)}</b> da meta · realizado <span>${fmt.moedaCurta(pr.realizado)}</span> em <span>${pr.diasUteisPassados} de ${pr.diasUteisMes}</span> dias úteis</div></section>`
            : `<section class="caixa h-100"><h2 class="secao">🎯 Projeção do mês</h2><p class="text-secondary mb-0">A projeção aparece quando o período inclui o mês atual.</p></section>`}</div>
        </div>

        <div class="kpis">${p.kpis.map((k, i) => `
            <article class="kpi caixa ${STATUS[k.status][1]}">
                <div class="kpi-topo"><span class="kpi-nome" title="${esc(k.ind.descricao)}">${esc(k.ind.nome)}</span><span class="kpi-status">${STATUS[k.status][0]}</span></div>
                <div class="kpi-valor">${fmt.valor(k.ind, k.valor)}</div>
                <div class="kpi-meta">meta <span>${(k.ind.maiorMelhor ? "≥ " : "≤ ") + fmt.valor(k.ind, k.meta)}</span>
                    ${k.variacaoPct != null ? `<span class="kpi-var ${k.variacaoBoa ? "boa" : "ruim"}" title="contra o período anterior de mesmo tamanho">${(k.variacaoPct > 0 ? "▲" : k.variacaoPct < 0 ? "▼" : "") + " " + fmt.pct(Math.abs(k.variacaoPct))}</span>` : ""}</div>
                <div class="sparkline"><canvas id="spark${i}"></canvas></div>
            </article>`).join("")}</div>
        <p class="rodape">Versão de demonstração rodando no navegador, com as mesmas regras e os mesmos dados fictícios do sistema em Java.</p>`;
        Rota.formulario(document.getElementById("formFiltros"), "/");
        const cores = { OK: "#0d9488", ATENCAO: "#d97706", CRITICO: "#dc2626" };
        p.kpis.forEach((k, i) => graficos.push(new Chart(document.getElementById("spark" + i), {
            type: "line",
            data: { labels: p.datas, datasets: [{ data: k.serie, borderColor: cores[k.status], borderWidth: 2, pointRadius: 0, tension: .35, fill: false }] },
            options: { maintainAspectRatio: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } },
        })));
    }

    function telaLogin(params) {
        app.style.maxWidth = "420px";
        app.innerHTML = `
        <form class="caixa mt-4" id="formLogin">
            <h1 class="titulo mb-1">Entrar como gestor</h1>
            <p class="subtitulo mb-3">Necessário apenas para alterar metas.</p>
            ${params.get("erro") ? `<div class="alert alert-danger py-2">Usuário ou senha inválidos.</div>` : ""}
            <div class="mb-2"><label class="form-label small" for="username">Usuário</label><input class="form-control" id="username" name="username" autocomplete="username" required autofocus></div>
            <div class="mb-3"><label class="form-label small" for="password">Senha</label><input class="form-control" id="password" name="password" type="password" autocomplete="current-password" required></div>
            <button class="btn btn-destaque w-100" type="submit">Entrar</button>
            <p class="small text-secondary mt-3 mb-0">Demonstração: <code>gestor</code> / <code>gestor123</code></p>
        </form>`;
        document.getElementById("formLogin").addEventListener("submit", (e) => {
            e.preventDefault();
            const ok = e.target.username.value === "gestor" && e.target.password.value === "gestor123";
            if (!ok) return Rota.ir("/login", { erro: "1" });
            sessionStorageSet("demo.gerot.logado", "1");
            Rota.ir("/metas");
        });
    }

    function telaMetas() {
        const salvas = metasSalvas();
        app.style.maxWidth = "980px";
        app.innerHTML = `
        <div class="cabecalho"><div><h1 class="titulo">Metas dos indicadores</h1><div class="subtitulo">Só o gestor altera. Cada mudança registra quem fez e quando.</div></div></div>
        ${flash?.ok ? `<div class="alert alert-success">${esc(flash.ok)}</div>` : ""}${flash?.erro ? `<div class="alert alert-danger">${esc(flash.erro)}</div>` : ""}
        <form class="caixa" id="formMetas"><table class="table tabela align-middle">
            <thead><tr><th>Indicador</th><th>Sentido</th><th style="width: 190px">Meta</th><th>Última alteração</th></tr></thead>
            <tbody>${IND.map((i) => {
                const s = salvas[i.id];
                return `<tr><td><div class="fw-semibold">${esc(i.nome)}</div><div class="small text-secondary">${esc(i.descricao)}</div></td>
                    <td class="small">${i.maiorMelhor ? "maior é melhor" : "menor é melhor"}</td>
                    <td><input class="form-control form-control-sm" type="number" step="any" min="0" name="meta_${i.id}" value="${String(s?.valor ?? i.metaPadrao)}" aria-label="Meta de ${esc(i.nome)}"></td>
                    <td class="small text-secondary">${s ? esc(s.por + " em " + s.em) : "padrão do sistema"}</td></tr>`;
            }).join("")}</tbody></table>
            <div class="d-flex justify-content-between gap-2 flex-wrap">
                <button class="btn btn-link btn-sm text-secondary px-0" type="button" id="btnRestaurar">Restaurar metas padrão</button>
                <div class="d-flex gap-2"><a class="btn btn-outline-secondary btn-sm" href="#/">Voltar ao painel</a><button class="btn btn-destaque btn-sm" type="submit">Salvar metas</button></div>
            </div>
        </form>`;
        flash = null;
        document.getElementById("formMetas").addEventListener("submit", (e) => {
            e.preventDefault();
            const atuais = metaValores(), novas = metasSalvas();
            let alteradas = 0;
            try {
                for (const i of IND) {
                    let bruto = e.target["meta_" + i.id].value.trim();
                    if (!bruto) continue;
                    if (bruto.includes(",")) bruto = bruto.replace(/\./g, "").replace(",", ".");
                    const valor = Number(bruto);
                    if (Number.isNaN(valor)) throw new SyntaxError();
                    if (valor !== atuais[i.id]) {
                        if (valor < 0 || !Number.isFinite(valor)) throw new RangeError("Meta inválida para " + i.nome);
                        const agora = new Date();
                        novas[i.id] = { valor, por: "gestor", em: `${Data.br(Data.hoje())} ${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}` };
                        alteradas++;
                    }
                }
                flash = { ok: alteradas === 0 ? "Nenhuma meta foi alterada." : alteradas + " meta(s) atualizada(s)." };
            } catch (err) {
                flash = { erro: err instanceof RangeError ? err.message : "Use apenas números (ex.: 185000 ou 0,5)." };
            }
            Local.gravar(CHAVE_METAS, novas);
            telaMetas();
        });
        document.getElementById("btnRestaurar").addEventListener("click", () => {
            Local.apagar(CHAVE_METAS);
            flash = { ok: "Metas voltaram ao padrão do sistema." };
            telaMetas();
        });
    }

    document.getElementById("btnSair").addEventListener("click", () => { sessionStorageSet("demo.gerot.logado", null); Rota.ir("/"); });

    Rota.iniciar(({ caminho, params }) => {
        graficos.forEach((g) => g.destroy());
        graficos = [];
        app.style.maxWidth = "";
        if (caminho === "/metas" && !logado()) return Rota.ir("/login");
        document.getElementById("navPainel").classList.toggle("ativo", caminho === "/");
        document.getElementById("navMetas").classList.toggle("ativo", caminho === "/metas");
        document.getElementById("btnSair").hidden = !logado();
        if (caminho === "/metas") { telaMetas(); document.title = "GEROT · Metas"; }
        else if (caminho === "/login") { telaLogin(params); document.title = "GEROT · Entrar"; }
        else { telaPainel(filtroDe(params)); document.title = "GEROT · Painel"; }
    });
})();
