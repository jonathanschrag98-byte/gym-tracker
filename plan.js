/* Trainingsplan: Standardplan, gespeicherter eigener Plan und Editor.
   Gelöschte Übungen werden nur archiviert (old), damit Verlauf und Bestwerte erhalten bleiben. */
const DEFAULT_EX = [
  {id:"sq",  name:"Kniebeugen",               group:null, sets:3, reps:"8",      top:8,  rest:150, note:"Vorher 2 Aufwärmsätze"},
  {id:"dl",  name:"Kreuzheben",               group:null, sets:3, reps:"5",      top:5,  rest:180, note:"Vorher 2–3 Aufwärmsätze"},
  {id:"pu",  name:"Klimmzüge",                group:null, sets:4, reps:"1–2 + 1–2 negative", pull:true, rest:120},
  {id:"ohp", name:"Schulterdrücken stehend",  group:null, sets:3, reps:"8",      top:8,  rest:150, note:"Vorher 1 Aufwärmsatz"},
  {id:"bp",  name:"Bankdrücken",              group:null, sets:3, reps:"8",      top:8,  rest:150, note:"Vorher 1–2 Aufwärmsätze"},
  {id:"row", name:"Langhantelrudern",         group:null, sets:3, reps:"8",      top:8,  rest:120},
  {id:"fp2", name:"Face Pulls (Kabelzug)",    group:null, sets:3, reps:"12–15",  top:15, rest:75, inc:"+1 Stufe", note:"Seil zur Stirn, Ellbogen hoch"},
  {id:"dbc", name:"Kurzhantel-Curls (Schrägbank)", group:"C", sets:2, reps:"10–12", top:12, rest:60, restS:75, inc:"+1–2 kg", note:"kg pro Hantel"},
  {id:"fp",  name:"French Press",             group:"C",  sets:2, reps:"10–12",  top:12, rest:60, restS:75},
  {id:"khr", name:"Hängendes Knieheben",      group:null, sets:2, reps:"10–15",  top:15, rest:60, bw:true, opt:true},
  {id:"fly", name:"Butterfly Kabelzug",       group:null, sets:2, reps:"12–15",  top:15, rest:90, old:true},
  {id:"curl",name:"Langhantel-Curls",         group:"C",  sets:2, reps:"10–12",  top:12, rest:60, restS:75, old:true},
];
const DEFAULT_DAYS = [
  {id:"A", name:"Tag A · Kniebeugen", items:["sq","bp","pu","ohp","row","fp2","dbc","fp","khr"]},
  {id:"B", name:"Tag B · Kreuzheben", items:["dl","bp","pu","ohp","row","fp2","dbc","fp","khr"]},
];
let ALL = [], EX = {}, DAYS = [], LIST = [];
const planCopy = o => JSON.parse(JSON.stringify(o));
const planInt = (v, lo, hi, def) => { const n = Math.round(Number(v)); return Number.isFinite(n) && v !== "" && v != null ? Math.min(hi, Math.max(lo, n)) : def; };
// höchste Wiederholungszahl aus "8–10" → 10 (ab dort wird eine Steigerung vorgeschlagen)
const topOf = reps => { const n = (String(reps).match(/\d+/g) || []).map(Number); return n.length ? Math.max(...n) : 0; };

function applyPlan(doc){
  let ex = null, days = null;
  if (doc && Array.isArray(doc.ex) && Array.isArray(doc.days)){
    ex = doc.ex.filter(e => e && /^[\w-]+$/.test(e.id || "") && e.name).map(e => ({
      ...e, name:String(e.name), note:e.note ? String(e.note) : "", reps:String(e.reps || ""), sets:planInt(e.sets, 1, 10, 3),
      rest:planInt(e.rest, 10, 600, 90), top:planInt(e.top, 0, 100, 0), group:["A","B","C"].includes(e.group) ? e.group : null }));
    const ids = new Set(ex.map(e => e.id));
    days = doc.days.filter(d => d && /^[\w-]+$/.test(d.id || "")).map(d => ({ id:d.id, name:String(d.name || "Tag"), items:[...new Set(Array.isArray(d.items) ? d.items : [])].filter(i => ids.has(i)) }));
  }
  if (!ex || !ex.length || !days.length){ ex = planCopy(DEFAULT_EX); days = planCopy(DEFAULT_DAYS); }
  ALL = ex; DAYS = days;
  EX = Object.fromEntries(ALL.map(e => [e.id, e]));
  LIST = ALL.filter(e => !e.old).concat(ALL.filter(e => e.old));
}
applyPlan(null);

