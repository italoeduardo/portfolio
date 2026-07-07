using Portfolio.Models;

namespace Portfolio.Data;

// ============================================================
//  DataVision — motor de dados fictícios do dashboard-demo.
//  Tudo é gerado de forma DETERMINÍSTICA em C# (mesma seed →
//  mesmos números), simulando uma distribuidora. Nenhum dado real.
// ============================================================

public record RegistroVenda(
    int MesIndex, string Mes, string Regiao, string Categoria,
    decimal Faturamento, int Pedidos, int Unidades, double SlaPct);

public record Kpi(string Rotulo, string Valor, double VariacaoPct, bool MaiorEhMelhor);

public record BarraMes(string Mes, decimal Valor);
public record FatiaCategoria(string Categoria, decimal Valor, double Pct, string Cor);
public record BarraRegiao(string Regiao, double SlaPct, decimal Faturamento);
public record LinhaProduto(string Produto, string Categoria, decimal Faturamento, int Unidades, double MargemPct);

public record ResumoDashboard(
    Kpi[] Kpis,
    BarraMes[] FaturamentoMensal,
    FatiaCategoria[] PorCategoria,
    BarraRegiao[] SlaPorRegiao,
    LinhaProduto[] TopProdutos,
    string Insight);

public static class DemoData
{
    public static readonly string[] Meses =
        { "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" };

    public static readonly string[] Regioes =
        { "Sudeste", "Sul", "Centro-Oeste", "Nordeste", "Norte" };

    // Categoria → cor (paleta do portfólio)
    public static readonly (string Nome, string Cor)[] Categorias =
    {
        ("Bebidas",  "#E76B2F"),
        ("Alimentos","#1E3A8A"),
        ("Limpeza",  "#198754"),
        ("Higiene",  "#5A3A6F"),
        ("Bazar",    "#0D6EFD"),
    };

    // Produtos fictícios, cada um ancorado numa categoria.
    private static readonly (string Nome, string Categoria, double Peso)[] Produtos =
    {
        ("Refrigerante Cola 2L",   "Bebidas",   1.0),
        ("Suco Néctar 1L",         "Bebidas",   0.6),
        ("Arroz Tipo 1 5kg",       "Alimentos", 1.0),
        ("Óleo de Soja 900ml",     "Alimentos", 0.7),
        ("Detergente Neutro 500ml","Limpeza",   0.9),
        ("Sabão em Pó 1kg",        "Limpeza",   0.8),
        ("Sabonete 90g",           "Higiene",   0.7),
        ("Papel Higiênico 12un",   "Higiene",   1.0),
        ("Copo Descartável 100un", "Bazar",     0.6),
    };

    // Pesos de "tamanho" por região (Sudeste é o maior mercado).
    private static readonly Dictionary<string, double> PesoRegiao = new()
    {
        ["Sudeste"] = 1.00, ["Sul"] = 0.62, ["Centro-Oeste"] = 0.48,
        ["Nordeste"] = 0.55, ["Norte"] = 0.30,
    };

    private static List<RegistroVenda>? _cache;

    /// <summary>Gera (uma vez) a base fictícia completa: 12 meses × 5 regiões × 5 categorias.</summary>
    public static List<RegistroVenda> Base()
    {
        if (_cache is not null) return _cache;

        var lista = new List<RegistroVenda>();
        for (int m = 0; m < 12; m++)
        {
            // Sazonalidade: pico no meio e fim do ano.
            double sazonal = 1 + 0.22 * Math.Sin((m - 2) / 12.0 * 2 * Math.PI) + (m >= 10 ? 0.15 : 0);

            foreach (var regiao in Regioes)
            {
                foreach (var (cat, _) in Categorias)
                {
                    double baseCat = cat switch
                    {
                        "Bebidas" => 320_000, "Alimentos" => 410_000, "Limpeza" => 210_000,
                        "Higiene" => 180_000, _ => 120_000
                    };

                    // Ruído determinístico (hash estável) entre ~0,85 e ~1,15.
                    double ruido = 0.85 + Pseudo(m, regiao, cat) * 0.30;

                    decimal fat = (decimal)(baseCat * PesoRegiao[regiao] * sazonal * ruido);
                    int pedidos = (int)(fat / 950);
                    int unidades = (int)(fat / 14);

                    // SLA entre 88% e 99%, pior no Norte, melhora ao longo do ano.
                    double slaBase = regiao == "Norte" ? 0.90 : regiao == "Nordeste" ? 0.93 : 0.955;
                    double sla = Math.Min(0.99, slaBase + m * 0.002 + (Pseudo(m + 7, regiao, cat) - 0.5) * 0.03);

                    lista.Add(new RegistroVenda(m, Meses[m], regiao, cat,
                        Math.Round(fat, 0), pedidos, unidades, Math.Round(sla * 100, 1)));
                }
            }
        }
        _cache = lista;
        return lista;
    }

