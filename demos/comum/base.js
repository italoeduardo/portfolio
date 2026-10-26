// ============================================================
//  Base das demos que rodam no navegador.
//  Porta para JavaScript o que os sistemas Java usam: o gerador
//  de números do java.util.Random (mesma semente = mesmos dados),
//  datas como LocalDate, o calendário de dias úteis com feriados
//  e a formatação pt-BR. Cada demo monta as telas por cima disso.
// ============================================================
(function () {
    "use strict";

    // ---------- java.util.Random, bit a bit ----------
    const MULT = 0x5DEECE66Dn, ADD = 0xBn, MASK = (1n << 48n) - 1n;

    class JavaRandom {
        constructor(semente) {
            this.seed = (BigInt(semente) ^ MULT) & MASK;
        }
        next(bits) {
            this.seed = (this.seed * MULT + ADD) & MASK;
            return Number(this.seed >> BigInt(48 - bits));
        }
        nextInt(bound) {
            if (bound === undefined) {
                const v = this.next(32);
                return v >= 0x80000000 ? v - 0x100000000 : v;
            }
            let r = this.next(31);
            const m = bound - 1;
            if ((bound & m) === 0) return Number((BigInt(bound) * BigInt(r)) >> 31n);
            for (let u = r; u - (r = u % bound) + m > 0x7fffffff; u = this.next(31));
            return r;
        }
        nextDouble() {
            return (this.next(26) * 134217728 + this.next(27)) / 9007199254740992;
        }
        nextBoolean() {
            return this.next(1) !== 0;
        }
        nextGaussian() {
            if (this.temGauss) { this.temGauss = false; return this.proxGauss; }
            let v1, v2, s;
            do {
                v1 = 2 * this.nextDouble() - 1;
                v2 = 2 * this.nextDouble() - 1;
                s = v1 * v1 + v2 * v2;
            } while (s >= 1 || s === 0);
            const mul = Math.sqrt(-2 * Math.log(s) / s);
            this.proxGauss = v2 * mul;
            this.temGauss = true;
            return v1 * mul;
        }
    }

    // ---------- LocalDate como número de dias desde 1970-01-01 ----------
    const Data = {
        de(ano, mes, dia) { return Math.round(Date.UTC(ano, mes - 1, dia) / 86400000); },
        hoje() { const d = new Date(); return Data.de(d.getFullYear(), d.getMonth() + 1, d.getDate()); },
        partes(n) { const d = new Date(n * 86400000); return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() + 1, dia: d.getUTCDate() }; },
        /** 1 = segunda ... 7 = domingo, como DayOfWeek. */
        diaSemana(n) { const w = new Date(n * 86400000).getUTCDay(); return w === 0 ? 7 : w; },
        somarMeses(n, meses) {
            const p = Data.partes(n);
            let total = p.ano * 12 + (p.mes - 1) + meses;
            const ano = Math.floor(total / 12), mes = total % 12 + 1;
            return Data.de(ano, mes, Math.min(p.dia, Data.diasNoMes(ano, mes)));
        },
        comDia(n, dia) { const p = Data.partes(n); return Data.de(p.ano, p.mes, dia); },
        diasNoMes(ano, mes) { return new Date(Date.UTC(ano, mes, 0)).getUTCDate(); },
        iso(n) { const p = Data.partes(n); return `${p.ano}-${String(p.mes).padStart(2, "0")}-${String(p.dia).padStart(2, "0")}`; },
        deIso(s) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? Data.de(+m[1], +m[2], +m[3]) : null; },
        br(n) { if (n == null) return "—"; const p = Data.partes(n); return `${String(p.dia).padStart(2, "0")}/${String(p.mes).padStart(2, "0")}/${p.ano}`; },
        anoMes(n) { const p = Data.partes(n); return p.ano * 100 + p.mes; },
    };
    const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const MESES_LONGOS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

    // ---------- Calendário de dias úteis (feriados nacionais + móveis) ----------
    function pascoa(ano) {
        const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4;
        const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
        const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
        return Data.de(ano, mes, dia);
    }
    const FIXOS = [[1, 1], [4, 21], [5, 1], [9, 7], [10, 12], [11, 2], [11, 15], [11, 20], [12, 25]];
    const cacheFeriados = {};
    const Calendario = {
        pascoa,
        feriados(ano) {
            if (!cacheFeriados[ano]) {
                const p = pascoa(ano);
                cacheFeriados[ano] = new Set([...FIXOS.map(([m, d]) => Data.de(ano, m, d)), p - 48, p - 47, p - 2, p + 60]);
            }
            return cacheFeriados[ano];
        },
        isDiaUtil(n) {
            const w = Data.diaSemana(n);
            return w !== 6 && w !== 7 && !Calendario.feriados(Data.partes(n).ano).has(n);
        },
        somarDiasUteis(n, dias) {
            let d = n, r = dias;
            while (r > 0) { d++; if (Calendario.isDiaUtil(d)) r--; }
            return d;
        },
        diasUteisEntre(de, ate) {
            if (ate < de) return -Calendario.diasUteisEntre(ate, de);
            let t = 0;
            for (let d = de + 1; d <= ate; d++) if (Calendario.isDiaUtil(d)) t++;
            return t;
        },
    };

    // ---------- Aritmética igual à do Java ----------
    /** DoubleStream.sum(): soma com compensação de Kahan, como o Java faz. */
    function somaJava(valores) {
        let soma = 0, comp = 0, simples = 0;
        for (const v of valores) {
            const tmp = v - comp, velvel = soma + tmp;
            comp = (velvel - soma) - tmp;
            soma = velvel;
            simples += v;
        }
        const r = soma - comp;
        return Number.isNaN(r) && !Number.isFinite(simples) ? simples : r;
    }
    /** BigDecimal.valueOf(v).setScale(casas, HALF_UP).doubleValue(). */
    function arredHalfUp(v, casas) {
        const s = String(v);
        if (/e/i.test(s)) return Number(v.toFixed(casas));
        const neg = s.startsWith("-"), [int, frac = ""] = (neg ? s.slice(1) : s).split(".");
        if (frac.length <= casas) return v;
        let n = BigInt(int + frac.slice(0, casas));
        if (+frac[casas] >= 5) n += 1n;
        const t = n.toString().padStart(casas + 1, "0");
        const r = parseFloat(t.slice(0, t.length - casas) + "." + t.slice(t.length - casas));
        return neg ? -r : r;
    }

    // ---------- Formatação pt-BR igual ao NumberFormat do Java ----------
    // O Java arredonda "meio para o par" olhando o valor binário EXATO do double
    // (3.145 é 3.14500000000000001… e vira 3,15). O Intl do navegador olha o
    // "3.145" curto e daria 3,14; por isso o arredondamento é feito aqui.
    function numJava(v, casas) {
        if (!Number.isFinite(v)) return String(v);
        const neg = v < 0;
        const a = Math.abs(v);
        let exato = a === 0 ? "0" : a.toPrecision(100);
        if (/e/.test(exato)) exato = a.toFixed(100);
        let [int, frac = ""] = exato.split(".");
        frac = frac.padEnd(casas + 1, "0");
        let n = BigInt(int + frac.slice(0, casas));
        const resto = frac.slice(casas);
        const meio = "5".padEnd(resto.length, "0");
        if (resto > meio || (resto === meio && n % 2n === 1n)) n += 1n;
        const t = n.toString().padStart(casas + 1, "0");
        const parteInt = t.slice(0, t.length - casas).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        const txt = casas > 0 ? parteInt + "," + t.slice(t.length - casas) : parteInt;
        return (neg && v !== 0 ? "-" : "") + txt; // o Java mantém o sinal: -0,04 vira "-0,0"
    }
    const Fmt = {
        num: numJava,
        pct: (v) => numJava(v, 1) + "%",
        moeda: (v) => { v = v || 0; return (v < 0 ? "-R$ " : "R$ ") + numJava(Math.abs(v), 2); },
        inteiro: (v) => numJava(v, 0),
        dec1: (v) => numJava(v, 1),
        dec2: (v) => numJava(v, 2),
        data: Data.br,
    };

    // ---------- Navegação por hash: #/rota?param=valor ----------
    const Rota = {
        atual() {
            const h = location.hash.replace(/^#/, "") || "/";
            const [caminho, qs] = h.split("?");
            return { caminho: caminho || "/", params: new URLSearchParams(qs || "") };
        },
        href(caminho, params) {
            const qs = params ? new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== "")).toString() : "";
            return "#" + caminho + (qs ? "?" + qs : "");
        },
        ir(caminho, params) { location.hash = Rota.href(caminho, params).slice(1); },
        iniciar(render) {
            const rodar = () => { render(Rota.atual()); window.scrollTo(0, 0); };
            window.addEventListener("hashchange", rodar);
            rodar();
        },
        /** Formulário GET vira navegação por hash. */
        formulario(form, caminho) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const p = {};
                new FormData(form).forEach((v, k) => { if (v !== "") p[k] = v; });
                Rota.ir(caminho, p);
            });
        },
    };

    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    /** Persistência por visitante (o que a pessoa altera fica só no navegador dela). */
    const Local = {
        ler(chave, padrao) { try { const v = localStorage.getItem(chave); return v == null ? padrao : JSON.parse(v); } catch (e) { return padrao; } },
        gravar(chave, valor) { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem storage */ } },
        apagar(chave) { try { localStorage.removeItem(chave); } catch (e) { /* sem storage */ } },
    };

    window.Demo = { JavaRandom, Data, MESES, MESES_LONGOS, Calendario, Fmt, Rota, esc, Local, somaJava, arredHalfUp };
})();
