// ============================================================
//  MediClinic ERP — API simulada para a demonstração.
//  O front-end é o build de produção do sistema (React + Vite), sem
//  mudanças além do roteamento por hash. Aqui as rotas do backend
//  Express + Prisma são reproduzidas no navegador (mesmas regras,
//  mesmos formatos de resposta), com o mesmo seed fictício.
//  Tudo fica no localStorage de quem está testando.
// ============================================================
(function () {
    "use strict";
    const CHAVE = "demo.mediclinic.v1";
    const pad = (n, w = 2) => String(n).padStart(w, "0");
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
    let seq = 0;
    const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + (++seq));

    // ---------- Seed (port fiel do backend/prisma/seed.ts, mesmo PRNG mulberry32) ----------
    function seed() {
        let s = 20261022;
        const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        const pick = (a) => a[Math.floor(rnd() * a.length)];
        let relogio = Date.now() - 600000; // createdAt em sequência, como no banco
        const criado = () => new Date(relogio += 37).toISOString();
        const db = { users: [], doctors: [], patients: [], appointments: [], medicalRecords: [], prescriptions: [], examRequests: [], certificates: [], financials: [], invoices: [], configs: {}, auditLogs: [] };
        const novoUser = (name, email, role) => { const c = criado(); const u = { id: uuid(), name, email, password: "123456", role, active: true, mustChangePassword: false, createdAt: c, updatedAt: c }; db.users.push(u); return u; };

        const DOCTORS = [
            { email: "medico@mediclinic.dev", name: "Carlos Silva", crm: "CRM/SP 112345", specialty: "Clínica Geral", price: 250 },
            { email: "fernanda.lima@mediclinic.dev", name: "Fernanda Lima", crm: "CRM/SP 223456", specialty: "Cardiologia", price: 380 },
            { email: "ricardo.alves@mediclinic.dev", name: "Ricardo Alves", crm: "CRM/SP 334567", specialty: "Dermatologia", price: 320 },
            { email: "juliana.costa@mediclinic.dev", name: "Juliana Costa", crm: "CRM/SP 445678", specialty: "Pediatria", price: 280 },
        ];
        const FIRST_F = ["Maria", "Ana", "Beatriz", "Camila", "Larissa", "Patrícia", "Renata", "Sofia", "Helena", "Clara", "Luana", "Vitória"];
        const FIRST_M = ["João", "Pedro", "Lucas", "Gabriel", "Rafael", "Bruno", "Felipe", "Gustavo", "Thiago", "André", "Diego", "Mateus"];
        const LAST = ["Oliveira", "Santos", "Pereira", "Costa", "Rodrigues", "Almeida", "Nascimento", "Carvalho", "Ribeiro", "Martins", "Rocha", "Moura", "Barbosa", "Teixeira"];
        const CONVENIOS = ["Particular", "Particular", "Unimed", "Bradesco Saúde", "SulAmérica", "Amil"];
        const BLOOD = ["A+", "A-", "B+", "O+", "O+", "O-", "AB+"];
        const BAIRROS = ["Centro", "Jardim Paulista", "Vila Mariana", "Moema", "Pinheiros", "Santana", "Tatuapé"];
        const CASES_CHILD = [
            { complaint: "Febre e dor de garganta há 2 dias", dx: "Faringoamigdalite aguda", cid: { code: "J03.9", description: "Amigdalite aguda não especificada" }, meds: ["Amoxicilina suspensão 250mg/5ml — 5ml de 8/8h por 10 dias", "Paracetamol gotas — conforme peso, se febre"] },
            { complaint: "Tosse seca e coriza", dx: "Resfriado comum", cid: { code: "J00", description: "Nasofaringite aguda (resfriado comum)" }, meds: ["Soro fisiológico nasal — 3x ao dia"] },
            { complaint: "Manchas vermelhas com coceira após praia", dx: "Dermatite de contato", cid: { code: "L25.9", description: "Dermatite de contato não especificada" }, meds: ["Hidratante corporal sem perfume — 2x ao dia"] },
            { complaint: "Consulta de puericultura", dx: "Acompanhamento de crescimento e desenvolvimento", cid: { code: "Z00.1", description: "Exame de rotina de saúde da criança" }, meds: [] },
        ];
        const CASES = [
            { complaint: "Dor de garganta e febre há 3 dias", dx: "Faringoamigdalite aguda", cid: { code: "J03.9", description: "Amigdalite aguda não especificada" }, meds: ["Amoxicilina 500mg — 1 cápsula de 8/8h por 7 dias", "Dipirona 500mg — 1 comprimido se febre"] },
            { complaint: "Cefaleia frequente no fim do dia", dx: "Cefaleia tensional", cid: { code: "G44.2", description: "Cefaléia tensional" }, meds: ["Paracetamol 750mg — 1 comprimido de 6/6h se dor"] },
            { complaint: "Pressão alta em medição de farmácia", dx: "Hipertensão arterial sistêmica", cid: { code: "I10", description: "Hipertensão essencial (primária)" }, meds: ["Losartana 50mg — 1 comprimido pela manhã"] },
            { complaint: "Palpitações aos esforços", dx: "Arritmia a esclarecer", cid: { code: "R00.2", description: "Palpitações" }, meds: [], exams: ["Eletrocardiograma", "Holter 24h", "Ecocardiograma"] },
            { complaint: "Manchas avermelhadas com coceira nos braços", dx: "Dermatite de contato", cid: { code: "L25.9", description: "Dermatite de contato não especificada" }, meds: ["Hidrocortisona creme 1% — aplicar 2x ao dia por 7 dias", "Loratadina 10mg — 1 comprimido ao dia"] },
            { complaint: "Acne persistente no rosto", dx: "Acne vulgar", cid: { code: "L70.0", description: "Acne vulgar" }, meds: ["Adapaleno gel 0,1% — aplicar à noite"] },
            { complaint: "Check-up anual", dx: "Exame geral de rotina", cid: { code: "Z00.0", description: "Exame médico geral" }, meds: [], exams: ["Hemograma completo", "Glicemia de jejum", "Colesterol total e frações", "TSH"] },
            { complaint: "Dor lombar após esforço", dx: "Lombalgia mecânica", cid: { code: "M54.5", description: "Dor lombar baixa" }, meds: ["Ciclobenzaprina 5mg — 1 comprimido à noite por 5 dias"] },
            { complaint: "Cansaço e sede excessiva", dx: "Diabetes mellitus tipo 2 a confirmar", cid: { code: "R73.0", description: "Teste de tolerância à glicose anormal" }, meds: [], exams: ["Glicemia de jejum", "Hemoglobina glicada (HbA1c)"] },
        ];
        const PAYMENTS = ["PIX", "PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Convênio"];
        const TIMES = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

        novoUser("Administrador", "admin@mediclinic.dev", "ADMIN");
        novoUser("Ana Recepcionista", "recepcao@mediclinic.dev", "STAFF");
        const doctors = [];
        DOCTORS.forEach((d, i) => {
            const user = novoUser(d.name, d.email, "DOCTOR");
            const doc = { id: uuid(), userId: user.id, crm: d.crm, specialty: d.specialty, phone: `(11) 99999-00${pad(i + 1)}`, bio: `Especialista em ${d.specialty.toLowerCase()}.`, workDays: "1,2,3,4,5", startTime: "08:00", endTime: "18:00", slotMinutes: 30 };
            db.doctors.push(doc);
            doctors.push({ userId: user.id, doctorId: doc.id, price: d.price, specialty: d.specialty });
        });
        db.configs = { clinic_name: "Clínica MediClinic", clinic_cnpj: "00.000.000/0001-00", clinic_address: "Rua das Flores, 123 - Centro", clinic_phone: "(11) 3333-4444", clinic_email: "contato@mediclinic.dev", clinic_city: "São Paulo - SP" };

        const patients = [];
        for (let i = 0; i < 24; i++) {
            const female = i % 2 === 0;
            const name = `${pick(female ? FIRST_F : FIRST_M)} ${pick(LAST)} ${pick(LAST)}`;
            const year = i % 6 === 5 ? 2014 + Math.floor(rnd() * 8) : 1955 + Math.floor(rnd() * 50);
            const convenio = pick(CONVENIOS);
            const c = criado();
            const p = { id: uuid(), name, cpf: `${pad(100 + i, 3)}.000.000-${pad(i)}`, rg: null,
                birthDate: `${year}-${pad(1 + Math.floor(rnd() * 12))}-${pad(1 + Math.floor(rnd() * 28))}`, gender: female ? "F" : "M",
                phone: `(11) 9${pad(8000 + i * 37, 4)}-${pad(1000 + i * 113, 4)}`, phone2: null,
                email: `${name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}.${i}@exemplo.com`,
                address: null, addressNumber: null, addressComplement: null, neighborhood: null, city: null, state: null, cep: null,
                bloodType: pick(BLOOD),
                allergies: rnd() < 0.2 ? pick(["Dipirona", "Penicilina", "Ibuprofeno", "Frutos do mar"]) : null,
                chronicDiseases: rnd() < 0.2 ? pick(["Hipertensão", "Diabetes tipo 2", "Asma"]) : null,
                medications: null, convenio, convenioNumber: convenio === "Particular" ? null : String(10000000 + Math.floor(rnd() * 89999999)), convenioValidity: null,
                emergencyName: null, emergencyPhone: null, emergencyRelation: null, observations: null, active: true, createdAt: c, updatedAt: c };
            p.neighborhood = pick(BAIRROS); p.city = "São Paulo"; p.state = "SP";
            db.patients.push(p); patients.push(p);
        }

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayStr = ymd(today);
        const receitas = [];
        for (let offset = -30; offset <= 14; offset++) {
            const day = addDays(today, offset);
            if (day.getDay() === 0 || day.getDay() === 6) continue;
            const date = ymd(day);
            const perDay = 6 + Math.floor(rnd() * 5);
            const used = new Set();
            for (let k = 0; k < perDay; k++) {
                const doc = pick(doctors), time = pick(TIMES);
                if (used.has(doc.doctorId + time)) continue;
                used.add(doc.doctorId + time);
                const child = doc.specialty === "Pediatria";
                const patient = pick(patients.filter((_, idx) => (idx % 6 === 5) === child));
                const type = rnd() < 0.7 ? "Consulta" : pick(["Retorno", "Exame", "Procedimento", "Telemedicina"]);
                let status;
                if (offset < 0) { const r = rnd(); status = r < 0.85 ? "CONCLUIDO" : r < 0.93 ? "FALTOU" : "CANCELADO"; }
                else if (offset === 0) { const hour = new Date().getHours(), slotHour = parseInt(time); status = slotHour < hour - 1 ? "CONCLUIDO" : slotHour <= hour ? pick(["EM_ATENDIMENTO", "AGUARDANDO"]) : pick(["AGENDADO", "CONFIRMADO", "CONFIRMADO"]); }
                else status = rnd() < 0.6 ? "CONFIRMADO" : "AGENDADO";
                const c = criado();
                const appt = { id: uuid(), patientId: patient.id, doctorId: doc.doctorId, userId: doc.userId, date, time, duration: 30, type, status,
                    notes: rnd() < 0.15 ? pick(["Primeira consulta", "Trazer exames anteriores", "Paciente pediu encaixe"]) : null, returnDate: null, createdAt: c, updatedAt: c };
                db.appointments.push(appt);
                if (status === "CONCLUIDO") {
                    const amount = type === "Retorno" ? 0 : type === "Procedimento" ? doc.price * 1.6 : doc.price;
                    if (amount > 0) receitas.push({ patientId: patient.id, appointmentId: appt.id, amount, date, type, paid: rnd() < 0.9 });
                    if (rnd() < 0.6) {
                        const cs = pick(child ? CASES_CHILD : CASES);
                        const cr = criado();
                        const rec = { id: uuid(), patientId: patient.id, doctorId: doc.userId, appointmentId: appt.id, date, chiefComplaint: cs.complaint,
                            anamnesis: `${child ? "Responsável relata" : "Paciente relata"}: ${cs.complaint.toLowerCase()}. Nega outras queixas.`,
                            physicalExam: "Bom estado geral, corado, hidratado, eupneico.",
                            bloodPressure: child ? `${95 + Math.floor(rnd() * 15)}/${58 + Math.floor(rnd() * 12)}` : `${110 + Math.floor(rnd() * 40)}/${70 + Math.floor(rnd() * 20)}`,
                            heartRate: String(child ? 80 + Math.floor(rnd() * 30) : 62 + Math.floor(rnd() * 30)),
                            temperature: (36 + rnd() * 2).toFixed(1),
                            weight: (child ? 18 + rnd() * 25 : 52 + rnd() * 45).toFixed(1),
                            height: String(child ? 105 + Math.floor(rnd() * 45) : 155 + Math.floor(rnd() * 37)),
                            oxygenSaturation: String(95 + Math.floor(rnd() * 5)),
                            diagnoses: cs.dx, cidCodes: JSON.stringify([cs.cid]),
                            treatment: cs.meds.length ? "Tratamento medicamentoso conforme receita." : "Aguardar resultado dos exames.",
                            observations: null, returnDate: ymd(addDays(day, 30)), createdAt: cr, updatedAt: cr };
                        db.medicalRecords.push(rec);
                        if (cs.meds.length) db.prescriptions.push({ id: uuid(), medicalRecordId: rec.id, patientId: patient.id, doctorId: doc.userId, date, valid: true, createdAt: criado(),
                            medications: JSON.stringify(cs.meds.map((m) => { const [n, ins] = m.split(" — "); return { name: n, instructions: ins }; })), instructions: "Retornar se não houver melhora em 7 dias." });
                        if (cs.exams) db.examRequests.push({ id: uuid(), medicalRecordId: rec.id, exams: JSON.stringify(cs.exams), urgency: "NORMAL", date, instructions: "Jejum de 8 horas para exames de sangue.", createdAt: criado() });
                        if (rnd() < 0.2) {
                            const days = 1 + Math.floor(rnd() * 3);
                            db.certificates.push({ id: uuid(), medicalRecordId: rec.id, type: "ATESTADO", days, date, createdAt: criado(),
                                content: `Atesto, para os devidos fins, que o(a) paciente esteve sob meus cuidados nesta data, necessitando de ${days} dia(s) de afastamento de suas atividades.` });
                        }
                    }
                }
            }
        }
        const fin = (d) => { const c = criado(); db.financials.push({ id: uuid(), patientId: null, appointmentId: null, notes: null, ...d, createdAt: c, updatedAt: c }); };
        for (const r of receitas) {
            fin({ patientId: r.patientId, appointmentId: r.appointmentId, type: "RECEITA", category: r.type === "Procedimento" ? "Procedimento" : r.type === "Exame" ? "Exame" : "Consulta",
                description: `${r.type} realizada em ${r.date.split("-").reverse().join("/")}`, amount: r.amount, paymentMethod: pick(PAYMENTS),
                status: r.paid ? "PAGO" : "PENDENTE", dueDate: r.date, paidDate: r.paid ? r.date : null });
        }
        const EXPENSES = [["Aluguel", "Aluguel da sala", 4200, 5], ["Salário", "Folha de pagamento (recepção e enfermagem)", 8600, 5], ["Material", "Materiais descartáveis", 1250, 10],
            ["Energia", "Conta de energia", 620, 15], ["Água", "Conta de água", 160, 15], ["Internet", "Internet e telefonia", 289, 20], ["Contabilidade", "Honorários contábeis", 900, 20]];
        for (const back of [1, 0]) {
            const ref = new Date(today.getFullYear(), today.getMonth() - back, 1);
            for (const [category, description, amount, dia] of EXPENSES) {
                const due = ymd(new Date(ref.getFullYear(), ref.getMonth(), dia)), paid = due <= todayStr;
                fin({ type: "DESPESA", category, description, amount, paymentMethod: "Boleto", status: paid ? "PAGO" : "PENDENTE", dueDate: due, paidDate: paid ? due : null });
            }
        }
        receitas.filter((r) => r.paid).slice(-12).forEach((r, i) => {
            db.invoices.push({ id: uuid(), number: pad(i + 1, 6), patientId: r.patientId, services: JSON.stringify([{ description: `${r.type} médica`, quantity: 1, unitPrice: r.amount }]),
                subtotal: r.amount, discount: 0, total: r.amount, paymentMethod: pick(PAYMENTS), status: "EMITIDA", date: r.date, notes: null, createdAt: criado() });
        });
        return db;
    }

    let db;
    try { db = JSON.parse(localStorage.getItem(CHAVE) || "null"); } catch (e) { db = null; }
    if (!db) db = seed();
    const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) { /* sem storage */ } };
    salvar();
    window.MediClinicDemo = { restaurar() { localStorage.removeItem(CHAVE); localStorage.removeItem("mediclinic_token"); localStorage.removeItem("mediclinic_user"); location.hash = "#/login"; location.reload(); } };

    // ---------- Helpers estilo Prisma ----------
    const agora = () => new Date().toISOString();
    const semSenha = ({ password, ...u }) => u;
    const userBy = (id) => db.users.find((u) => u.id === id);
    const doctorBy = (id) => db.doctors.find((d) => d.id === id);
    const patientBy = (id) => db.patients.find((p) => p.id === id);
    const pick = (o, campos) => o ? Object.fromEntries(campos.map((c) => [c, o[c] ?? null])) : null;
    const comUser = (doc, campos) => doc ? { ...doc, user: pick(userBy(doc.userId), campos) } : null;
    const ordenar = (lista, ...chaves) => [...lista].sort((a, b) => { for (const [k, dir] of chaves) { const x = a[k] ?? "", y = b[k] ?? ""; if (x < y) return dir === "desc" ? 1 : -1; if (x > y) return dir === "desc" ? -1 : 1; } return 0; });
    const paginar = (lista, q, padrao) => { const page = parseInt(q.get("page") || "1"), limit = parseInt(q.get("limit") || padrao); return lista.slice((page - 1) * limit, (page - 1) * limit + limit); };
    const SCALARS = {
        patients: ["name", "cpf", "rg", "birthDate", "gender", "phone", "phone2", "email", "address", "addressNumber", "addressComplement", "neighborhood", "city", "state", "cep", "bloodType", "allergies", "chronicDiseases", "medications", "convenio", "convenioNumber", "convenioValidity", "emergencyName", "emergencyPhone", "emergencyRelation", "observations", "active"],
        appointments: ["patientId", "doctorId", "userId", "date", "time", "duration", "type", "status", "notes", "returnDate"],
        medicalRecords: ["patientId", "doctorId", "appointmentId", "date", "chiefComplaint", "anamnesis", "physicalExam", "bloodPressure", "heartRate", "temperature", "weight", "height", "oxygenSaturation", "diagnoses", "cidCodes", "treatment", "observations", "returnDate"],
        financials: ["patientId", "appointmentId", "type", "category", "description", "amount", "paymentMethod", "status", "dueDate", "paidDate", "notes"],
        doctors: ["crm", "specialty", "phone", "bio", "workDays", "startTime", "endTime", "slotMinutes"],
    };
    const aplicar = (obj, body, tabela) => { SCALARS[tabela].forEach((k) => { if (body[k] !== undefined) obj[k] = body[k] === "" && k !== "name" ? null : body[k]; }); return obj; };
    const criar = (tabela, body, extra = {}) => { const c = agora(); const o = aplicar({ id: uuid(), createdAt: c, updatedAt: c }, body, tabela); Object.keys(o).forEach((k) => o[k] === undefined && delete o[k]); return Object.assign(o, extra); };

    class Erro { constructor(status, corpo) { this.status = status; this.corpo = corpo; } }
    const falha = (status, error) => { throw new Erro(status, { error }); };

    // ---------- Rotas ----------
    function rotear(metodo, caminho, q, body, usuario) {
        const seg = caminho.replace(/^\/api\//, "").split("/").filter(Boolean);
        const [rec, id, sub] = seg;
        const exigir = () => { if (!usuario) falha(401, "Token não fornecido"); };
        const exigirAdmin = () => { exigir(); if (usuario.role !== "ADMIN") falha(403, "Acesso negado"); };

        if (rec === "health") return { status: "ok", system: "MediClinic ERP", version: "1.0.0" };
        if (rec === "auth") {
            if (id === "login" && metodo === "POST") {
                if (!body.email || !body.password) falha(400, "E-mail e senha são obrigatórios");
                const u = db.users.find((x) => x.email === String(body.email).trim().toLowerCase());
                if (!u || !u.active || u.password !== body.password) falha(401, "Credenciais inválidas");
                const doctor = db.doctors.find((d) => d.userId === u.id) || null;
                return { token: "demo-" + u.id, user: { id: u.id, name: u.name, email: u.email, role: u.role, doctor, mustChangePassword: u.mustChangePassword } };
            }
            exigir();
            if (id === "me") return { ...semSenha(userBy(usuario.id)), doctor: db.doctors.find((d) => d.userId === usuario.id) || null };
            if (id === "change-password" && metodo === "PUT") {
                const u = userBy(usuario.id);
                if (u.password !== body.currentPassword) falha(400, "Senha atual incorreta");
                if (String(body.newPassword || "").length < 8) falha(400, "A nova senha precisa ter pelo menos 8 caracteres");
                if (body.newPassword === body.currentPassword) falha(400, "A nova senha precisa ser diferente da atual");
                u.password = body.newPassword; u.mustChangePassword = false; salvar();
                return { message: "Senha alterada com sucesso" };
            }
        }
        exigir();
        const doctorDoUsuario = () => db.doctors.find((d) => d.userId === usuario.id);

        switch (rec) {
            case "users": {
                if (metodo === "GET") return ordenar(db.users, ["name", "asc"]).map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, createdAt: u.createdAt, doctor: db.doctors.find((d) => d.userId === u.id) || null }));
                exigirAdmin();
                if (metodo === "POST") {
                    if (db.users.some((u) => u.email === body.email)) falha(400, "Email já cadastrado");
                    const c = agora(); const u = { id: uuid(), name: body.name, email: body.email, password: body.password, role: body.role || "STAFF", active: true, mustChangePassword: false, createdAt: c, updatedAt: c };
                    db.users.push(u);
                    // o front cria o perfil de médico chamando POST /users de novo com crm/especialidade
                    salvar();
                    return [201, { id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, createdAt: u.createdAt }];
                }
                const u = userBy(id);
                if (!u) falha(500, metodo === "PUT" ? "Erro ao atualizar usuário" : "Erro ao desativar usuário");
                if (metodo === "PUT") { ["name", "email", "role", "active"].forEach((k) => { if (body[k] !== undefined) u[k] = body[k]; }); if (body.password) u.password = body.password; u.updatedAt = agora(); salvar(); return { id: u.id, name: u.name, email: u.email, role: u.role, active: u.active }; }
                if (metodo === "DELETE") { u.active = false; salvar(); return { message: "Usuário desativado" }; }
                break;
            }
            case "patients": {
                if (metodo === "GET" && !id) {
                    const search = q.get("search");
                    let lista = db.patients.filter((p) => p.active);
                    if (search) lista = lista.filter((p) => ["name", "cpf", "phone", "email"].some((k) => (p[k] || "").includes(search)));
                    return { data: paginar(ordenar(lista, ["name", "asc"]), q, "20"), total: lista.length, page: parseInt(q.get("page") || "1"), limit: parseInt(q.get("limit") || "20") };
                }
                if (metodo === "GET") {
                    const p = patientBy(id); if (!p) falha(404, "Paciente não encontrado");
                    return { ...p,
                        appointments: ordenar(db.appointments.filter((a) => a.patientId === id), ["date", "desc"]).slice(0, 10).map((a) => ({ ...a, doctor: comUser(doctorBy(a.doctorId), ["name"]) })),
                        medicalRecords: ordenar(db.medicalRecords.filter((r) => r.patientId === id), ["date", "desc"]).slice(0, 5),
                        financials: ordenar(db.financials.filter((f) => f.patientId === id), ["createdAt", "desc"]).slice(0, 10) };
                }
                if (metodo === "POST") {
                    if (body.cpf && db.patients.some((p) => p.cpf === body.cpf)) falha(400, "CPF já cadastrado");
                    const p = criar("patients", body, { active: body.active ?? true }); SCALARS.patients.forEach((k) => { if (p[k] === undefined) p[k] = null; }); p.active = p.active ?? true;
                    db.patients.push(p); salvar(); return [201, p];
                }
                const p = patientBy(id); if (!p) falha(500, "Erro ao atualizar paciente");
                if (metodo === "PUT") { aplicar(p, body, "patients"); p.updatedAt = agora(); salvar(); return p; }
                if (metodo === "DELETE") { p.active = false; salvar(); return { message: "Paciente desativado" }; }
                break;
            }
            case "doctors": {
                if (metodo === "GET" && !id) return ordenar(db.doctors.map((d) => comUser(d, ["id", "name", "email", "active"])), ).sort((a, b) => a.user.name.localeCompare(b.user.name));
                const d = doctorBy(id); if (!d) falha(404, "Médico não encontrado");
                if (metodo === "GET" && sub === "availability") {
                    const date = q.get("date");
                    const booked = db.appointments.filter((a) => a.doctorId === id && a.date === date && a.status !== "CANCELADO").map((a) => a.time);
                    const [sh, sm] = d.startTime.split(":").map(Number), [eh, em] = d.endTime.split(":").map(Number);
                    const slots = [];
                    for (let cur = sh * 60 + sm; cur + d.slotMinutes <= eh * 60 + em; cur += d.slotMinutes) { const t = `${pad(Math.floor(cur / 60))}:${pad(cur % 60)}`; if (!booked.includes(t)) slots.push(t); }
                    return { slots, bookedTimes: booked, doctor: d };
                }
                if (metodo === "GET") return comUser(d, ["id", "name", "email"]);
                if (metodo === "PUT") { aplicar(d, body, "doctors"); salvar(); return d; }
                break;
            }
            case "appointments": {
                const incluir = (a) => ({ ...a, patient: pick(patientBy(a.patientId), ["id", "name", "phone", "convenio"]), doctor: comUser(doctorBy(a.doctorId), ["name"]) });
                if (metodo === "GET" && !id) {
                    let lista = db.appointments;
                    const date = q.get("date"), doctorId = q.get("doctorId"), patientId = q.get("patientId"), status = q.get("status"), ini = q.get("startDate"), fim = q.get("endDate");
                    if (date) lista = lista.filter((a) => a.date === date);
                    if (doctorId) lista = lista.filter((a) => a.doctorId === doctorId);
                    if (patientId) lista = lista.filter((a) => a.patientId === patientId);
                    if (status) lista = lista.filter((a) => a.status === status);
                    if (ini && fim) lista = lista.filter((a) => a.date >= ini && a.date <= fim);
                    if (usuario.role === "DOCTOR") { const d = doctorDoUsuario(); if (d) lista = lista.filter((a) => a.doctorId === d.id); }
                    lista = ordenar(lista, ["date", "asc"], ["time", "asc"]);
                    return { data: paginar(lista, q, "50").map(incluir), total: lista.length };
                }
                if (metodo === "GET") {
                    const a = db.appointments.find((x) => x.id === id); if (!a) falha(404, "Agendamento não encontrado");
                    return { ...a, patient: patientBy(a.patientId), doctor: comUser(doctorBy(a.doctorId), ["name", "email"]),
                        medicalRecord: db.medicalRecords.find((r) => r.appointmentId === id) || null, financial: db.financials.find((f) => f.appointmentId === id) || null };
                }
                if (metodo === "POST") {
                    if (db.appointments.some((a) => a.doctorId === body.doctorId && a.date === body.date && a.time === body.time && a.status !== "CANCELADO")) falha(400, "Horário já ocupado para este médico");
                    const a = criar("appointments", { ...body, duration: body.duration || 30 }, { status: "AGENDADO" });
                    a.type = a.type || "CONSULTA"; a.userId = a.userId ?? null; a.notes = a.notes ?? null; a.returnDate = a.returnDate ?? null;
                    db.appointments.push(a); salvar();
                    return [201, { ...a, patient: pick(patientBy(a.patientId), ["name", "phone"]), doctor: comUser(doctorBy(a.doctorId), ["name"]) }];
                }
                const a = db.appointments.find((x) => x.id === id); if (!a) falha(500, "Erro ao atualizar agendamento");
                if (metodo === "PUT") { aplicar(a, body, "appointments"); a.updatedAt = agora(); salvar(); return { ...a, patient: pick(patientBy(a.patientId), ["name"]), doctor: comUser(doctorBy(a.doctorId), ["name"]) }; }
                if (metodo === "PATCH" && sub === "status") { a.status = body.status; a.updatedAt = agora(); salvar(); return a; }
                if (metodo === "DELETE") { a.status = "CANCELADO"; a.updatedAt = agora(); salvar(); return { message: "Agendamento cancelado" }; }
                break;
            }
            case "medical-records": {
                const filhos = (r) => ({ prescriptions: db.prescriptions.filter((p) => p.medicalRecordId === r.id), examRequests: db.examRequests.filter((e) => e.medicalRecordId === r.id), certificates: db.certificates.filter((c) => c.medicalRecordId === r.id) });
                if (metodo === "GET" && !id) {
                    let lista = db.medicalRecords;
                    if (q.get("patientId")) lista = lista.filter((r) => r.patientId === q.get("patientId"));
                    if (q.get("doctorId")) lista = lista.filter((r) => r.doctorId === q.get("doctorId"));
                    if (usuario.role === "DOCTOR") lista = lista.filter((r) => r.doctorId === usuario.id);
                    lista = ordenar(lista, ["date", "desc"]);
                    return { data: paginar(lista, q, "20").map((r) => ({ ...r, patient: pick(patientBy(r.patientId), ["id", "name", "birthDate"]), doctor: pick(userBy(r.doctorId), ["id", "name"]), ...filhos(r) })), total: lista.length };
                }
                if (metodo === "GET") {
                    const r = db.medicalRecords.find((x) => x.id === id); if (!r) falha(404, "Prontuário não encontrado");
                    return { ...r, patient: patientBy(r.patientId), doctor: pick(userBy(r.doctorId), ["id", "name"]), appointment: db.appointments.find((a) => a.id === r.appointmentId) || null, ...filhos(r) };
                }
                if (metodo === "POST") {
                    if (body.appointmentId && db.medicalRecords.some((r) => r.appointmentId === body.appointmentId)) falha(500, "Erro ao criar prontuário");
                    const r = criar("medicalRecords", body, { doctorId: usuario.id }); SCALARS.medicalRecords.forEach((k) => { if (r[k] === undefined) r[k] = null; });
                    db.medicalRecords.push(r); salvar();
                    return [201, { ...r, patient: pick(patientBy(r.patientId), ["name"]), doctor: pick(userBy(r.doctorId), ["name"]) }];
                }
                if (metodo === "PUT") { const r = db.medicalRecords.find((x) => x.id === id); if (!r) falha(500, "Erro ao atualizar prontuário"); aplicar(r, body, "medicalRecords"); r.updatedAt = agora(); salvar(); return r; }
                break;
            }
            case "prescriptions": {
                if (metodo === "GET" && !id) {
                    let lista = db.prescriptions;
                    if (q.get("patientId")) lista = lista.filter((p) => p.patientId === q.get("patientId"));
                    if (q.get("medicalRecordId")) lista = lista.filter((p) => p.medicalRecordId === q.get("medicalRecordId"));
                    if (usuario.role === "DOCTOR") lista = lista.filter((p) => p.doctorId === usuario.id);
                    return ordenar(lista, ["date", "desc"]).map((p) => ({ ...p, patient: pick(patientBy(p.patientId), ["name", "birthDate"]), doctor: pick(userBy(p.doctorId), ["name"]) }));
                }
                if (metodo === "GET") { const p = db.prescriptions.find((x) => x.id === id); if (!p) falha(404, "Prescrição não encontrada"); return { ...p, patient: patientBy(p.patientId), doctor: pick(userBy(p.doctorId), ["name"]) }; }
                if (metodo === "POST") {
                    const p = { id: uuid(), medicalRecordId: body.medicalRecordId ?? null, patientId: body.patientId, doctorId: usuario.id, medications: body.medications, instructions: body.instructions ?? null, date: body.date, valid: true, createdAt: agora() };
                    db.prescriptions.push(p); salvar(); return [201, { ...p, patient: pick(patientBy(p.patientId), ["name"]), doctor: pick(userBy(p.doctorId), ["name"]) }];
                }
                break;
            }
            case "exams":
            case "certificates": {
                const tabela = rec === "exams" ? db.examRequests : db.certificates;
                const comRec = (x, pacienteCompleto) => { const r = db.medicalRecords.find((m) => m.id === x.medicalRecordId); return { ...x, medicalRecord: r ? { ...r, patient: pacienteCompleto ? patientBy(r.patientId) : pick(patientBy(r.patientId), ["name"]), doctor: pick(userBy(r.doctorId), ["name"]) } : null }; };
                if (metodo === "GET" && !id) { let l = tabela; if (q.get("medicalRecordId")) l = l.filter((x) => x.medicalRecordId === q.get("medicalRecordId")); return ordenar(l, ["date", "desc"]).map((x) => comRec(x, false)); }
                if (metodo === "GET" && rec === "certificates") { const c = tabela.find((x) => x.id === id); if (!c) falha(404, "Certificado não encontrado"); return comRec(c, true); }
                if (metodo === "POST") {
                    const x = rec === "exams"
                        ? { id: uuid(), medicalRecordId: body.medicalRecordId, exams: body.exams, urgency: body.urgency || "NORMAL", instructions: body.instructions ?? null, date: body.date, createdAt: agora() }
                        : { id: uuid(), medicalRecordId: body.medicalRecordId, type: body.type || "ATESTADO", content: body.content, days: body.days ?? null, date: body.date, createdAt: agora() };
                    tabela.push(x); salvar(); return [201, x];
                }
                break;
            }
            case "financial": {
                if (metodo === "GET") {
                    let lista = db.financials;
                    const type = q.get("type"), status = q.get("status"), ini = q.get("startDate"), fim = q.get("endDate");
                    if (type) lista = lista.filter((f) => f.type === type);
                    if (status) lista = lista.filter((f) => f.status === status);
                    if (ini && fim) { const a = new Date(ini).toISOString(), b = new Date(fim).toISOString(); lista = lista.filter((f) => f.createdAt >= a && f.createdAt <= b); }
                    lista = ordenar(lista, ["createdAt", "desc"]);
                    const base = status ? db.financials.filter((f) => f.status === status) : db.financials;
                    const summary = ["RECEITA", "DESPESA"].filter((t) => base.some((f) => f.type === t)).map((t) => ({ _sum: { amount: base.filter((f) => f.type === t).reduce((s, f) => s + f.amount, 0) }, type: t }));
                    return { data: paginar(lista, q, "20").map((f) => ({ ...f, patient: f.patientId ? pick(patientBy(f.patientId), ["name"]) : null })), total: lista.length, summary };
                }
                if (metodo === "POST") { const f = criar("financials", body); SCALARS.financials.forEach((k) => { if (f[k] === undefined) f[k] = null; }); f.type = f.type || "RECEITA"; f.category = f.category || "CONSULTA"; f.status = f.status || "PENDENTE"; db.financials.push(f); salvar(); return [201, { ...f, patient: f.patientId ? pick(patientBy(f.patientId), ["name"]) : null }]; }
                const f = db.financials.find((x) => x.id === id); if (!f) falha(500, "Erro ao atualizar lançamento");
                if (metodo === "PUT") { aplicar(f, body, "financials"); f.updatedAt = agora(); salvar(); return f; }
                if (metodo === "PATCH" && sub === "pay") { f.status = "PAGO"; f.paymentMethod = body.paymentMethod; f.paidDate = body.paidDate || new Date().toISOString().split("T")[0]; f.updatedAt = agora(); salvar(); return f; }
                if (metodo === "DELETE") { db.financials = db.financials.filter((x) => x.id !== id); salvar(); return { message: "Lançamento removido" }; }
                break;
            }
            case "invoices": {
                if (metodo === "GET" && !id) {
                    let lista = db.invoices; if (q.get("patientId")) lista = lista.filter((i) => i.patientId === q.get("patientId"));
                    lista = ordenar(lista, ["createdAt", "desc"]);
                    return { data: paginar(lista, q, "20").map((i) => ({ ...i, patient: pick(patientBy(i.patientId), ["name", "cpf"]) })), total: lista.length };
                }
                if (metodo === "GET") { const i = db.invoices.find((x) => x.id === id); if (!i) falha(404, "Nota não encontrada"); return { ...i, patient: patientBy(i.patientId) }; }
                if (metodo === "POST") {
                    const i = { id: uuid(), number: pad(db.invoices.length + 1, 6), patientId: body.patientId, services: body.services, subtotal: body.subtotal, discount: body.discount ?? 0, total: body.total,
                        paymentMethod: body.paymentMethod ?? null, status: body.status || "EMITIDA", date: body.date, notes: body.notes ?? null, createdAt: agora() };
                    db.invoices.push(i); salvar(); return [201, { ...i, patient: pick(patientBy(i.patientId), ["name", "cpf"]) }];
                }
                if (metodo === "PATCH" && sub === "cancel") { const i = db.invoices.find((x) => x.id === id); if (!i) falha(500, "Erro ao cancelar nota"); i.status = "CANCELADA"; salvar(); return i; }
                break;
            }
            case "reports": {
                if (id === "dashboard") {
                    const today = new Date().toISOString().split("T")[0], first = today.substring(0, 8) + "01";
                    const porStatus = {};
                    db.appointments.filter((a) => a.date >= first).forEach((a) => { porStatus[a.status] = (porStatus[a.status] || 0) + 1; });
                    return {
                        totalPatients: db.patients.filter((p) => p.active).length,
                        todayAppointments: db.appointments.filter((a) => a.date === today).length,
                        monthAppointments: db.appointments.filter((a) => a.date >= first && a.date <= today).length,
                        pendingPayments: db.financials.filter((f) => f.status === "PENDENTE" && f.type === "RECEITA").reduce((s, f) => s + f.amount, 0),
                        monthRevenue: db.financials.filter((f) => f.status === "PAGO" && f.type === "RECEITA" && f.paidDate >= first).reduce((s, f) => s + f.amount, 0),
                        appointmentsByStatus: Object.entries(porStatus).map(([status, n]) => ({ _count: { status: n }, status })),
                    };
                }
                const ini = q.get("startDate"), fim = q.get("endDate");
                const noPeriodoCriado = (x) => !(ini && fim) || (x.createdAt >= new Date(ini).toISOString() && x.createdAt <= new Date(fim).toISOString());
                if (id === "appointments") {
                    let lista = db.appointments;
                    if (ini && fim) lista = lista.filter((a) => a.date >= ini && a.date <= fim);
                    if (q.get("doctorId")) lista = lista.filter((a) => a.doctorId === q.get("doctorId"));
                    lista = ordenar(lista, ["date", "asc"], ["time", "asc"]).map((a) => ({ ...a, patient: pick(patientBy(a.patientId), ["name", "convenio"]), doctor: comUser(doctorBy(a.doctorId), ["name"]) }));
                    const byStatus = {}, byDoctor = {};
                    lista.forEach((a) => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; byDoctor[a.doctor.user.name] = (byDoctor[a.doctor.user.name] || 0) + 1; });
                    return { data: lista, byStatus, byDoctor, total: lista.length };
                }
                if (id === "financial") {
                    const receitas = db.financials.filter((f) => f.type === "RECEITA" && noPeriodoCriado(f)).map((f) => ({ ...f, patient: f.patientId ? pick(patientBy(f.patientId), ["name"]) : null }));
                    const despesas = db.financials.filter((f) => f.type === "DESPESA" && noPeriodoCriado(f));
                    const tr = receitas.reduce((s, i) => s + i.amount, 0), td = despesas.reduce((s, i) => s + i.amount, 0);
                    return { receitas, despesas, totalReceitas: tr, totalDespesas: td, saldo: tr - td };
                }
                if (id === "patients") {
                    const lista = ordenar(db.patients.filter((p) => p.active && noPeriodoCriado(p)), ["createdAt", "desc"]).map((p) => pick(p, ["id", "name", "gender", "city", "convenio", "createdAt", "birthDate"]));
                    const byGender = {}, byConvenio = {};
                    lista.forEach((p) => { const g = p.gender || "Não informado", c = p.convenio || "Particular"; byGender[g] = (byGender[g] || 0) + 1; byConvenio[c] = (byConvenio[c] || 0) + 1; });
                    return { data: lista, byGender, byConvenio, total: lista.length };
                }
                break;
            }
            case "cid10": {
                const dados = window.CID10_DATA || [];
                if (id) { const c = dados.find((x) => x.code === id.toUpperCase()); if (!c) falha(404, "CID não encontrado"); return c; }
                const busca = q.get("search"), limit = parseInt(q.get("limit") || "20");
                if (!busca) return dados.slice(0, limit);
                const t = busca.toLowerCase().trim();
                return dados.filter((c) => c.code.toLowerCase().includes(t) || c.description.toLowerCase().includes(t)).slice(0, limit);
            }
            case "config": {
                if (metodo === "GET") return { ...db.configs };
                if (metodo === "PUT") { Object.assign(db.configs, body); salvar(); return { message: "Configurações salvas" }; }
                break;
            }
            case "audit": exigirAdmin(); return { data: [], total: 0 };
        }
        falha(404, "Rota não encontrada");
    }

    // ---------- XMLHttpRequest falso (o axios do front usa XHR) ----------
    const XHRReal = window.XMLHttpRequest;
    class XHRDemo {
        constructor() { this.readyState = 0; this.status = 0; this.statusText = ""; this.responseText = ""; this.response = ""; this.responseType = ""; this.timeout = 0; this.withCredentials = false; this.upload = { addEventListener() {} }; this._h = {}; this._ls = {}; }
        open(metodo, url) { this._m = String(metodo).toUpperCase(); this._url = url; this.readyState = 1; }
        setRequestHeader(k, v) { this._h[k.toLowerCase()] = v; }
        getAllResponseHeaders() { return "content-type: application/json; charset=utf-8\r\n"; }
        getResponseHeader(k) { return k.toLowerCase() === "content-type" ? "application/json; charset=utf-8" : null; }
        addEventListener(t, fn) { (this._ls[t] ||= []).push(fn); }
        removeEventListener() {}
        abort() { this._abortado = true; }
        send(dados) {
            setTimeout(() => {
                if (this._abortado) return;
                const url = new URL(this._url, location.href);
                const auth = this._h.authorization || "";
                const usuario = /^Bearer demo-/.test(auth) ? userBy(auth.slice(12)) : null;
                let corpo = {};
                try { corpo = dados ? JSON.parse(dados) : {}; } catch (e) { corpo = {}; }
                let status = 200, resp;
                try {
                    if (auth && !usuario) throw new Erro(401, { error: "Token inválido ou expirado" });
                    const r = rotear(this._m, url.pathname.replace(/^.*?\/api\//, "/api/"), url.searchParams, corpo, usuario ? { id: usuario.id, role: usuario.role, name: usuario.name, email: usuario.email } : null);
                    if (Array.isArray(r) && typeof r[0] === "number" && r.length === 2) { status = r[0]; resp = r[1]; } else resp = r;
                } catch (e) {
                    if (e instanceof Erro) { status = e.status; resp = e.corpo; } else { status = 500; resp = { error: "Erro interno", details: String(e && e.message) }; console.error(e); }
                }
                this.status = status; this.statusText = status === 200 ? "OK" : String(status);
                this.responseText = this.response = resp === undefined ? "" : JSON.stringify(resp);
                this.readyState = 4;
                const ev = { target: this };
                this.onreadystatechange && this.onreadystatechange(ev);
                this.onload && this.onload(ev);
                this.onloadend && this.onloadend(ev);
                ["readystatechange", "load", "loadend"].forEach((t) => (this._ls[t] || []).forEach((fn) => fn(ev)));
            }, 60);
        }
    }
    window.XMLHttpRequest = function () {
        const fake = new XHRDemo();
        return new Proxy(fake, {
            get(alvo, prop) {
                if (prop === "open") return (m, url, ...resto) => {
                    if (/(^|\/)api\//.test(String(url)) || String(url).startsWith("/api")) return alvo.open(m, url);
                    // qualquer outra requisição segue para o XHR de verdade
                    const real = new XHRReal(); alvo._real = real; real.open(m, url, ...resto); return undefined;
                };
                if (alvo._real) { const v = alvo._real[prop]; return typeof v === "function" ? v.bind(alvo._real) : v; }
                const v = alvo[prop]; return typeof v === "function" ? v.bind(alvo) : v;
            },
            set(alvo, prop, valor) { if (alvo._real) alvo._real[prop] = valor; else alvo[prop] = valor; return true; },
        });
    };
})();
