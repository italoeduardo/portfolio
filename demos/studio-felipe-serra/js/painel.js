/* =========================================================
   STUDIO FELIPE SERRA — Painel do Barbeiro
   Conectado à API real (backend .NET).
   ========================================================= */
(function () {
  'use strict';

  /* ====== CONFIG ====== */
  const API_BASE = 'https://api.studiofelipeserra.com';
  const TOKEN_KEY = 'sfs_painel_token';   // token emitido pelo login (a senha fica só no servidor)
  const SHOP_PHONE = '5561982307942';

  const SERVICES = [
    { id: 'corte-cabelo',      name: 'Corte de cabelo',                 price: 50,  dur: 30 },
    { id: 'corte-maquina',     name: 'Corte máquina',                   price: 40,  dur: 30 },
    { id: 'corte-barba',       name: 'Corte e barba',                   price: 90,  dur: 60 },
    { id: 'barba-express',     name: 'Barba express',                   price: 20,  dur: 30 },
    { id: 'barba-completa',    name: 'Barba completa',                  price: 50,  dur: 30 },
    { id: 'sobrancelha',       name: 'Sobrancelha',                     price: 20,  dur: 30 },
    { id: 'epilacao-combo',    name: 'Epilação combo nariz e orelha',   price: 30,  dur: 30 },
    { id: 'epilacao-nariz',    name: 'Epilação nariz',                  price: 20,  dur: 30 },
    { id: 'epilacao-olheira',  name: 'Epilação olheira',                price: 20,  dur: 30 },
    { id: 'hidratacao-ozonio', name: 'Hidratação do ozônio terapia',    price: 35,  dur: 30 },
    { id: 'limpeza-pele',      name: 'Limpeza de pele',                 price: 30,  dur: 30 },
    { id: 'esfoliacao',        name: 'Esfoliação',                      price: 30,  dur: 30 },
    { id: 'penteado',          name: 'Penteado',                        price: 20,  dur: 30 },
    { id: 'camuflagem',        name: 'Camuflagem',                      price: 30,  dur: 30 },
    { id: 'relaxamento-capilar', name: 'Relaxamento capilar',            price: 100, dur: 60 },
    { id: 'acabamento',        name: 'Acabamento',                      price: 15,  dur: 30 },
    { id: 'barbaterapia',      name: 'Barbaterapia',                    price: 70,  dur: 60 },
    // Descontinuados: só existem pra reconhecer agendamentos antigos (não aparecem pra escolher)
    { id: 'progressiva',       name: 'Progressiva',                     price: 100, dur: 60, legacy: true },
    { id: 'botox',             name: 'Botox',                           price: 50,  dur: 60, legacy: true },
    { id: 'selagem',           name: 'Selagem',                         price: 80,  dur: 60, legacy: true },
  ];
  const svc = id => SERVICES.find(s => s.id === id);
  const svcMany = ids => Array.from(ids || []).map(svc).filter(Boolean);
  const sumDur = ids => svcMany(ids).reduce((sum, s) => sum + s.dur, 0);
  const sumPrice = ids => svcMany(ids).reduce((sum, s) => sum + s.price, 0);

  // 0=Dom … 6=Sáb  → [abre, fecha] em horas (24h) ou null (fechado)
  const SCHEDULE = { 0: null, 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 19] };

  const STATUS = {
    pendente:   { label: 'Pendente',  color: 'var(--st-pendente)' },
    confirmado: { label: 'Confirmado',color: 'var(--st-confirmado)' },
    concluido:  { label: 'Concluído', color: 'var(--st-concluido)' },
    cancelado:  { label: 'Cancelado', color: 'var(--st-cancelado)' },
    falta:      { label: 'Faltou',    color: 'var(--st-falta)' },
    bloqueio:   { label: 'Bloqueio',  color: 'var(--st-bloqueio)' },
  };

  const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const WEEKDAYS_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const PXMIN = 1.8;

  /* ====== HELPERS ====== */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');
  const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const t2m = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const m2t = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const todayKey = () => toKey(new Date());
  const initials = n => (n || '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  const hoursOf = key => SCHEDULE[parseKey(key).getDay()];
  const money = v => 'R$ ' + (v || 0).toLocaleString('pt-BR');

  function fmtDateLong(key) {
    const d = parseKey(key);
    return `${WEEKDAYS_LONG[d.getDay()]} • ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  function normalizePhone(p) {
    let d = (p || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.length <= 11) d = '55' + d;
    return d;
  }
  function waLink(name, a) {
    const phone = normalizePhone(a.phone);
    if (!phone) return null;
    const txt = `Olá ${(name || '').split(' ')[0]}! Aqui é do Studio Felipe Serra. Sobre o seu horário de ${a.serviceName || 'atendimento'} no dia ${parseKey(a.date).getDate()}/${pad(parseKey(a.date).getMonth() + 1)} às ${a.start}: `;
    return `https://wa.me/${phone}?text=${encodeURIComponent(txt)}`;
  }

  /* ====== API ====== */
  function getToken() {
    try {
      const t = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
      return t && new Date(t.expiresAt) > new Date() ? t.token : null;
    } catch (e) { return null; }
  }
  function sair() { try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ } location.reload(); }

  async function apiFetch(path, opts) {
    opts = opts || {};
    const res = await fetch(API_BASE + path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken(), ...(opts.headers || {}) },
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* sem corpo */ }
    if (res.status === 401) { sair(); throw new Error('Sessão expirada. Entre de novo.'); }
    if (!res.ok) throw new Error((data && data.message) || `Erro (${res.status})`);
    return data;
  }

  function mapItem(raw, key) {
    return {
      id: raw.id,
      type: raw.type,
      status: raw.status,
      name: raw.clientName || null,
      phone: raw.clientPhone || '',
      email: raw.clientEmail || '',
      temConta: !!raw.temConta,
      serviceIds: raw.serviceIds || [],
      serviceName: raw.serviceName || '',
      dur: raw.durationMinutes,
      price: raw.price,
      notes: raw.notes,
      date: key,
      start: raw.start,
      reason: raw.type === 'block' ? raw.serviceName : undefined,
    };
  }

  /* ====== DAY CACHE (substitui o antigo Store de localStorage) ====== */
  const dayCache = new Map();
  async function ensureDay(key) {
    if (!dayCache.has(key)) {
      try {
        const raw = await apiFetch(`/api/painel/agenda?date=${key}`);
        dayCache.set(key, raw.map(r => mapItem(r, key)));
      } catch (e) {
        dayCache.set(key, []);
        toast('Erro ao carregar agenda: ' + e.message, true);
      }
    }
    return dayCache.get(key);
  }
  function byDateSync(key) {
    return (dayCache.get(key) || []).slice().sort((x, y) => t2m(x.start) - t2m(y.start));
  }
  function findByIdSync(id) {
    for (const list of dayCache.values()) {
      const f = list.find(x => String(x.id) === String(id));
      if (f) return f;
    }
    return null;
  }
  function invalidateAll() { dayCache.clear(); }

  /* ====== STATE ====== */
  let selected = todayKey();
  let filterStatus = '';
  let searchTerm = '';
  let editingId = null;
  let editingBlockId = null;

  /* ====== CONFLICT / SLOTS (client-side, sobre o cache — verificação real acontece no backend) ====== */
  function activeOn(key, excludeId) {
    return byDateSync(key).filter(a => String(a.id) !== String(excludeId) && a.status !== 'cancelado');
  }
  function conflict(key, startMin, dur, excludeId) {
    const end = startMin + dur;
    return activeOn(key, excludeId).some(a => {
      const s = t2m(a.start), e = s + a.dur;
      return startMin < e && end > s;
    });
  }
  function freeStarts(key, dur, excludeId, step = 30) {
    const h = hoursOf(key) || [9, 20];
    const open = h[0] * 60, close = h[1] * 60;
    const out = [];
    for (let m = open; m + dur <= close; m += step) {
      if (!conflict(key, m, dur, excludeId)) out.push(m2t(m));
    }
    return out;
  }

  /* ====== LOAD (semana inteira + dia selecionado) ====== */
  async function loadWeekAndSelected() {
    const base = parseKey(selected);
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    const keys = [];
    for (let i = 0; i < 7; i++) { const d = new Date(monday); d.setDate(monday.getDate() + i); keys.push(toKey(d)); }
    if (!keys.includes(selected)) keys.push(selected);
    await Promise.all(keys.map(k => ensureDay(k)));
  }

  /* ====== RENDER: week strip ====== */
  function renderWeek() {
    const el = $('#weekStrip');
    const base = parseKey(selected);
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7)); // segunda como início
    const tk = todayKey();
    let html = '';
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const key = toKey(d);
      const closed = !SCHEDULE[d.getDay()];
      const count = byDateSync(key).filter(a => a.type === 'appt' && a.status !== 'cancelado').length;
      const dots = count ? `<span class="week__dot">${'<i></i>'.repeat(Math.min(count, 4))}</span>` : '';
      html += `<button class="week__day${key === selected ? ' active' : ''}${key === tk ? ' today' : ''}${closed ? ' closed' : ''}" data-key="${key}">
        <span class="week__dn">${WEEKDAYS[d.getDay()]}</span>
        <span class="week__num">${d.getDate()}</span>${dots}</button>`;
    }
    el.innerHTML = html;
    $$('.week__day', el).forEach(b => b.addEventListener('click', () => { selected = b.dataset.key; renderAll(); }));
  }

  /* ====== RENDER: stats ====== */
  function renderStats() {
    const list = byDateSync(selected).filter(a => a.type === 'appt');
    const active = list.filter(a => a.status !== 'cancelado');
    const by = s => list.filter(a => a.status === s).length;
    const faturaveis = list.filter(a => a.status === 'confirmado' || a.status === 'concluido');
    const fat = faturaveis.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const cards = [
      { v: active.length, l: 'Agendamentos', c: 'stat--gold' },
      { v: by('confirmado'), l: 'Confirmados', c: 'stat--green' },
      { v: by('pendente'), l: 'Pendentes', c: 'stat--amber' },
      { v: by('concluido'), l: 'Concluídos', c: '' },
      { v: money(fat), l: 'Faturamento', c: 'stat--gold' },
    ];
    $('#dayStats').innerHTML = cards.map(c =>
      `<div class="stat ${c.c}"><div class="stat__v">${c.v}</div><div class="stat__l">${c.l}</div></div>`).join('');
  }

  /* ====== RENDER: timeline ====== */
  function matchesFilter(a) {
    if (a.type === 'block') return !filterStatus && !searchTerm;
    if (filterStatus && a.status !== filterStatus) return false;
    if (searchTerm && !(a.name || '').toLowerCase().includes(searchTerm)) return false;
    return true;
  }

  function renderTimeline() {
    const tl = $('#timeline');
    const list = byDateSync(selected);
    const empty = $('#emptyState');
    $('#agendaTitle').textContent = `Agenda — ${fmtDateLong(selected)}`;

    if (!list.length) { tl.hidden = true; empty.hidden = false; return; }
    tl.hidden = false; empty.hidden = true;

    const h = hoursOf(selected) || [9, 20];
    const open = h[0] * 60, close = h[1] * 60;
    const height = (close - open) * PXMIN;
    tl.style.height = height + 'px';

    let html = '';
    // grades de hora
    for (let hh = h[0]; hh <= h[1]; hh++) {
      const top = (hh * 60 - open) * PXMIN;
      html += `<div class="tl-hour" style="top:${top}px"><span>${pad(hh)}:00</span></div>`;
      if (hh < h[1]) html += `<div class="tl-half" style="top:${top + 30 * PXMIN}px"></div>`;
    }
    // linha "agora"
    if (selected === todayKey()) {
      const now = new Date().getHours() * 60 + new Date().getMinutes();
      if (now >= open && now <= close) html += `<div class="tl-now" style="top:${(now - open) * PXMIN}px"></div>`;
    }
    // slots livres clicáveis (gaps entre ativos)
    const active = list.filter(a => a.status !== 'cancelado').map(a => [t2m(a.start), t2m(a.start) + a.dur]).sort((x, y) => x[0] - y[0]);
    let cursor = open;
    active.forEach(([s, e]) => {
      if (s > cursor) html += slotFree(cursor, s, open);
      cursor = Math.max(cursor, e);
    });
    if (cursor < close) html += slotFree(cursor, close, open);

    // agendamentos
    list.forEach(a => {
      const dim = !matchesFilter(a) ? ' dimmed' : '';
      const s = t2m(a.start), top = (s - open) * PXMIN, hgt = Math.max(a.dur * PXMIN - 4, 26);
      const st = STATUS[a.status] || STATUS.pendente;
      const tight = a.dur <= 30;
      const service = a.type === 'block' ? (a.reason || 'Bloqueio') : (a.serviceName || '');
      const contaBadge = a.type === 'appt' && a.temConta ? ' <span class="appt__badge" style="background:transparent;border:1px solid var(--gold);color:var(--gold)">conta</span>' : '';
      const nameHtml = escapeHtml(a.name || 'Sem nome')
        + (tight && a.type !== 'block' && service ? ` <span class="appt__svc-inline">· ${escapeHtml(service)}</span>` : '');
      html += `<div class="appt ${a.status}${tight ? ' appt--tight' : ''}${dim}" data-id="${a.id}"
          style="top:${top}px;height:${hgt}px;--st:${st.color}">
        <div class="appt__t">${a.start}–${m2t(s + a.dur)}
          <span class="appt__badge">${st.label}</span>${contaBadge}</div>
        <div class="appt__name">${a.type === 'block' ? `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg> ` : ''}${nameHtml}</div>
        ${(!tight && a.type !== 'block') ? `<div class="appt__svc">${service}</div>` : ''}
      </div>`;
    });

    tl.innerHTML = html;
    $$('.appt', tl).forEach(el => el.addEventListener('click', () => openDetail(el.dataset.id)));
    $$('.slot-free', tl).forEach(el => el.addEventListener('click', () => openForm(null, { date: selected, start: el.dataset.start })));
  }

  function slotFree(from, to, open) {
    if (to - from < 15) return '';
    return `<div class="slot-free" data-start="${m2t(from)}" style="top:${(from - open) * PXMIN}px;height:${(to - from) * PXMIN - 2}px"></div>`;
  }
  function escapeHtml(s) { return (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ====== RENDER ALL ====== */
  async function renderAll() {
    $('#datePicker').value = selected;
    $('#dateLabel').textContent = `${WEEKDAYS[parseKey(selected).getDay()]} • ${parseKey(selected).getDate()} ${MONTHS[parseKey(selected).getMonth()]}`;
    $('#agendaTitle').textContent = 'Carregando…';
    await loadWeekAndSelected();
    renderWeek(); renderStats(); renderTimeline();
    renderTomorrow();
  }

  /* ====== CARD "AMANHÃ" (sempre o dia seguinte a hoje, não ao dia selecionado) ====== */
  async function renderTomorrow() {
    const d = parseKey(todayKey());
    d.setDate(d.getDate() + 1);
    const key = toKey(d);
    await ensureDay(key);

    const dateLbl = $('#tomorrowDate');
    if (dateLbl) dateLbl.textContent = `• ${WEEKDAYS[d.getDay()]} ${d.getDate()}/${pad(d.getMonth() + 1)}`;

    const list = byDateSync(key).filter(a => a.type === 'appt' && (a.status === 'pendente' || a.status === 'confirmado'));
    const box = $('#tomorrowList');
    if (!box) return;

    if (!list.length) {
      box.innerHTML = '<p class="tomorrow-empty">Nenhum agendamento pra amanhã ainda.</p>';
      return;
    }
    box.innerHTML = list.map(a => {
      const st = STATUS[a.status] || STATUS.pendente;
      const service = a.serviceName || '';
      return `<div class="tomorrow-item" data-date="${key}">
        <div class="tomorrow-item__time">${a.start}</div>
        <div class="tomorrow-item__info">
          <div class="tomorrow-item__name">${escapeHtml(a.name || 'Sem nome')}</div>
          <div class="tomorrow-item__svc">${escapeHtml(service)}</div>
        </div>
        <span class="appt__badge" style="--st:${st.color}">${st.label}</span>
      </div>`;
    }).join('');
    $$('.tomorrow-item', box).forEach(el => el.addEventListener('click', () => {
      selected = el.dataset.date;
      renderAll();
    }));
  }

  /* ====== MODAL helpers ====== */
  function openModal(id) { $('#' + id).classList.add('open'); $('#' + id).setAttribute('aria-hidden', 'false'); }
  function closeModal(el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.hasAttribute('data-close')) closeModal(m); });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.open').forEach(closeModal); });

  /* ====== DETAIL MODAL ====== */
  function openDetail(id) {
    const a = findByIdSync(id); if (!a) return;
    const st = STATUS[a.status] || STATUS.pendente;
    const s = t2m(a.start);
    const isBlock = a.type === 'block';
    const service = isBlock ? (a.reason || 'Bloqueio') : (a.serviceName || '—');
    const wa = !isBlock ? waLink(a.name, a) : null;

    let actions = '';
    if (isBlock) {
      actions = `
        <button class="btn btn--ghost" data-act="edit">Editar</button>
        <button class="btn btn--danger" data-act="delete">Remover bloqueio</button>`;
    } else {
      if (wa) actions += `<a class="btn ad__wa" href="${wa}" target="_blank" rel="noopener">Falar no WhatsApp</a>`;
      if (a.status === 'pendente')   actions += `<button class="btn btn--gold" data-act="confirmar">Confirmar</button>`;
      if (a.status === 'confirmado' || a.status === 'pendente') actions += `<button class="btn btn--ghost" data-act="concluir">Concluir</button>`;
      if (a.status !== 'cancelado')  actions += `<button class="btn btn--ghost" data-act="remarcar">Remarcar</button>`;
      if (a.status !== 'cancelado')  actions += `<button class="btn btn--ghost" data-act="edit">Editar</button>`;
      if (a.status === 'confirmado' || a.status === 'pendente') actions += `<button class="btn btn--ghost" data-act="falta">Marcar falta</button>`;
      if (a.status !== 'cancelado')  actions += `<button class="btn btn--danger" data-act="cancelar">Cancelar</button>`;
      if (a.status === 'cancelado')  actions += `<button class="btn btn--gold" data-act="reativar">Reativar</button><button class="btn btn--danger" data-act="delete">Excluir</button>`;
    }

    $('#apptBody').innerHTML = `
      <div class="ad__head">
        <div class="ad__avatar" style="background:${isBlock ? 'var(--st-bloqueio)' : 'var(--gold)'}">${isBlock ? `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>` : initials(a.name)}</div>
        <div>
          <div class="ad__name">${escapeHtml(a.name || 'Sem nome')}${!isBlock && a.temConta ? ' <span style="color:var(--gold);font-size:11px;font-weight:600">· tem conta</span>' : ''}</div>
          <div class="ad__status" style="--st:${st.color}">${st.label}</div>
        </div>
      </div>
      <div class="ad__grid">
        <div class="ad__cell"><div class="ad__k">Serviço</div><div class="ad__v">${service}</div></div>
        <div class="ad__cell"><div class="ad__k">Horário</div><div class="ad__v">${a.start} – ${m2t(s + a.dur)} <span style="color:var(--muted)">(${a.dur}min)</span></div></div>
        <div class="ad__cell"><div class="ad__k">Data</div><div class="ad__v">${fmtDateLong(a.date)}</div></div>
        ${!isBlock ? `<div class="ad__cell"><div class="ad__k">Telefone</div><div class="ad__v">${a.phone ? `<a href="tel:+${normalizePhone(a.phone)}">${escapeHtml(a.phone)}</a>` : '—'}</div></div>` : ''}
        ${!isBlock && a.email ? `<div class="ad__cell"><div class="ad__k">E-mail</div><div class="ad__v">${escapeHtml(a.email)}</div></div>` : ''}
        ${!isBlock && a.price ? `<div class="ad__cell"><div class="ad__k">Valor</div><div class="ad__v">${money(Number(a.price))}</div></div>` : ''}
        ${a.notes ? `<div class="ad__cell full"><div class="ad__k">Observações</div><div class="ad__v">${escapeHtml(a.notes)}</div></div>` : ''}
      </div>
      <div class="ad__actions">${actions}</div>`;

    $$('#apptBody [data-act]').forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.act, a)));
    openModal('apptModal');
  }

  async function handleAction(act, a) {
    try {
      switch (act) {
        case 'confirmar': await setStatus(a.id, 'confirmado'); toast('Agendamento confirmado'); break;
        case 'concluir':  await setStatus(a.id, 'concluido');  toast('Marcado como concluído'); break;
        case 'falta':     await setStatus(a.id, 'falta');      toast('Marcado como falta'); break;
        case 'reativar':  await setStatus(a.id, 'confirmado'); toast('Agendamento reativado'); break;
        case 'edit':
          closeModal($('#apptModal'));
          if (a.type === 'block') openBlock(a); else openForm(a.id);
          break;
        case 'remarcar': closeModal($('#apptModal')); openForm(a.id, null, true); break;
        case 'cancelar': {
          const r = await confirmDialog({ title: 'Cancelar agendamento', msg: `Cancelar o horário de ${a.name}?`, yes: 'Sim, cancelar', reason: true });
          if (r.ok) {
            await apiFetch(`/api/painel/agendamentos/${a.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelado', reason: r.reason }) });
            invalidateAll();
            await refreshAfter('Agendamento cancelado');
          }
          break;
        }
        case 'delete': {
          const r = await confirmDialog({ title: 'Excluir', msg: `Excluir definitivamente "${a.name || a.reason}"? Não dá pra desfazer.`, yes: 'Excluir' });
          if (r.ok) {
            if (a.type === 'block') await apiFetch(`/api/painel/bloqueios/${a.id}`, { method: 'DELETE' });
            else await apiFetch(`/api/painel/agendamentos/${a.id}`, { method: 'DELETE' });
            invalidateAll();
            await refreshAfter('Excluído');
          }
          break;
        }
      }
    } catch (e) {
      toast(e.message || 'Erro ao processar ação.', true);
    }
  }

  async function setStatus(id, status) {
    await apiFetch(`/api/painel/agendamentos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    invalidateAll();
    await renderAll();
    const updated = findByIdSync(id);
    if ($('#apptModal').classList.contains('open') && updated) openDetail(id);
  }
  async function refreshAfter(msg) {
    await renderAll();
    if (msg) toast(msg);
    if ($('#apptModal').classList.contains('open')) closeModal($('#apptModal'));
  }

  /* ====== FORM (novo / editar / remarcar) ====== */
  let formSelectedServices = new Set();

  function renderServiceCheckboxes() {
    const box = $('#f_services');
    box.innerHTML = SERVICES.filter(s => !s.legacy).map(s => `
      <label class="f-service${formSelectedServices.has(s.id) ? ' checked' : ''}" data-id="${s.id}">
        <input type="checkbox" ${formSelectedServices.has(s.id) ? 'checked' : ''} />
        <span class="f-service__name">${s.name}</span>
        <span class="f-service__meta">${money(s.price)} · ${s.dur}min</span>
      </label>
    `).join('');
    $$('.f-service', box).forEach(label => {
      const id = label.dataset.id;
      const input = label.querySelector('input');
      input.addEventListener('change', () => {
        if (input.checked) formSelectedServices.add(id); else formSelectedServices.delete(id);
        label.classList.toggle('checked', input.checked);
        updateServicesTotal();
        refreshTimeOptions(editingId);
      });
    });
    updateServicesTotal();
  }
  function updateServicesTotal() {
    const total = $('#f_servicesTotal');
    const count = formSelectedServices.size;
    if (!count) { total.hidden = true; return; }
    total.hidden = false;
    total.textContent = `${count} procedimento${count > 1 ? 's' : ''} · ${sumDur(formSelectedServices)}min · ${money(sumPrice(formSelectedServices))}`;
    $('#f_price').value = sumPrice(formSelectedServices) || '';
  }
  function refreshTimeOptions(excludeId, keepValue) {
    const key = $('#f_date').value || selected;
    const dur = sumDur(formSelectedServices) || 30;
    const opts = freeStarts(key, dur, excludeId);
    const cur = keepValue || $('#f_time').value;
    $('#f_time').innerHTML = opts.length
      ? opts.map(t => `<option value="${t}">${t} – ${m2t(t2m(t) + dur)}</option>`).join('')
      : `<option value="">Sem horário livre neste dia</option>`;
    if (cur && opts.includes(cur)) $('#f_time').value = cur;
  }

  function openForm(id, prefill, isReschedule) {
    editingId = id || null;
    const a = id ? findByIdSync(id) : null;
    formSelectedServices = new Set(a ? a.serviceIds : []);
    renderServiceCheckboxes();
    $('#formWarn').hidden = true;
    $('#formTitle').textContent = isReschedule ? 'Remarcar' : (id ? 'Editar agendamento' : 'Novo agendamento');
    $('#f_id').value = id || '';
    $('#f_name').value  = a ? (a.name || '') : '';
    $('#f_phone').value = a ? (a.phone || '') : '';
    $('#f_email').value = a ? (a.email || '') : '';
    $('#f_price').value = a ? (a.price || '') : (sumPrice(formSelectedServices) || '');
    $('#f_notes').value = a ? (a.notes || '') : '';
    $('#f_date').value  = a ? a.date : (prefill?.date || selected);
    refreshTimeOptions(id, a ? a.start : (prefill?.start));
    if (prefill?.start) $('#f_time').value = prefill.start;
    openModal('formModal');
    setTimeout(() => $('#f_name').focus(), 60);
  }
  $('#f_date').addEventListener('change', () => refreshTimeOptions(editingId));

  $('#apptForm').addEventListener('submit', async e => {
    e.preventDefault();
    const warn = $('#formWarn');
    warn.hidden = true;
    const name = $('#f_name').value.trim();
    const ids = Array.from(formSelectedServices);
    const date = $('#f_date').value;
    const start = $('#f_time').value;
    if (!name || !ids.length || !date || !start) { warn.hidden = false; warn.textContent = 'Preencha nome, ao menos um procedimento, data e horário.'; return; }
    const dur = sumDur(ids);
    const startMin = t2m(start);
    if (conflict(date, startMin, dur, editingId)) { warn.hidden = false; warn.textContent = 'Esse horário conflita com outro agendamento. Escolha outro.'; return; }

    const payload = {
      clientName: name,
      clientPhone: $('#f_phone').value.trim() || null,
      clientEmail: $('#f_email').value.trim() || null,
      serviceIds: ids,
      date, start,
      price: $('#f_price').value ? Number($('#f_price').value) : null,
      notes: $('#f_notes').value.trim() || null,
    };
    const submitBtn = $('#apptForm button[type=submit]');
    submitBtn.disabled = true;
    try {
      if (editingId) await apiFetch(`/api/painel/agendamentos/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await apiFetch('/api/painel/agendamentos', { method: 'POST', body: JSON.stringify(payload) });
      invalidateAll();
      closeModal($('#formModal'));
      selected = date;
      await renderAll();
      toast(editingId ? 'Agendamento atualizado' : 'Agendamento criado');
    } catch (err) {
      warn.hidden = false; warn.textContent = err.message || 'Erro ao salvar.';
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ====== BLOCK ====== */
  const BLOCK_PRESETS = [30, 60, 90, 120, 180, 600];
  function openBlock(existing) {
    editingBlockId = existing ? existing.id : null;
    $('#blockWarn').hidden = true;
    $('#b_date').value = existing ? existing.date : selected;
    $('#b_reason').value = existing ? (existing.reason || '') : '';
    refreshBlockStarts();
    if (existing) {
      $('#b_start').value = existing.start;
      if (BLOCK_PRESETS.includes(existing.dur)) {
        $('#b_dur').value = String(existing.dur);
        toggleCustomEnd(false);
      } else {
        $('#b_dur').value = 'custom';
        $('#b_customEnd').value = m2t(t2m(existing.start) + existing.dur);
        toggleCustomEnd(true);
      }
    } else {
      $('#b_dur').value = '30';
      toggleCustomEnd(false);
    }
    openModal('blockModal');
  }
  function toggleCustomEnd(show) { $('#b_customWrap').hidden = !show; }
  function refreshBlockStarts() {
    const key = $('#b_date').value || selected;
    const h = hoursOf(key) || [9, 20];
    const opts = [];
    for (let m = h[0] * 60; m < h[1] * 60; m += 15) opts.push(m2t(m));
    $('#b_start').innerHTML = opts.map(t => `<option value="${t}">${t}</option>`).join('');
  }
  $('#b_date').addEventListener('change', refreshBlockStarts);
  $('#b_dur').addEventListener('change', () => {
    const isCustom = $('#b_dur').value === 'custom';
    toggleCustomEnd(isCustom);
    if (isCustom && !$('#b_customEnd').value) {
      $('#b_customEnd').value = m2t(t2m($('#b_start').value || '09:00') + 30);
    }
  });
  $('#blockForm').addEventListener('submit', async e => {
    e.preventDefault();
    const warn = $('#blockWarn');
    warn.hidden = true;
    const date = $('#b_date').value;
    const start = $('#b_start').value;
    let dur;
    if ($('#b_dur').value === 'custom') {
      const end = $('#b_customEnd').value;
      if (!end) { warn.hidden = false; warn.textContent = 'Escolha até que horas o bloqueio vai.'; return; }
      dur = t2m(end) - t2m(start);
      if (dur <= 0) { warn.hidden = false; warn.textContent = 'O horário final tem que ser depois do início.'; return; }
    } else {
      dur = Number($('#b_dur').value);
      const h = hoursOf(date) || [9, 20];
      if (dur >= 600) dur = h[1] * 60 - t2m(start); // dia todo
    }
    if (conflict(date, t2m(start), dur, editingBlockId)) { warn.hidden = false; warn.textContent = 'Esse período conflita com um agendamento existente.'; return; }

    const submitBtn = $('#blockForm button[type=submit]');
    submitBtn.disabled = true;
    try {
      if (editingBlockId) await apiFetch(`/api/painel/bloqueios/${editingBlockId}`, { method: 'DELETE' });
      await apiFetch('/api/painel/bloqueios', { method: 'POST', body: JSON.stringify({ date, start, durationMinutes: dur, reason: $('#b_reason').value.trim() || 'Bloqueio' }) });
      invalidateAll();
      closeModal($('#blockModal'));
      selected = date;
      await renderAll();
      toast(editingBlockId ? 'Bloqueio atualizado' : 'Horário bloqueado');
    } catch (err) {
      warn.hidden = false; warn.textContent = err.message || 'Erro ao bloquear.';
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ====== CONFIRM DIALOG ====== */
  function confirmDialog({ title, msg, yes = 'Confirmar', reason = false }) {
    return new Promise(resolve => {
      $('#confirmTitle').textContent = title;
      $('#confirmMsg').textContent = msg;
      $('#confirmYes').textContent = yes;
      const rw = $('#confirmReasonWrap'); rw.hidden = !reason; $('#confirmReason').value = '';
      openModal('confirmModal');
      const cleanup = () => { $('#confirmYes').onclick = null; $('#confirmNo').onclick = null; closeModal($('#confirmModal')); };
      $('#confirmYes').onclick = () => { const r = $('#confirmReason').value.trim(); cleanup(); resolve({ ok: true, reason: r }); };
      $('#confirmNo').onclick = () => { cleanup(); resolve({ ok: false }); };
    });
  }

  /* ====== TOAST ====== */
  let toastT;
  function toast(msg, err) {
    const el = $('#toast');
    el.textContent = msg; el.classList.toggle('err', !!err); el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ====== CLOCK ====== */
  function tickClock() {
    const n = new Date();
    $('#clock').textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}`;
  }

  /* ====== NAV / WIRES ====== */
  function shiftDay(delta) { const d = parseKey(selected); d.setDate(d.getDate() + delta); selected = toKey(d); renderAll(); }
  $('#prevDay').addEventListener('click', () => shiftDay(-1));
  $('#nextDay').addEventListener('click', () => shiftDay(1));
  $('#todayBtn').addEventListener('click', () => { selected = todayKey(); renderAll(); });
  $('#datePicker').addEventListener('change', e => { if (e.target.value) { selected = e.target.value; renderAll(); } });
  $('#newBtn').addEventListener('click', () => openForm(null, { date: selected }));
  $('#emptyNew').addEventListener('click', () => openForm(null, { date: selected }));
  $('#blockBtn').addEventListener('click', () => openBlock());
  $('#statusFilter').addEventListener('change', e => { filterStatus = e.target.value; renderTimeline(); });
  $('#search').addEventListener('input', e => { searchTerm = e.target.value.trim().toLowerCase(); renderTimeline(); });

  /* ====== NOTIFICAÇÕES: sino (agendamento novo, cancelamento, remarcação) ====== */
  const NOTIF_META = {
    novo: { icon: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/></svg>`, verb: 'agendou' },
    cancelado: { icon: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`, verb: 'cancelou' },
    remarcado: { icon: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20v-4h-4"/></svg>`, verb: 'remarcou' },
  };
  let lastSeenNotifId = 0;
  let bellOpen = false;

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [880, 1175].forEach((freq, i) => {
        setTimeout(() => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = freq;
          g.gain.setValueAtTime(0.001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          o.connect(g); g.connect(ctx.destination);
          o.start(); o.stop(ctx.currentTime + 0.55);
        }, i * 180);
      });
    } catch (e) { /* ambiente sem áudio, ignora */ }
  }

  function timeAgo(iso) {
    const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return 'agora';
    if (min < 60) return `há ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `há ${h}h`;
    return `há ${Math.round(h / 24)}d`;
  }

  function notifTitle(n) {
    const meta = NOTIF_META[n.type] || NOTIF_META.novo;
    return `<b>${escapeHtml(n.clientName)}</b> ${meta.verb} ${escapeHtml(n.serviceName)}`;
  }

  /* Rótulo de grupo estilo Facebook: Hoje / Ontem / Há N dias / dd/mm/aaaa */
  function groupLabel(dt) {
    const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((startOfDay(new Date()) - startOfDay(dt)) / 86400000);
    if (diffDays <= 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
  }

  function renderBellList(items) {
    const box = $('#bellList');
    if (!box) return;
    if (!items.length) { box.innerHTML = '<p class="bell-empty">Nenhuma notificação ainda.</p>'; return; }
    let html = '';
    let lastGroup = null;
    items.forEach(n => {
      const createdDt = new Date(n.createdAt);
      const group = groupLabel(createdDt);
      if (group !== lastGroup) { html += `<div class="bell-group">${group}</div>`; lastGroup = group; }
      const meta = NOTIF_META[n.type] || NOTIF_META.novo;
      const [, mm, dd] = n.date.split('-');
      html += `<div class="bell-item ${n.type}${n.read ? '' : ' unread'}">
        <div class="bell-item__icon">${meta.icon}</div>
        <div class="bell-item__body">
          <div class="bell-item__title">${notifTitle(n)}</div>
          <div class="bell-item__meta">${dd}/${mm} às ${n.start} · ${timeAgo(n.createdAt)}</div>
          ${n.extra ? `<div class="bell-item__extra">${escapeHtml(n.extra)}</div>` : ''}
        </div>
      </div>`;
    });
    box.innerHTML = html;
  }

  function alertNotification(n) {
    const meta = NOTIF_META[n.type] || NOTIF_META.novo;
    const label = n.type === 'novo' ? 'Novo agendamento' : n.type === 'cancelado' ? 'Cancelamento' : 'Remarcação';
    const [, mm, dd] = n.date.split('-');
    const msg = `${n.clientName} · ${n.serviceName} · ${dd}/${mm} às ${n.start}`;
    playBeep();
    toast(`${label}: ${msg}`);
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(`${label} — Studio Felipe Serra`, { body: msg, icon: 'assets/img/favicon.png' });
    }
    invalidateAll();
    if (selected === todayKey() || n.date === selected) renderAll();
    else renderTomorrow();
  }

  async function pollNotifications() {
    try {
      const items = await apiFetch('/api/painel/notificacoes?limit=50');
      renderBellList(items);
      const unread = items.filter(n => !n.read);
      const badge = $('#bellBadge');
      if (badge) {
        badge.hidden = unread.length === 0;
        badge.textContent = unread.length > 9 ? '9+' : String(unread.length);
      }
      const maxId = items.reduce((m, n) => Math.max(m, n.id), 0);
      if (lastSeenNotifId > 0) {
        items.filter(n => n.id > lastSeenNotifId).reverse().forEach(alertNotification);
      }
      if (maxId > lastSeenNotifId) lastSeenNotifId = maxId;
    } catch (e) { /* silencioso, tenta de novo no próximo ciclo */ }
  }

  $('#bellBtn').addEventListener('click', e => {
    e.stopPropagation();
    bellOpen = !bellOpen;
    $('#bellPanel').classList.toggle('open', bellOpen);
    if (bellOpen) {
      apiFetch('/api/painel/notificacoes/marcar-lidas', { method: 'POST', body: JSON.stringify({}) })
        .then(() => {
          $('#bellBadge').hidden = true;
          $$('.bell-item.unread', $('#bellList')).forEach(el => el.classList.remove('unread'));
        }).catch(() => {});
    }
  });
  document.addEventListener('click', e => {
    if (bellOpen && !e.target.closest('.bell-wrap')) { bellOpen = false; $('#bellPanel').classList.remove('open'); }
  });

  /* ====== AUTH ====== */
  function showApp() {
    $('#login').style.display = 'none';
    $('#app').hidden = false;
    renderAll();
    tickClock(); setInterval(tickClock, 15000);
    setInterval(() => { invalidateAll(); renderAll(); }, 60000);

    if (window.Notification && Notification.permission === 'default') Notification.requestPermission();
    pollNotifications();
    setInterval(pollNotifications, 20000);
  }
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const botao = $('#loginForm button[type=submit]');
    if (botao) botao.disabled = true;
    $('#loginErr').textContent = '';
    try {
      const res = await fetch(API_BASE + '/api/painel/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: $('#pin').value }),
      });
      let data = null;
      try { data = await res.json(); } catch (err) { /* sem corpo */ }
      if (!res.ok) throw new Error((data && data.message) || 'Não foi possível entrar agora.');
      localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
      showApp();
    } catch (err) {
      $('#loginErr').textContent = err.message === 'Failed to fetch' ? 'Sem conexão com o servidor.' : err.message;
      $('#pin').value = ''; $('#pin').focus();
    } finally {
      if (botao) botao.disabled = false;
    }
  });
  $('#logout').addEventListener('click', sair);

  /* ====== BOOT ====== */
  if (getToken()) showApp();
  else setTimeout(() => $('#pin').focus(), 100);

})();
