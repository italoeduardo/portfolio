/* (c) 2026 Italo Eduardo. Todos os direitos reservados. Proibida a cópia, modificação ou uso sem autorização por escrito. */
(function(){"use strict";const{JavaRandom:Z,Data:m,MESES:tt,Calendario:p,Fmt:r,Rota:v,esc:n}=window.Demo,b=90,at=["RJ","MG","ES"],et=["PR","SC","RS"],st=["DF","GO","MS","MT"],ot=["BA","SE","AL","PE","PB","RN","CE","PI","MA"];function w(t){return t==="SP"?"SP":at.includes(t)?"SE":et.includes(t)?"S":st.includes(t)?"CO":ot.includes(t)?"NE":"N"}function it(t){return{SP:2,SE:3,S:4,CO:4,NE:6}[w(t)]??8}const R=[["SP","São Paulo",30],["SP","Campinas",8],["SP","Ribeirão Preto",5],["RJ","Rio de Janeiro",9],["RJ","Niterói",3],["MG","Belo Horizonte",8],["MG","Uberlândia",3],["ES","Vitória",2],["PR","Curitiba",6],["SC","Florianópolis",3],["SC","Joinville",2],["RS","Porto Alegre",5],["GO","Goiânia",4],["DF","Brasília",4],["MS","Campo Grande",2],["MT","Cuiabá",2],["BA","Salvador",5],["PE","Recife",4],["CE","Fortaleza",3],["RN","Natal",1],["PA","Belém",3],["AM","Manaus",2],["TO","Palmas",1]],N=[["Expresso Horizonte",.05],["RotaSul Log",.09],["TransVale Cargas",.13],["Ágil Express",.17]],M=["Mercado","Supermercado","Empório","Atacado","Casa & Construção","Drogaria","Hiper","Distribuidora","Mercearia","Loja"],U=["Bom Preço","Estrela","Santa Clara","Nova Era","Ponto Certo","Alvorada","Sol Nascente","Primavera","Boa Vista","Central","União","Progresso"],k=["Ana Ribeiro","Bruno Tavares","Carla Mendes","Diego Freitas","Elisa Prado","Fábio Nunes","Gabriela Rocha","Henrique Sales"];function dt(t){const a=new Z(42),e=[];for(let l=0;l<45;l++)e.push(M[l%M.length]+" "+U[l*7%U.length]+(l>=M.length*2?" "+String.fromCharCode(65+l%6):""));const s=R.reduce((l,E)=>l+E[2],0),i=()=>{let l=a.nextInt(s);for(const E of R)if(l-=E[2],l<0)return E;return R[0]},d=m.comDia(m.somarMeses(t,-5),1),u=m.comDia(m.somarMeses(t,-2),1),o=m.somarMeses(u,1),c=[];let h=10001,bt=1;for(let l=d;l<=t;l++){if(!p.isDiaUtil(l))continue;const E=9+a.nextInt(7);for(let J=0;J<E;J++){const Q=i(),F=Q[0],X=N[a.nextInt(N.length)],y=X[0];let S=X[1];const D=w(F);(D==="N"||D==="NE")&&(S+=.07),y==="RotaSul Log"&&D==="S"&&(S-=.05),y==="Ágil Express"&&l>=u&&l<o&&(S+=.25);const I=it(F),K=p.somarDiasUteis(l,I);let P;if(a.nextDouble()<S)P=p.somarDiasUteis(K,1+a.nextInt(a.nextDouble()<.8?2:5));else{const $t=a.nextInt(Math.min(I,3));P=p.somarDiasUteis(l,Math.max(1,I-$t))}(P>t||!(t>p.somarDiasUteis(l,10))&&a.nextDouble()<.06)&&(P=null);const T=5+a.nextInt(116);let Y=T;a.nextDouble()<.07&&(Y=T-(1+a.nextInt(Math.min(6,T-1))));const gt=((18+a.nextInt(78))*100+a.nextInt(100))*T/100;c.push({id:bt++,numero:"PV-"+h++,cliente:e[a.nextInt(e.length)],uf:F,cidade:Q[1],transportadora:y,vendedor:k[a.nextInt(k.length)],dataFaturamento:l,prazoDiasUteis:I,dataPrevista:K,dataEntrega:P,qtdPedida:T,qtdAtendida:Y,valor:gt})}}return c}const z={OTIF:["No prazo e completo","success"],ATRASADO:["Atrasado","warning"],INCOMPLETO:["Com corte","warning"],ATRASADO_E_INCOMPLETO:["Atrasado e com corte","danger"],EM_ROTA:["Em rota, dentro do prazo","secondary"],EM_RISCO:["Em rota, prazo estourado","danger"]},A=t=>t===1?"1 dia útil":t+" dias úteis";function L(t,a){const e=Math.max(0,t.qtdPedida-t.qtdAtendida),s=e===0;let i;if(t.dataEntrega==null){const d=Math.max(0,p.diasUteisEntre(t.dataPrevista,a));i={pedido:t,situacao:d>0?"EM_RISCO":"EM_ROTA",onTime:d===0,inFull:s,diasAtraso:d,unidadesCortadas:e}}else{const d=Math.max(0,p.diasUteisEntre(t.dataPrevista,t.dataEntrega)),u=d===0;i={pedido:t,situacao:u&&s?"OTIF":!u&&!s?"ATRASADO_E_INCOMPLETO":u?"INCOMPLETO":"ATRASADO",onTime:u,inFull:s,diasAtraso:d,unidadesCortadas:e}}return i.realizado=t.dataEntrega!=null,i.otif=i.situacao==="OTIF",i}function B(t){const a=t.pedido.qtdPedida;switch(t.situacao){case"OTIF":return"Entregue no prazo e sem cortes.";case"ATRASADO":return`Entregue com ${A(t.diasAtraso)} de atraso.`;case"INCOMPLETO":return`Entregue no prazo, mas faltaram ${t.unidadesCortadas} de ${a} unidades.`;case"ATRASADO_E_INCOMPLETO":return`Atraso de ${A(t.diasAtraso)} e faltaram ${t.unidadesCortadas} de ${a} unidades.`;case"EM_ROTA":return"Ainda em rota e dentro do prazo prometido.";default:return`Ainda em rota e já ${A(t.diasAtraso)} além do prazo.`}}const g=m.hoje(),O=dt(g),_=new Map(O.map(t=>[t.id,t])),rt=[...new Set(O.map(t=>t.uf))].sort(),lt=[...new Set(O.map(t=>t.transportadora))].sort(),nt=[...O].sort((t,a)=>a.dataFaturamento-t.dataFaturamento||(a.numero<t.numero?-1:1));function ct(t){let a=m.deIso(t.get("inicio")),e=m.deIso(t.get("fim"));return a!=null&&e!=null&&e<a&&([a,e]=[e,a]),{inicio:a??m.comDia(m.somarMeses(g,-5),1),fim:e??g,uf:t.get("uf")||null,transportadora:t.get("transportadora")||null}}const q=t=>({inicio:m.iso(t.inicio),fim:m.iso(t.fim),uf:t.uf,transportadora:t.transportadora});function j(t){return nt.filter(a=>a.dataFaturamento>=t.inicio&&a.dataFaturamento<=t.fim&&(!t.uf||a.uf===t.uf)&&(!t.transportadora||a.transportadora===t.transportadora)).map(a=>L(a,g))}function f(t,a){return t.length?Math.round(t.filter(a).length*1e3/t.length)/10:0}function C(t,a,e){const s=new Map;return t.forEach(i=>{const d=a(i.pedido);(s.get(d)||s.set(d,[]).get(d)).push(i)}),[...s.entries()].filter(([,i])=>i.length>=e).map(([i,d])=>({nome:i,entregues:d.length,falhas:d.filter(u=>!u.otif).length,otifPct:f(d,u=>u.otif)})).sort((i,d)=>i.otifPct-d.otifPct||d.falhas-i.falhas)}function mt(t){const a=j(t),e=a.filter(o=>o.realizado),s=a.filter(o=>o.situacao==="EM_RISCO"),i=new Map;e.forEach(o=>{const c=m.anoMes(o.pedido.dataFaturamento);(i.get(c)||i.set(c,[]).get(c)).push(o)});const d=[...i.keys()].sort((o,c)=>o-c).map(o=>{const c=i.get(o);return{mes:tt[o%100-1]+"/"+String(Math.floor(o/100)).slice(2),otif:f(c,h=>h.otif),onTime:f(c,h=>h.onTime),inFull:f(c,h=>h.inFull)}}),u=o=>e.filter(c=>c.situacao===o).length;return{entregues:e.length,emRota:a.filter(o=>o.situacao==="EM_ROTA").length,emRisco:s.length,otifPct:f(e,o=>o.otif),onTimePct:f(e,o=>o.onTime),inFullPct:f(e,o=>o.inFull),valorEmRisco:s.reduce((o,c)=>o+c.pedido.valor,0),mensal:d,porUf:C(e,o=>o.uf,0),porTransportadora:C(e,o=>o.transportadora,0),pioresClientes:C(e,o=>o.cliente,5).slice(0,8),motivos:{atraso:u("ATRASADO"),corte:u("INCOMPLETO"),ambos:u("ATRASADO_E_INCOMPLETO")},falhasRecentes:e.filter(o=>!o.otif).slice(0,40)}}const $=document.getElementById("app");let x=[];const ut=t=>t>=b?"var(--verde)":t>=b-5?"var(--amarelo)":"var(--vermelho)",vt=t=>t>=b?"ok":t>=b-5?"alerta":"ruim",V=(t,a)=>`<span class="badge-sit text-bg-${z[t][1]} ${a||""}">${z[t][0]}</span>`,H=t=>`<a class="link-pedido" href="#/pedidos/${t.id}">${n(t.numero)}</a>`;function W(t,a){const e=(s,i)=>s.map(d=>`<option value="${n(d)}"${d===i?" selected":""}>${n(d)}</option>`).join("");return`
        <form class="filtros card-sla" id="formFiltros">
            <div class="row g-2 align-items-end">
                <div class="col-6 col-md-2"><label class="form-label" for="inicio">Faturados de</label>
                    <input class="form-control form-control-sm" type="date" id="inicio" name="inicio" value="${m.iso(t.inicio)}"></div>
                <div class="col-6 col-md-2"><label class="form-label" for="fim">até</label>
                    <input class="form-control form-control-sm" type="date" id="fim" name="fim" value="${m.iso(t.fim)}"></div>
                <div class="col-6 col-md-2"><label class="form-label" for="uf">UF destino</label>
                    <select class="form-select form-select-sm" id="uf" name="uf"><option value="">Todas</option>${e(rt,t.uf)}</select></div>
                <div class="col-6 col-md-3"><label class="form-label" for="transportadora">Transportadora</label>
                    <select class="form-select form-select-sm" id="transportadora" name="transportadora"><option value="">Todas</option>${e(lt,t.transportadora)}</select></div>
                <div class="col-12 col-md-3 d-flex gap-2">
                    <button class="btn btn-sm btn-primario flex-fill" type="submit">Filtrar</button>
                    <a class="btn btn-sm btn-outline-secondary flex-fill" href="#${a}">Limpar</a>
                </div>
            </div>
        </form>`}function G(t,a){return`<tr>
            <td><a class="link-pedido text-reset" href="${a}">${n(t.nome)}</a></td>
            <td class="text-end">${r.inteiro(t.entregues)}</td>
            <td class="text-end">${r.inteiro(t.falhas)}</td>
            <td style="width: 40%"><div class="d-flex align-items-center gap-2">
                <div class="barra flex-fill"><span style="width:${t.otifPct}%;background:${ut(t.otifPct)}"></span></div>
                <b>${r.pct(t.otifPct)}</b></div></td>
        </tr>`}function pt(t){const a=mt(t),e=q(t);$.innerHTML=`
        <div class="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3"><div>
            <h1 class="titulo">Painel de OTIF</h1>
            <div class="subtitulo">Pedidos faturados de <b>${r.data(t.inicio)}</b> a <b>${r.data(t.fim)}</b> · meta OTIF <b>${r.pct(b)}</b></div>
        </div></div>
        ${W(t,"/")}
        <div class="row g-3 mb-3">
            <div class="col-6 col-lg"><div class="card-sla kpi kpi-destaque"><div class="rotulo">OTIF</div>
                <div class="valor ${vt(a.otifPct)}">${r.pct(a.otifPct)}</div><div class="detalhe">no prazo <b>e</b> completo</div></div></div>
            <div class="col-6 col-lg"><div class="card-sla kpi"><div class="rotulo">On Time</div>
                <div class="valor">${r.pct(a.onTimePct)}</div><div class="detalhe">entregues até a data prevista</div></div></div>
            <div class="col-6 col-lg"><div class="card-sla kpi"><div class="rotulo">In Full</div>
                <div class="valor">${r.pct(a.inFullPct)}</div><div class="detalhe">entregues sem corte</div></div></div>
            <div class="col-6 col-lg"><div class="card-sla kpi"><div class="rotulo">Entregues</div>
                <div class="valor">${r.inteiro(a.entregues)}</div><div class="detalhe"><span>${r.inteiro(a.emRota)}</span> ainda em rota no prazo</div></div></div>
            <div class="col-12 col-lg"><a class="text-decoration-none text-reset" href="${v.href("/risco",e)}">
                <div class="card-sla kpi"><div class="rotulo">Em risco</div>
                <div class="valor ${a.emRisco>0?"ruim":"ok"}">${r.inteiro(a.emRisco)}</div>
                <div class="detalhe"><span>${r.moeda(a.valorEmRisco)}</span> em rota com prazo estourado →</div></div></a></div>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-lg-8"><div class="card-sla"><div class="secao-titulo">Tendência mensal <small>por mês de faturamento</small></div>
                <div class="grafico"><canvas id="graficoMensal"></canvas></div></div></div>
            <div class="col-lg-4"><div class="card-sla h-100"><div class="secao-titulo">Por que os pedidos falham
                <small>${r.inteiro(a.motivos.atraso+a.motivos.corte+a.motivos.ambos)} falhas</small></div>
                <div class="grafico"><canvas id="graficoMotivos"></canvas></div></div></div>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-lg-6"><div class="card-sla h-100"><div class="secao-titulo">OTIF por transportadora <small>pior → melhor</small></div>
                <table class="table tabela"><thead><tr><th>Transportadora</th><th class="text-end">Entregues</th><th class="text-end">Falhas</th><th>OTIF</th></tr></thead>
                <tbody>${a.porTransportadora.map(s=>G(s,v.href("/",{...e,transportadora:s.nome}))).join("")}</tbody></table></div></div>
            <div class="col-lg-6"><div class="card-sla h-100"><div class="secao-titulo">OTIF por UF de destino <small>pior → melhor</small></div>
                <div style="max-height: 300px; overflow-y: auto"><table class="table tabela">
                <thead><tr><th>UF</th><th class="text-end">Entregues</th><th class="text-end">Falhas</th><th>OTIF</th></tr></thead>
                <tbody>${a.porUf.map(s=>G(s,v.href("/",{...e,uf:s.nome}))).join("")}</tbody></table></div></div></div>
        </div>
        <div class="row g-3">
            <div class="col-lg-4"><div class="card-sla h-100"><div class="secao-titulo">Clientes mais afetados <small>mín. 5 entregas</small></div>
                <table class="table tabela"><thead><tr><th>Cliente</th><th class="text-end">Falhas</th><th class="text-end">OTIF</th></tr></thead>
                <tbody>${a.pioresClientes.map(s=>`<tr><td>${n(s.nome)}</td><td class="text-end">${s.falhas}/${s.entregues}</td><td class="text-end fw-semibold">${r.pct(s.otifPct)}</td></tr>`).join("")}</tbody></table></div></div>
            <div class="col-lg-8"><div class="card-sla h-100"><div class="secao-titulo">Falhas mais recentes <small>clique no pedido para ver o detalhe</small></div>
                <div style="max-height: 360px; overflow-y: auto"><table class="table tabela table-hover">
                <thead><tr><th>Pedido</th><th>Cliente</th><th>Destino</th><th>Transportadora</th><th>Situação</th><th>Motivo</th></tr></thead>
                <tbody>${a.falhasRecentes.map(s=>`<tr><td>${H(s.pedido)}</td><td>${n(s.pedido.cliente)}</td>
                    <td>${n(s.pedido.cidade+"/"+s.pedido.uf)}</td><td>${n(s.pedido.transportadora)}</td>
                    <td>${V(s.situacao)}</td><td class="text-secondary">${n(B(s))}</td></tr>`).join("")}</tbody></table></div></div></div>
        </div>
        <p class="rodape">Versão de demonstração rodando no navegador, com as mesmas regras e os mesmos dados fictícios do sistema em Java.</p>`,v.formulario(document.getElementById("formFiltros"),"/"),Chart.defaults.font.family='system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',Chart.defaults.color="#64748b",x.push(new Chart(document.getElementById("graficoMensal"),{type:"line",data:{labels:a.mensal.map(s=>s.mes),datasets:[{label:"OTIF",data:a.mensal.map(s=>s.otif),borderColor:"#1d4ed8",backgroundColor:"rgba(29,78,216,.08)",borderWidth:3,fill:!0,tension:.3,pointRadius:4},{label:"On Time",data:a.mensal.map(s=>s.onTime),borderColor:"#16a34a",borderDash:[6,4],borderWidth:2,tension:.3,pointRadius:2},{label:"In Full",data:a.mensal.map(s=>s.inFull),borderColor:"#d97706",borderDash:[6,4],borderWidth:2,tension:.3,pointRadius:2},{label:"Meta",data:a.mensal.map(()=>b),borderColor:"#dc2626",borderWidth:1.5,pointRadius:0,borderDash:[2,3]}]},options:{maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},scales:{y:{suggestedMin:60,suggestedMax:100,ticks:{callback:s=>s+"%"}}},plugins:{legend:{position:"bottom",labels:{usePointStyle:!0,boxWidth:8}},tooltip:{callbacks:{label:s=>`${s.dataset.label}: ${s.parsed.y.toLocaleString("pt-BR")}%`}}}}})),x.push(new Chart(document.getElementById("graficoMotivos"),{type:"doughnut",data:{labels:["Atraso","Corte","Atraso + corte"],datasets:[{data:[a.motivos.atraso,a.motivos.corte,a.motivos.ambos],backgroundColor:["#f59e0b","#6366f1","#dc2626"],borderWidth:0}]},options:{maintainAspectRatio:!1,cutout:"62%",plugins:{legend:{position:"bottom",labels:{usePointStyle:!0,boxWidth:8}}}}}))}function ft(t){const a=j(t).filter(e=>e.situacao==="EM_RISCO").sort((e,s)=>s.diasAtraso-e.diasAtraso||s.pedido.valor-e.pedido.valor);$.innerHTML=`
        <div class="mb-3"><h1 class="titulo">Pedidos em risco</h1>
            <div class="subtitulo">Ainda em rota e já depois da data prevista — a logística precisa agir antes de virar falha.</div></div>
        ${W(t,"/risco")}
        <div class="card-sla"><div class="secao-titulo"><span>${a.length} pedido(s)</span><small>ordenado por dias de atraso</small></div>
        ${a.length===0?'<div class="text-center text-secondary py-5">Nenhum pedido em risco neste filtro. 🎉</div>':`
        <div class="table-responsive"><table class="table tabela table-hover"><thead><tr>
            <th>Pedido</th><th>Cliente</th><th>Destino</th><th>Transportadora</th><th>Faturado</th><th>Previsto</th><th class="text-end">Atraso</th><th class="text-end">Valor</th>
        </tr></thead><tbody>${a.map(e=>`<tr><td>${H(e.pedido)}</td><td>${n(e.pedido.cliente)}</td>
            <td>${n(e.pedido.cidade+"/"+e.pedido.uf)}</td><td>${n(e.pedido.transportadora)}</td>
            <td>${r.data(e.pedido.dataFaturamento)}</td><td>${r.data(e.pedido.dataPrevista)}</td>
            <td class="text-end"><span class="badge-sit ${e.diasAtraso>=3?"text-bg-danger":"text-bg-warning"}">${A(e.diasAtraso)}</span></td>
            <td class="text-end">${r.moeda(e.pedido.valor)}</td></tr>`).join("")}</tbody></table></div>`}
        </div>`,v.formulario(document.getElementById("formFiltros"),"/risco")}function ht(t){const a=_.get(t);if(!a){$.innerHTML='<div class="card-sla text-center py-5">Pedido não encontrado. <a href="#/">Voltar ao painel</a></div>';return}const e=L(a,g),s=d=>`<b class="${d?"ok":"ruim"}">${d?"sim":"não"}</b>`,i=a.dataEntrega==null?e.diasAtraso>0?"ruim pendente":"pendente":e.onTime?"ok":"ruim";$.style.maxWidth="980px",$.innerHTML=`
        <a class="text-secondary text-decoration-none small" href="javascript:history.back()">← voltar</a>
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mt-2 mb-3">
            <div><h1 class="titulo">Pedido ${n(a.numero)}</h1><div class="subtitulo">${n(a.cliente+" · "+a.cidade+"/"+a.uf)}</div></div>
            ${V(e.situacao,"fs-6")}
        </div>
        <div class="card-sla mb-3"><div class="secao-titulo">Diagnóstico</div>
            <p class="fs-5 mb-1">${n(B(e))}</p>
            <div class="d-flex gap-4 mt-2 small"><span>On Time: ${s(e.onTime)}</span><span>In Full: ${s(e.inFull)}</span></div>
            <div class="linha-tempo">
                <div class="marco"><div class="ponto"></div><b>Faturado</b><span>${r.data(a.dataFaturamento)}</span></div>
                <div class="marco"><div class="ponto"></div><b>Prazo prometido</b><span>${r.data(a.dataPrevista)} (D+${a.prazoDiasUteis} úteis)</span></div>
                <div class="marco"><div class="ponto ${i}"></div><b>${a.dataEntrega!=null?"Entregue":"Em rota"}</b>
                    <span>${a.dataEntrega!=null?r.data(a.dataEntrega):"hoje é "+r.data(g)}</span></div>
            </div>
        </div>
        <div class="row g-3">
            <div class="col-md-6"><div class="card-sla h-100"><div class="secao-titulo">Quantidades</div><table class="table tabela">
                <tr><td>Pedida</td><td class="text-end fw-semibold">${a.qtdPedida}</td></tr>
                <tr><td>Atendida</td><td class="text-end fw-semibold">${a.qtdAtendida}</td></tr>
                <tr><td>Cortada</td><td class="text-end fw-semibold ${e.unidadesCortadas>0?"ruim":""}">${e.unidadesCortadas}</td></tr>
                <tr><td>Valor do pedido</td><td class="text-end fw-semibold">${r.moeda(a.valor)}</td></tr></table></div></div>
            <div class="col-md-6"><div class="card-sla h-100"><div class="secao-titulo">Logística</div><table class="table tabela">
                <tr><td>Transportadora</td><td class="text-end fw-semibold">${n(a.transportadora)}</td></tr>
                <tr><td>Vendedor</td><td class="text-end fw-semibold">${n(a.vendedor)}</td></tr>
                <tr><td>Prazo</td><td class="text-end fw-semibold">D+${a.prazoDiasUteis} dias úteis</td></tr>
                <tr><td>Dias úteis de atraso</td><td class="text-end fw-semibold ${e.diasAtraso>0?"ruim":""}">${e.diasAtraso}</td></tr></table></div></div>
        </div>`}v.iniciar(({caminho:t,params:a})=>{x.forEach(d=>d.destroy()),x=[],$.style.maxWidth="";const e=/^\/pedidos\/(\d+)$/.exec(t);document.getElementById("navPainel").classList.toggle("ativo",t==="/"),document.getElementById("navRisco").classList.toggle("ativo",t==="/risco");const s=ct(a),i=q(s);document.getElementById("navPainel").href=v.href("/",i),document.getElementById("navRisco").href=v.href("/risco",i),e?(ht(+e[1]),document.title="OTIF · "+(_.get(+e[1])?.numero||"Pedido")):t==="/risco"?(ft(s),document.title="OTIF · Em risco"):(pt(s),document.title="OTIF · Painel")})})();