    /// <summary>Monta o resumo do dashboard para a região escolhida ("Todas" = tudo).</summary>
    public static ResumoDashboard Resumo(string regiaoFiltro)
    {
        var dados = Base().Where(r => regiaoFiltro == "Todas" || r.Regiao == regiaoFiltro).ToList();

        // ---- KPIs (semestre atual vs semestre anterior) ----
        var atual = dados.Where(r => r.MesIndex >= 6).ToList();
        var anterior = dados.Where(r => r.MesIndex < 6).ToList();

        decimal fatA = atual.Sum(r => r.Faturamento), fatP = anterior.Sum(r => r.Faturamento);
        int pedA = atual.Sum(r => r.Pedidos), pedP = anterior.Sum(r => r.Pedidos);
        decimal tickA = pedA > 0 ? fatA / pedA : 0, tickP = pedP > 0 ? fatP / pedP : 0;
        double slaA = atual.Count > 0 ? atual.Average(r => r.SlaPct) : 0;
        double slaP = anterior.Count > 0 ? anterior.Average(r => r.SlaPct) : 0;

        var kpis = new[]
        {
            new Kpi("Faturamento (S2)", Moeda(fatA), Var(fatA, fatP), true),
            new Kpi("Pedidos (S2)", $"{pedA:N0}", Var((decimal)pedA, (decimal)pedP), true),
            new Kpi("Ticket médio", Moeda(tickA), Var((double)tickA, (double)tickP), true),
            new Kpi("SLA de entrega", $"{slaA:N1}%", slaA - slaP, true),
        };

        // ---- Faturamento por mês ----
        var mensal = dados.GroupBy(r => r.MesIndex)
            .OrderBy(g => g.Key)
            .Select(g => new BarraMes(Meses[g.Key], g.Sum(r => r.Faturamento)))
            .ToArray();

        // ---- Participação por categoria ----
        decimal totalGeral = dados.Sum(r => r.Faturamento);
        var porCat = Categorias.Select(c =>
        {
            decimal v = dados.Where(r => r.Categoria == c.Nome).Sum(r => r.Faturamento);
            return new FatiaCategoria(c.Nome, v, totalGeral > 0 ? (double)(v / totalGeral) * 100 : 0, c.Cor);
        }).OrderByDescending(f => f.Valor).ToArray();

        // ---- SLA por região (sempre todas, pra ranking) ----
        var slaRegiao = Base().GroupBy(r => r.Regiao)
            .Select(g => new BarraRegiao(g.Key, Math.Round(g.Average(r => r.SlaPct), 1), g.Sum(r => r.Faturamento)))
            .OrderByDescending(b => b.SlaPct)
            .ToArray();

        // ---- Top produtos (deriva da participação da categoria filtrada) ----
        var topProd = Produtos.Select(p =>
        {
            decimal fatCat = dados.Where(r => r.Categoria == p.Categoria).Sum(r => r.Faturamento);
            double somaPeso = Produtos.Where(x => x.Categoria == p.Categoria).Sum(x => x.Peso);
            decimal fat = somaPeso > 0 ? fatCat * (decimal)(p.Peso / somaPeso) : 0;
            int un = (int)(fat / 14);
            double margem = 18 + Pseudo(0, p.Nome, p.Categoria) * 14; // 18%–32%
            return new LinhaProduto(p.Nome, p.Categoria, Math.Round(fat, 0), un, Math.Round(margem, 1));
        }).OrderByDescending(p => p.Faturamento).Take(6).ToArray();

        // ---- Insight automático (regra determinística que "lê" os dados) ----
        var melhorMes = mensal.OrderByDescending(m => m.Valor).First();
        var catLider = porCat.First();
        var piorSla = slaRegiao.Last();
        string tendencia = kpis[0].VariacaoPct >= 0 ? "alta" : "queda";
        string alerta = piorSla.SlaPct < 95
            ? $" Atenção: a região {piorSla.Regiao} está com SLA de {piorSla.SlaPct:N1}%, abaixo da meta de 95%."
            : " Todas as regiões estão dentro da meta de SLA (95%).";

        string escopo = regiaoFiltro == "Todas" ? "geral" : $"da região {regiaoFiltro}";
        string insight =
            $"No recorte {escopo}, o faturamento do 2º semestre teve {tendencia} de " +
            $"{Math.Abs(kpis[0].VariacaoPct):N1}% frente ao 1º. O pico foi em {melhorMes.Mes} " +
            $"({Moeda(melhorMes.Valor)}) e a categoria líder é {catLider.Categoria}, com " +
            $"{catLider.Pct:N1}% do total.{alerta}";

        return new ResumoDashboard(kpis, mensal, porCat, slaRegiao, topProd, insight);
    }

    // ---------- helpers ----------
    private static double Var(decimal atual, decimal anterior) =>
        anterior == 0 ? 0 : (double)((atual - anterior) / anterior) * 100;
    private static double Var(double atual, double anterior) =>
        anterior == 0 ? 0 : (atual - anterior) / anterior * 100;

    public static string Moeda(decimal v) =>
        v >= 1_000_000 ? $"R$ {v / 1_000_000:N1}M"
        : v >= 1_000 ? $"R$ {v / 1_000:N0}k"
        : $"R$ {v:N0}";

    /// <summary>Hash determinístico → double em [0,1). Substitui um Random por algo estável.</summary>
    private static double Pseudo(int n, string a, string b)
    {
        unchecked
        {
            int h = 17;
            h = h * 31 + n;
            foreach (char c in a) h = h * 31 + c;
            foreach (char c in b) h = h * 31 + c;
            uint u = (uint)h * 2654435761u;
            return (u % 10000) / 10000.0;
        }
    }
}
