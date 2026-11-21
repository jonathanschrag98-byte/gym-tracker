/* Ersetzt die claude.ai-Laufzeit (db, user, sample) durch lokale Versionen,
   damit die App ohne claude.ai als eigenständige Handy-App läuft. */
(function(){
  const KEY = "gymtracker-data-v1";
  const APIKEY = "gymtracker-apikey";

  /* ---------- lokaler Speicher (gleiche API wie claude db) ---------- */
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ store = {}; }
  const listeners = [];
  const clone = o => JSON.parse(JSON.stringify(o));
  function persist(){
    try { localStorage.setItem(KEY, JSON.stringify(store)); }
    catch(e){ const err = new Error("Speicher voll"); err.code = "quota_exceeded"; throw err; }
  }
  function snap(){
    return { docs: Object.entries(store).map(([id,d]) => ({ id, data: () => clone(d) })), metadata: { fromCache:false } };
  }
  function emit(){ const s = snap(); listeners.forEach(f => { try { f(s); } catch(e){ console.error(e); } }); }
  const collection = {
    doc(id){
      return {
        set: async d => { store[id] = clone(d); persist(); emit(); },
        delete: async () => { delete store[id]; persist(); emit(); },
      };
    },
    onSnapshot(cb){ listeners.push(cb); setTimeout(() => cb(snap()), 0); return () => {}; },
  };
  const db = { collection: () => collection };

  // Browser bitten, die Daten nicht automatisch zu löschen
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch(e){}

  /* ---------- Claude-Coach über eigenen API-Schlüssel ---------- */
  const getKey = () => { try { return localStorage.getItem(APIKEY) || ""; } catch(e){ return ""; } };
  const fail = (code, text) => { const e = new Error(code); e.code = code; if (text) e.text = text; return e; };

  function imageBlock(file){
    // Bild verkleinern und als JPEG senden (funktioniert auch mit HEIC auf dem iPhone)
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const max = 1568, s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        const data = c.toDataURL("image/jpeg", 0.85).split(",")[1];
        resolve({ type:"image", source:{ type:"base64", media_type:"image/jpeg", data } });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(fail("image_rejected")); };
      img.src = url;
    });
  }

  async function sample(prompt, opts = {}){
    const key = getKey(); if (!key) throw fail("not_granted");
    const content = [];
    for (const f of (opts.images || [])) content.push(await imageBlock(f));
    content.push({ type:"text", text: prompt });
    const stream = typeof opts.onText === "function";
    const body = {
      model: opts.modelTier === "quick" ? "claude-haiku-5-5" : "claude-sonnet-5-5",
      max_tokens: 2000, stream, messages: [{ role:"user", content }],
    };
    let text = "";
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", signal: opts.signal,
        headers:{ "content-type":"application/json", "x-api-key": key, "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
        body: JSON.stringify(body),
      });
      if (!r.ok){
        let msg = ""; try { msg = (await r.json()).error.message || ""; } catch(e){}
        if (r.status === 401 || r.status === 403) throw fail("not_granted");
        if (r.status === 429 || r.status === 529) throw fail("rate_limited");
        if (r.status === 400 && /image/i.test(msg)) throw fail("image_rejected");
        throw fail("error", "");
      }
      if (!stream){ const j = await r.json(); text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join(""); return { text }; }
      const rd = r.body.getReader(), dec = new TextDecoder(); let buf = "";
      for (;;){
        const { value, done } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream:true });
        let i;
        while ((i = buf.indexOf("\n")) >= 0){
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
          if (!line.startsWith("data:")) continue;
          let ev; try { ev = JSON.parse(line.slice(5)); } catch(e){ continue; }
          if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta"){ text += ev.delta.text; opts.onText({ text }); }
          if (ev.type === "error") throw fail(ev.error && ev.error.type === "overloaded_error" ? "rate_limited" : "error", text);
        }
      }
      return { text };
    } catch(e){
      if (e && e.name === "AbortError") throw fail("cancelled", text);
      if (e && e.code) { if (!e.text) e.text = text; throw e; }
      throw fail("error", text);
    }
  }
  sample.json = async (prompt, opts = {}) => {
    const { text } = await sample(prompt + "\n\nAntworte ausschließlich mit dem JSON-Objekt, ohne weiteren Text.", opts);
    const m = text.match(/\{[\s\S]*\}/); if (!m) return null;
    try { return JSON.parse(m[0]); } catch(e){ return null; }
  };
  sample.limits = async () => ({ images:true });

  window.claude = {
    async use(name){
      if (name === "db") return db;
      if (name === "user") return { id: async () => "local" };
      if (name === "sample") return getKey() ? sample : null;
      return null;
    },
  };

  /* ---------- Helfer für die Einstellungen ---------- */
  window.gymLocal = {
    getKey, setKey(k){ try { k ? localStorage.setItem(APIKEY, k) : localStorage.removeItem(APIKEY); } catch(e){} },
    exportData(){ return { app:"gym-tracker", version:1, exported:new Date().toISOString(), docs: clone(store) }; },
    importData(obj){
      if (!obj || typeof obj.docs !== "object") throw new Error("Ungültige Datei");
      store = clone(obj.docs); persist(); emit();
    },
    count(){ return Object.values(store).filter(d => d && (d.type === "workout" || d.type === "run" || d.type === "weight")).length; },
  };
})();
