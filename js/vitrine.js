// ============================================================
//  Vitrine "em vídeo": player de telas que rolam sozinhas.
//  Cada quadro é uma captura de página inteira; enquanto o quadro
//  está ativo, a imagem rola de cima para baixo como uma gravação
//  de tela. Barras de progresso no estilo stories.
// ============================================================
(function () {
    "use strict";

    const MOVIMENTO_REDUZIDO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const suave = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    class Player {
        /**
         * @param {object} o
         * @param {HTMLElement} o.tela        onde os quadros ficam empilhados
         * @param {HTMLElement[]} o.quadros   elementos .quadro (podem ter img.rolavel ou ser animados)
         * @param {number} o.duracao          ms por quadro
         * @param {HTMLElement} [o.barras]    container das barras de progresso
         * @param {(i:number)=>void} [o.aoMudar]
         * @param {(tocando:boolean)=>void} [o.aoPausar]
         * @param {HTMLElement} [o.hover]     pausa enquanto o mouse estiver em cima
         */
        constructor(o) {
            this.o = o;
            this.i = 0;
            this.decorrido = 0;
            this.tocando = !MOVIMENTO_REDUZIDO;
            this.visivel = false;
            this.emCima = false;
            this.distancias = [];
            this.ultimo = 0;

            o.quadros.forEach((q, idx) => {
                o.tela.appendChild(q);
                const img = q.querySelector("img.rolavel");
                if (img) {
                    const medir = () => this.medir(idx);
                    img.complete ? medir() : img.addEventListener("load", medir, { once: true });
                }
            });

            if (o.barras) {
                o.barras.innerHTML = o.quadros.map(() => '<span class="barra"><i></i></span>').join("");
            }

            if (o.hover) {
                o.hover.addEventListener("mouseenter", () => { this.emCima = true; });
                o.hover.addEventListener("mouseleave", () => { this.emCima = false; });
            }

            new IntersectionObserver((ents) => {
                this.visivel = ents[0].isIntersecting;
                this.atualizarAnimacao();
            }, { threshold: 0.25 }).observe(o.tela);

            document.addEventListener("visibilitychange", () => this.atualizarAnimacao());
            window.addEventListener("resize", () => o.quadros.forEach((_, idx) => this.medir(idx)));

            this.ir(0);
            requestAnimationFrame((t) => this.passo(t));
        }

        medir(idx) {
            const img = this.o.quadros[idx].querySelector("img.rolavel");
            if (!img) return;
            const sobra = img.offsetHeight - this.o.tela.clientHeight;
            this.distancias[idx] = sobra > 0 ? -sobra : 0;
        }

        rodando() {
            return this.tocando && this.visivel && !this.emCima && !document.hidden;
        }

        passo(t) {
            const dt = this.ultimo ? Math.min(t - this.ultimo, 100) : 0;
            this.ultimo = t;
            if (this.rodando()) this.decorrido += dt;

            const p = Math.min(1, this.decorrido / this.o.duracao);
            this.pintar(p);
            if (p >= 1) this.ir((this.i + 1) % this.o.quadros.length);
            requestAnimationFrame((tt) => this.passo(tt));
        }

        pintar(p) {
            const barra = this.o.barras?.children[this.i]?.firstElementChild;
            if (barra) barra.style.transform = `scaleX(${p})`;
            const img = this.o.quadros[this.i].querySelector("img.rolavel");
            if (img && !MOVIMENTO_REDUZIDO) {
                // segura no topo, rola, e segura no fim antes de trocar
                const r = suave(Math.min(1, Math.max(0, (p - 0.14) / 0.74)));
                img.style.transform = `translateY(${(this.distancias[this.i] || 0) * r}px)`;
            }
        }

        ir(idx) {
            const anterior = this.o.quadros[this.i];
            anterior.classList.remove("ativo");
            anterior._parar?.();
            this.i = idx;
            this.decorrido = 0;
            const atual = this.o.quadros[idx];
            atual.classList.add("ativo");
            const img = atual.querySelector("img.rolavel");
            if (img) img.style.transform = "translateY(0)";
            [...(this.o.barras?.children || [])].forEach((b, k) => {
                b.classList.toggle("feita", k < idx);
                b.firstElementChild.style.transform = k < idx ? "scaleX(1)" : "scaleX(0)";
                b.classList.toggle("atual", k === idx);
            });
            this.atualizarAnimacao();
            this.o.aoMudar?.(idx);
        }

        /** Quadros animados (ex.: Transcritor) só rodam quando ativos e visíveis. */
        atualizarAnimacao() {
            const q = this.o.quadros[this.i];
            if (!q._iniciar) return;
            (this.visivel && !document.hidden) ? q._iniciar() : q._parar();
        }

        proximo() { this.ir((this.i + 1) % this.o.quadros.length); }
        anterior() { this.ir((this.i - 1 + this.o.quadros.length) % this.o.quadros.length); }

        alternar() {
            this.tocando = !this.tocando;
            this.o.aoPausar?.(this.tocando);
        }
    }

    function quadroTela(nomeImg, alt, prioridade) {
        const q = document.createElement("div");
        q.className = "quadro";
        const img = new Image();
        img.className = "rolavel";
        img.alt = alt;
        img.decoding = "async";
        if (!prioridade) img.loading = "lazy";
        img.src = `assets/sistemas/${nomeImg}.webp`;
        q.appendChild(img);
        return q;
    }

    // ---------- Transcritor de Reunião: interface do app recriada em HTML ----------
    const FALAS = [
        { quem: "Outros", texto: "Bom dia, pessoal. Vamos começar pelo fechamento de setembro?" },
        { quem: "Você", texto: "Bora. O OTIF fechou em oitenta e quatro por cento, dois pontos acima de agosto." },
        { quem: "Outros", texto: "E o que puxou essa melhora?" },
        { quem: "Você", texto: "Principalmente a transportadora do Nordeste, que reduziu os atrasos pela metade." },
        { quem: "Outros", texto: "Ótimo. Consegue mandar o painel com o detalhe por região até amanhã?" },
        { quem: "Você", texto: "Consigo, já sai filtrado por região e com os pedidos em risco." },
    ];

    function quadroTranscritor() {
        const q = document.createElement("div");
        q.className = "quadro transcritor";
        q.innerHTML = `
            <div class="tr-app">
                <div class="tr-topo">
                    <span class="tr-gravando"><i></i> Gravando</span>
                    <span class="tr-relogio">00:00:00</span>
                    <span class="tr-botao">Salvar .txt</span>
                </div>
                <div class="tr-fontes">
                    <div class="tr-fonte"><span>🎙️ Microfone · Você</span><div class="tr-nivel" data-fonte="Você">${"<b></b>".repeat(18)}</div></div>
                    <div class="tr-fonte"><span>🔊 Som do sistema · Outros</span><div class="tr-nivel" data-fonte="Outros">${"<b></b>".repeat(18)}</div></div>
                </div>
                <div class="tr-historico"></div>
                <div class="tr-legenda"><span class="tr-quem"></span><span class="tr-texto"></span><span class="tr-cursor"></span></div>
            </div>`;

        const hist = q.querySelector(".tr-historico");
        const quem = q.querySelector(".tr-quem");
        const texto = q.querySelector(".tr-texto");
        const relogio = q.querySelector(".tr-relogio");
        const niveis = [...q.querySelectorAll(".tr-nivel")];
        let timer = null, segundos = 754, fala = 0, letra = 0, espera = 0;

        function tique() {
            // relógio
            if (Math.random() < 0.1) {
                segundos++;
                const h = String(Math.floor(segundos / 3600)).padStart(2, "0");
                const m = String(Math.floor(segundos / 60) % 60).padStart(2, "0");
                const s = String(segundos % 60).padStart(2, "0");
                relogio.textContent = `${h}:${m}:${s}`;
            }
            const f = FALAS[fala];
            // medidores: só a fonte que está falando se mexe
            niveis.forEach((n) => {
                const ativo = n.dataset.fonte === f.quem && espera === 0;
                [...n.children].forEach((b) => {
                    b.style.transform = `scaleY(${ativo ? 0.2 + Math.random() * 0.8 : 0.08})`;
                });
            });
            if (espera > 0) { espera--; return; }
            quem.textContent = f.quem;
            quem.dataset.quem = f.quem;
            letra = Math.min(f.texto.length, letra + 2);
            texto.textContent = f.texto.slice(0, letra);
            if (letra >= f.texto.length) {
                // fim da fala: sobe para o histórico
                const linha = document.createElement("div");
                linha.className = "tr-linha";
                linha.innerHTML = `<b data-quem="${f.quem}">${f.quem}</b><span></span>`;
                linha.querySelector("span").textContent = f.texto;
                hist.appendChild(linha);
                while (hist.children.length > 4) hist.firstElementChild.remove();
                fala = (fala + 1) % FALAS.length;
                if (fala === 0) hist.innerHTML = "";
                letra = 0;
                espera = 14;
                texto.textContent = "";
            }
        }

        q._iniciar = () => { if (!timer && !MOVIMENTO_REDUZIDO) timer = setInterval(tique, 60); };
        q._parar = () => { clearInterval(timer); timer = null; };
        if (MOVIMENTO_REDUZIDO) {
            // versão parada: mostra uma conversa já transcrita
            FALAS.slice(0, 4).forEach((f) => {
                const linha = document.createElement("div");
                linha.className = "tr-linha";
                linha.innerHTML = `<b data-quem="${f.quem}">${f.quem}</b><span>${f.texto}</span>`;
                hist.appendChild(linha);
            });
        }
        return q;
    }

    window.Vitrine = { Player, quadroTela, quadroTranscritor, MOVIMENTO_REDUZIDO };
})();
