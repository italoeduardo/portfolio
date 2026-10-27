/* (c) 2026 Italo Eduardo. Todos os direitos reservados. Proibida a cópia, modificação ou uso sem autorização por escrito. */
(function(){"use strict";const s=(t,a=document)=>a.querySelector(t),u=(t,a=document)=>[...a.querySelectorAll(t)],{Player:$,quadroTela:f,quadroTranscritor:I,MOVIMENTO_REDUZIDO:v}=window.Vitrine,i=t=>String(t).replace(/[&<>"]/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[a]),g={};function h(t){const a=document.getElementById(t);a&&(a.scrollIntoView({behavior:v?"auto":"smooth",block:"start"}),history.replaceState(null,"","#"+t))}function E(){const t=VITRINE.map((e,o)=>e.animacao?I():f(e.telas[0].img,`${e.nome}: ${e.telas[0].legenda}`,o===0)),a=s("#vitrineChips");a.innerHTML=VITRINE.map((e,o)=>`
            <button class="chip" role="tab" data-i="${o}" style="--cor:${e.cor}" aria-label="Ver ${i(e.nome)}">
                <span class="chip-ponto"></span>${i(e.nome)}
            </button>`).join("");const r=s("#vitrineLegenda"),c=s("#vitrineJanela"),d=s("#vitrinePausa"),n=new $({tela:s("#vitrineTela"),quadros:t,duracao:7500,barras:s("#vitrineBarras"),hover:c,aoMudar:e=>{const o=VITRINE[e];s("#vitrine").style.setProperty("--cor",o.cor),s("#vitrineUrl").textContent=o.url,r.innerHTML=`
                    <div>
                        <span class="pill">${i(o.categoria)}</span>
                        <strong>${i(o.nome)}</strong>
                        <span class="vitrine-chamada">${i(o.chamada)}</span>
                    </div>
                    <button class="botao botao-pequeno" data-ir="sistema-${o.id}">Conhecer o sistema ↓</button>`,u(".chip",a).forEach((p,l)=>{p.classList.toggle("ativo",l===e),p.setAttribute("aria-selected",l===e)})},aoPausar:e=>{d.textContent=e?"❚❚":"▶",d.setAttribute("aria-label",e?"Pausar a vitrine":"Continuar a vitrine")}});v&&n.o.aoPausar(!1),d.addEventListener("click",e=>{e.stopPropagation(),n.alternar()}),r.addEventListener("click",e=>{const o=e.target.closest("[data-ir]");o&&m(o.dataset.ir.replace("sistema-",""))}),s("#vitrineTela").addEventListener("click",()=>m(VITRINE[n.i].id)),a.addEventListener("click",e=>{const o=e.target.closest(".chip");o&&(n.ir(+o.dataset.i),m(VITRINE[+o.dataset.i].id))})}function m(t){h("sistema-"+t);const a=g[t];a&&(a.ir(0),a.tocando||a.alternar())}function T(){const t=String(VITRINE.length).padStart(2,"0");s("#casos").innerHTML=VITRINE.map((a,r)=>`
            <article class="caso revelar" id="sistema-${a.id}" style="--cor:${a.cor}">
                <div class="caso-texto">
                    <div class="caso-topo">
                        <span class="caso-indice">${String(r+1).padStart(2,"0")}<i> / ${t}</i></span>
                        <span class="pill">${i(a.categoria)}</span>
                    </div>
                    <h3>${i(a.nome)}</h3>
                    <p class="caso-chamada">${i(a.chamada)}</p>
                    <p class="caso-descricao">${i(a.descricao)}</p>
                    <ul class="caso-destaques">${a.destaques.map(c=>`<li>${i(c)}</li>`).join("")}</ul>
                    <div class="caso-numeros">${a.numeros.map(c=>`<div><b>${i(c.v)}</b><span>${i(c.r)}</span></div>`).join("")}</div>
                    <div class="tags">${a.stack.map(c=>`<span class="tag">${i(c)}</span>`).join("")}</div>
                    <div class="caso-acoes">
                        ${LAB[a.id]?`<button class="botao botao-principal" data-testar="${a.id}">Testar ao vivo ▶</button>`:""}
                        ${a.link?`<a class="botao botao-vazado" href="${a.link}" target="_blank" rel="noopener">Ver no ar ↗</a>`:""}
                        <button class="botao botao-vazado" data-proximo="${r}">${r<VITRINE.length-1?"Próximo sistema ↓":"Testar ao vivo ↓"}</button>
                    </div>
                </div>
                <div class="caso-midia">
                    <div class="vitrine-barras"></div>
                    <div class="janela">
                        <div class="janela-barra"><span class="pontos"><i></i><i></i><i></i></span><span class="janela-url">${i(a.url)}</span></div>
                        <div class="janela-tela${a.animacao?" tela-app":""}"></div>
                    </div>
                    <p class="caso-legenda"></p>
                    <div class="miniaturas">${(a.telas||[]).map((c,d)=>`
                        <button class="miniatura" data-k="${d}" aria-label="${i(c.legenda)}">
                            <img src="assets/sistemas/${c.img}.webp" alt="" loading="lazy" decoding="async">
                        </button>`).join("")}</div>
                </div>
            </article>`).join(""),VITRINE.forEach(a=>{const r=s("#sistema-"+a.id),c=s(".caso-legenda",r),d=a.animacao?[I()]:a.telas.map(n=>f(n.img,`${a.nome}: ${n.legenda}`));g[a.id]=new $({tela:s(".janela-tela",r),quadros:d,duracao:a.animacao?6e4:6500,barras:d.length>1?s(".vitrine-barras",r):null,hover:s(".janela",r),aoMudar:n=>{c.textContent=a.animacao?"Interface do app recriada em HTML: legenda ao vivo e histórico por locutor":a.telas[n].legenda,u(".miniatura",r).forEach((e,o)=>e.classList.toggle("ativa",o===n))}}),r.addEventListener("click",n=>{const e=n.target.closest(".miniatura");e&&g[a.id].ir(+e.dataset.k);const o=n.target.closest("[data-testar]");o&&x(o.dataset.testar);const p=n.target.closest("[data-proximo]");if(p){const l=VITRINE[+p.dataset.proximo+1];l?m(l.id):h("demo")}})})}function j(){const t=s("#numeros");t.innerHTML=STATS.map(a=>`
            <li><b data-alvo="${a.valor}" data-sufixo="${i(a.sufixo)}">0</b><span>${i(a.rotulo)}</span></li>`).join(""),new IntersectionObserver((a,r)=>{a[0].isIntersecting&&(r.disconnect(),u("b[data-alvo]",t).forEach(c=>{const d=+c.dataset.alvo,n=c.dataset.sufixo;if(v){c.textContent=d+n;return}const e=performance.now(),o=p=>{const l=Math.min(1,(p-e)/1400);c.textContent=Math.round(d*(1-Math.pow(1-l,3)))+n,l<1&&requestAnimationFrame(o)};requestAnimationFrame(o)}))},{threshold:.5}).observe(t)}let b=()=>{};function k(){const t=Object.keys(LAB).filter(n=>VITRINE.some(e=>e.id===n)),a=s("#labAbas"),r=s("#labFrame");a.innerHTML=t.map(n=>{const e=VITRINE.find(o=>o.id===n);return`<button class="chip" role="tab" data-lab="${n}" style="--cor:${e.cor}"><span class="chip-ponto"></span>${i(LAB[n].rotulo||e.nome)}</button>`}).join("");let c=null,d=!1;b=n=>{const e=VITRINE.find(l=>l.id===n),o=LAB[n];if(!e||!o)return;c=n,s("#laboratorio").style.setProperty("--cor",e.cor),u(".chip",a).forEach(l=>{const L=l.dataset.lab===n;l.classList.toggle("ativo",L),l.setAttribute("aria-selected",L)});const p=`demos/${n}/index.html`;s("#labUrl").textContent=e.url,s("#labTela").href=p,s("#labDica").innerHTML=`<b>${i(e.nome)}</b> · ${i(o.dica)}${o.login?`<br><span>Acesso de demonstração: ${i(o.login)}</span>`:""}`,d&&(r.src=p)},a.addEventListener("click",n=>{const e=n.target.closest("[data-lab]");e&&b(e.dataset.lab)}),b(t[0]),new IntersectionObserver((n,e)=>{n[0].isIntersecting&&(e.disconnect(),d=!0,r.src=`demos/${c}/index.html`)},{rootMargin:"300px"}).observe(r)}function x(t){b(t),h("demo")}function M(){s("#listaProjetos").innerHTML=PROJETOS.map(t=>`
            <article class="projeto revelar">
                <div class="projeto-topo"><span class="projeto-icone">${t.icone}</span><span class="pill">${i(t.categoria)}</span></div>
                <h3>${i(t.nome)}</h3>
                <p>${i(t.descricao)}</p>
                <div class="tags">${t.tecnologias.map(a=>`<span class="tag">${i(a)}</span>`).join("")}</div>
                ${t.link?`<div class="projeto-links">
                    ${t.link?`<a class="projeto-link" href="${t.link}" target="_blank" rel="noopener">Ver no ar ↗</a>`:""}
                </div>`:""}
            </article>`).join("")}function R(){s("#listaHabilidades").innerHTML=SKILLS.map(t=>`
            <div class="habilidade revelar">
                <h3><span>${t.icone}</span>${i(t.nome)}</h3>
                <div class="tags">${t.itens.map(a=>`<span class="tag">${i(a)}</span>`).join("")}</div>
            </div>`).join("")}function V(){const t=[{href:"mailto:"+PERFIL.email,rotulo:PERFIL.email,icone:"✉️"},{href:PERFIL.linkedin,rotulo:"LinkedIn",icone:"in",externo:!0},{href:PERFIL.whatsapp,rotulo:"WhatsApp",icone:"💬",externo:!0}];s("#contatoLinks").innerHTML=t.map(a=>`
            <a class="contato-link" href="${a.href}"${a.externo?' target="_blank" rel="noopener"':""}>
                <span class="contato-icone">${a.icone}</span>${i(a.rotulo)}
            </a>`).join("")}function P(){const t=s("#menu"),a=s("#menuBotao"),r=s("#topo");a.addEventListener("click",()=>{const o=t.classList.toggle("aberto");a.setAttribute("aria-expanded",o)}),u("a",t).forEach(o=>o.addEventListener("click",()=>{t.classList.remove("aberto"),a.setAttribute("aria-expanded","false")}));const c=u("a[href^='#']",t),d=new IntersectionObserver(o=>{o.forEach(p=>{p.isIntersecting&&c.forEach(l=>l.classList.toggle("ativo",l.getAttribute("href")==="#"+p.target.id))})},{rootMargin:"-45% 0px -50% 0px"});u("main > section[id]").forEach(o=>d.observe(o));const n=s("#progressoPagina"),e=()=>{const o=document.documentElement,p=o.scrollTop/Math.max(1,o.scrollHeight-o.clientHeight);n.style.transform=`scaleX(${p})`,r.classList.toggle("rolado",o.scrollTop>20)};window.addEventListener("scroll",e,{passive:!0}),e()}function w(){const t=u(".revelar");if(v||!("IntersectionObserver"in window)){t.forEach(r=>r.classList.add("visivel"));return}const a=new IntersectionObserver(r=>{r.forEach(c=>{c.isIntersecting&&(c.target.classList.add("visivel"),a.unobserve(c.target))})},{threshold:.12});t.forEach(r=>a.observe(r))}document.addEventListener("DOMContentLoaded",()=>{s("#ano").textContent=new Date().getFullYear(),E(),T(),j(),M(),R(),V(),P(),w(),k(),location.hash.startsWith("#sistema-")&&setTimeout(()=>m(location.hash.slice(9)),300)})})();
