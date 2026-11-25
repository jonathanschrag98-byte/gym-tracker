/* Essensideen-Finder: Filter → ein passender Vorschlag */
const FF_CATS = [["","Alle"],["f","Frühstück"],["m","Mittagessen"],["a","Abendessen"],["s","Snack"],["p","Nach dem Training"]];
const FF_DIET = [["","Alles"],["veg","Vegetarisch"],["vegan","Vegan"]];
const FF_LVL = ["egal","gering","mittel","hoch"];
// Stufen nach Anteil an den Kalorien der Mahlzeit (Grenzen in %)
const FF_MAC = { p:{name:"Eiweiß", kc:4, lim:[18,30]}, c:{name:"Kohlenhydrate", kc:4, lim:[25,48]}, f:{name:"Fett", kc:9, lim:[20,36]} };
const FF_DEF = {cat:"", diet:"", kmin:100, kmax:900, p:0, c:0, f:0, z:60};
const ffPct = (r, m) => Math.round(r[m] * FF_MAC[m].kc / (4*r.p + 4*r.c + 9*r.f) * 100);
const ffLevel = (r, m) => 1 + FF_MAC[m].lim.filter(x => ffPct(r, m) >= x).length;
function ffState(){
  if (!S.ff){ const d = S.docs.find(x => x._id === "finder") || {}; S.ff = {}; for (const k in FF_DEF) S.ff[k] = typeof d[k] === typeof FF_DEF[k] ? d[k] : FF_DEF[k];
    if (d.v !== 3) S.ff.p = S.ff.c = S.ff.f = 0; } // alte 5-Stufen-Werte nicht falsch deuten
  return S.ff;
}
function ffSearch(over){
  const q = {...ffState(), ...over}, avoid = mealTerms(nprof().avoid), likes = mealTerms(nprof().likes);
  return MEALS.filter(r => {
    const g = r.g.split(" "), no = l => !l.some(x => g.includes(x));
    return (!q.cat || r.m.includes(q.cat)) && r.z <= (q.z >= 60 ? 999 : q.z) && r.k >= (q.kmin <= 100 ? 0 : q.kmin) && r.k <= (q.kmax >= 900 ? 9999 : q.kmax)
      && (q.diet !== "veg" || no(["fleisch","fisch","hartkaese"])) && (q.diet !== "vegan" || no(["fleisch","fisch","milch","ei","honig"]))
      && !avoid.some(t => mealHits(r, t));
  }).map(r => {
    const off = ["p","c","f"].filter(m => q[m] && ffLevel(r, m) !== q[m]);
    const dist = off.reduce((a, m) => a + Math.pow(ffLevel(r, m) - q[m], 2), 0);
    return {r, off, dist, s:(likes.some(t => mealHits(r, t)) ? 0.6 : 0) + mealHash(today() + r.n)};
  }).sort((a, b) => a.dist - b.dist || b.s - a.s);
}
function ffResult(){
  const q = ffState(), all = ffSearch(), exact = all.filter(x => !x.dist), list = exact.length ? exact : all.slice(0, 5);
  if (!list.length){
    const tips = [[{kmin:100, kmax:900}, "den Kalorienbereich"],[{z:60}, "die Kochzeit"],[{cat:""}, "die Kategorie"],[{diet:""}, "die Ernährungsart"]].filter(([o]) => ffSearch(o).length).map(x => x[1]);
    return `<div class="card"><h2>Kein passendes Gericht</h2><p class="hint">${tips.length ? "Erweitere " + tips.join(" oder ") + "." : "Erweitere mehrere Filter gleichzeitig."}</p></div>`;
  }
  const i = (S.ffi || 0) % list.length, {r, off} = list[i];
  const unk = mealUnknown(nprof().avoid);
  return `<div class="card" style="border-color:rgba(198,244,50,.4)">
    <span class="tag">${exact.length ? "Passt genau" : "Kommt am nächsten"} · ${i + 1} von ${list.length}</span>
    <h2 style="font-size:20px">${esc(r.n)}</h2>
    <p class="hint" style="margin:4px 0 10px">⏱ ${r.z} min · 🔥 ca. ${r.k} kcal</p>
    <div class="stat" style="margin-bottom:10px">${["p","c","f"].map(m => `<div style="padding:10px 8px"><b>${r[m]} g</b><span>${FF_MAC[m].name}<br>${FF_LVL[ffLevel(r, m)]}</span></div>`).join("")}</div>
    <p style="margin:0;line-height:1.5;font-size:15px"><b>Für 1 Portion:</b> ${esc(r.d)}</p>
    ${off.length ? `<p class="hint" style="color:var(--warn);margin:10px 0 0">Abweichung: ${off.map(m => `${FF_MAC[m].name} ${FF_LVL[ffLevel(r, m)]} statt ${FF_LVL[q[m]]}`).join(", ")}</p>` : ""}
    ${list.length > 1 ? `<button class="btn primary" data-act="ffnext" style="margin-top:12px">🔄 Nächster Vorschlag</button>` : ""}
    ${unk.length ? `<p class="hint" style="color:var(--warn);margin:10px 0 0">Aus deinem Profil nicht zugeordnet: ${esc(unk.join(", "))}. Zutaten bitte selbst prüfen.</p>` : ""}
    <p class="hint" style="margin:10px 0 0;font-size:12px">Nährwerte sind Schätzungen. Bei Allergien immer die Zutatenliste der Produkte prüfen.</p>
  </div>`;
}
const ffLabel = k => { const q = ffState();
  return k === "z" ? (q.z >= 60 ? "beliebig" : "bis " + q.z + " min") : k === "k" ? (q.kmin <= 100 ? "0" : q.kmin) + " – " + (q.kmax >= 900 ? "900+" : q.kmax) + " kcal" : FF_LVL[q[k]]; };
