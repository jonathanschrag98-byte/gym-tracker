/* Rezeptsammlung und eingebauter Ernährungs-Coach (ohne Internet, ohne API-Schlüssel).
   Pro Portion: p Eiweiß, c Kohlenhydrate, f Fett in g (Schätzwerte); Kalorien = 4p + 4c + 9f.
   m = Mahlzeiten (f Frühstück, m Mittag, a Abend, s Snack, p nach dem Training, n spät abends), z = Kochzeit in min
   g = Allergene/Herkunft: milch ei gluten soja nuesse pilze honig fisch fleisch (sorgfältig pflegen, danach wird gefiltert) */
const MEALS = [
  ["Skyr-Bowl mit Beeren","fsp",5,36,55,5,"250 g Skyr, 40 g Haferflocken, 100 g Beeren, 1 TL Honig","milch gluten honig"],
  ["Rührei auf Vollkornbrot","fa",10,29,38,24,"3 Eier, 2 Scheiben Vollkornbrot, 1 Tomate, Schnittlauch","ei gluten"],
  ["Overnight Oats mit Quark","fp",5,40,75,8,"60 g Haferflocken, 200 g Magerquark, 150 ml Milch, 1 Banane, Zimt","milch gluten"],
  ["Vollkornbrot mit Hüttenkäse und Räucherlachs","fs",5,36,40,14,"2 Scheiben Vollkornbrot, 150 g Hüttenkäse, 50 g Räucherlachs, Gurke","milch fisch gluten"],
  ["Tofu-Rührei mit Spinat","fa",15,30,22,20,"200 g Naturtofu, 1 Handvoll Spinat, 1 Scheibe Vollkornbrot, Kurkuma","soja gluten"],
  ["Protein-Pancakes","fp",20,38,58,15,"2 Eier, 50 g Haferflocken, 150 g Magerquark, 1 Banane, Beeren","ei milch gluten"],
  ["Haferbrei mit Apfel und Zimt","fp",10,14,70,9,"70 g Haferflocken, 250 ml Haferdrink, 1 Apfel, Zimt","gluten"],
  ["Omelett mit Feta und Spinat","fma",15,32,5,30,"3 Eier, 50 g Feta, 1 Handvoll Spinat, 1 TL Öl","ei milch"],
  ["Avocadobrot mit Ei","fa",10,20,32,28,"2 Scheiben Vollkornbrot, ½ Avocado, 2 Eier","ei gluten"],
  ["Magerquark mit Leinöl und Nüssen","fs",5,34,14,22,"250 g Magerquark, 1 EL Leinöl, 15 g Walnüsse, Beeren","milch nuesse"],
  ["Chia-Pudding mit Sojadrink","fs",5,15,22,18,"40 g Chiasamen, 250 ml Sojadrink, 100 g Beeren (über Nacht quellen)","soja"],
  ["Brötchen mit Putenbrust","fsp",5,26,50,6,"2 Brötchen, 80 g Putenbrust-Aufschnitt, Gurke, Tomate","fleisch gluten"],
  ["Hähnchen-Reis-Bowl","map",25,48,75,9,"150 g Hähnchenbrust, 80 g Reis (roh), Brokkoli, Paprika, Sojasauce","fleisch soja gluten"],
  ["Vollkornpasta mit Thunfisch-Tomatensauce","map",15,48,82,9,"100 g Vollkornpasta, 1 Dose Thunfisch (natur), 250 g passierte Tomaten, Zwiebel","fisch gluten"],
  ["Linsen-Bolognese","ma",30,36,105,10,"100 g Vollkornspaghetti, 70 g rote Linsen, Tomaten, Möhre, Zwiebel, 20 g Parmesan","gluten milch hartkaese"],
  ["Ofenlachs mit Kartoffeln und Zucchini","ma",35,38,55,28,"150 g Lachsfilet, 300 g Kartoffeln, 1 Zucchini, Zitrone, 1 TL Olivenöl","fisch"],
  ["Chili con Carne","ma",45,45,85,14,"125 g mageres Rinderhack, ½ Dose Kidneybohnen, Mais, Tomaten, 60 g Reis (roh)","fleisch rind"],
  ["Putengeschnetzeltes mit Bulgur","ma",25,47,58,12,"150 g Putenbrust, 70 g Bulgur, Champignons, Paprika, 50 ml Kochsahne","fleisch gluten pilze milch"],
  ["Kichererbsen-Spinat-Curry","ma",25,23,95,16,"240 g Kichererbsen (Dose), Spinat, 100 ml leichte Kokosmilch, Currypulver, 60 g Reis (roh)",""],
  ["Hähnchen-Wraps","map",15,42,55,15,"2 Vollkornwraps, 120 g Hähnchenbrust, Salat, Tomate, 2 EL Joghurt-Dip","fleisch gluten milch"],
  ["Ofenkartoffel mit Kräuterquark und Ei","ma",45,42,72,12,"400 g Kartoffeln, 200 g Magerquark mit Kräutern, 2 Eier, Gurkensalat","milch ei"],
  ["Tofu mit Reisnudeln und Gemüse","ma",20,32,75,23,"200 g Tofu, 80 g Reisnudeln, Brokkoli, 1 EL Erdnussmus, Sojasauce","soja nuesse gluten"],
  ["Shakshuka mit Feta","fma",25,32,32,29,"3 Eier, 400 g stückige Tomaten, 1 Paprika, 40 g Feta, 1 Scheibe Vollkornbrot","ei milch gluten"],
  ["Griechischer Salat mit Hähnchen","ma",15,46,25,22,"130 g Hähnchenbrust, Gurke, Tomate, ½ Dose Kichererbsen, 30 g Feta, Oliven","fleisch milch"],
  ["Lachs-Bowl mit Edamame","ma",25,38,66,24,"120 g Lachs, 70 g Reis (roh), 80 g Edamame, Gurke, Möhre, Sojasauce","fisch soja gluten"],
  ["Vollkorn-Pizza mit Hähnchen","a",60,50,82,18,"Teig aus 100 g Vollkornmehl, Tomatensauce, 100 g Hähnchen, 50 g Mozzarella light, Gemüse","fleisch gluten milch"],
  ["Rinderhack-Gemüsepfanne mit Kartoffeln","ma",30,38,58,18,"125 g mageres Rinderhack, 300 g Kartoffeln, Paprika, Zucchini, Zwiebel","fleisch rind"],
  ["Bohnen-Quinoa-Salat","ma",20,24,82,11,"70 g Quinoa, ½ Dose schwarze Bohnen, Mais, Paprika, Limette, 1 TL Öl",""],
  ["Zucchininudeln mit Garnelen","ma",20,35,14,12,"200 g Garnelen, 2 Zucchini, Kirschtomaten, Knoblauch, 2 TL Olivenöl","fisch krebstiere"],
  ["Hähnchenbrust mit großem Salat","ma",20,50,12,14,"200 g Hähnchenbrust, Blattsalat, Gurke, Paprika, 1 EL Olivenöl","fleisch"],
  ["Kabeljau mit Ofengemüse","ma",35,42,28,12,"220 g Kabeljau, Zucchini, Paprika, Möhren, 1 EL Olivenöl","fisch"],
  ["Rindersteak mit Bohnen","a",20,50,12,26,"200 g Rinderhüftsteak, 250 g grüne Bohnen, 1 EL Olivenöl","fleisch rind"],
  ["Lachs mit Spargel oder Brokkoli","ma",20,42,10,36,"180 g Lachsfilet, 300 g Spargel oder Brokkoli, 1 TL Öl, Zitrone","fisch"],
  ["Hähnchen-Avocado-Salat","ma",15,44,12,32,"150 g Hähnchenbrust, 1 Avocado, Blattsalat, Tomaten, Zitrone","fleisch"],
  ["Halloumi mit Ofengemüse","ma",30,28,24,38,"120 g Halloumi, Zucchini, Paprika, Aubergine, 1 TL Öl","milch"],
  ["Spaghetti aglio e olio","ma",15,15,82,24,"110 g Spaghetti, 2 EL Olivenöl, Knoblauch, Chili, Petersilie","gluten"],
  ["Gemüse-Couscous","ma",15,15,80,9,"90 g Couscous, Zucchini, Paprika, Tomate, 2 TL Olivenöl","gluten"],
  ["Tomaten-Reis mit Gemüse","map",25,12,98,7,"110 g Reis (roh), stückige Tomaten, Paprika, Erbsen, 1 TL Öl",""],
  ["Kartoffelsuppe","ma",35,11,62,9,"350 g Kartoffeln, Möhren, Lauch, 2 TL Öl, Gemüsebrühe",""],
  ["Kürbissuppe mit Kokosmilch","ma",30,7,38,18,"400 g Hokkaido, 100 ml Kokosmilch, Zwiebel, Ingwer",""],
  ["Minestrone mit weißen Bohnen","ma",30,19,55,7,"½ Dose weiße Bohnen, Möhren, Zucchini, Tomaten, 40 g Nudeln","gluten"],
  ["Gemüsebrühe mit Hähnchen und Reis","map",25,32,42,5,"120 g Hähnchenbrust, 45 g Reis (roh), Möhren, Lauch","fleisch"],
  ["Rote-Linsen-Suppe","ma",25,25,60,6,"90 g rote Linsen, Möhren, Tomaten, Kreuzkümmel, 1 TL Öl",""],
  ["Tofu-Gemüsepfanne ohne Reis","ma",20,34,18,24,"250 g Tofu, Brokkoli, Paprika, Möhre, 1 TL Öl, Ingwer, Salz","soja"],
  ["Tempeh-Reis-Bowl","ma",25,38,72,20,"170 g Tempeh, 70 g Reis (roh), Gemüse, Limette","soja"],
  ["Seitan-Pfanne mit Paprika","ma",20,48,28,8,"180 g Seitan, Paprika, Zwiebel, Tomaten, 1 TL Öl","gluten soja"],
  ["Süßkartoffel mit schwarzen Bohnen","ma",45,18,92,8,"350 g Süßkartoffel, ½ Dose schwarze Bohnen, Mais, Salsa",""],
  ["Gnocchi mit Tomatensauce und Mozzarella","ma",15,24,90,16,"250 g Gnocchi, passierte Tomaten, 60 g Mozzarella, Basilikum","gluten milch ei"],
  ["Käsespätzle mit Salat","a",30,34,75,34,"200 g Spätzle, 70 g Bergkäse, Zwiebeln, Blattsalat","gluten milch ei hartkaese"],
  ["Pilzrisotto","a",40,17,88,15,"100 g Risottoreis, 200 g Champignons, Zwiebel, 20 g Parmesan, 1 TL Öl","milch pilze hartkaese"],
  ["Lasagne mit Rinderhack","a",75,42,62,30,"120 g Rinderhack, 80 g Lasagneplatten, Tomaten, Bechamel, 40 g Käse","fleisch rind gluten milch ei"],
  ["Gefüllte Paprika mit Hack","a",55,38,50,20,"2 Paprika, 120 g mageres Rinderhack, 50 g Reis (roh), Tomatensauce","fleisch rind"],
  ["Magerquark mit Beeren","spn",5,31,20,1,"250 g Magerquark, 100 g Beeren","milch"],
  ["Reiswaffeln mit Hüttenkäse","s",5,20,24,6,"3 Reiswaffeln, 150 g Hüttenkäse, Tomate","milch"],
  ["Apfel und Nüsse","s",5,7,25,17,"1 Apfel, 30 g Mandeln oder Walnüsse","nuesse"],
  ["Shake mit Milch und Banane","sp",5,27,45,5,"300 ml Milch, 1 Banane, 150 g Skyr","milch"],
  ["Edamame mit Meersalz","sn",5,22,16,10,"200 g Edamame (TK, 5 min gekocht)","soja"],
  ["Gekochte Eier mit Gemüsesticks","s",10,14,8,11,"2 Eier, Möhren, Gurke, Paprika","ei"],
  ["Hüttenkäse mit Gurke","sn",5,25,7,8,"200 g Hüttenkäse, Gurke, Pfeffer","milch"],
  ["Banane und Joghurt","sp",5,11,42,7,"1 Banane, 200 g Naturjoghurt, 1 TL Honig","milch honig"],
  ["Hummus mit Gemüsesticks","s",10,10,22,14,"80 g Hummus, Möhren, Paprika, Gurke","sesam"],
  ["Reiswaffeln mit Banane","sp",5,4,48,1,"3 Reiswaffeln, 1 Banane",""],
  ["Obstsalat","s",10,3,45,1,"1 Apfel, 1 Orange, 100 g Trauben",""],
  ["Putenröllchen mit Frischkäse","sn",5,24,4,7,"100 g Putenbrust-Aufschnitt, 40 g leichter Frischkäse, Gurke","fleisch milch"],
  ["Thunfisch-Gurken-Salat","sn",5,30,6,5,"1 Dose Thunfisch (natur), Gurke, 1 TL Öl, Zitrone","fisch"],
  ["Kernige Nussmischung","s",1,9,9,27,"45 g gemischte Nüsse","nuesse"],
].map(([n, m, z, p, c, f, d, g]) => ({n, m, z, p, c, f, d, g, k:Math.round((4*p + 4*c + 9*f) / 10) * 10, t:z <= 15 ? "s" : z <= 35 ? "n" : "a"}));