const dayOf = id => DAYS.find(d => d.id === id) || DAYS[0];
const planFor = id => dayOf(id).items.map(i => EX[i]).filter(Boolean);
const dayName = w => (DAYS.find(d => d.id === w.day) || {}).name || w.dayName || "Tag " + w.day;
function nextDay(){
  const l = workouts().find(x => DAYS.some(d => d.id === x.day));
  return l ? DAYS[(DAYS.findIndex(d => d.id === l.day) + 1) % DAYS.length].id : DAYS[0].id;
}
function selDay(){ return DAYS.some(d => d.id === S.day) ? S.day : nextDay(); }
function curPlan(){ return planFor(S.draft ? S.draft.day : selDay()); }
const hasHistory = id => workouts().some(w => w.sets && w.sets[id] && w.sets[id].length) || !!(S.draft && S.draft.sets[id]);

// Solange eigene Änderungen noch geschrieben werden, darf kein älterer Speicherstand den Plan überschreiben
let planPending = 0;
function loadPlan(doc){ if (!planPending) applyPlan(doc); }
function writePlan(){ return queueWrite(() => col.doc("plan").set({type:"plan", ex:planCopy(ALL), days:planCopy(DAYS)})).then(() => { planPending--; }); }
function savePlan(ex, days){
  applyPlan({ex, days});
  if (col){ planPending++; writePlan(); }
  render();
}
const newId = p => p + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
const kindOf = e => e.pull ? "pull" : e.bw ? "bw" : "kg";

