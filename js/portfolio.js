// ============================================================
//  Renderização do portfólio + interações (vanilla JS).
// ============================================================
(function () {
    "use strict";

    const $ = (sel) => document.querySelector(sel);

    // ---------- HERO: chips da stack ----------
    function renderHeroStack() {
        $("#heroStack").innerHTML = HERO_STACK
            .map((t) => `<span class="chip">${t}</span>`)
            .join("");
    }

    // ---------- SOBRE: estatísticas ----------
    function renderStats() {
        $("#stats").innerHTML = STATS
            .map((e) => `
                <div class="stat">
                    <span class="stat-valor">${e.valor}</span>
                    <span class="stat-rotulo">${e.rotulo}</span>
                </div>`)
            .join("");
    }

    // ---------- SKILLS ----------
    function renderSkills() {
        $("#skillsGrid").innerHTML = SKILLS
            .map((s) => `
                <div class="skill-card">
                    <div class="skill-head">
                        <span class="skill-icone">${s.icone}</span>
                        <h3>${s.nome}</h3>
                    </div>
                    <div class="skill-itens">
                        ${s.itens.map((i) => `<span class="tag">${i}</span>`).join("")}
                    </div>
                </div>`)
            .join("");
    }

    // ---------- PROJETOS + filtro ----------
    let categoriaAtiva = "Todos";

    function categorias() {
        return ["Todos", ...new Set(PROJETOS.map((p) => p.categoria))];
    }

    function cardProjeto(p) {
        const links = p.url || p.repo
            ? `<div class="projeto-links">
                    ${p.url ? `<a href="${p.url}" class="link-proj">Ver demo ↓</a>` : ""}
                    ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener" class="link-proj link-repo">Código ↗</a>` : ""}
               </div>`
            : "";
        return `
            <article class="projeto-card" style="--accent:${p.cor}">
                <div class="projeto-top">
                    <span class="projeto-icone">${p.icone}</span>
                    <div class="projeto-badges">
                        <span class="badge-cat">${p.categoria}</span>
                    </div>
                </div>
                <h3 class="projeto-nome">${p.nome}</h3>
                <p class="projeto-sub">${p.subtitulo}</p>
                <p class="projeto-desc">${p.descricao}</p>
                <ul class="projeto-destaques">
                    ${p.destaques.map((d) => `<li>${d}</li>`).join("")}
                </ul>
                <div class="projeto-techs">
                    ${p.tecnologias.map((t) => `<span class="tag tag-sm">${t}</span>`).join("")}
                </div>
                ${links}
            </article>`;
    }

    function renderProjetos() {
        const lista = categoriaAtiva === "Todos"
            ? PROJETOS
            : PROJETOS.filter((p) => p.categoria === categoriaAtiva);
        $("#projetosGrid").innerHTML = lista.map(cardProjeto).join("");
    }

    function renderFiltros() {
        $("#filtros").innerHTML = categorias()
            .map((c) => `<button class="filtro${c === categoriaAtiva ? " ativo" : ""}" data-cat="${c}">${c}</button>`)
            .join("");
        $("#filtros").querySelectorAll(".filtro").forEach((btn) => {
            btn.addEventListener("click", () => {
                categoriaAtiva = btn.dataset.cat;
                renderFiltros();
                renderProjetos();
            });
        });
    }

    // ---------- NAVBAR (menu mobile) ----------
    function initNav() {
        const links = $("#navLinks");
        $("#navToggle").addEventListener("click", () => links.classList.toggle("open"));
        links.querySelectorAll("a").forEach((a) =>
            a.addEventListener("click", () => links.classList.remove("open"))
        );
    }

    // ---------- Loader ----------
    function hideLoader() {
        const loader = $("#loader");
        if (!loader) return;
        loader.style.opacity = "0";
        setTimeout(() => loader.remove(), 400);
    }

    // ---------- Boot ----------
    document.addEventListener("DOMContentLoaded", () => {
        $("#ano").textContent = new Date().getFullYear();
        renderHeroStack();
        renderStats();
        renderSkills();
        renderFiltros();
        renderProjetos();
        if (window.DemoApp) DemoApp.init("#demoRoot");
    });

    window.addEventListener("load", () => setTimeout(hideLoader, 250));
})();