// Was im Profil steht → wonach gefiltert wird. Lieber einmal zu viel aussortieren als zu wenig.
const AVOID_ROOTS = [
  [/^kokos/, null],
  [/lakto|milch|molke|casein|kasein|käse$/, ["milch"]],
  [/vegan/, ["fleisch","fisch","milch","ei","honig"]], [/vegetar|veggie/, ["fleisch","fisch","hartkaese"]],
  [/meeresfr|krebs|krusten|garnel|shrimp/, ["krebstiere"]], [/fisch/, ["fisch"]],
  [/^rind/, ["rind"]], [/^schwein/, ["schwein"]], [/fleisch/, ["fleisch"]],
  [/gluten|weizen|zöliak|getreide/, ["gluten"]], [/^(hühner)?ei(er|ern)?$/, ["ei"]], [/eierallerg|eiallerg|hühnereiweiß/, ["ei"]],
  [/nuss|nüsse|nuesse|mandel/, ["nuesse"]], [/pilz|champignon/, ["pilze"]], [/soja|tofu/, ["soja"]], [/sesam/, ["sesam"]], [/honig/, ["honig"]],
];
const AVOID_STOP = new Set("kein keine keinen keiner nicht nichts ich mag esse vertrage bin habe und oder auch sehr gar ungern wenig ohne frei der die das den dem mit auf gegen von allergie allergisch allergiker unverträglich unverträglichkeit intoleranz bitte alles alle zu in es ist am im gern gerne z b".split(" "));
function mealTerms(txt){ return [...new Set(String(txt || "").toLowerCase().split(/[^a-zäöüß]+/).filter(w => w.length >= 2 && !AVOID_STOP.has(w)))]; }
function mealHits(r, term){
  const root = AVOID_ROOTS.find(x => x[0].test(term));
  const tags = r.g.split(" ");
  if (root && root[1] && root[1].some(s => tags.includes(s))) return true;
  if (root && root[1] && term.length < 5) return false;
  const words = (r.n + " " + r.d).toLowerCase().split(/[^a-zäöüß]+/).filter(Boolean);
  if (/^geflügel/.test(term)) return words.some(w => /hähnchen|pute/.test(w));
  if (term.length < 4) return words.includes(term);
  const stem = term.length >= 5 ? term.replace(/(en|n|e|s)$/, "") : term;
  return words.some(w => w.startsWith(stem) || (stem.length >= 4 && w.includes(stem)));
}
const mealUnknown = txt => mealTerms(txt).filter(t => !AVOID_ROOTS.some(x => x[0].test(t)) && !MEALS.some(r => mealHits(r, t)));
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
  const unk = mealUnknown(prof.avoid);
  if (unk.length) out.push(`Aus deinem Profil nicht zugeordnet: ${unk.join(", ")}. Zutaten bitte selbst prüfen.`);
  S.mealShown = [...used];
  if (kind === "ask") out.push("### Eigene Fragen\n- Freie Fragen und Foto-Analyse gehen mit einem Claude-Schlüssel unter ⚙️ Einstellungen.");
  return out.join("\n");
}
