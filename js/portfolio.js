// ============================================================
//  Monta a página a partir de data.js e liga as interações.
// ============================================================
(function () {
    "use strict";

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const { Player, quadroTela, quadroTranscritor, MOVIMENTO_REDUZIDO } = window.Vitrine;
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const players = {};

    function irPara(id) {
        const alvo = document.getElementById(id);
        if (!alvo) return;
        alvo.scrollIntoView({ behavior: MOVIMENTO_REDUZIDO ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", "#" + id);
    }

    // ---------------- vitrine da abertura ----------------
    function montarVitrine() {
        const quadros = VITRINE.map((s, i) => s.animacao
            ? quadroTranscritor()
            : quadroTela(s.telas[0].img, `${s.nome}: ${s.telas[0].legenda}`, i === 0));

        const chips = $("#vitrineChips");
        chips.innerHTML = VITRINE.map((s, i) => `
            <button class="chip" role="tab" data-i="${i}" style="--cor:${s.cor}" aria-label="Ver ${esc(s.nome)}">
                <span class="chip-ponto"></span>${esc(s.nome)}
            </button>`).join("");

        const legenda = $("#vitrineLegenda");
        const janela = $("#vitrineJanela");
        const botaoPausa = $("#vitrinePausa");

        const player = new Player({
            tela: $("#vitrineTela"),
            quadros,
            duracao: 7500,
            barras: $("#vitrineBarras"),
            hover: janela,
            aoMudar: (i) => {
                const s = VITRINE[i];
                $("#vitrine").style.setProperty("--cor", s.cor);
                $("#vitrineUrl").textContent = s.url;
                legenda.innerHTML = `
                    <div>
                        <span class="pill">${esc(s.categoria)}</span>
                        <strong>${esc(s.nome)}</strong>
                        <span class="vitrine-chamada">${esc(s.chamada)}</span>
                    </div>
                    <button class="botao botao-pequeno" data-ir="sistema-${s.id}">Conhecer o sistema ↓</button>`;
                $$(".chip", chips).forEach((c, k) => {
                    c.classList.toggle("ativo", k === i);
                    c.setAttribute("aria-selected", k === i);
                });
            },
            aoPausar: (tocando) => {
                botaoPausa.textContent = tocando ? "❚❚" : "▶";
                botaoPausa.setAttribute("aria-label", tocando ? "Pausar a vitrine" : "Continuar a vitrine");
            },
        });
        if (MOVIMENTO_REDUZIDO) player.o.aoPausar(false);

        botaoPausa.addEventListener("click", (e) => { e.stopPropagation(); player.alternar(); });
        legenda.addEventListener("click", (e) => {
            const b = e.target.closest("[data-ir]");
            if (b) abrirCaso(b.dataset.ir.replace("sistema-", ""));
        });
        $("#vitrineTela").addEventListener("click", () => abrirCaso(VITRINE[player.i].id));
        chips.addEventListener("click", (e) => {
            const c = e.target.closest(".chip");
            if (!c) return;
            player.ir(+c.dataset.i);
            abrirCaso(VITRINE[+c.dataset.i].id);
        });
    }

    /** Clicou num sistema: rola até ele e recomeça o tour de telas dele. */
    function abrirCaso(id) {
        irPara("sistema-" + id);
        const p = players[id];
        if (p) {
            p.ir(0);
            if (!p.tocando) p.alternar();
        }
    }

    // ---------------- um bloco por sistema ----------------
    function montarCasos() {
        const total = String(VITRINE.length).padStart(2, "0");
        $("#casos").innerHTML = VITRINE.map((s, i) => `
            <article class="caso revelar" id="sistema-${s.id}" style="--cor:${s.cor}">
                <div class="caso-texto">
                    <div class="caso-topo">
                        <span class="caso-indice">${String(i + 1).padStart(2, "0")}<i> / ${total}</i></span>
                        <span class="pill">${esc(s.categoria)}</span>
                    </div>
                    <h3>${esc(s.nome)}</h3>
                    <p class="caso-chamada">${esc(s.chamada)}</p>
                    <p class="caso-descricao">${esc(s.descricao)}</p>
                    <ul class="caso-destaques">${s.destaques.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
                    <div class="caso-numeros">${s.numeros.map((n) => `<div><b>${esc(n.v)}</b><span>${esc(n.r)}</span></div>`).join("")}</div>
                    <div class="tags">${s.stack.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
                    <div class="caso-acoes">
                        <a class="botao botao-principal" href="${s.repo}" target="_blank" rel="noopener">Ver o código ↗</a>
                        ${s.link ? `<a class="botao botao-vazado" href="${s.link}" target="_blank" rel="noopener">Ver no ar ↗</a>` : ""}
                        <button class="botao botao-vazado" data-proximo="${i}">${i < VITRINE.length - 1 ? "Próximo sistema ↓" : "Testar ao vivo ↓"}</button>
                    </div>
                </div>
                <div class="caso-midia">
                    <div class="vitrine-barras"></div>
                    <div class="janela">
                        <div class="janela-barra"><span class="pontos"><i></i><i></i><i></i></span><span class="janela-url">${esc(s.url)}</span></div>
                        <div class="janela-tela${s.animacao ? " tela-app" : ""}"></div>
                    </div>
                    <p class="caso-legenda"></p>
                    <div class="miniaturas">${(s.telas || []).map((t, k) => `
                        <button class="miniatura" data-k="${k}" aria-label="${esc(t.legenda)}">
                            <img src="assets/sistemas/${t.img}.webp" alt="" loading="lazy" decoding="async">
                        </button>`).join("")}</div>
                </div>
            </article>`).join("");

        VITRINE.forEach((s) => {
            const caso = $("#sistema-" + s.id);
            const legenda = $(".caso-legenda", caso);
            const quadros = s.animacao
                ? [quadroTranscritor()]
                : s.telas.map((t) => quadroTela(t.img, `${s.nome}: ${t.legenda}`));
            players[s.id] = new Player({
                tela: $(".janela-tela", caso),
                quadros,
                duracao: s.animacao ? 60000 : 6500,
                barras: quadros.length > 1 ? $(".vitrine-barras", caso) : null,
                hover: $(".janela", caso),
                aoMudar: (k) => {
                    legenda.textContent = s.animacao
                        ? "Interface do app recriada em HTML: legenda ao vivo e histórico por locutor"
                        : s.telas[k].legenda;
                    $$(".miniatura", caso).forEach((m, j) => m.classList.toggle("ativa", j === k));
                },
            });
            caso.addEventListener("click", (e) => {
                const m = e.target.closest(".miniatura");
                if (m) players[s.id].ir(+m.dataset.k);
                const p = e.target.closest("[data-proximo]");
                if (p) {
                    const prox = VITRINE[+p.dataset.proximo + 1];
                    prox ? abrirCaso(prox.id) : irPara("demo");
                }
            });
        });
    }

    // ---------------- números da abertura ----------------
    function montarNumeros() {
        const ul = $("#numeros");
        ul.innerHTML = STATS.map((e) => `
            <li><b data-alvo="${e.valor}" data-sufixo="${esc(e.sufixo)}">0</b><span>${esc(e.rotulo)}</span></li>`).join("");
        new IntersectionObserver((ents, obs) => {
            if (!ents[0].isIntersecting) return;
            obs.disconnect();
            $$("b[data-alvo]", ul).forEach((b) => {
                const alvo = +b.dataset.alvo, suf = b.dataset.sufixo;
                if (MOVIMENTO_REDUZIDO) { b.textContent = alvo + suf; return; }
                const ini = performance.now();
                const anima = (t) => {
                    const p = Math.min(1, (t - ini) / 1400);
                    b.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3))) + suf;
                    if (p < 1) requestAnimationFrame(anima);
                };
                requestAnimationFrame(anima);
            });
        }, { threshold: 0.5 }).observe(ul);
    }

    function montarProjetos() {
        $("#listaProjetos").innerHTML = PROJETOS.map((p) => `
            <article class="projeto revelar">
                <div class="projeto-topo"><span class="projeto-icone">${p.icone}</span><span class="pill">${esc(p.categoria)}</span></div>
                <h3>${esc(p.nome)}</h3>
                <p>${esc(p.descricao)}</p>
                <div class="tags">${p.tecnologias.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
                ${p.link || p.repo ? `<div class="projeto-links">
                    ${p.link ? `<a class="projeto-link" href="${p.link}" target="_blank" rel="noopener">Ver no ar ↗</a>` : ""}
                    ${p.repo ? `<a class="projeto-link" href="${p.repo}" target="_blank" rel="noopener">Código ↗</a>` : ""}
                </div>` : ""}
            </article>`).join("");
    }

    function montarHabilidades() {
        $("#listaHabilidades").innerHTML = SKILLS.map((s) => `
            <div class="habilidade revelar">
                <h3><span>${s.icone}</span>${esc(s.nome)}</h3>
                <div class="tags">${s.itens.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
            </div>`).join("");
    }

    function montarContato() {
        const links = [
            { href: "mailto:" + PERFIL.email, rotulo: PERFIL.email, icone: "✉️" },
            { href: PERFIL.linkedin, rotulo: "LinkedIn", icone: "in", externo: true },
            { href: PERFIL.whatsapp, rotulo: "WhatsApp", icone: "💬", externo: true },
            { href: PERFIL.github, rotulo: "GitHub", icone: "⌥", externo: true },
        ];
        $("#contatoLinks").innerHTML = links.map((l) => `
            <a class="contato-link" href="${l.href}"${l.externo ? ' target="_blank" rel="noopener"' : ""}>
                <span class="contato-icone">${l.icone}</span>${esc(l.rotulo)}
            </a>`).join("");
    }

    // ---------------- navegação, revelar ao rolar, progresso ----------------
    function ligarNavegacao() {
        const menu = $("#menu"), botao = $("#menuBotao"), topo = $("#topo");
        botao.addEventListener("click", () => {
            const aberto = menu.classList.toggle("aberto");
            botao.setAttribute("aria-expanded", aberto);
        });
        $$("a", menu).forEach((a) => a.addEventListener("click", () => {
            menu.classList.remove("aberto");
            botao.setAttribute("aria-expanded", "false");
        }));

        const links = $$("a[href^='#']", menu);
        const obsSecoes = new IntersectionObserver((ents) => {
            ents.forEach((e) => {
                if (!e.isIntersecting) return;
                links.forEach((a) => a.classList.toggle("ativo", a.getAttribute("href") === "#" + e.target.id));
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        $$("main > section[id]").forEach((s) => obsSecoes.observe(s));

        const barra = $("#progressoPagina");
        const aoRolar = () => {
            const h = document.documentElement;
            const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
            barra.style.transform = `scaleX(${p})`;
            topo.classList.toggle("rolado", h.scrollTop > 20);
        };
        window.addEventListener("scroll", aoRolar, { passive: true });
        aoRolar();
    }

    function ligarRevelar() {
        const alvos = $$(".revelar");
        if (MOVIMENTO_REDUZIDO || !("IntersectionObserver" in window)) {
            alvos.forEach((a) => a.classList.add("visivel"));
            return;
        }
        const obs = new IntersectionObserver((ents) => {
            ents.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("visivel");
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        alvos.forEach((a) => obs.observe(a));
    }

    document.addEventListener("DOMContentLoaded", () => {
        $("#ano").textContent = new Date().getFullYear();
        montarVitrine();
        montarCasos();
        montarNumeros();
        montarProjetos();
        montarHabilidades();
        montarContato();
        ligarNavegacao();
        ligarRevelar();
        if (window.DemoApp) DemoApp.init("#demoRoot");
        // link direto para um sistema: #sistema-otif
        if (location.hash.startsWith("#sistema-")) setTimeout(() => abrirCaso(location.hash.slice(9)), 300);
    });
})();
