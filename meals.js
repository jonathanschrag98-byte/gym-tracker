/* Eingebauter Ernährungs-Coach: empfiehlt passende Gerichte ohne Internet und ohne API-Schlüssel.
   Berücksichtigt Uhrzeit, Training/Lauf heute, Körpergewicht, Vorlieben, Unverträglichkeiten und Kochaufwand.
   m = Mahlzeiten (f Frühstück, m Mittag, a Abend, s Snack, p nach dem Training, n spät abends)
   t = Aufwand (s schnell ≤15 min, n normal, a aufwendig) */
const MEALS = [
  {n:"Skyr-Bowl mit Beeren", m:"fsp", t:"s", k:420, p:35, d:"250 g Skyr, 40 g Haferflocken, 100 g Beeren, 1 TL Honig", g:"milch gluten"},
  {n:"Rührei auf Vollkornbrot", m:"fa", t:"s", k:480, p:28, d:"3 Eier, 2 Scheiben Vollkornbrot, 1 Tomate, Schnittlauch", g:"ei gluten"},
  {n:"Overnight Oats mit Quark", m:"fp", t:"s", k:520, p:38, d:"60 g Haferflocken, 200 g Magerquark, 150 ml Milch, 1 Banane, Zimt", g:"milch gluten"},
  {n:"Vollkornbrot mit Hüttenkäse und Räucherlachs", m:"fs", t:"s", k:450, p:36, d:"2 Scheiben Vollkornbrot, 150 g Hüttenkäse, 50 g Räucherlachs, Gurke", g:"milch fisch gluten"},
  {n:"Tofu-Rührei mit Spinat", m:"fa", t:"s", k:380, p:28, d:"200 g Naturtofu, 1 Handvoll Spinat, 1 Scheibe Vollkornbrot, Kurkuma", g:"soja gluten"},
  {n:"Protein-Pancakes", m:"fp", t:"n", k:500, p:37, d:"2 Eier, 50 g Haferflocken, 150 g Magerquark, 1 Banane, Beeren obendrauf", g:"ei milch gluten"},
  {n:"Hähnchen-Reis-Bowl", m:"map", t:"n", k:600, p:48, d:"150 g Hähnchenbrust, 80 g Reis (roh), Brokkoli, Paprika, Sojasauce", g:"fleisch soja"},
  {n:"Vollkornpasta mit Thunfisch-Tomatensauce", m:"map", t:"s", k:650, p:48, d:"100 g Vollkornpasta, 1 Dose Thunfisch (natur), 250 g passierte Tomaten, Zwiebel, Oregano", g:"fisch gluten"},
  {n:"Linsen-Bolognese", m:"ma", t:"n", k:680, p:36, d:"100 g Vollkornspaghetti, 70 g rote Linsen, Tomaten, Möhre, Zwiebel, 20 g Parmesan", g:"gluten milch"},
  {n:"Ofenlachs mit Kartoffeln und Zucchini", m:"ma", t:"n", k:650, p:38, d:"150 g Lachsfilet, 300 g Kartoffeln, 1 Zucchini, Zitrone, 1 TL Olivenöl", g:"fisch"},
  {n:"Chili con Carne", m:"ma", t:"a", k:680, p:45, d:"125 g mageres Rinderhack, ½ Dose Kidneybohnen, Mais, Tomaten, 60 g Reis (roh)", g:"fleisch"},
  {n:"Putengeschnetzeltes mit Bulgur", m:"ma", t:"n", k:560, p:47, d:"150 g Putenbrust, 70 g Bulgur, Champignons, Paprika, 50 ml Kochsahne light", g:"fleisch gluten pilze milch"},
  {n:"Kichererbsen-Spinat-Curry", m:"ma", t:"n", k:620, p:24, d:"240 g Kichererbsen (Dose), 1 Handvoll Spinat, 100 ml leichte Kokosmilch, Currypaste, 60 g Reis (roh)", g:""},
  {n:"Hähnchen-Wraps", m:"map", t:"s", k:550, p:42, d:"2 Vollkornwraps, 120 g Hähnchenbrust, Salat, Tomate, 2 EL Joghurt-Dip", g:"fleisch gluten milch"},
  {n:"Ofenkartoffel mit Kräuterquark und Ei", m:"ma", t:"n", k:560, p:42, d:"400 g Kartoffeln, 200 g Magerquark mit Kräutern, 2 Eier, Gurkensalat", g:"milch ei"},
  {n:"Tofu mit Reisnudeln und Gemüse", m:"ma", t:"n", k:620, p:30, d:"200 g Tofu, 80 g Reisnudeln, Pak Choi oder Brokkoli, 1 EL Erdnussmus, Sojasauce", g:"soja nuesse"},
  {n:"Shakshuka mit Feta", m:"fma", t:"s", k:520, p:32, d:"3 Eier, 400 g stückige Tomaten, 1 Paprika, 40 g Feta, 1 Scheibe Vollkornbrot", g:"ei milch gluten"},
  {n:"Griechischer Salat mit Hähnchen", m:"ma", t:"s", k:520, p:45, d:"130 g Hähnchenbrust, Gurke, Tomate, ½ Dose Kichererbsen, 30 g Feta, Oliven", g:"fleisch milch"},
  {n:"Lachs-Bowl mit Edamame", m:"ma", t:"n", k:620, p:38, d:"120 g Lachs, 70 g Reis (roh), 80 g Edamame, Gurke, Möhre, Sojasauce", g:"fisch soja"},
  {n:"Vollkorn-Pizza mit Hähnchen", m:"a", t:"a", k:700, p:45, d:"Teig aus 100 g Vollkornmehl, Tomatensauce, 100 g Hähnchen, 50 g Mozzarella light, Gemüse", g:"fleisch gluten milch"},
  {n:"Rinderhack-Gemüsepfanne mit Kartoffeln", m:"ma", t:"n", k:610, p:40, d:"125 g mageres Rinderhack, 300 g Kartoffeln, Paprika, Zucchini, Zwiebel", g:"fleisch"},
  {n:"Bohnen-Quinoa-Salat", m:"ma", t:"s", k:540, p:26, d:"70 g Quinoa, ½ Dose schwarze Bohnen, Mais, Paprika, Limette, Koriander", g:""},
  {n:"Magerquark mit Beeren", m:"spn", t:"s", k:200, p:30, d:"250 g Magerquark, 100 g Beeren, etwas Süßstoff oder Honig", g:"milch"},
  {n:"Reiswaffeln mit Hüttenkäse", m:"s", t:"s", k:200, p:18, d:"3 Reiswaffeln, 150 g Hüttenkäse, Tomate", g:"milch"},
  {n:"Apfel und Nüsse", m:"s", t:"s", k:260, p:7, d:"1 Apfel, 30 g Mandeln oder Walnüsse", g:"nuesse"},
  {n:"Shake mit Milch und Banane", m:"sp", t:"s", k:330, p:32, d:"300 ml Milch, 1 Banane, optional 1 Messlöffel Proteinpulver (oder 150 g Skyr)", g:"milch"},
  {n:"Edamame mit Meersalz", m:"sn", t:"s", k:240, p:22, d:"200 g Edamame (TK, 5 min gekocht)", g:"soja"},
  {n:"Gekochte Eier mit Gemüsesticks", m:"s", t:"s", k:180, p:13, d:"2 Eier, Möhren, Gurke, Paprika", g:"ei"},
  {n:"Hüttenkäse mit Gurke", m:"n", t:"s", k:160, p:20, d:"200 g Hüttenkäse, Gurke, Pfeffer", g:"milch"},
  {n:"Banane und Joghurt", m:"p", t:"s", k:250, p:12, d:"1 Banane, 200 g Naturjoghurt, 1 TL Honig", g:"milch"},
];
const AVOID_SYN = {
  laktose:["milch"], milchprodukte:["milch"], milch:["milch"], käse:["milch"],
  fisch:["fisch"], meeresfrüchte:["fisch"], lachs:["fisch"], thunfisch:["fisch"],
  fleisch:["fleisch"], vegetarisch:["fleisch","fisch"], vegetarier:["fleisch","fisch"],
  vegan:["fleisch","fisch","milch","ei","honig"], veganer:["fleisch","fisch","milch","ei","honig"],
  gluten:["gluten"], weizen:["gluten"], ei:["ei"], eier:["ei"],
  nüsse:["nuesse"], nuss:["nuesse"], nuesse:["nuesse"], erdnüsse:["nuesse"], erdnuss:["nuesse"], mandeln:["nuesse"],
  pilze:["pilze"], champignons:["pilze"], soja:["soja"], tofu:["soja"],
};
function mealTerms(txt){ return String(txt||"").toLowerCase().split(/[,;\/\n]|\bund\b|\boder\b/).map(s=>s.replace(/^(kein|keine|keinen|nicht|kein\.)\s+/,"").trim()).filter(s=>s.length>=2); }
function mealTokens(r){
  const words = (r.n+" "+r.d).toLowerCase().split(/[^a-zäöüß]+/).filter(Boolean);
  const tags = new Set(r.g.split(" ").filter(Boolean));
  if (r.d.toLowerCase().includes("honig")) tags.add("honig");
  return {words, tags};
}
function mealHits(r, term){
  const {words, tags} = mealTokens(r);
  const syn = AVOID_SYN[term];
  if (syn) return syn.some(s => tags.has(s) || words.includes(s));
  if (term.length < 4) return words.includes(term);
  return words.some(w => w.startsWith(term) || (term.length >= 5 && w.includes(term)));
}
function mealHash(s){ let h = 2166136261; for (const c of s){ h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

function mealPick(slot, n, used, ctx){
  const allowT = ctx.effort === "schnell" ? "s" : ctx.effort === "gern" ? "sna" : "sn";
  let pool = MEALS.filter(r => r.m.includes(slot) && !used.has(r.n) && !ctx.avoid.some(t => mealHits(r, t)));
  const prev = S.mealPrev || new Set();
  const byEffort = pool.filter(r => allowT.includes(r.t));
  if (byEffort.filter(r => !prev.has(r.n)).length >= n || (byEffort.length >= n && !prev.size)) pool = byEffort;
  const score = r => mealHash(ctx.seed + slot + r.n) - (prev.has(r.n) ? 2 : 0)
    + (ctx.likes.some(t => mealHits(r, t)) ? 0.6 : 0)
    + (ctx.effort === "gern" && r.t === "a" ? 0.2 : 0)
    + (slot === "p" || ctx.trainDay ? r.p / 200 : 0);
  const out = pool.sort((a, b) => score(b) - score(a)).slice(0, n);
  out.forEach(r => used.add(r.n));
  return out;
}
const mealLine = r => `- **${r.n}** – ${r.d} (ca. ${r.k} kcal, ${r.p} g Eiweiß${r.t === "s" ? ", schnell" : r.t === "a" ? ", etwas aufwendiger" : ""})`;

function offlineCoach(kind){
  const prof = nprof(), ws = weights(), lastW = ws[ws.length - 1];
  const now = new Date(), h = now.getHours(), dayStr = today();
  const gym = workouts().filter(x => new Date(x.date).toDateString() === now.toDateString());
  const run = runs().filter(x => x.day === dayStr);
  const trainDay = gym.length > 0 || run.length > 0 || kind === "post";
  const ctx = { avoid: mealTerms(prof.avoid), likes: mealTerms(prof.likes), effort: prof.effort, trainDay, seed: dayStr + ":" + (S.mealSeed || 0) };
  const used = new Set(), out = [];
  const prot = lastW ? Math.round(lastW.kg * 1.8 / 5) * 5 : null;
  const protLine = prot ? `- Eiweiß-Richtwert heute: **ca. ${prot} g** (1,8 g pro kg bei ${fmt(lastW.kg)} kg), verteilt auf 3–5 Mahlzeiten` : `- Trag dein Gewicht ein (⚖️), dann rechne ich dir den Eiweißbedarf aus`;
  const what = gym.length && run.length ? "Kraft + Lauf heute" : gym.length ? "Krafttraining heute" : run.length ? `Lauf heute (${fmt(run[0].km)} km)` : "Ruhetag";

  if (kind === "post"){
    out.push("### Nach dem Training (nächste 1–2 Stunden)");
    out.push("Eiweiß plus Kohlenhydrate helfen bei der Regeneration und beim Muskelaufbau.");
    mealPick("p", 3, used, ctx).forEach(r => out.push(mealLine(r)));
    out.push("### Für den Rest des Tages");
    out.push(protLine);
    out.push("- Heute ausgeglichen essen, kein großes Defizit – das hält die Leistung hoch");
    const slot = h < 14 ? "m" : "a";
    const d = mealPick(slot, 1, used, ctx)[0];
    if (d) out.push(`- Später zum ${slot === "m" ? "Mittagessen" : "Abendessen"}: **${d.n}** (ca. ${d.p} g Eiweiß)`);
    S.mealShown = [...used];
    return out.join("\n");
  }

  out.push(`### Heute: ${what}`);
  out.push(protLine);
  out.push(trainDay ? "- Trainingstag: normale Portionen mit Kohlenhydraten, Defizit klein halten" : "- Ruhetag: etwas leichter essen (kleines Defizit ist ok), Eiweiß trotzdem hoch halten");
  const slots = h < 10 ? [["f","Frühstück"],["m","Mittagessen"],["s","Snack"],["a","Abendessen"]]
    : h < 14 ? [["m","Mittagessen"],["s","Snack"],["a","Abendessen"]]
    : h < 17 ? [["s","Snack"],["a","Abendessen"]]
    : h < 21 ? [["a","Abendessen"],["n","Später am Abend"]]
    : [["n","Später am Abend"]];
  let k = 0, p = 0;
  for (const [slot, label] of slots){
    const picks = mealPick(slot, slot === "s" || slot === "n" ? 1 : 2, used, ctx);
    if (!picks.length) continue;
    out.push(`### ${label}${picks.length > 1 ? " (zur Auswahl)" : ""}`);
    picks.forEach(r => out.push(mealLine(r)));
    k += picks[0].k; p += picks[0].p;
  }
  out.push(`Mit der jeweils ersten Option kommst du für den Rest des Tages auf ca. ${Math.round(k / 10) * 10} kcal und ${p} g Eiweiß.`);
  S.mealShown = [...used];
  if (kind === "ask") out.push("### Eigene Fragen\n- Freie Fragen und Foto-Analyse gehen mit einem Claude-Schlüssel unter ⚙️ Einstellungen.");
  return out.join("\n");
}