function viewFinder(){
  const q = ffState();
  const sel = (k, l, o) => `<label class="lbl">${l}<select data-ff="${k}" style="margin:4px 0 0">${o.map(([v, t]) => `<option value="${v}" ${q[k] === v ? "selected" : ""}>${t}</option>`).join("")}</select></label>`;
  const rng = (k, a, b, st, lbl) => `<input class="fr" type="range" data-ff="${k}" min="${a}" max="${b}" step="${st}" value="${q[k]}" aria-label="${lbl}">`;
  const row = (l, k) => `<div class="frow">${l}<span id="ffl-${k}">${ffLabel(k)}</span></div>`;
  return `<div class="card"><h2 style="margin-bottom:10px">Essensideen-Finder</h2>
    <div class="wbox" style="margin:0">${sel("cat", "Kategorie", FF_CATS)}${sel("diet", "Ernährungsart", FF_DIET)}</div>
    ${row("Kalorien", "k")}<div class="wbox" style="margin:0"><label class="hint">von${rng("kmin", 100, 850, 50, "Kalorien von")}</label><label class="hint">bis${rng("kmax", 150, 900, 50, "Kalorien bis")}</label></div>
    ${["p","c","f"].map(m => row(FF_MAC[m].name, m) + rng(m, 0, 3, 1, FF_MAC[m].name)).join("")}
    ${row("Kochzeit", "z")}${rng("z", 5, 60, 5, "Kochzeit")}
    <p class="hint" style="margin:8px 0 10px;font-size:12px">Regler ganz links = egal. Eiweiß, Kohlenhydrate und Fett zählen nach ihrem Anteil an den Kalorien. Unverträglichkeiten aus deinem Profil werden berücksichtigt.</p>
    <button class="btn ghost" data-act="ffreset">Filter zurücksetzen</button>
  </div><div id="ffres">${ffResult()}</div>`;
}
function ffSet(t, save){
  const q = ffState(), k = t.dataset.ff;
  q[k] = t.type === "range" ? +t.value : t.value;
  if (k === "kmin" && q.kmax < q.kmin + 50) q.kmax = q.kmin + 50;
  if (k === "kmax" && q.kmin > q.kmax - 50) q.kmin = q.kmax - 50;
  for (const x of ["kmin","kmax"]){ const el = $(`[data-ff="${x}"]`); if (el && +el.value !== q[x]) el.value = q[x]; }
  for (const x of ["k","p","c","f","z"]){ const el = $("#ffl-" + x); if (el) el.textContent = ffLabel(x); }
  S.ffi = 0; $("#ffres").innerHTML = ffResult();
  if (save) ffSave();
}
function ffSave(){ const d = {type:"finder", v:3, ...S.ff}; if (col) queueWrite(() => col.doc("finder").set(d)); }
document.addEventListener("input", e => { if (e.target.dataset.ff) ffSet(e.target, false); });
document.addEventListener("change", e => { if (e.target.dataset.ff) ffSet(e.target, true); });
document.addEventListener("click", e => {
  const t = e.target.closest("[data-act]"); if (!t) return;
  const a = t.dataset.act;
  if (a === "ftab"){ S.foodTab = t.dataset.v; render(); }
  if (a === "ffnext"){ S.ffi = (S.ffi || 0) + 1; $("#ffres").innerHTML = ffResult(); }
  if (a === "ffreset"){ S.ff = {...FF_DEF}; S.ffi = 0; ffSave(); render(); }
});
