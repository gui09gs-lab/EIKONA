/* Motor dos projetos conceito da Eikóna: lê os dados do site (script#dados) e monta as seções. */
(() => {
"use strict";
const D = JSON.parse(document.getElementById("dados").textContent);
const WA = "5511983701215";
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const brl = v => "R$ " + Number(v).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const precoTxt = p => p == null ? "" : typeof p === "number" ? brl(p) : esc(p);
const cab = s => `<div class="cab">${s.rot ? `<span class="rot">${esc(s.rot)}</span>` : ""}${s.titulo ? `<h2>${esc(s.titulo)}</h2>` : ""}${s.sub ? `<p>${esc(s.sub)}</p>` : ""}</div>`;
const sec = (s, corpo) => `<section class="sec gut ${s.fundo || ""}" id="${esc(s.id || "")}"><div class="in">${cab(s)}${corpo}</div></section>`;
const msgWa = txt => "https://wa.me/" + WA + "?text=" + encodeURIComponent(`[Projeto conceito · ${D.nome}]\n${txt}\n\n(Teste do site conceito criado pela Eikóna.)`);
let toastT;
function avisar(t) { let el = $("#toast"); if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.append(el); } el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 3800); }
function abrirWa(txt) { avisar("Neste projeto conceito, a mensagem vai para o WhatsApp da Eikóna, que criou o site."); window.open(msgWa(txt), "_blank", "noopener"); }

/* ---------- carrinho (cardápio, ofertas, encomendas, catálogo) ---------- */
const CK = "eik-conceito-" + D.slug;
let carro = {}; try { carro = JSON.parse(localStorage.getItem(CK) || "{}"); } catch {}
const ITENS = {};
const salvar = () => { try { localStorage.setItem(CK, JSON.stringify(carro)); } catch {} };
function qtdHTML(id) {
  const q = carro[id] || 0;
  return q ? `<span class="qtd" data-q="${esc(id)}"><button type="button" data-menos aria-label="Tirar um">−</button><span>${q}</span><button type="button" data-mais aria-label="Pôr mais um">+</button></span>`
    : `<span class="qtd" data-q="${esc(id)}"><button type="button" class="add" data-mais>Adicionar</button></span>`;
}
function atualizarSacola() {
  const ids = Object.keys(carro).filter(k => carro[k] > 0 && ITENS[k]);
  let el = $("#sacola");
  if (!ids.length) { if (el) el.hidden = true; return; }
  if (!el) { el = document.createElement("div"); el.id = "sacola"; el.className = "sacola"; document.body.append(el); }
  const tot = ids.reduce((s, k) => s + (typeof ITENS[k].p === "number" ? ITENS[k].p * carro[k] : 0), 0), n = ids.reduce((s, k) => s + carro[k], 0);
  el.hidden = false;
  el.innerHTML = `<span>${n} ${n === 1 ? "item" : "itens"}${tot ? ` · <b>${brl(tot)}</b>` : ""}</span><button class="btn" type="button" id="fechar">${esc(D.textoPedido || "Enviar pedido")}</button>`;
  $("#fechar").onclick = () => {
    const linhas = ids.map(k => `${carro[k]}x ${ITENS[k].n}${typeof ITENS[k].p === "number" ? " · " + brl(ITENS[k].p * carro[k]) : ""}`);
    abrirWa(`${D.textoPedido || "Pedido"}:\n${linhas.join("\n")}${tot ? `\nTotal: ${brl(tot)}` : ""}`);
  };
}
document.addEventListener("click", e => {
  const q = e.target.closest("[data-q]"); if (!q) return;
  const id = q.dataset.q;
  if (e.target.closest("[data-mais]")) carro[id] = (carro[id] || 0) + 1;
  else if (e.target.closest("[data-menos]")) carro[id] = Math.max(0, (carro[id] || 0) - 1);
  else return;
  salvar(); q.outerHTML = qtdHTML(id); atualizarSacola();
});