function viewPlan(){
  if (S.pe) return viewExForm();
  const act = ALL.filter(e => !e.old), arch = ALL.filter(e => e.old);
  const ib = (a, d, i, txt, lbl, dis) => `<button class="pbtn" data-act="${a}" data-day="${d}" data-i="${i}" aria-label="${lbl}" ${dis ? "disabled" : ""}>${txt}</button>`;
  return `
  <button class="btn ghost" data-tab="training" style="margin-bottom:12px">← Zurück zum Training</button>
  <p class="hint" style="margin:0 2px 12px">Änderungen werden sofort gespeichert. Dein Verlauf bleibt immer erhalten.</p>
  ${DAYS.map(d => `<div class="card">
    <label class="lbl">Name des Trainingstags<input class="pin" data-dayname="${d.id}" maxlength="40" value="${esc(d.name)}"></label>
    <div class="list" style="margin-top:8px">${d.items.map((id, i) => `<div class="item"><button class="plink" data-act="pedit" data-id="${id}"><b>${esc(EX[id].name)}</b><br><span class="hint">${EX[id].group ? "⇄ " : ""}${EX[id].sets} × ${esc(EX[id].reps)} · ✏️</span></button>
      <span style="white-space:nowrap">${ib("pup", d.id, i, "▲", "Nach oben", i === 0)}${ib("pdown", d.id, i, "▼", "Nach unten", i === d.items.length - 1)}${ib("prem", d.id, i, "✕", "Aus diesem Tag entfernen")}</span></div>`).join("") || `<div class="empty">Noch keine Übungen.</div>`}</div>
    <select data-addto="${d.id}" aria-label="Übung hinzufügen"><option value="">＋ Vorhandene Übung hinzufügen …</option>${act.filter(e => !d.items.includes(e.id)).map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join("")}</select>
    <button class="btn ghost" data-act="pnew" data-day="${d.id}">＋ Neue Übung anlegen</button>
    ${DAYS.length > 1 ? `<button class="btn danger" data-act="pdaydel" data-day="${d.id}" style="padding:11px">Tag löschen</button>` : ""}
  </div>`).join("")}
  <button class="btn primary" data-act="pdayadd" style="margin-bottom:12px">＋ Trainingstag hinzufügen</button>
  <div class="card"><h2>Alle Übungen</h2><div class="list">${act.map(e => `<div class="item"><button class="plink" data-act="pedit" data-id="${e.id}"><b>${esc(e.name)}</b></button><button class="pbtn" data-act="parch" data-id="${e.id}" aria-label="Übung löschen">✕</button></div>`).join("")}</div>
    <button class="btn ghost" data-act="pnew" data-day="">＋ Neue Übung anlegen</button></div>
  ${arch.length ? `<div class="card"><h2>Gelöschte Übungen</h2><div class="list">${arch.map(e => `<div class="item"><span class="hint">${esc(e.name)}</span><button class="x" data-act="prest" data-id="${e.id}" style="font-size:13px;color:var(--accent)">Wiederherstellen</button></div>`).join("")}</div></div>` : ""}
  <button class="btn danger" data-act="preset">Auf Standardplan zurücksetzen</button>`;
}
function viewExForm(){
  const f = S.pe, lock = f.id && hasHistory(f.id);
  const inp = (k, l, ph, mode) => `<label class="lbl">${l}<input class="pin" data-pe="${k}" maxlength="60" inputmode="${mode || "text"}" placeholder="${ph}" value="${esc(f[k])}"></label>`;
  const sel = (k, l, o, dis) => `<label class="lbl">${l}<select data-pe="${k}" style="margin:4px 0 0" ${dis ? "disabled" : ""}>${o.map(([v, t]) => `<option value="${v}" ${f[k] === v ? "selected" : ""}>${t}</option>`).join("")}</select></label>`;
  return `<div class="card">
    <h2 style="margin-bottom:10px">${f.id ? "Übung bearbeiten" : "Neue Übung"}</h2>
    <div style="display:grid;gap:12px">
    ${inp("name", "Name", "z. B. Beinpresse")}
    ${sel("kind", "Art", [["kg","Gewicht + Wiederholungen"],["bw","Nur Wiederholungen"],["pull","Wiederholungen + Negative"]], lock)}
    ${lock ? `<p class="hint" style="margin:-6px 0 0">Die Art ist fest, weil schon Trainings dazu gespeichert sind.</p>` : ""}
    <div class="wbox" style="margin:0">${inp("sets", "Sätze", "3", "numeric")}${inp("reps", "Wiederholungen", "8–10")}</div>
    <div class="wbox" style="margin:0">${inp("rest", "Pause (Sek.)", "90", "numeric")}${inp("inc", "Steigerung", "+2,5 kg")}</div>
    ${sel("group", "Supersatz", [["","Kein Supersatz"],["A","Gruppe 1"],["B","Gruppe 2"],["C","Gruppe 3 (Arme)"]])}
    <p class="hint" style="margin:-6px 0 0">Übungen derselben Gruppe müssen im Tag direkt untereinander stehen.</p>
    ${inp("note", "Hinweis", "z. B. Vorher 1 Aufwärmsatz")}
    <label class="goal"><input type="checkbox" data-pe="opt" ${f.opt ? "checked" : ""} style="width:20px;height:20px"> Optionale Übung</label>
    </div>
    ${f.err ? `<p class="hint" style="color:var(--warn)">${esc(f.err)}</p>` : ""}
    <p class="hint">Gilt für alle Tage, in denen die Übung vorkommt.</p>
    <button class="btn primary" data-act="psaveex">Speichern</button>
    <button class="btn ghost" data-act="pcancel">Abbrechen</button>
  </div>`;
}

