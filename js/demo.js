// ============================================================
//  DataVision — dashboard-demo (dados fictícios em JavaScript).
//  Gera dados DETERMINÍSTICOS no navegador simulando uma
//  distribuidora. Nenhum dado real. Showcase de código em Java.
// ============================================================
const DemoApp = (function () {
    "use strict";

    const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const REGIOES = ["Sudeste", "Sul", "Centro-Oeste", "Nordeste", "Norte"];
    const CATEGORIAS = [
        { nome: "Bebidas", cor: "#E76B2F" },
        { nome: "Alimentos", cor: "#1E3A8A" },
        { nome: "Limpeza", cor: "#198754" },
        { nome: "Higiene", cor: "#5A3A6F" },
        { nome: "Bazar", cor: "#0D6EFD" },
    ];
    const PRODUTOS = [
        { nome: "Refrigerante Cola 2L", cat: "Bebidas", peso: 1.0 },
        { nome: "Suco Néctar 1L", cat: "Bebidas", peso: 0.6 },
        { nome: "Arroz Tipo 1 5kg", cat: "Alimentos", peso: 1.0 },
        { nome: "Óleo de Soja 900ml", cat: "Alimentos", peso: 0.7 },
        { nome: "Detergente Neutro 500ml", cat: "Limpeza", peso: 0.9 },
        { nome: "Sabão em Pó 1kg", cat: "Limpeza", peso: 0.8 },
        { nome: "Sabonete 90g", cat: "Higiene", peso: 0.7 },
        { nome: "Papel Higiênico 12un", cat: "Higiene", peso: 1.0 },
        { nome: "Copo Descartável 100un", cat: "Bazar", peso: 0.6 },
    ];
    const PESO_REGIAO = { "Sudeste": 1.0, "Sul": 0.62, "Centro-Oeste": 0.48, "Nordeste": 0.55, "Norte": 0.30 };
    const MARGEM_CAT = { "Bebidas": 21.5, "Alimentos": 17.8, "Limpeza": 27.4, "Higiene": 30.2, "Bazar": 33.6 };
    const BASE_CAT = { "Bebidas": 320000, "Alimentos": 410000, "Limpeza": 210000, "Higiene": 180000, "Bazar": 120000 };

    // ---------- helpers ----------
    const nf = (v, d) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
    function moeda(v) {
        if (v >= 1e6) return "R$ " + nf(v / 1e6, 1) + "M";
        if (v >= 1e3) return "R$ " + nf(Math.round(v / 1e3), 0) + "k";
        return "R$ " + nf(Math.round(v), 0);
    }
    const moedaCurta = (v) => v >= 1e6 ? nf(v / 1e6, 1) + "M" : nf(Math.round(v / 1e3), 0) + "k";
    const abrev = (n) => n >= 1e6 ? nf(n / 1e6, 1) + "M" : n >= 1e3 ? nf(Math.round(n / 1e3), 0) + "k" : nf(n, 0);
    const variacao = (a, b) => b === 0 ? 0 : (a - b) / b * 100;
    const corte = (sla) => Math.round(((100 - sla) * 0.55 + 1.2) * 10) / 10;
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    function pseudo(n, a, b) {
        let h = 17;
        h = (Math.imul(h, 31) + n) | 0;
        const s = a + "|" + b;
        for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
        const u = Math.imul(h ^ (h >>> 15), 2654435761) >>> 0;
        return (u % 10000) / 10000;
    }

    // ---------- base fictícia (memoizada) ----------
    let _base = null;
    function base() {
        if (_base) return _base;
        const lista = [];
        for (let m = 0; m < 12; m++) {
            const sazonal = 1 + 0.22 * Math.sin((m - 2) / 12 * 2 * Math.PI) + (m >= 10 ? 0.15 : 0);
            for (const regiao of REGIOES) {
                for (const c of CATEGORIAS) {
                    const ruido = 0.85 + pseudo(m, regiao, c.nome) * 0.30;
                    const fat = BASE_CAT[c.nome] * PESO_REGIAO[regiao] * sazonal * ruido;
                    const slaBase = regiao === "Norte" ? 0.90 : regiao === "Nordeste" ? 0.93 : 0.955;
                    const sla = Math.min(0.99, slaBase + m * 0.002 + (pseudo(m + 7, regiao, c.nome) - 0.5) * 0.03);
                    lista.push({
                        mesIndex: m, mes: MESES[m], regiao: regiao, categoria: c.nome,
                        faturamento: Math.round(fat), pedidos: Math.trunc(fat / 950),
                        unidades: Math.trunc(fat / 14), slaPct: Math.round(sla * 1000) / 10,
                    });
                }
            }
        }
        _base = lista;
        return lista;
    }

    function margemMedia(dados) {
        const total = dados.reduce((s, r) => s + r.faturamento, 0);
        if (total === 0) return 0;
        let acc = 0;
        for (const c of CATEGORIAS) {
            const fatC = dados.filter((r) => r.categoria === c.nome).reduce((s, r) => s + r.faturamento, 0);
            acc += MARGEM_CAT[c.nome] * (fatC / total);
        }
        return Math.round(acc * 10) / 10;
    }

    // ---------- resumo do dashboard ----------
    function resumo(regiaoFiltro) {
        const dados = base().filter((r) => regiaoFiltro === "Todas" || r.regiao === regiaoFiltro);
        const atual = dados.filter((r) => r.mesIndex >= 6);
        const anterior = dados.filter((r) => r.mesIndex < 6);
        const soma = (arr, k) => arr.reduce((s, r) => s + r[k], 0);

        const fatAno = soma(dados, "faturamento"), pedAno = soma(dados, "pedidos"), unAno = soma(dados, "unidades");
        const tickAno = pedAno > 0 ? fatAno / pedAno : 0;
        const slaAno = dados.length ? dados.reduce((s, r) => s + r.slaPct, 0) / dados.length : 0;
        const margemAno = margemMedia(dados), corteAno = corte(slaAno);

        const fatA = soma(atual, "faturamento"), fatP = soma(anterior, "faturamento");
        const pedA = soma(atual, "pedidos"), pedP = soma(anterior, "pedidos");
        const unA = soma(atual, "unidades"), unP = soma(anterior, "unidades");
        const tickA = pedA > 0 ? fatA / pedA : 0, tickP = pedP > 0 ? fatP / pedP : 0;
        const slaA = atual.length ? atual.reduce((s, r) => s + r.slaPct, 0) / atual.length : 0;
        const slaP = anterior.length ? anterior.reduce((s, r) => s + r.slaPct, 0) / anterior.length : 0;
        const margA = margemMedia(atual), margP = margemMedia(anterior);
        const corteA = corte(slaA), corteP = corte(slaP);

        const kpis = [
            { rot: "Faturamento (ano)", val: moeda(fatAno), v: variacao(fatA, fatP), bom: true, suf: "%", ico: "💵" },
            { rot: "Ticket médio", val: moeda(tickAno), v: variacao(tickA, tickP), bom: true, suf: "%", ico: "🧾" },
            { rot: "Pedidos", val: abrev(pedAno), v: variacao(pedA, pedP), bom: true, suf: "%", ico: "📑" },
            { rot: "Unidades vendidas", val: abrev(unAno), v: variacao(unA, unP), bom: true, suf: "%", ico: "📦" },
            { rot: "Margem média", val: nf(margemAno, 1) + "%", v: margA - margP, bom: true, suf: " pts", ico: "📈" },
            { rot: "SLA de entrega", val: nf(slaAno, 1) + "%", v: slaA - slaP, bom: true, suf: " pts", ico: "🚚" },
            { rot: "Taxa de corte", val: nf(corteAno, 1) + "%", v: corteA - corteP, bom: false, suf: " pts", ico: "✂️" },
            { rot: "Faturamento (S2)", val: moeda(fatA), v: variacao(fatA, fatP), bom: true, suf: "%", ico: "🗓️" },
        ];

        const mensal = MESES.map((mes, i) => ({
            mes: mes, valor: soma(dados.filter((r) => r.mesIndex === i), "faturamento")
        }));

        const totalGeral = fatAno;
        const porCat = CATEGORIAS.map((c) => {
            const v = soma(dados.filter((r) => r.categoria === c.nome), "faturamento");
            return { categoria: c.nome, valor: v, pct: totalGeral > 0 ? v / totalGeral * 100 : 0, cor: c.cor };
        }).sort((a, b) => b.valor - a.valor);

        const slaRegiao = REGIOES.map((rg) => {
            const d = base().filter((r) => r.regiao === rg);
            return { regiao: rg, slaPct: Math.round(d.reduce((s, r) => s + r.slaPct, 0) / d.length * 10) / 10 };
        }).sort((a, b) => b.slaPct - a.slaPct);

        const topProd = PRODUTOS.map((p) => {
            const fatCat = soma(dados.filter((r) => r.categoria === p.cat), "faturamento");
            const somaPeso = PRODUTOS.filter((x) => x.cat === p.cat).reduce((s, x) => s + x.peso, 0);
            const fat = somaPeso > 0 ? fatCat * (p.peso / somaPeso) : 0;
            return { produto: p.nome, categoria: p.cat, faturamento: Math.round(fat), unidades: Math.trunc(fat / 14), margem: Math.round((18 + pseudo(0, p.nome, p.cat) * 14) * 10) / 10 };
        }).sort((a, b) => b.faturamento - a.faturamento).slice(0, 6);

        const melhorMes = mensal.slice().sort((a, b) => b.valor - a.valor)[0];
        const catLider = porCat[0];
        const regRank = REGIOES.map((rg) => ({ regiao: rg, fat: soma(dados.filter((r) => r.regiao === rg), "faturamento") }))
            .sort((a, b) => b.fat - a.fat)[0];

        const destaques = [
            { rot: "Melhor mês", val: `${melhorMes.mes} · ${moeda(melhorMes.valor)}`, ico: "🏅" },
            { rot: "Região líder", val: `${regRank.regiao} · ${moeda(regRank.fat)}`, ico: "📍" },
            { rot: "Categoria líder", val: `${catLider.categoria} · ${nf(catLider.pct, 1)}%`, ico: "🏆" },
        ];

        const piorSla = slaRegiao[slaRegiao.length - 1];
        const tendencia = kpis[0].v >= 0 ? "alta" : "queda";
        const alerta = piorSla.slaPct < 95
            ? ` Atenção: a região ${piorSla.regiao} está com SLA de ${nf(piorSla.slaPct, 1)}%, abaixo da meta de 95%.`
            : " Todas as regiões estão dentro da meta de SLA (95%).";
        const escopo = regiaoFiltro === "Todas" ? "geral" : `da região ${regiaoFiltro}`;
        const insight = `No recorte ${escopo}, o faturamento do 2º semestre teve ${tendencia} de ` +
            `${nf(Math.abs(kpis[0].v), 1)}% frente ao 1º, com margem média de ${nf(margemAno, 1)}% ` +
            `e ticket de ${moeda(tickAno)}. O pico foi em ${melhorMes.mes} (${moeda(melhorMes.valor)}) ` +
            `e a categoria líder é ${catLider.categoria}, com ${nf(catLider.pct, 1)}% do total.${alerta}`;

        return { kpis, destaques, mensal, porCat, slaRegiao, topProd, insight };
    }

    // ---------- código (showcase Java) ----------
    const CODE = {
        "Controller": `@RestController
@RequestMapping("/api/vendas")
public class VendasController {

    private final VendasService service;

    public VendasController(VendasService service) {
        this.service = service;
    }

    @GetMapping("/resumo")
    public ResumoDTO resumo(@RequestParam(defaultValue = "Todas") String regiao) {
        return service.resumoPorRegiao(regiao);
    }
}`,
        "Service (JPA)": `@Service
public class VendasService {

    private final VendaRepository repo;

    public VendasService(VendaRepository repo) {
        this.repo = repo;
    }

    public ResumoDTO resumoPorRegiao(String regiao) {
        List<Venda> dados = "Todas".equals(regiao)
                ? repo.findAll()
                : repo.findByRegiao(regiao);

        BigDecimal faturamento = dados.stream()
                .map(Venda::getFaturamento)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double sla = dados.stream()
                .mapToDouble(Venda::getSlaPct)
                .average().orElse(0);

        Map<String, BigDecimal> porCategoria = dados.stream()
                .collect(Collectors.groupingBy(
                        Venda::getCategoria,
                        Collectors.reducing(BigDecimal.ZERO,
                                Venda::getFaturamento, BigDecimal::add)));

        return new ResumoDTO(faturamento, sla, porCategoria);
    }
}`,
        "SQL": `SELECT
    v.regiao,
    v.categoria,
    TO_CHAR(v.data_venda, 'YYYY-MM')          AS competencia,
    SUM(v.valor_total)                        AS faturamento,
    COUNT(DISTINCT v.pedido_id)               AS pedidos,
    SUM(v.quantidade)                         AS unidades,
    ROUND(AVG(CASE WHEN e.no_prazo = 'S'
                   THEN 100 ELSE 0 END), 1)   AS sla_pct
FROM   vendas v
JOIN   entregas e ON e.pedido_id = v.pedido_id
WHERE  (:regiao = 'Todas' OR v.regiao = :regiao)
GROUP  BY v.regiao, v.categoria, TO_CHAR(v.data_venda, 'YYYY-MM')
ORDER  BY faturamento DESC;`,
    };
    const TABS = ["Controller", "Service (JPA)", "SQL"];

    // ---------- render ----------
    let root = null, regiao = "Todas", tab = "Controller";

    function svgBarras(mensal) {
        const maxBar = Math.max(...mensal.map((b) => b.valor));
        const bw = 660 / mensal.length;
        let grid = "";
        for (let g = 1; g <= 4; g++) { const y = 20 + 200 / 4 * g; grid += `<line x1="0" y1="${y}" x2="660" y2="${y}" class="demo-grid" />`; }
        let bars = "";
        mensal.forEach((b, i) => {
            const h = maxBar > 0 ? b.valor / maxBar * 200 : 0;
            const x = i * bw + bw * 0.18, w = bw * 0.64, y = 220 - h;
            bars += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="4" class="demo-bar" style="animation-delay:${(i * 0.035).toFixed(3)}s"><title>${b.mes}: ${moeda(b.valor)}</title></rect>`;
            bars += `<text x="${(x + w / 2).toFixed(2)}" y="${(y - 6).toFixed(2)}" class="demo-vallabel" text-anchor="middle">${moedaCurta(b.valor)}</text>`;
            bars += `<text x="${(x + w / 2).toFixed(2)}" y="238" class="demo-axis" text-anchor="middle">${b.mes}</text>`;
        });
        return `<svg viewBox="0 0 660 260" class="demo-svg" role="img" aria-label="Faturamento por mês">${grid}${bars}</svg>`;
    }

    function svgDonut(porCat) {
        const circ = 2 * Math.PI * 45;
        let acc = 0, slices = "";
        for (const f of porCat) {
            const len = f.pct / 100 * circ;
            slices += `<circle cx="60" cy="60" r="45" fill="none" stroke="${f.cor}" stroke-width="16" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 60 60)"><title>${f.categoria}: ${nf(f.pct, 1)}%</title></circle>`;
            acc += len;
        }
        return `<svg viewBox="0 0 120 120" class="demo-donut" role="img" aria-label="Participação por categoria">
            <circle cx="60" cy="60" r="45" class="demo-donut-bg" />${slices}
            <text x="60" y="58" text-anchor="middle" class="demo-donut-c1">${porCat.length}</text>
            <text x="60" y="72" text-anchor="middle" class="demo-donut-c2">categorias</text></svg>`;
    }

    function dyn(r) {
        const kpis = r.kpis.map((k, i) => {
            const bom = k.bom ? k.v >= 0 : k.v <= 0;
            return `<div class="demo-kpi" style="animation-delay:${(i * 0.05).toFixed(2)}s">
                <span class="demo-kpi-rot">${k.ico} ${k.rot}</span>
                <span class="demo-kpi-val">${k.val}</span>
                <span class="demo-kpi-var ${bom ? "up" : "down"}">
                    <span class="demo-kpi-seta">${k.v >= 0 ? "▲" : "▼"}</span>
                    ${nf(Math.abs(k.v), 1)}${k.suf}
                    <span class="demo-kpi-vs">vs S1</span>
                </span></div>`;
        }).join("");

        const dest = r.destaques.map((d) => `
            <div class="demo-dest">
                <span class="demo-dest-ico">${d.ico}</span>
                <div class="demo-dest-txt">
                    <span class="demo-dest-rot">${d.rot}</span>
                    <span class="demo-dest-val">${d.val}</span>
                </div></div>`).join("");

        const legenda = r.porCat.map((f) => `
            <div class="demo-leg-item">
                <span class="demo-leg-cor" style="background:${f.cor}"></span>
                <span class="demo-leg-nome">${f.categoria}</span>
                <span class="demo-leg-val">${moeda(f.valor)}</span>
                <span class="demo-leg-pct">${nf(f.pct, 1)}%</span>
            </div>`).join("");

        const sla = r.slaRegiao.map((s) => `
            <div class="demo-sla-row">
                <span class="demo-sla-nome">${s.regiao}</span>
                <div class="demo-sla-track">
                    <div class="demo-sla-fill ${s.slaPct < 95 ? "ruim" : "bom"}" style="width:${s.slaPct}%"></div>
                </div>
                <span class="demo-sla-val">${nf(s.slaPct, 1)}%</span>
            </div>`).join("");

        const linhas = r.topProd.map((p) => `
            <tr>
                <td>${p.produto}</td>
                <td><span class="demo-pill">${p.categoria}</span></td>
                <td class="num">${moeda(p.faturamento)}</td>
                <td class="num">${nf(p.unidades, 0)}</td>
                <td class="num">${nf(p.margem, 1)}%</td>
            </tr>`).join("");

        return `
            <div class="demo-kpis">${kpis}</div>
            <div class="demo-destaques">${dest}</div>
            <div class="demo-graficos">
                <div class="demo-card demo-card-wide">
                    <h4>Faturamento por mês</h4>
                    ${svgBarras(r.mensal)}
                </div>
                <div class="demo-card">
                    <h4>Mix por categoria</h4>
                    <div class="demo-donut-wrap">
                        ${svgDonut(r.porCat)}
                        <div class="demo-legenda">${legenda}</div>
                    </div>
                </div>
                <div class="demo-card">
                    <h4>SLA por região <span class="demo-alvo">🎯 Meta 95%</span></h4>
                    <div class="demo-sla">${sla}</div>
                </div>
                <div class="demo-card demo-card-wide">
                    <h4>Top produtos — recorte ${regiao}</h4>
                    <div class="demo-tabela-wrap">
                        <table class="demo-tabela">
                            <thead><tr><th>Produto</th><th>Categoria</th><th class="num">Faturamento</th><th class="num">Unidades</th><th class="num">Margem</th></tr></thead>
                            <tbody>${linhas}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;
    }

    function renderCode() {
        root.querySelector("#demoCodeBody").innerHTML = "<code>" + esc(CODE[tab]) + "</code>";
        root.querySelectorAll(".demo-code-tab").forEach((b) =>
            b.classList.toggle("ativo", b.dataset.tab === tab));
    }

    function update() {
        const r = resumo(regiao);
        root.querySelector("#demoDyn").innerHTML = dyn(r);
        root.querySelector("#demoInsight").textContent = r.insight;
        root.querySelectorAll(".demo-reg").forEach((b) =>
            b.classList.toggle("ativo", b.dataset.reg === regiao));
    }

    function init(sel) {
        root = document.querySelector(sel);
        if (!root) return;
        const regioes = ["Todas", ...REGIOES];
        root.innerHTML = `
            <div class="demo">
                <div class="demo-head">
                    <div>
                        <h3 class="demo-titulo">📊 DataVision <span class="demo-tag">Aplicação interativa</span></h3>
                        <p class="demo-sub">Analytics de uma distribuidora fictícia — os números são gerados no navegador. Troque a região e veja tudo recalcular.</p>
                    </div>
                    <div class="demo-regioes">
                        ${regioes.map((rg) => `<button class="demo-reg" data-reg="${rg}">${rg}</button>`).join("")}
                    </div>
                </div>
                <div id="demoDyn"></div>
                <div class="demo-insight">
                    <span class="demo-insight-ico">🤖</span>
                    <div><strong>Insight automático</strong><p id="demoInsight"></p></div>
                </div>
                <div class="demo-code">
                    <div class="demo-code-head">
                        <span class="demo-code-titulo">👨‍💻 Por trás dos dados</span>
                        <div class="demo-code-tabs">
                            ${TABS.map((t) => `<button class="demo-code-tab" data-tab="${t}">${t}</button>`).join("")}
                        </div>
                    </div>
                    <pre class="demo-code-body" id="demoCodeBody"></pre>
                    <p class="demo-code-nota">
                        Numa arquitetura real, o front-end consome uma API REST em <strong>Java (Spring Boot)</strong>,
                        que roda consultas <strong>SQL</strong> agregadas no banco via <strong>Spring Data JPA</strong>.
                        Aqui os dados são simulados no navegador para a demo rodar sem servidor.
                    </p>
                </div>
            </div>`;

        root.querySelectorAll(".demo-reg").forEach((b) =>
            b.addEventListener("click", () => { regiao = b.dataset.reg; update(); }));
        root.querySelectorAll(".demo-code-tab").forEach((b) =>
            b.addEventListener("click", () => { tab = b.dataset.tab; renderCode(); }));

        update();
        renderCode();
    }

    return { init };
})();
window.DemoApp = DemoApp;