/* ---------- seções ---------- */
const R = {};
R.hero = s => `<section class="hero ${s.estilo === "dividido" ? "dividido" : ""}" id="inicio">${s.estilo === "dividido" ? "" : `<img class="foto" src="${esc(s.img)}" alt="${esc(s.alt || "")}" fetchpriority="high">`}
  <div class="in gut"><div style="display:grid;gap:18px">${s.rot ? `<span class="rot">${esc(s.rot)}</span>` : ""}<h1>${esc(s.titulo)}</h1>${s.sub ? `<p class="sub">${esc(s.sub)}</p>` : ""}
  <div class="acoes">${(s.acoes || []).map(a => `<a class="btn ${a.pri ? "pri" : "sec"}" href="${esc(a.href)}">${esc(a.t)}</a>`).join("")}</div></div>
  ${s.estilo === "dividido" ? `<img class="foto" src="${esc(s.img)}" alt="${esc(s.alt || "")}" fetchpriority="high">` : ""}</div></section>`;
R.texto = s => sec(s, `${s.itens ? `<div class="grade">${s.itens.map(i => `<div class="cartao"><h3>${esc(i.t)}</h3><p class="suave">${esc(i.d)}</p></div>`).join("")}</div>` : ""}
  ${s.mosaico ? `<div class="mosaico" style="margin-top:28px">${s.mosaico.map(m => `<img src="${esc(m.img)}" alt="${esc(m.alt || "")}" loading="lazy">`).join("")}</div>` : ""}`);
R.servicos = s => sec(s, (s.grupos || [{ itens: s.itens }]).map(g => `${g.nome ? `<h3 style="margin:18px 0 4px">${esc(g.nome)}</h3>` : ""}<div class="servicos">${g.itens.map(i => `<div class="serv"><b>${esc(i.n)}</b><span class="preco">${precoTxt(i.p)}</span>${i.d ? `<span class="d">${esc(i.d)}</span>` : ""}${i.t ? `<span class="t">${esc(i.t)}</span>` : ""}</div>`).join("")}</div>`).join("")
  + (s.agendar ? `<div style="margin-top:28px"><a class="btn pri" href="#agendar">${esc(s.agendar)}</a></div>` : ""));
R.galeria = s => {
  const cats = [...new Set(s.itens.map(i => i.cat).filter(Boolean))];
  return sec(s, `${cats.length > 1 ? `<div class="filtros" role="group" aria-label="Filtrar">${["Todos", ...cats].map((c, i) => `<button type="button" data-filtro="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`).join("")}</div>` : ""}
    <div class="galeria">${s.itens.map(i => `<figure data-cat="${esc(i.cat || "")}" data-img="${esc(i.img)}" data-leg="${esc(i.leg || "")}" tabindex="0"><img src="${esc(i.img)}" alt="${esc(i.leg || "")}" loading="lazy">${i.leg ? `<figcaption>${esc(i.leg)}</figcaption>` : ""}</figure>`).join("")}</div>`);
};
R.cardapio = s => sec(s, `${s.grupos.length > 2 ? `<nav class="cats" aria-label="Categorias">${s.grupos.map((g, i) => `<a href="#${esc(s.id)}-${i}">${esc(g.nome)}</a>`).join("")}</nav>` : ""}
  ${s.grupos.map((g, gi) => `<div class="grupo" id="${esc(s.id)}-${gi}"><h3>${esc(g.nome)}</h3>${g.itens.map((i, ii) => { const id = `${s.id}-${gi}-${ii}`; ITENS[id] = i;
    return `<div class="item${i.img ? " foto" : ""}">${i.img ? `<img src="${esc(i.img)}" alt="" loading="lazy">` : ""}<span class="nm">${esc(i.n)}</span><span class="preco">${precoTxt(i.p)}</span>${s.pedido === false ? "<span></span>" : qtdHTML(id)}${i.d ? `<span class="d">${esc(i.d)}</span>` : ""}</div>`; }).join("")}</div>`).join("")}
  ${s.nota ? `<p class="suave">${esc(s.nota)}</p>` : ""}`);
R.ofertas = s => sec(s, `<div class="produtos">${s.itens.map((i, ii) => { const id = `${s.id}-${ii}`; ITENS[id] = i;
  return `<div class="produto oferta">${i.selo ? `<span class="selo">${esc(i.selo)}</span>` : ""}<img src="${esc(i.img)}" alt="${esc(i.n)}" loading="lazy" style="aspect-ratio:1">
    <b>${esc(i.n)}</b><span class="suave" style="font-size:13px">${esc(i.un || "")}</span><span>${i.de ? `<span class="de">${brl(i.de)}</span>` : ""}<span class="preco">${precoTxt(i.p)}</span></span>${qtdHTML(id)}</div>`; }).join("")}</div>
  ${s.nota ? `<p class="suave" style="margin-top:20px">${esc(s.nota)}</p>` : ""}`);