document.addEventListener("input", e => {
  const k = e.target.dataset && e.target.dataset.pe; if (!k || !S.pe) return;
  S.pe[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.dataset.dayname){
    const name = t.value.trim(); if (!name){ t.value = dayOf(t.dataset.dayname).name; return; }
    // Neuzeichnen hier würde einen gerade angetippten Knopf verschlucken
    dayOf(t.dataset.dayname).name = name;
    if (col){ planPending++; setTimeout(writePlan, 300); }
  }
  if (t.dataset.addto && t.value) savePlan(ALL, DAYS.map(d => d.id === t.dataset.addto ? {...d, items:[...d.items, t.value]} : d));
});
document.addEventListener("click", e => {
  const t = e.target.closest("[data-act]"); if (!t) return;
  const a = t.dataset.act, day = t.dataset.day, i = +t.dataset.i, id = t.dataset.id;
  const items = fn => savePlan(ALL, DAYS.map(d => d.id === day ? {...d, items:fn([...d.items])} : d));
  if (a === "popen"){ S.tab = "plan"; S.pe = null; render(); window.scrollTo(0, 0); }
  if (a === "pup") items(l => { [l[i-1], l[i]] = [l[i], l[i-1]]; return l; });
  if (a === "pdown") items(l => { [l[i+1], l[i]] = [l[i], l[i+1]]; return l; });
  if (a === "prem") items(l => { l.splice(i, 1); return l; });
  if (a === "pdayadd"){
    if (DAYS.length >= 7) return ask("Mehr als 7 Trainingstage sind nicht möglich.", () => {});
    savePlan(ALL, [...DAYS, {id:newId("d"), name:"Tag " + "ABCDEFG"[DAYS.length], items:[]}]);
  }
  if (a === "pdaydel"){
    if (S.draft && dayOf(S.draft.day).id === day) return ask("Dieser Tag läuft gerade als Training und kann erst danach gelöscht werden.", () => {});
    ask(`„${dayOf(day).name}“ löschen? Übungen und Verlauf bleiben erhalten.`, () => savePlan(ALL, DAYS.filter(d => d.id !== day)));
  }
  if (a === "parch") ask(`„${EX[id].name}“ aus dem Plan löschen? Dein Verlauf bleibt erhalten.`, () => savePlan(ALL.map(x => x.id === id ? {...x, old:true} : x), DAYS.map(d => ({...d, items:d.items.filter(x => x !== id)}))));
  if (a === "prest") savePlan(ALL.map(x => x.id === id ? {...x, old:false} : x), DAYS);
  if (a === "preset") ask("Standardplan wiederherstellen? Eigene Übungen werden archiviert, der Verlauf bleibt.", () => {
    const own = ALL.filter(x => !DEFAULT_EX.some(d => d.id === x.id)).map(x => ({...x, old:true}));
    S.day = null;
    if (S.draft && !DEFAULT_DAYS.some(d => d.id === S.draft.day)){ S.draft.day = "A"; saveDraftSoon(); }
    savePlan([...planCopy(DEFAULT_EX), ...own], planCopy(DEFAULT_DAYS));
  });
  if (a === "pnew"){ S.pe = {id:"", day, name:"", kind:"kg", sets:"3", reps:"8–10", rest:"90", inc:"", group:"", note:"", opt:false}; render(); window.scrollTo(0, 0); }
  if (a === "pedit"){ const x = EX[id]; S.pe = {id, name:x.name, kind:kindOf(x), sets:String(x.sets), reps:x.reps, rest:String(x.rest), inc:x.inc || "", group:x.group || "", note:x.note || "", opt:!!x.opt}; render(); window.scrollTo(0, 0); }
  if (a === "pcancel"){ S.pe = null; render(); }
  if (a === "psaveex"){
    const f = S.pe, name = f.name.trim(), reps = f.reps.trim();
    const bad = !name ? "Bitte einen Namen eingeben."
      : ALL.some(x => !x.old && x.id !== f.id && x.name.toLowerCase() === name.toLowerCase()) ? "Diese Übung gibt es schon."
      : !(+f.sets >= 1 && +f.sets <= 10) ? "Sätze: bitte 1 bis 10." : !topOf(reps) ? "Wiederholungen: bitte eine Zahl angeben, z. B. 8–10."
      : !(+f.rest >= 10 && +f.rest <= 600) ? "Pause: bitte 10 bis 600 Sekunden." : "";
    if (bad){ f.err = bad; render(); return; }
    const old = f.id ? EX[f.id] : {}, rest = planInt(f.rest, 10, 600, 90);
    const x = {...old, id:f.id || newId("x"), name, sets:planInt(f.sets, 1, 10, 3), reps, rest, group:f.group || null, note:f.note.trim(), inc:f.inc.trim(), opt:!!f.opt, pull:f.kind === "pull", bw:f.kind === "bw", top:f.kind === "pull" ? 0 : topOf(reps)};
    if (rest !== old.rest) delete x.restS;
    S.pe = null;
    savePlan(f.id ? ALL.map(y => y.id === f.id ? x : y) : [...ALL, x], f.id ? DAYS : DAYS.map(d => d.id === f.day ? {...d, items:[...d.items, x.id]} : d));
  }
});
