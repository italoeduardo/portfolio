// ============================================================
//  Painel de Despesas — versão que roda no navegador.
//  Porta das regras do sistema em Java (github.com/italoeduardo/painel-de-despesas):
//  mesmo gerador (semente 2026), DRE em cascata com CMV, chave
//  Competência × Caixa, comparação de período e drill-down.
//  Valores em centavos inteiros, para somar exatamente como o BigDecimal.
// ============================================================
(function () {
    "use strict";
    const { JavaRandom, Data, MESES, Calendario, Fmt, Rota, esc, somaJava, arredHalfUp } = window.Demo;

    // ---------- Plano de contas ----------
    const GRUPOS = [["PESSOAL", "Pessoal"], ["OCUPACAO", "Ocupação"], ["LOGISTICA", "Logística"],
        ["COMERCIAL", "Comercial"], ["ADMINISTRATIVO", "Administrativo"], ["TECNOLOGIA", "Tecnologia"]];
    const GRUPO_NOME = Object.fromEntries(GRUPOS);
    const CONTAS = [
        ["SALARIOS", "4.1.01", "Salários", "PESSOAL"], ["ENCARGOS", "4.1.02", "Encargos sociais", "PESSOAL"],
        ["BENEFICIOS", "4.1.03", "Benefícios", "PESSOAL"], ["ALUGUEL", "4.2.01", "Aluguel", "OCUPACAO"],
        ["ENERGIA", "4.2.02", "Energia elétrica", "OCUPACAO"], ["AGUA", "4.2.03", "Água", "OCUPACAO"],
        ["MANUTENCAO_PREDIAL", "4.2.04", "Manutenção predial", "OCUPACAO"], ["FRETE_VENDAS", "4.3.01", "Fretes sobre vendas", "LOGISTICA"],
        ["COMBUSTIVEL", "4.3.02", "Combustível", "LOGISTICA"], ["MANUTENCAO_FROTA", "4.3.03", "Manutenção de frota", "LOGISTICA"],
        ["PEDAGIO", "4.3.04", "Pedágios", "LOGISTICA"], ["COMISSOES", "4.4.01", "Comissões", "COMERCIAL"],
        ["MARKETING", "4.4.02", "Marketing", "COMERCIAL"], ["CONTABILIDADE", "4.5.01", "Contabilidade", "ADMINISTRATIVO"],
        ["MATERIAL_ESCRITORIO", "4.5.02", "Material de escritório", "ADMINISTRATIVO"], ["TELECOM", "4.5.03", "Telefonia e internet", "ADMINISTRATIVO"],
        ["LICENCAS", "4.6.01", "Licenças de software", "TECNOLOGIA"], ["NUVEM", "4.6.02", "Infraestrutura em nuvem", "TECNOLOGIA"],
    ].map(([id, codigo, nome, grupo]) => ({ id, codigo, nome, grupo }));
    const CONTA = Object.fromEntries(CONTAS.map((c) => [c.id, c]));
    const REGIMES = { COMPETENCIA: ["Competência", "pela data do fato gerador"], CAIXA: ["Caixa", "pela data do pagamento"] };

    // ---------- Gerador (mesma sequência de sorteios do Java) ----------
    const UNIDADES = [{ nome: "CD Campinas", fatDia: 196000, escala: 1.0, pctFrete: 0.032 }, { nome: "CD Recife", fatDia: 171000, escala: 0.62, pctFrete: 0.041 }];
    const TRANSPORTADORAS = ["Expresso Horizonte", "RotaSul Log", "TransVale Cargas"];
    const FORNECEDOR = {
        SALARIOS: "Folha de pagamento", ENCARGOS: "Encargos (INSS/FGTS)", BENEFICIOS: "Vale Mais Benefícios",
        ALUGUEL: "Imobiliária Paraná Galpões", ENERGIA: "Distribuidora de Energia Regional", AGUA: "Companhia de Saneamento",
        MANUTENCAO_PREDIAL: "Predial Serviços Técnicos", COMBUSTIVEL: "Posto Rodovia Sul", MANUTENCAO_FROTA: "Oficina Diesel Center",
        PEDAGIO: "Tag Rodovias", COMISSOES: "Representantes comerciais", MARKETING: "Agência Ponto Criativo",
        CONTABILIDADE: "Escritório Contábil Exato", MATERIAL_ESCRITORIO: "Papelaria Central", TELECOM: "Operadora Conecta",
        LICENCAS: "SoftGestão Licenças", NUVEM: "NuvemBR Infra",
    };
    const centavos = (v) => Math.round(arredHalfUp(v, 2) * 100);

    /**
     * Ordem de iteração de um HashMap<LocalDate, ?> do Java com até 12 chaves (tabela de 16 posições).
     * As chaves entram por merge(), que põe a chave nova no INÍCIO do balde, então dentro do
     * mesmo balde a ordem é da última inserida para a primeira.
     */
    function ordemHashMap(datas) {
        const balde = (n) => {
            const { ano, mes, dia } = Data.partes(n);
            const h = ((ano & 0xFFFFF800) ^ ((ano << 11) + (mes << 6) + dia)) | 0;
            return (h ^ (h >>> 16)) & 15;
        };
        return datas.map((d, i) => [balde(d), i, d]).sort((a, b) => a[0] - b[0] || b[1] - a[1]).map((x) => x[2]);
    }

    function gerar(hoje) {
        const rnd = new JavaRandom(2026);
        const ruido = (amp) => 1 + (rnd.nextDouble() * 2 - 1) * amp;
        const fats = [], lancs = [];
        const inicioAno = Data.partes(hoje).ano - 1;
        const fimAnoMes = Data.anoMes(hoje);
        let seqNota = 40000;

        const lancamento = (u, conta, fornecedor, descricao, documento, valor, competencia, vencimento) => {
            let pagamento = null;
            if (!(vencimento > hoje) && rnd.nextDouble() < 0.97) {
                const p = vencimento + rnd.nextInt(9) - 3;
                pagamento = p > hoje ? hoje : p;
            }
            lancs.push({ id: lancs.length + 1, unidade: u.nome, conta, fornecedor, descricao, documento,
                valor: centavos(valor), competencia, vencimento, pagamento });
        };
        const fixo = (u, conta, descricao, valor, competencia, vencimento, variacao) => {
            if (competencia > hoje) return;
            lancamento(u, conta, FORNECEDOR[conta], descricao, null, valor * ruido(variacao), competencia, vencimento);
        };

        for (const u of UNIDADES) {
            for (let ano = inicioAno, mes = 1; ano * 100 + mes <= fimAnoMes; mes === 12 ? (ano++, mes = 1) : mes++) {
                const anos = (ano - inicioAno) + (mes - 1) / 12;
                const tendencia = Math.pow(1.08, anos);
                const sazonal = mes <= 2 ? 0.90 : mes === 11 ? 1.08 : mes === 12 ? 1.15 : 1.0;
                const inflacao = Math.pow(1.055, anos);
                const dia1 = Data.de(ano, mes, 1), diasMes = Data.diasNoMes(ano, mes), fimMes = dia1 + diasMes - 1;

                let fatMes = 0;
                const fatSemana = new Map();
                for (let d = dia1; d <= fimMes && d <= hoje; d++) {
                    if (!Calendario.isDiaUtil(d)) continue;
                    const v = u.fatDia * tendencia * sazonal * ruido(0.12);
                    const cmv = v * (0.728 + (rnd.nextDouble() * 2 - 1) * 0.012);
                    fats.push({ data: d, unidade: u.nome, valor: centavos(v), custo: centavos(cmv) });
                    fatMes += v;
                    const sexta = d + (5 - Data.diaSemana(d));
                    fatSemana.set(sexta, (fatSemana.has(sexta) ? fatSemana.get(sexta) : 0) + v);
                }
                if (fatMes === 0) continue;

                const esc = u.escala * inflacao;
                const prox = (dia) => Data.de(mes === 12 ? ano + 1 : ano, mes === 12 ? 1 : mes + 1, dia);
                const rot = String(mes).padStart(2, "0") + "/" + ano;
                const diaDo = (n) => dia1 + n - 1;

                fixo(u, "SALARIOS", "Salários " + rot, 392000 * esc, fimMes, prox(5), 0.01);
                fixo(u, "ENCARGOS", "INSS e FGTS " + rot, 141000 * esc, fimMes, prox(20), 0.01);
                fixo(u, "BENEFICIOS", "Vale-refeição e transporte " + rot, 61000 * esc, dia1, diaDo(10), 0.03);
                fixo(u, "ALUGUEL", "Aluguel do galpão " + rot, 118000 * esc, dia1, diaDo(10), 0);
                const verao = [12, 1, 2, 3].includes(mes) ? 1.35 : 1.0;
                fixo(u, "ENERGIA", "Energia " + rot, 27000 * esc * verao, fimMes, prox(15), 0.08);
                fixo(u, "AGUA", "Água " + rot, 3100 * esc, fimMes, prox(15), 0.1);
                fixo(u, "PEDAGIO", "Pedágios " + rot, 8800 * esc, fimMes, prox(10), 0.15);
                fixo(u, "COMISSOES", "Comissões " + rot, fatMes * 0.011, fimMes, prox(10), 0);
                fixo(u, "MARKETING", "Campanha " + rot, 14000 * esc, diaDo(8), diaDo(25), 0.35);
                fixo(u, "CONTABILIDADE", "Honorários " + rot, 11500 * esc, fimMes, prox(10), 0);
                fixo(u, "MATERIAL_ESCRITORIO", "Materiais " + rot, 3900 * esc, diaDo(12), diaDo(28), 0.3);
                fixo(u, "TELECOM", "Telefonia e links " + rot, 6200 * esc, dia1, diaDo(15), 0.04);
                fixo(u, "LICENCAS", "Licenças ERP e WMS " + rot, 21500 * esc, dia1, diaDo(10), 0);
                fixo(u, "NUVEM", "Servidores e backup " + rot, 8700 * esc, fimMes, prox(8), 0.12);

                const manutencoes = 1 + rnd.nextInt(3);
                for (let i = 0; i < manutencoes; i++) {
                    const d = diaDo(1 + rnd.nextInt(diasMes));
                    fixo(u, "MANUTENCAO_PREDIAL", "Manutenção predial", 2000 + rnd.nextInt(9000) * esc, d, d + 20, 0);
                }
                const frota = 2 + rnd.nextInt(3);
                for (let i = 0; i < frota; i++) {
                    const d = diaDo(1 + rnd.nextInt(diasMes));
                    fixo(u, "MANUTENCAO_FROTA", "Revisão e peças", 3500 + rnd.nextInt(7000) * esc, d, d + 15, 0);
                }

                // no Java as semanas ficam num HashMap: a ordem de iteração muda a sequência de sorteios
                for (const chave of ordemHashMap([...fatSemana.keys()])) {
                    let sexta = chave > fimMes ? fimMes : chave;
                    if (sexta > hoje) sexta = hoje;
                    fixo(u, "COMBUSTIVEL", "Combustível da semana", 6300 * esc, sexta, sexta + 15, 0.15);
                    const freteSemana = fatSemana.get(chave) * u.pctFrete * ruido(0.1);
                    const fatias = [0.48, 0.32, 0.20];
                    for (let t = 0; t < TRANSPORTADORAS.length; t++) {
                        lancamento(u, "FRETE_VENDAS", TRANSPORTADORAS[t], "Fretes da semana", "CT-e " + (seqNota++),
                            freteSemana * fatias[t], sexta, sexta + 28);
                    }
                }
            }
        }
        return { fats, lancs };
    }

    // ---------- Consultas ----------
    const HOJE = Data.hoje();
    const { fats: FATS, lancs: LANCS } = gerar(HOJE);
    const UNIDS = [...new Set(LANCS.map((l) => l.unidade))].sort();
    const dataNo = (l, regime) => regime === "COMPETENCIA" ? l.competencia : l.pagamento;

    const buscarLanc = (f) => LANCS.filter((l) => { const d = dataNo(l, f.regime); return d != null && d >= f.inicio && d <= f.fim && (!f.unidade || l.unidade === f.unidade); });
    const buscarFat = (f) => FATS.filter((x) => x.data >= f.inicio && x.data <= f.fim && (!f.unidade || x.unidade === f.unidade));
    const somaCent = (lista, campo) => lista.reduce((s, x) => s + x[campo], 0) / 100;
    const faturamento = (f) => somaCent(buscarFat(f), "valor");
    const cmvDe = (f) => somaCent(buscarFat(f), "custo");
    const pct = (parte, todo) => todo === 0 ? 0 : parte / todo * 100;
    const valor = (atual, anterior) => ({ atual, anterior, variacaoPct: anterior === 0 ? null : (atual - anterior) / Math.abs(anterior) * 100, pontos: atual - anterior });
    const rotuloMes = (am) => MESES[am % 100 - 1] + "/" + String(Math.floor(am / 100)).slice(2);

    // ---------- Filtro ----------
    function filtro(inicio, fim, unidade, regime) {
        if (inicio != null && fim != null && fim < inicio) [inicio, fim] = [fim, inicio];
        return { inicio, fim, unidade: unidade || null, regime: regime === "CAIXA" ? "CAIXA" : "COMPETENCIA" };
    }
    function comPadroes(f) {
        const ultimo = Data.somarMeses(Data.comDia(HOJE, 1), -1);
        const p = Data.partes(ultimo);
        return filtro(f.inicio ?? Data.de(p.ano, 1, 1), f.fim ?? Data.de(p.ano, p.mes, Data.diasNoMes(p.ano, p.mes)), f.unidade, f.regime);
    }
    const mesCheio = (f) => { const p = Data.partes(f.inicio); return p.dia === 1 && f.fim === Data.de(p.ano, p.mes, Data.diasNoMes(p.ano, p.mes)); };
    const primeiroDoAno = (n) => { const p = Data.partes(n); return p.mes === 1 && p.dia === 1; };
    const menosAno = (n) => { const p = Data.partes(n); return Data.de(p.ano - 1, p.mes, Math.min(p.dia, Data.diasNoMes(p.ano - 1, p.mes))); };
    function anterior(f) {
        if (f.inicio === f.fim) return { ...f, inicio: f.inicio - 1, fim: f.inicio - 1 };
        if (mesCheio(f)) {
            const a = Data.somarMeses(f.inicio, -1), p = Data.partes(a);
            return { ...f, inicio: a, fim: Data.de(p.ano, p.mes, Data.diasNoMes(p.ano, p.mes)) };
        }
        if (primeiroDoAno(f.inicio)) return { ...f, inicio: menosAno(f.inicio), fim: menosAno(f.fim) };
        const dias = f.fim - f.inicio + 1;
        return { ...f, inicio: f.inicio - dias, fim: f.inicio - 1 };
    }
    function descricaoAnterior(f) {
        if (f.inicio === f.fim) return "dia anterior";
        if (mesCheio(f)) return "mês anterior";
        if (primeiroDoAno(f.inicio)) return "mesmo período de " + Data.partes(anterior(f).inicio).ano;
        return "período anterior de mesmo tamanho";
    }
    function filtroDe(params) {
        return comPadroes(filtro(Data.deIso(params.get("inicio")), Data.deIso(params.get("fim")), params.get("unidade"), params.get("regime")));
    }
    const query = (f) => ({ inicio: Data.iso(f.inicio), fim: Data.iso(f.fim), unidade: f.unidade, regime: f.regime });

    // ---------- Formatos (iguais ao @fmt do Java) ----------
    const fmt = {
        moeda: Fmt.moeda, pct: Fmt.pct, num: Fmt.num, data: Data.br,
        moedaCurta(v) { const a = Math.abs(v); if (a >= 1e6) return "R$ " + Fmt.num(v / 1e6, 2) + " mi"; if (a >= 1e4) return "R$ " + Fmt.num(v / 1e3, 0) + " mil"; return Fmt.moeda(v); },
        inteiro: (v) => Fmt.num(Math.round(v), 0),
        variacao: (p) => p == null ? "" : (p > 0 ? "+" : "") + Fmt.pct(p),
        pontos: (pp) => Math.abs(pp) < 0.05 ? "estável" : (pp > 0 ? "+" : "") + Fmt.num(pp, 1) + " p.p.",
        classe: (v, maiorMelhor) => v == null || Math.abs(v) < 0.05 ? "neutro" : ((v > 0) === maiorMelhor ? "bom" : "ruim"),
    };

    // ---------- DRE ----------
    function montarDre(f) {
        const ant = anterior(f);
        const atual = buscarLanc(f), antL = buscarLanc(ant);
        const fat = faturamento(f), fatAnt = faturamento(ant), cmv = cmvDe(f), cmvAnt = cmvDe(ant);
        const desp = somaCent(atual, "valor"), despAnt = somaCent(antL, "valor");
        const res = fat - cmv - desp, resAnt = fatAnt - cmvAnt - despAnt;
        const grupos = GRUPOS.map(([g]) => {
            const contas = CONTAS.filter((c) => c.grupo === g).map((c) => {
                const v = valor(somaCent(atual.filter((l) => l.conta === c.id), "valor"), somaCent(antL.filter((l) => l.conta === c.id), "valor"));
                return { conta: c, v, pct: pct(v.atual, fat) };
            }).filter((c) => c.v.atual > 0 || c.v.anterior > 0).sort((a, b) => b.v.atual - a.v.atual);
            const v = valor(somaCent(atual.filter((l) => CONTA[l.conta].grupo === g), "valor"), somaCent(antL.filter((l) => CONTA[l.conta].grupo === g), "valor"));
            return { grupo: g, v, pct: pct(v.atual, fat), contas };
        });
        // mês a mês
        const fatMes = new Map(), despMes = new Map();
        buscarFat(f).forEach((x) => fatMes.set(Data.anoMes(x.data), (fatMes.get(Data.anoMes(x.data)) || 0) + x.valor));
        atual.forEach((l) => { const k = Data.anoMes(dataNo(l, f.regime)); despMes.set(k, (despMes.get(k) || 0) + l.valor); });
        const mensal = [];
        for (let m = Data.comDia(f.inicio, 1); Data.anoMes(m) <= Data.anoMes(f.fim); m = Data.somarMeses(m, 1)) {
            const k = Data.anoMes(m), fa = (fatMes.get(k) || 0) / 100, de = (despMes.get(k) || 0) / 100;
            mensal.push({ mes: rotuloMes(k), faturamento: fa, despesa: de, pctDespesa: pct(de, fa) });
        }
        const porForn = new Map();
        atual.forEach((l) => (porForn.get(l.fornecedor) || porForn.set(l.fornecedor, []).get(l.fornecedor)).push(l));
        const fornecedores = [...porForn.entries()].map(([nome, ls]) => ({ nome, valor: somaCent(ls, "valor"), lancamentos: ls.length }))
            .sort((a, b) => b.valor - a.valor).slice(0, 10);
        return {
            fat: valor(fat, fatAnt), cmv: valor(cmv, cmvAnt), margemBruta: valor(pct(fat - cmv, fat), pct(fatAnt - cmvAnt, fatAnt)),
            desp: valor(desp, despAnt), pctDesp: valor(pct(desp, fat), pct(despAnt, fatAnt)), res: valor(res, resAnt), margem: valor(pct(res, fat), pct(resAnt, fatAnt)),
            grupos, mensal, fornecedores, maiores: [...atual].sort((a, b) => b.valor - a.valor).slice(0, 10),
        };
    }

    // ---------- Frete ----------
    function montarFrete(f) {
        const ant = anterior(f);
        const fretes = buscarLanc(f).filter((l) => l.conta === "FRETE_VENDAS");
        const fretesAnt = buscarLanc(ant).filter((l) => l.conta === "FRETE_VENDAS");
        const somar = (ls) => somaJava(ls.map((l) => l.valor / 100));
        const total = somar(fretes), pago = somar(fretes.filter((l) => l.pagamento != null));
        const fat = faturamento(f), fatAnt = faturamento(ant);
        const pagos = fretes.filter((l) => l.pagamento != null);
        const prazoMedio = pagos.length ? pagos.reduce((s, l) => s + (l.pagamento - l.competencia), 0) / pagos.length : 0;
        const porT = new Map();
        fretes.forEach((l) => (porT.get(l.fornecedor) || porT.set(l.fornecedor, []).get(l.fornecedor)).push(l));
        const transp = [...porT.entries()].map(([nome, ls]) => {
            const v = somar(ls), p = somar(ls.filter((l) => l.pagamento != null));
            return { nome, valor: v, notas: ls.length, pctTotal: pct(v, total), pctPago: pct(p, v) };
        }).sort((a, b) => b.valor - a.valor);
        const unidades = UNIDS.filter((u) => !f.unidade || f.unidade === u).map((u) => {
            const ls = fretes.filter((l) => l.unidade === u), v = somar(ls);
            return { nome: u, valor: v, pctTotal: pct(v, total), pctFaturamento: pct(v, faturamento({ ...f, unidade: u })), notas: ls.length };
        });
        const porMes = new Map();
        fretes.forEach((l) => { const k = Data.anoMes(dataNo(l, f.regime)); (porMes.get(k) || porMes.set(k, []).get(k)).push(l); });
        const mensal = [];
        for (let m = Data.comDia(f.inicio, 1); Data.anoMes(m) <= Data.anoMes(f.fim); m = Data.somarMeses(m, 1)) {
            const k = Data.anoMes(m), v = somar(porMes.get(k) || []);
            const p = Data.partes(m), fimM = Data.de(p.ano, p.mes, Data.diasNoMes(p.ano, p.mes));
            const fatM = faturamento({ ...f, inicio: Math.max(m, f.inicio), fim: Math.min(fimM, f.fim) });
            mensal.push({ mes: rotuloMes(k), valor: v, pctFaturamento: pct(v, fatM) });
        }
        const totalAnt = somar(fretesAnt);
        return { total: valor(total, totalAnt), pago, emAberto: total - pago, notas: fretes.length, medio: fretes.length ? total / fretes.length : 0,
            pctFat: valor(pct(total, fat), pct(totalAnt, fatAnt)), prazoMedio, transp, unidades, mensal };
    }

    // ---------- Telas ----------
    const app = document.getElementById("app");
    let graficos = [];

    function cabecalho(titulo, f, sub) {
        return `<div class="cabecalho"><div><h1 class="titulo">${titulo}</h1><div class="subtitulo">${sub}</div></div></div>`;
    }
    function subtitulo(f, prefixoRegime) {
        return `<span>${fmt.data(f.inicio)} a ${fmt.data(f.fim)}</span> · <span>${esc(f.unidade || "todas as unidades")}</span> · ${prefixoRegime}<b>${REGIMES[f.regime][1]}</b> · comparado ao <span>${descricaoAnterior(f)}</span>`;
    }
    function filtros(f, pagina, params) {
        const ocultos = ["grupo", "conta", "fornecedor"].filter((k) => params && params.get(k))
            .map((k) => `<input type="hidden" name="${k}" value="${esc(params.get(k))}">`).join("");
        return `
        <form class="filtros caixa" id="formFiltros">${ocultos}
            <div><label for="inicio">De</label><input type="date" id="inicio" name="inicio" class="form-control form-control-sm" value="${Data.iso(f.inicio)}"></div>
            <div><label for="fim">Até</label><input type="date" id="fim" name="fim" class="form-control form-control-sm" value="${Data.iso(f.fim)}"></div>
            <div><label for="unidade">Unidade</label><select id="unidade" name="unidade" class="form-select form-select-sm"><option value="">Todas</option>
                ${UNIDS.map((u) => `<option value="${esc(u)}"${u === f.unidade ? " selected" : ""}>${esc(u)}</option>`).join("")}</select></div>
            <div><label>Regime</label><div class="regime" role="radiogroup" aria-label="Regime">
                ${Object.entries(REGIMES).map(([r, [nome, expl]]) => `<input type="radio" class="btn-check" name="regime" id="reg-${r}" value="${r}"${r === f.regime ? " checked" : ""}>
                <label class="btn btn-sm" for="reg-${r}" title="${expl}">${nome}</label>`).join("")}</div></div>
            <div class="filtros-botoes"><button class="btn btn-sm btn-destaque" type="submit">Aplicar</button>
                <a class="btn btn-sm btn-outline-secondary" href="#${pagina === "/frete" ? "/frete" : "/"}">Ano atual</a></div>
        </form>`;
    }
    function ligarFiltros(pagina) {
        const form = document.getElementById("formFiltros");
        Rota.formulario(form, pagina);
        form.querySelectorAll("input[name=regime]").forEach((r) => r.addEventListener("change", () => form.requestSubmit()));
    }
    const varSpan = (v, maiorMelhor, extra = "") => `<div class="var ${fmt.classe(v.variacaoPct, maiorMelhor)}${extra}">${fmt.variacao(v.variacaoPct)}</div>`;
    const ppSpan = (v, maiorMelhor) => `<div class="var ${fmt.classe(v.pontos, maiorMelhor)}">${fmt.pontos(v.pontos)}</div>`;
    const tdVar = (v, mm) => `<td class="text-end var ${fmt.classe(v.variacaoPct, mm)}">${fmt.variacao(v.variacaoPct)}</td>`;
    const tdPp = (v, mm) => `<td class="text-end var ${fmt.classe(v.pontos, mm)}">${fmt.pontos(v.pontos)}</td>`;
    const linkLanc = (f, extra) => Rota.href("/lancamentos", { ...query(f), ...extra });

    function telaDre(f) {
        const d = montarDre(f);
        app.innerHTML = `
        ${cabecalho("DRE gerencial", f, subtitulo(f, "despesas "))}
        ${filtros(f, "/")}
        <div class="kpis">
            <div class="kpi caixa"><div class="rotulo">Faturamento</div><div class="valor">${fmt.moedaCurta(d.fat.atual)}</div>${varSpan(d.fat, true)}</div>
            <div class="kpi caixa"><div class="rotulo">Margem bruta</div><div class="valor">${fmt.pct(d.margemBruta.atual)}</div>${ppSpan(d.margemBruta, true)}</div>
            <div class="kpi caixa"><div class="rotulo">Despesas operacionais</div><div class="valor">${fmt.moedaCurta(d.desp.atual)}</div>${varSpan(d.desp, false)}</div>
            <div class="kpi caixa"><div class="rotulo">Despesa sobre faturamento</div><div class="valor">${fmt.pct(d.pctDesp.atual)}</div>${ppSpan(d.pctDesp, false)}</div>
            <div class="kpi caixa"><div class="rotulo">Resultado operacional</div><div class="valor">${fmt.moedaCurta(d.res.atual)}</div>${varSpan(d.res, true)}</div>
            <div class="kpi caixa destaque"><div class="rotulo">Margem operacional</div><div class="valor">${fmt.pct(d.margem.atual)}</div>${ppSpan(d.margem, true)}</div>
        </div>
        <section class="caixa mb-3"><h2 class="secao">Mês a mês <small>barras: faturamento × despesa · linha: despesa sobre faturamento</small></h2>
            <div class="grafico"><canvas id="graficoMensal"></canvas></div></section>
        <div class="row g-3">
            <div class="col-xl-7"><section class="caixa h-100"><h2 class="secao">Demonstrativo de resultado <small>clique nas despesas para ver os lançamentos</small></h2>
                <table class="table tabela dre"><thead><tr><th>Linha</th><th class="text-end">Valor</th><th class="text-end">% fat.</th><th class="text-end">Variação</th></tr></thead><tbody>
                <tr class="linha-total"><td>Faturamento</td><td class="text-end">${fmt.moeda(d.fat.atual)}</td><td class="text-end">100,0%</td>${tdVar(d.fat, true)}</tr>
                <tr class="linha-conta"><td>(−) Custo das mercadorias vendidas</td><td class="text-end">${fmt.moeda(d.cmv.atual)}</td><td class="text-end">${fmt.pct(100 - d.margemBruta.atual)}</td>${tdVar(d.cmv, false)}</tr>
                <tr class="linha-total"><td>(=) Margem bruta</td><td class="text-end">${fmt.moeda(d.fat.atual - d.cmv.atual)}</td><td class="text-end">${fmt.pct(d.margemBruta.atual)}</td>${tdPp(d.margemBruta, true)}</tr>
                <tr><td colspan="4" class="separador">(−) Despesas operacionais</td></tr>
                ${d.grupos.map((g) => `
                <tr class="linha-grupo"><td><a href="${linkLanc(f, { grupo: g.grupo })}">${GRUPO_NOME[g.grupo]}</a></td><td class="text-end">${fmt.moeda(g.v.atual)}</td><td class="text-end">${fmt.pct(g.pct)}</td>${tdVar(g.v, false)}</tr>
                ${g.contas.map((c) => `<tr class="linha-conta"><td><a href="${linkLanc(f, { conta: c.conta.id })}"><span class="codigo">${c.conta.codigo}</span> <span>${c.conta.nome}</span></a></td>
                    <td class="text-end">${fmt.moeda(c.v.atual)}</td><td class="text-end">${fmt.pct(c.pct)}</td>${tdVar(c.v, false)}</tr>`).join("")}`).join("")}
                <tr class="linha-subtotal"><td>Total de despesas</td><td class="text-end">${fmt.moeda(d.desp.atual)}</td><td class="text-end">${fmt.pct(d.pctDesp.atual)}</td>${tdVar(d.desp, false)}</tr>
                <tr class="linha-total resultado"><td>(=) Resultado operacional</td><td class="text-end">${fmt.moeda(d.res.atual)}</td><td class="text-end">${fmt.pct(d.margem.atual)}</td>${tdVar(d.res, true)}</tr>
                </tbody></table></section></div>
            <div class="col-xl-5">
                <section class="caixa mb-3"><h2 class="secao">Maiores fornecedores</h2><table class="table tabela">
                    <thead><tr><th>Fornecedor</th><th class="text-end">Lanç.</th><th class="text-end">Valor</th></tr></thead>
                    <tbody>${d.fornecedores.map((x) => `<tr><td><a href="${linkLanc(f, { fornecedor: x.nome })}">${esc(x.nome)}</a></td><td class="text-end">${x.lancamentos}</td><td class="text-end">${fmt.moedaCurta(x.valor)}</td></tr>`).join("")}</tbody></table></section>
                <section class="caixa"><h2 class="secao">Maiores lançamentos</h2><table class="table tabela">
                    <thead><tr><th>Data</th><th>Descrição</th><th class="text-end">Valor</th></tr></thead>
                    <tbody>${d.maiores.map((l) => `<tr><td class="text-nowrap">${fmt.data(dataNo(l, f.regime))}</td><td><span>${esc(l.descricao)}</span> <small class="text-secondary">· ${esc(l.unidade)}</small></td><td class="text-end">${fmt.moedaCurta(l.valor / 100)}</td></tr>`).join("")}</tbody></table></section>
            </div>
        </div>
        <p class="rodape">Versão de demonstração rodando no navegador, com as mesmas regras e os mesmos dados fictícios do sistema em Java.</p>`;
        ligarFiltros("/");
        const brl = (v) => "R$ " + (v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " mi";
        graficos.push(new Chart(document.getElementById("graficoMensal"), {
            data: { labels: d.mensal.map((m) => m.mes), datasets: [
                { type: "bar", label: "Faturamento", data: d.mensal.map((m) => m.faturamento), backgroundColor: "#a7f3d0", borderRadius: 4, yAxisID: "y" },
                { type: "bar", label: "Despesa", data: d.mensal.map((m) => m.despesa), backgroundColor: "#065f46", borderRadius: 4, yAxisID: "y" },
                { type: "line", label: "Despesa / faturamento", data: d.mensal.map((m) => m.pctDespesa), borderColor: "#d4a017", backgroundColor: "#d4a017", borderWidth: 2.5, tension: .3, yAxisID: "pct" },
            ] },
            options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
                scales: { y: { ticks: { callback: brl } }, pct: { position: "right", grid: { display: false }, ticks: { callback: (v) => v + "%" }, suggestedMin: 15 } },
                plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
                    tooltip: { callbacks: { label: (c) => c.dataset.yAxisID === "pct" ? `${c.dataset.label}: ${c.parsed.y.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : `${c.dataset.label}: ${brl(c.parsed.y)}` } } } },
        }));
    }

    function telaFrete(f) {
        const d = montarFrete(f);
        app.innerHTML = `
        ${cabecalho("Fretes sobre vendas", f, subtitulo(f, ""))}
        ${filtros(f, "/frete")}
        <div class="kpis">
            <div class="kpi caixa destaque"><div class="rotulo">Frete total</div><div class="valor">${fmt.moedaCurta(d.total.atual)}</div>${varSpan(d.total, false)}</div>
            <div class="kpi caixa"><div class="rotulo">Frete sobre faturamento</div><div class="valor">${fmt.pct(d.pctFat.atual)}</div>${ppSpan(d.pctFat, false)}</div>
            <div class="kpi caixa"><div class="rotulo">Pago</div><div class="valor">${fmt.moedaCurta(d.pago)}</div><div class="var neutro">prazo médio ${fmt.num(d.prazoMedio, 0)} dias</div></div>
            <div class="kpi caixa"><div class="rotulo">Em aberto</div><div class="valor">${fmt.moedaCurta(d.emAberto)}</div><div class="var neutro">${f.regime === "CAIXA" ? "no caixa só entra o que foi pago" : "a vencer ou atrasado"}</div></div>
            <div class="kpi caixa"><div class="rotulo">Conhecimentos de transporte</div><div class="valor">${fmt.inteiro(d.notas)}</div><div class="var neutro">média ${fmt.moedaCurta(d.medio)}</div></div>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-xl-7"><section class="caixa h-100"><h2 class="secao">Mês a mês <small>valor e % sobre o faturamento</small></h2><div class="grafico"><canvas id="graficoFrete"></canvas></div></section></div>
            <div class="col-xl-5"><section class="caixa h-100"><h2 class="secao">Por unidade</h2>
                ${d.unidades.map((u) => `<div class="unidade"><div class="d-flex justify-content-between align-items-baseline"><b>${esc(u.nome)}</b><span>${fmt.moedaCurta(u.valor)}</span></div>
                    <div class="barra"><span style="width:${u.pctTotal}%"></span></div>
                    <div class="small text-secondary"><span>${fmt.pct(u.pctTotal)}</span> do frete · <b>${fmt.pct(u.pctFaturamento)}</b> do faturamento da unidade · <span>${u.notas} CT-e</span></div></div>`).join("")}
            </section></div>
        </div>
        <section class="caixa"><h2 class="secao">Por transportadora</h2><table class="table tabela">
            <thead><tr><th>Transportadora</th><th class="text-end">CT-e</th><th class="text-end">Valor</th><th class="text-end">% do frete</th><th>Pago</th></tr></thead>
            <tbody>${d.transp.map((t) => `<tr><td><a href="${linkLanc(f, { conta: "FRETE_VENDAS", fornecedor: t.nome })}">${esc(t.nome)}</a></td><td class="text-end">${t.notas}</td>
                <td class="text-end">${fmt.moeda(t.valor)}</td><td class="text-end">${fmt.pct(t.pctTotal)}</td>
                <td style="width: 30%"><div class="d-flex align-items-center gap-2"><div class="barra flex-fill"><span style="width:${t.pctPago}%"></span></div><small>${fmt.pct(t.pctPago)}</small></div></td></tr>`).join("")}</tbody></table></section>
        <p class="rodape">Versão de demonstração rodando no navegador, com as mesmas regras e os mesmos dados fictícios do sistema em Java.</p>`;
        ligarFiltros("/frete");
        graficos.push(new Chart(document.getElementById("graficoFrete"), {
            data: { labels: d.mensal.map((m) => m.mes), datasets: [
                { type: "bar", label: "Frete", data: d.mensal.map((m) => m.valor), backgroundColor: "#065f46", borderRadius: 4, yAxisID: "y" },
                { type: "line", label: "% do faturamento", data: d.mensal.map((m) => m.pctFaturamento), borderColor: "#d4a017", backgroundColor: "#d4a017", borderWidth: 2.5, tension: .3, yAxisID: "pct" },
            ] },
            options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
                scales: { y: { ticks: { callback: (v) => "R$ " + (v / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " mil" } },
                    pct: { position: "right", grid: { display: false }, ticks: { callback: (v) => v + "%" }, suggestedMin: 2, suggestedMax: 5 } },
                plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } } },
        }));
    }

    function telaLancamentos(f, params) {
        const grupo = params.get("grupo"), conta = params.get("conta"), fornecedor = params.get("fornecedor");
        const lista = buscarLanc(f).filter((l) => (!grupo || CONTA[l.conta].grupo === grupo) && (!conta || l.conta === conta) && (!fornecedor || l.fornecedor === fornecedor))
            .sort((a, b) => dataNo(b, f.regime) - dataNo(a, f.regime));
        const titulo = conta && CONTA[conta] ? CONTA[conta].codigo + " · " + CONTA[conta].nome
            : grupo && GRUPO_NOME[grupo] ? "Grupo " + GRUPO_NOME[grupo] : fornecedor || "Todas as despesas";
        const total = somaJava(lista.map((l) => l.valor / 100));
        app.innerHTML = `
        <a class="small text-secondary text-decoration-none" href="${Rota.href("/", query(f))}">← voltar para a DRE</a>
        <div class="cabecalho mt-2"><div><h1 class="titulo">${esc(titulo)}</h1>
            <div class="subtitulo"><span>${lista.length} lançamento(s)</span> · total <b>${fmt.moeda(total)}</b> · <span>${REGIMES[f.regime][1]}</span></div></div></div>
        ${filtros(f, "/lancamentos", params)}
        <section class="caixa"><div class="table-responsive"><table class="table tabela table-hover"><thead><tr>
            <th>${f.regime === "CAIXA" ? "Pago em" : "Competência"}</th><th>Conta</th><th>Fornecedor</th><th>Descrição</th><th>Unidade</th><th>Vencimento</th><th>Situação</th><th class="text-end">Valor</th>
        </tr></thead><tbody>${lista.map((l) => `<tr>
            <td class="text-nowrap">${fmt.data(dataNo(l, f.regime))}</td>
            <td class="text-nowrap"><span class="codigo">${CONTA[l.conta].codigo}</span> <span>${CONTA[l.conta].nome}</span></td>
            <td>${esc(l.fornecedor)}</td><td><span>${esc(l.descricao)}</span>${l.documento ? ` <small class="text-secondary">· ${esc(l.documento)}</small>` : ""}</td>
            <td class="text-nowrap">${esc(l.unidade)}</td><td class="text-nowrap">${fmt.data(l.vencimento)}</td>
            <td>${l.pagamento != null ? `<span class="situacao pago">pago ${fmt.data(l.pagamento)}</span>` : `<span class="situacao aberto">em aberto</span>`}</td>
            <td class="text-end text-nowrap">${fmt.moeda(l.valor / 100)}</td></tr>`).join("")}</tbody></table></div>
        </section>`;
        ligarFiltros("/lancamentos");
    }

    Rota.iniciar(({ caminho, params }) => {
        graficos.forEach((g) => g.destroy());
        graficos = [];
        const f = filtroDe(params);
        const q = query(f);
        document.getElementById("navDre").href = Rota.href("/", q);
        document.getElementById("navFrete").href = Rota.href("/frete", q);
        document.getElementById("navDre").classList.toggle("ativo", caminho === "/");
        document.getElementById("navFrete").classList.toggle("ativo", caminho === "/frete");
        if (caminho === "/frete") { telaFrete(f); document.title = "Painel de Despesas · Frete"; }
        else if (caminho === "/lancamentos") { telaLancamentos(f, params); document.title = "Painel de Despesas · Lançamentos"; }
        else { telaDre(f); document.title = "Painel de Despesas · DRE"; }
    });
})();