R.catalogo = s => sec(s, `<div class="produtos">${s.itens.map((i, ii) => {
  const base = `${s.id}-${ii}`;
  return `<div class="produto" data-prod="${esc(base)}"><img src="${esc(i.img)}" alt="${esc(i.n)}" loading="lazy"><div class="linha"><b>${esc(i.n)}</b><span class="preco">${precoTxt(i.p)}</span></div>
    ${i.d ? `<span class="suave" style="font-size:14px">${esc(i.d)}</span>` : ""}
    <div class="tams" role="group" aria-label="Tamanho">${(i.tams || []).map((t, ti) => `<button type="button" data-tam="${esc(t)}" aria-pressed="${ti === 0}">${esc(t)}</button>`).join("")}</div>
    <button class="btn pri peq" type="button" data-addprod="${ii}" data-sec="${esc(s.id)}">Adicionar à sacola</button></div>`; }).join("")}</div>`);
R.exercicios = s => {
  const g0 = s.grupos[0].nome;
  return sec(s, `<div class="grupos-m" role="group" aria-label="Grupo muscular">${s.grupos.map((g, i) => `<button type="button" data-gm="${i}" aria-pressed="${i === 0}">${esc(g.nome)}</button>`).join("")}</div>
    <div id="exs" class="exs"></div>
    <div class="treino" id="treino"><div class="linha"><h3>Meu treino de hoje</h3><button class="btn sec peq" type="button" id="limparTreino">Limpar</button></div><ol id="treinoLista"></ol><p class="suave" id="treinoVazio">Toque em "Pôr no treino" nos exercícios para montar a sua ficha.</p>
      <div><button class="btn pri" type="button" id="enviarTreino">Mandar a ficha para o professor</button></div></div>`);
};
const CORPO = { "Peito": [[17, 13, 14, 8]], "Costas": [[17, 13, 14, 12]], "Pernas": [[17, 33, 6, 22], [25, 33, 6, 22]], "Ombros": [[13, 12, 5, 5], [30, 12, 5, 5]], "Braços": [[11, 16, 4, 14], [33, 16, 4, 14]], "Abdômen": [[19, 21, 10, 10]], "Glúteos": [[17, 31, 14, 6]], "Cardio": [[17, 13, 14, 18]] };
function boneco(gr) {
  const hl = (CORPO[gr] || []).map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="var(--acento)"/>`).join("");
  return `<svg viewBox="0 0 48 58" aria-hidden="true"><g fill="currentColor" opacity=".28"><circle cx="24" cy="6" r="5"/><rect x="17" y="12" width="14" height="21" rx="3"/><rect x="11" y="13" width="5" height="18" rx="2.5"/><rect x="32" y="13" width="5" height="18" rx="2.5"/><rect x="17" y="33" width="6" height="23" rx="3"/><rect x="25" y="33" width="6" height="23" rx="3"/></g>${hl}</svg>`;
}
let treino = []; try { treino = JSON.parse(localStorage.getItem(CK + "-treino") || "[]"); } catch {}
function desenharExs(s, gi) {
  const g = s.grupos[gi];
  $("#exs").innerHTML = g.exs.map(x => { const no = treino.some(t => t.n === x.n);
    return `<article class="ex${no ? " no-treino" : ""}"><div class="musc">${boneco(g.nome)}<div><h3>${esc(x.n)}</h3><span style="font-size:13px;opacity:.7">${esc(g.nome)}${x.eq ? " · " + esc(x.eq) : ""}</span></div></div>
      <div class="met"><span>${esc(x.s)} séries</span><span>${esc(x.r)}</span>${x.desc ? `<span>descanso ${esc(x.desc)}</span>` : ""}</div>
      <p class="dica">${esc(x.dica)}</p><button class="btn ${no ? "pri" : "sec"} peq" type="button" data-treino="${esc(x.n)}" data-g="${gi}">${no ? "No treino" : "Pôr no treino"}</button></article>`; }).join("");
}
function desenharTreino() {
  const ol = $("#treinoLista"); if (!ol) return;
  ol.innerHTML = treino.map(t => `<li><b>${esc(t.n)}</b> · ${esc(t.s)} séries de ${esc(t.r)}</li>`).join("");
  $("#treinoVazio").hidden = !!treino.length; $("#enviarTreino").disabled = !treino.length;
  try { localStorage.setItem(CK + "-treino", JSON.stringify(treino)); } catch {}
}
R.planos = s => sec(s, `<div class="planos">${s.itens.map(p => `<div class="plano${p.dest ? " dest" : ""}">${p.dest ? `<span class="rot">${esc(p.dest)}</span>` : ""}<h3>${esc(p.n)}</h3><div class="valor">${precoTxt(p.p)}${p.per ? `<small> ${esc(p.per)}</small>` : ""}</div><ul>${p.itens.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
  <a class="btn ${p.dest ? "pri" : "sec"}" href="${esc(msgWa(`Quero saber mais sobre o plano ${p.n}.`))}" target="_blank" rel="noopener">${esc(s.botao || "Quero este")}</a></div>`).join("")}</div>`);
R.orcamento = s => sec(s, `<form class="form" id="form-${esc(s.id)}" data-orc="${esc(s.id)}" novalidate>${s.campos.map((c, i) => {
  const id = `${s.id}-c${i}`, cls = c.int ? "int" : "";
  if (c.tipo === "select") return `<label class="${cls}" for="${id}">${esc(c.label)}<select id="${id}" data-l="${esc(c.label)}">${c.ops.map(o => `<option>${esc(o)}</option>`).join("")}</select></label>`;
  if (c.tipo === "opcoes") return `<fieldset class="${cls} opcoes" style="border:0;padding:0;margin:0" data-l="${esc(c.label)}"><legend style="font-size:14px;font-weight:600;margin-bottom:6px">${esc(c.label)}</legend>${c.ops.map((o, oi) => `<label><input type="${c.multi ? "checkbox" : "radio"}" name="${id}" value="${esc(o)}" ${!c.multi && oi === 0 ? "checked" : ""}>${esc(o)}</label>`).join("")}</fieldset>`;
  if (c.tipo === "textarea") return `<label class="${cls || "int"}" for="${id}">${esc(c.label)}<textarea id="${id}" data-l="${esc(c.label)}" placeholder="${esc(c.ph || "")}"></textarea></label>`;
  return `<label class="${cls}" for="${id}">${esc(c.label)}<input id="${id}" data-l="${esc(c.label)}" placeholder="${esc(c.ph || "")}"></label>`; }).join("")}
  <div class="int"><button class="btn pri" type="submit">${esc(s.botao || "Pedir orçamento pelo WhatsApp")}</button></div></form>`);
R.equipe = s => sec(s, `<div class="grade">${s.itens.map(p => `<div class="cartao">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy" style="aspect-ratio:1;object-fit:cover;border-radius:var(--raio,8px);margin-bottom:6px">` : ""}<h3>${esc(p.n)}</h3><span class="rot">${esc(p.f)}</span><p class="suave">${esc(p.d)}</p></div>`).join("")}</div>`);
R.faq = s => sec(s, `<div class="faq">${s.itens.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`);
R.agenda = s => {
  const dias = []; const d0 = new Date();
  for (let i = 0; dias.length < 7; i++) { const d = new Date(d0); d.setDate(d0.getDate() + i); if (!(s.fechado || [0]).includes(d.getDay())) dias.push(d); }
  const DS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  return sec(s, `<div class="agenda" id="ag"><div>
    <div class="passo"><b>1. ${esc(s.rotServ || "Serviço")}</b><div class="escolhas" data-grupo="serv">${s.servicos.map((x, i) => `<button type="button" data-v="${esc(x.n)}" data-p="${esc(x.p ?? "")}" aria-pressed="${i === 0}">${esc(x.n)}<small>${[x.t, typeof x.p === "number" ? brl(x.p) : x.p].filter(Boolean).map(esc).join(" · ")}</small></button>`).join("")}</div></div>
    ${s.profissionais ? `<div class="passo"><b>2. ${esc(s.rotProf || "Com quem")}</b><div class="escolhas" data-grupo="prof">${["Sem preferência", ...s.profissionais].map((p, i) => `<button type="button" data-v="${esc(p)}" aria-pressed="${i === 0}">${esc(p)}</button>`).join("")}</div></div>` : ""}
    <div class="passo"><b>${s.profissionais ? 3 : 2}. Dia</b><div class="escolhas dias" data-grupo="dia">${dias.map((d, i) => `<button type="button" data-v="${DS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}" aria-pressed="${i === 1}">${DS[d.getDay()]}<small style="font-size:16px;font-weight:700">${d.getDate()}</small></button>`).join("")}</div></div>
    <div class="passo"><b>${s.profissionais ? 4 : 3}. Horário</b><div class="escolhas" data-grupo="hora">${(s.horas || ["09:00", "10:00", "11:00", "14:00", "15:30", "17:00", "18:30"]).map((h, i) => `<button type="button" data-v="${esc(h)}" aria-pressed="${i === 3}">${esc(h)}</button>`).join("")}</div></div>
  </div><aside class="resumo" id="agResumo"></aside></div>`);
};
R.infos = s => sec(s, `<div class="infos">${(s.blocos || []).map(b => `<div><h3>${esc(b.t)}</h3>${b.l.map(l => `<p class="suave">${esc(l)}</p>`).join("")}</div>`).join("")}</div>
  ${s.cta ? `<div style="margin-top:28px"><a class="btn pri" href="${esc(msgWa(s.cta.msg))}" target="_blank" rel="noopener">${esc(s.cta.t)}</a></div>` : ""}`);

/* ---------- montagem ---------- */
document.title = D.titulo || D.nome;
const corpo = D.secoes.map(s => (R[s.tipo] || (() => ""))(s)).join("");
document.getElementById("app").innerHTML = `
  <div class="conceito gut"><div class="in"><span><b>eikóna<i>.</i></b> · Projeto conceito: ${esc(D.nome)} é uma empresa fictícia criada para mostrar o que fazemos.</span>
    <span><a href="${esc("https://wa.me/" + WA + "?text=" + encodeURIComponent(`Oi! Vi o projeto conceito ${D.nome} e quero um site assim para a minha empresa.`))}" target="_blank" rel="noopener">Quero um site assim</a> · <a href="../../">Ver todos os projetos</a></span></div></div>
  <header class="topo gut"><div class="in"><a class="logo" href="#inicio">${esc(D.nome)}${D.sub ? `<small>${esc(D.sub)}</small>` : ""}</a>
    <nav class="menu" aria-label="Seções">${(D.menu || []).map(([id, t]) => `<a href="#${esc(id)}">${esc(t)}</a>`).join("")}</nav>${D.cta ? `<a class="btn pri peq" href="${esc(D.cta.href)}">${esc(D.cta.t)}</a>` : ""}</div></header>
  <main>${corpo}</main>
  <footer class="rodape gut"><div class="in"><span>${esc(D.nome)} · ${esc(D.bairro || "São Paulo")} · empresa fictícia</span><span>Projeto conceito de site por <a href="../../">Eikóna Marketing e Comunicação</a> · <a href="../creditos.html#${esc(D.slug)}">Créditos das fotos</a></span></div></footer>`;
atualizarSacola();

/* galeria: filtro e ampliação */
document.addEventListener("click", e => {
  const f = e.target.closest("[data-filtro]");
  if (f) { const box = f.closest("section"); box.querySelectorAll("[data-filtro]").forEach(b => b.setAttribute("aria-pressed", String(b === f)));
    box.querySelectorAll(".galeria figure").forEach(fig => fig.hidden = f.dataset.filtro !== "Todos" && fig.dataset.cat !== f.dataset.filtro); return; }
  const fig = e.target.closest(".galeria figure");
  if (fig) { const c = document.createElement("div"); c.className = "caixa"; c.setAttribute("role", "dialog"); c.setAttribute("aria-label", "Foto ampliada");
    c.innerHTML = `<div><img src="${esc(fig.dataset.img)}" alt="${esc(fig.dataset.leg)}">${fig.dataset.leg ? `<p>${esc(fig.dataset.leg)}</p>` : ""}</div><button type="button">Fechar</button>`;
    c.onclick = () => c.remove(); document.body.append(c); return; }
  const tam = e.target.closest("[data-tam]");
  if (tam) { tam.parentElement.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === tam))); return; }
  const ap = e.target.closest("[data-addprod]");
  if (ap) { const s = D.secoes.find(x => x.id === ap.dataset.sec), i = s.itens[+ap.dataset.addprod], t = ap.closest(".produto").querySelector('[data-tam][aria-pressed="true"]')?.dataset.tam;
    const id = `${s.id}-${ap.dataset.addprod}-${t || ""}`; ITENS[id] = { n: `${i.n}${t ? " (" + t + ")" : ""}`, p: i.p }; carro[id] = (carro[id] || 0) + 1; salvar(); atualizarSacola(); avisar(`${i.n}${t ? " tamanho " + t : ""} na sacola.`); return; }
  const gm = e.target.closest("[data-gm]");
  if (gm) { const s = D.secoes.find(x => x.tipo === "exercicios"); gm.parentElement.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === gm))); desenharExs(s, +gm.dataset.gm); return; }
  const tr = e.target.closest("[data-treino]");
  if (tr) { const s = D.secoes.find(x => x.tipo === "exercicios"), g = s.grupos[+tr.dataset.g], x = g.exs.find(y => y.n === tr.dataset.treino);
    const i = treino.findIndex(t => t.n === x.n); if (i >= 0) treino.splice(i, 1); else treino.push({ n: x.n, s: x.s, r: x.r }); desenharExs(s, +tr.dataset.g); desenharTreino(); return; }
  if (e.target.id === "limparTreino") { treino = []; const s = D.secoes.find(x => x.tipo === "exercicios"); desenharExs(s, +($('[data-gm][aria-pressed="true"]')?.dataset.gm || 0)); desenharTreino(); return; }
  if (e.target.id === "enviarTreino") { abrirWa(`Meu treino de hoje:\n${treino.map((t, i) => `${i + 1}. ${t.n} · ${t.s} séries de ${t.r}`).join("\n")}`); return; }
  const esc2 = e.target.closest(".escolhas button");
  if (esc2) { esc2.parentElement.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === esc2))); resumoAgenda(); return; }
});
document.addEventListener("keydown", e => { if (e.key === "Escape") document.querySelector(".caixa")?.remove(); if (e.key === "Enter" && e.target.matches?.(".galeria figure")) e.target.click(); });
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-orc]"); if (!f) return; e.preventDefault();
  const linhas = [];
  f.querySelectorAll("[data-l]").forEach(c => { let v = ""; if (c.tagName === "FIELDSET") v = [...c.querySelectorAll("input:checked")].map(i => i.value).join(", "); else v = c.value.trim(); if (v) linhas.push(`${c.dataset.l}: ${v}`); });
  abrirWa(linhas.join("\n") || "Quero um orçamento.");
});
function resumoAgenda() {
  const el = $("#agResumo"); if (!el) return; const s = D.secoes.find(x => x.tipo === "agenda");
  const v = g => $(`[data-grupo="${g}"] [aria-pressed="true"]`)?.dataset.v || "";
  const serv = s.servicos.find(x => x.n === v("serv")), prof = v("prof");
  el.innerHTML = `<span class="rot">Resumo</span><h3>${esc(v("serv"))}</h3><p class="suave">${esc(v("dia"))} às ${esc(v("hora"))}${prof && prof !== "Sem preferência" ? ` · com ${esc(prof)}` : ""}</p>
    ${serv && serv.p != null ? `<div class="linha"><span>Valor</span><span class="preco">${precoTxt(serv.p)}</span></div>` : ""}${s.sinal ? `<p class="suave" style="font-size:14px">${esc(s.sinal)}</p>` : ""}
    <button class="btn pri" type="button" id="confirmarAg">${esc(s.botao || "Confirmar pelo WhatsApp")}</button>`;
  $("#confirmarAg").onclick = () => abrirWa(`Quero agendar: ${v("serv")}\nDia: ${v("dia")} às ${v("hora")}${prof && prof !== "Sem preferência" ? `\nCom: ${prof}` : ""}`);
}
resumoAgenda();
const ex = D.secoes.find(x => x.tipo === "exercicios"); if (ex) { desenharExs(ex, 0); desenharTreino(); }
})();
