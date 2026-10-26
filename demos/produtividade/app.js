// ============================================================
//  Produtividade — versão que roda no navegador.
//  Porta das regras do sistema em Java (github.com/italoeduardo/produtividade):
//  mesmo gerador (semente 11), vol/h pelas horas efetivamente separando,
//  ranking com mínimo de 10 OS, matriz separador × setor e pico por hora.
//  Como no Java, só existem as OS que já terminaram até agora.
// ============================================================
(function () {
    "use strict";
    const { JavaRandom, Data, Calendario, Fmt, Rota, esc } = window.Demo;

    const SETORES = [["MERCEARIA", "Mercearia", 1.10, 6.0], ["BEBIDAS", "Bebidas", 0.95, 12.0], ["LIMPEZA", "Limpeza", 1.05, 5.0],
        ["HIGIENE", "Higiene", 1.00, 2.0], ["PESADOS", "Pesados", 0.70, 25.0], ["FRACIONADOS", "Fracionados", 0.60, 0.8]]
        .map(([id, nome, ritmo, kgPorVolume]) => ({ id, nome, ritmo, kgPorVolume }));
    const SETOR = Object.fromEntries(SETORES.map((s) => [s.id, s]));
    const TURNOS = [["MANHA", "Manhã", 6], ["TARDE", "Tarde", 14], ["NOITE", "Noite", 22]].map(([id, nome, inicio]) => ({ id, nome, inicio, horas: 8 }));
    const TURNO = Object.fromEntries(TURNOS.map((t) => [t.id, t]));

    const EQUIPE = [
        ["Ana Lúcia Prado", "CD Campinas", "MANHA", 92, 92, "MERCEARIA", "LIMPEZA"], ["Bruno Teixeira", "CD Campinas", "MANHA", 88, 88, "BEBIDAS", "PESADOS"],
        ["Carla Nogueira", "CD Campinas", "MANHA", 80, 80, "HIGIENE", "FRACIONADOS"], ["Diego Moreira", "CD Campinas", "MANHA", 96, 96, "MERCEARIA", "BEBIDAS"],
        ["Elaine Rocha", "CD Campinas", "MANHA", 78, 78, "FRACIONADOS"], ["Fábio Cardoso", "CD Campinas", "MANHA", 85, 85, "PESADOS", "BEBIDAS"],
        ["Gustavo Lima", "CD Campinas", "TARDE", 90, 90, "MERCEARIA", "LIMPEZA"], ["Helena Barros", "CD Campinas", "TARDE", 84, 84, "HIGIENE", "LIMPEZA"],
        ["Igor Fonseca", "CD Campinas", "TARDE", 87, 87, "BEBIDAS"], ["Júlia Santana", "CD Campinas", "TARDE", 52, 86, "MERCEARIA", "HIGIENE"],
        ["Kleber Matos", "CD Campinas", "TARDE", 82, 82, "PESADOS"], ["Larissa Pires", "CD Campinas", "TARDE", 79, 79, "FRACIONADOS", "HIGIENE"],
        ["Marcos Vieira", "CD Campinas", "NOITE", 81, 81, "MERCEARIA", "BEBIDAS"], ["Nathália Freitas", "CD Campinas", "NOITE", 77, 77, "LIMPEZA", "HIGIENE"],
        ["Otávio Ramos", "CD Campinas", "NOITE", 84, 84, "PESADOS", "BEBIDAS"], ["Paula Antunes", "CD Recife", "MANHA", 86, 86, "MERCEARIA", "HIGIENE"],
        ["Rafael Gomes", "CD Recife", "MANHA", 83, 83, "BEBIDAS", "PESADOS"], ["Sabrina Duarte", "CD Recife", "MANHA", 76, 76, "FRACIONADOS", "LIMPEZA"],
        ["Tiago Brandão", "CD Recife", "MANHA", 89, 89, "MERCEARIA"], ["Úrsula Macedo", "CD Recife", "TARDE", 80, 80, "HIGIENE", "LIMPEZA"],
        ["Vítor Campos", "CD Recife", "TARDE", 85, 85, "BEBIDAS", "MERCEARIA"], ["Wesley Pacheco", "CD Recife", "TARDE", 74, 74, "PESADOS", "FRACIONADOS"],
        ["Yara Lopes", "CD Recife", "TARDE", 82, 82, "MERCEARIA", "LIMPEZA"], ["Zeca Albuquerque", "CD Recife", "NOITE", 78, 78, "BEBIDAS", "PESADOS"],
    ].map(([nome, unidade, turno, ritmoBase, ritmoFinal, ...preferidos]) => ({ nome, unidade, turno, ritmoBase, ritmoFinal, preferidos }));

    // ---------- Gerador (tempo em segundos: dia × 86400 + segundos do dia, como LocalDateTime) ----------
    function gerar(agora) {
        const rnd = new JavaRandom(11);
        const hoje = Math.floor(agora / 86400);
        const inicio = Data.comDia(Data.somarMeses(hoje, -2), 1);
        const totalDias = hoje - inicio;
        const out = [];
        let seq = 500000;
        for (let dia = inicio; dia <= hoje; dia++) {
            if (!Calendario.isDiaUtil(dia)) continue;
            const progresso = (dia - inicio) / totalDias;
            for (const s of EQUIPE) {
                if (rnd.nextDouble() < 0.05) continue;
                let ritmo = s.ritmoBase + (s.ritmoFinal - s.ritmoBase) * Math.sqrt(progresso);
                if (s.turno === "NOITE") ritmo *= 0.93;
                const t0 = dia * 86400 + TURNO[s.turno].inicio * 3600;
                let t = t0 + (10 + rnd.nextInt(15)) * 60;
                const fimTurno = t0 + TURNO[s.turno].horas * 3600 - 20 * 60;
                while (true) {
                    const setor = rnd.nextDouble() < 0.75 ? SETOR[s.preferidos[rnd.nextInt(s.preferidos.length)]] : SETORES[rnd.nextInt(SETORES.length)];
                    let volumes = 18 + rnd.nextInt(42);
                    if (setor.id === "PESADOS") volumes = Math.max(8, Math.trunc(volumes / 2));
                    const volHora = ritmo * setor.ritmo * (0.88 + rnd.nextDouble() * 0.24);
                    const segundos = Math.round(volumes / volHora * 3600);
                    const fim = t + segundos;
                    if (fim > fimTurno || fim > agora) break;
                    const itensPorVolume = setor.id === "FRACIONADOS" ? 6 + rnd.nextInt(7) : 1 + rnd.nextInt(3);
                    const peso = volumes * setor.kgPorVolume * (0.85 + rnd.nextDouble() * 0.3);
                    out.push({ numero: "OS-" + seq++, unidade: s.unidade, data: dia, turno: s.turno, setor: setor.id, separador: s.nome,
                        inicio: t, fim, itens: volumes * itensPorVolume, volumes, pesoKg: Math.round(peso * 10) / 10 });
                    t = fim + (2 + rnd.nextInt(5)) * 60;
                }
            }
        }
        return out;
    }

    // ---------- Métricas: vol/h pelas horas efetivamente separando ----------
    function metricas(lista) {
        let volumes = 0, itens = 0, peso = 0, minutos = 0;
        for (const o of lista) { volumes += o.volumes; itens += o.itens; peso += o.pesoKg; minutos += (o.fim - o.inicio) / 60; }
        const horas = minutos / 60;
        return { os: lista.length, volumes, itens, pesoKg: peso, horas,
            volumesPorHora: horas === 0 ? 0 : volumes / horas, minutosPorOs: lista.length === 0 ? 0 : horas * 60 / lista.length, toneladas: peso / 1000 };
    }

    const agora = () => { const d = new Date(); return Data.hoje() * 86400 + d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); };
    const AGORA = agora();
    const HOJE = Math.floor(AGORA / 86400);
    const OS = gerar(AGORA);
    const UNIDS = [...new Set(OS.map((o) => o.unidade))].sort();
    const agrupar = (lista, chave) => { const m = new Map(); lista.forEach((x) => { const k = chave(x); (m.get(k) || m.set(k, []).get(k)).push(x); }); return m; };

    function filtroDe(params) {
        let inicio = Data.deIso(params.get("inicio")), fim = Data.deIso(params.get("fim"));
        if (inicio != null && fim != null && fim < inicio) [inicio, fim] = [fim, inicio];
        return { inicio: inicio ?? HOJE - 29, fim: fim ?? HOJE, unidade: params.get("unidade") || null,
            turno: TURNO[params.get("turno")] ? params.get("turno") : null, setor: SETOR[params.get("setor")] ? params.get("setor") : null };
    }
    const buscar = (f) => OS.filter((o) => o.data >= f.inicio && o.data <= f.fim && (!f.unidade || o.unidade === f.unidade)
        && (!f.turno || o.turno === f.turno) && (!f.setor || o.setor === f.setor));

    function montar(f) {
        const os = buscar(f);
        const dias = f.fim - f.inicio + 1;
        const osAnt = buscar({ ...f, inicio: f.inicio - dias, fim: f.inicio - 1 });
        const atual = metricas(os), anterior = metricas(osAnt);
        const porSeparador = agrupar(os, (o) => o.separador);
        const ranking = [...porSeparador.entries()].filter(([, v]) => v.length >= 10).map(([nome, v]) => {
            const porSetor = agrupar(v, (o) => o.setor);
            let principal = null, max = -1;
            for (const [s, l] of porSetor) { const t = l.reduce((a, o) => a + o.volumes, 0); if (t > max) { max = t; principal = s; } }
            return { nome, m: metricas(v), setorPrincipal: principal };
        }).sort((a, b) => b.m.volumesPorHora - a.m.volumesPorHora);
        const nomes = [...porSeparador.entries()].map(([nome, v]) => [nome, v.reduce((a, o) => a + o.volumes, 0)]).sort((a, b) => b[1] - a[1]).map((x) => x[0]);
        let maximo = 0;
        const matriz = new Map(nomes.map((nome) => {
            const linha = {};
            porSeparador.get(nome).forEach((o) => { linha[o.setor] = (linha[o.setor] || 0) + o.volumes; });
            maximo = Math.max(maximo, ...Object.values(linha), 0);
            return [nome, linha];
        }));
        const porDia = agrupar(os, (o) => o.data);
        const diario = [...porDia.keys()].sort((a, b) => a - b).map((d) => {
            const l = porDia.get(d), soma = (t) => l.filter((o) => o.turno === t).reduce((a, o) => a + o.volumes, 0);
            return { data: Data.br(d).slice(0, 5), manha: soma("MANHA"), tarde: soma("TARDE"), noite: soma("NOITE"), volumesPorHora: Math.round(metricas(l).volumesPorHora * 10) / 10 };
        });
        const porHora = new Array(24).fill(0);
        os.forEach((o) => { porHora[Math.floor((o.inicio % 86400) / 3600)] += o.volumes; });
        const total = os.reduce((a, o) => a + o.volumes, 0);
        const porSetor = agrupar(os, (o) => o.setor);
        const setores = SETORES.filter((s) => porSetor.has(s.id)).map((s) => {
            const m = metricas(porSetor.get(s.id));
            return { setor: s, m, pct: total === 0 ? 0 : m.volumes * 100 / total };
        }).sort((a, b) => b.m.volumes - a.m.volumes);
        const bP = anterior.volumesPorHora;
        return {
            atual, anterior, separadoresAtivos: porSeparador.size, dias: new Set(os.map((o) => o.data)).size,
            varProd: bP === 0 ? null : (atual.volumesPorHora - bP) / bP * 100,
            varVol: anterior.volumes === 0 ? null : (atual.volumes - anterior.volumes) / anterior.volumes * 100,
            ranking, nomes, matriz, maximo, diario, porHora, setores,
        };
    }

    // ---------- Formatos ----------
    const fmt = {
        num: Fmt.num, pct: Fmt.pct, inteiro: (v) => Fmt.num(Math.round(v), 0),
        variacao: (p) => p == null ? "" : (p > 0 ? "+" : "") + Fmt.pct(p),
        classe: (v, mm) => v == null || Math.abs(v) < 0.05 ? "neutro" : ((v > 0) === mm ? "bom" : "ruim"),
    };

    // ---------- Tela ----------
    const app = document.getElementById("app");
    let graficos = [];

    function tela(f) {
        const p = montar(f), m = p.atual;
        const opt = (lista, sel) => lista.map((x) => `<option value="${esc(x.id ?? x)}"${(x.id ?? x) === sel ? " selected" : ""}>${esc(x.nome ?? x)}</option>`).join("");
        app.innerHTML = `
        <div class="cabecalho"><h1 class="titulo">Separação no armazém</h1>
            <div class="subtitulo"><span>${Data.br(f.inicio)} a ${Data.br(f.fim)}</span> · <span>${esc(f.unidade || "todas as unidades")}</span> · <span>${p.dias} dias com operação</span> · variações contra a janela anterior de mesmo tamanho</div></div>
        <form class="filtros caixa" id="formFiltros">
            <div><label for="inicio">De</label><input type="date" id="inicio" name="inicio" class="form-control form-control-sm" value="${Data.iso(f.inicio)}"></div>
            <div><label for="fim">Até</label><input type="date" id="fim" name="fim" class="form-control form-control-sm" value="${Data.iso(f.fim)}"></div>
            <div><label for="unidade">Unidade</label><select id="unidade" name="unidade" class="form-select form-select-sm"><option value="">Todas</option>${opt(UNIDS, f.unidade)}</select></div>
            <div><label for="turno">Turno</label><select id="turno" name="turno" class="form-select form-select-sm"><option value="">Todos</option>${opt(TURNOS, f.turno)}</select></div>
            <div><label for="setor">Setor</label><select id="setor" name="setor" class="form-select form-select-sm"><option value="">Todos</option>${opt(SETORES, f.setor)}</select></div>
            <div class="filtros-botoes"><button class="btn btn-sm btn-destaque" type="submit">Aplicar</button><a class="btn btn-sm btn-outline-secondary" href="#/">Limpar</a></div>
        </form>
        <div class="kpis">
            <div class="kpi caixa destaque"><div class="rotulo">Produtividade</div><div class="valor"><span>${fmt.num(m.volumesPorHora, 1)}</span> <small>vol/h</small></div>
                <div class="var ${fmt.classe(p.varProd, true)}">${fmt.variacao(p.varProd)}</div></div>
            <div class="kpi caixa"><div class="rotulo">Volumes separados</div><div class="valor">${fmt.inteiro(m.volumes)}</div>
                <div class="var ${fmt.classe(p.varVol, true)}">${fmt.variacao(p.varVol)}</div></div>
            <div class="kpi caixa"><div class="rotulo">Ordens concluídas</div><div class="valor">${fmt.inteiro(m.os)}</div><div class="var neutro">${fmt.num(m.minutosPorOs, 0)} min por OS</div></div>
            <div class="kpi caixa"><div class="rotulo">Peso movimentado</div><div class="valor"><span>${fmt.num(m.toneladas, 1)}</span> <small>t</small></div><div class="var neutro">${fmt.inteiro(m.itens)} itens</div></div>
            <div class="kpi caixa"><div class="rotulo">Separadores ativos</div><div class="valor">${p.separadoresAtivos}</div><div class="var neutro">${fmt.num(m.horas, 0)} h separando</div></div>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-xl-8"><section class="caixa h-100"><h2 class="secao">Volumes por dia e turno <small>linha: volumes por hora</small></h2><div class="grafico"><canvas id="graficoDiario"></canvas></div></section></div>
            <div class="col-xl-4"><section class="caixa h-100"><h2 class="secao">Pico de separação <small>volumes pela hora de início da OS</small></h2><div class="grafico"><canvas id="graficoHora"></canvas></div></section></div>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-xl-5"><section class="caixa h-100"><h2 class="secao">Ranking de separadores <small>mín. 10 OS no período</small></h2>
                <div class="rolagem"><table class="table tabela"><thead><tr><th>#</th><th>Separador</th><th class="text-end">OS</th><th class="text-end">Volumes</th><th>Vol/h</th></tr></thead>
                <tbody>${p.ranking.map((r, i) => `<tr class="${i + 1 <= 3 ? "topo-ranking" : (i + 1 > p.ranking.length - 3 ? "fundo-ranking" : "")}">
                    <td class="posicao">${i + 1}</td><td><div class="fw-semibold">${esc(r.nome)}</div><small class="text-secondary">${r.setorPrincipal ? SETOR[r.setorPrincipal].nome : ""}</small></td>
                    <td class="text-end">${r.m.os}</td><td class="text-end">${fmt.inteiro(r.m.volumes)}</td>
                    <td style="width: 34%"><div class="d-flex align-items-center gap-2"><div class="barra flex-fill"><span style="width:${r.m.volumesPorHora / p.ranking[0].m.volumesPorHora * 100}%"></span></div><b>${fmt.num(r.m.volumesPorHora, 1)}</b></div></td>
                </tr>`).join("")}</tbody></table></div></section></div>
            <div class="col-xl-7"><section class="caixa h-100"><h2 class="secao">Matriz separador × setor <small>volumes separados · quanto mais forte, mais volume</small></h2>
                <div class="rolagem"><table class="table tabela matriz"><thead><tr><th>Separador</th>${SETORES.map((s) => `<th class="text-center">${s.nome}</th>`).join("")}</tr></thead>
                <tbody>${p.nomes.map((nome) => `<tr><td class="text-nowrap">${esc(nome)}</td>${SETORES.map((s) => {
                    const v = p.matriz.get(nome)[s.id] || 0, it = p.maximo === 0 ? 0 : v / p.maximo;
                    return `<td class="celula" style="background: rgba(109, 40, 217,${it * 0.85});${it > 0.45 ? "color:#fff;" : ""}">${v === 0 ? "" : fmt.inteiro(v)}</td>`;
                }).join("")}</tr>`).join("")}</tbody></table></div></section></div>
        </div>
        <section class="caixa"><h2 class="secao">Por setor <small>o ritmo muda com o tipo de produto</small></h2><table class="table tabela">
            <thead><tr><th>Setor</th><th class="text-end">OS</th><th class="text-end">Volumes</th><th class="text-end">% dos volumes</th><th class="text-end">Peso (t)</th><th class="text-end">Vol/h</th><th class="text-end">Min por OS</th></tr></thead>
            <tbody>${p.setores.map((s) => `<tr><td><a href="${Rota.href("/", { inicio: Data.iso(f.inicio), fim: Data.iso(f.fim), setor: s.setor.id })}">${s.setor.nome}</a></td>
                <td class="text-end">${fmt.inteiro(s.m.os)}</td><td class="text-end">${fmt.inteiro(s.m.volumes)}</td><td class="text-end">${fmt.pct(s.pct)}</td>
                <td class="text-end">${fmt.num(s.m.toneladas, 1)}</td><td class="text-end fw-semibold">${fmt.num(s.m.volumesPorHora, 1)}</td><td class="text-end">${fmt.num(s.m.minutosPorOs, 0)}</td></tr>`).join("")}</tbody></table></section>
        <p class="rodape">Versão de demonstração rodando no navegador, com as mesmas regras e os mesmos dados fictícios do sistema em Java.</p>`;
        Rota.formulario(document.getElementById("formFiltros"), "/");
        Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        graficos.push(new Chart(document.getElementById("graficoDiario"), {
            data: { labels: p.diario.map((d) => d.data), datasets: [
                { type: "bar", label: "Manhã", data: p.diario.map((d) => d.manha), backgroundColor: "#c4b5fd", stack: "t", yAxisID: "y" },
                { type: "bar", label: "Tarde", data: p.diario.map((d) => d.tarde), backgroundColor: "#8b5cf6", stack: "t", yAxisID: "y" },
                { type: "bar", label: "Noite", data: p.diario.map((d) => d.noite), backgroundColor: "#4c1d95", stack: "t", yAxisID: "y" },
                { type: "line", label: "Vol/h", data: p.diario.map((d) => d.volumesPorHora), borderColor: "#f59e0b", backgroundColor: "#f59e0b", borderWidth: 2, pointRadius: 0, tension: .3, yAxisID: "vh" },
            ] },
            options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
                scales: { x: { stacked: true }, y: { stacked: true }, vh: { position: "right", grid: { display: false }, suggestedMin: 60 } },
                plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } } },
        }));
        graficos.push(new Chart(document.getElementById("graficoHora"), {
            type: "bar",
            data: { labels: p.porHora.map((_, h) => h + "h"), datasets: [{ label: "Volumes", data: p.porHora, backgroundColor: "#7c3aed", borderRadius: 3 }] },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } } } },
        }));
    }

    Rota.iniciar(({ params }) => {
        graficos.forEach((g) => g.destroy());
        graficos = [];
        tela(filtroDe(params));
    });
})();
