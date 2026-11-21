/* Einstellungen: Backup, Wiederherstellen, Claude-Schlüssel für den Coach */
function viewSettings(){
  const has = !!gymLocal.getKey();
  return `
  <div class="card">
    <h2>Datensicherung</h2>
    <p class="hint" style="margin:4px 0 10px">Alle Daten liegen nur auf diesem Handy (${gymLocal.count()} Einträge). Mach ab und zu ein Backup, z. B. in iCloud Drive oder Google Drive.</p>
    <button class="btn primary" data-act="bexport">⬇️ Backup speichern</button>
    <button class="btn ghost" data-act="bimport">⬆️ Backup laden</button>
    <input type="file" id="bfile" accept="application/json,.json" hidden>
    ${S.backupMsg ? `<p class="hint" style="margin:10px 0 0;color:${S.backupMsg.startsWith("✓")?"var(--good)":"var(--warn)"}">${esc(S.backupMsg)}</p>` : ""}
  </div>
  <div class="card">
    <h2>Ernährungs-Coach & Screenshot-Import</h2>
    <p class="hint" style="margin:4px 0 10px">Optional. Diese Funktionen nutzen Claude über einen eigenen API-Schlüssel von <b style="color:var(--text)">console.anthropic.com</b> (Abrechnung pro Nutzung, wenige Cent pro Frage). Der Schlüssel bleibt nur auf diesem Gerät.</p>
    ${has ? `<p class="hint" style="color:var(--good);margin:0 0 10px">✓ Schlüssel hinterlegt – Coach ist aktiv.</p><button class="btn danger" data-act="kdel">Schlüssel entfernen</button>`
      : `<input id="kval" type="password" autocomplete="off" placeholder="sk-ant-…" style="width:100%;background:var(--card2);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:12px;font-size:16px;font-family:inherit;outline:none;margin-bottom:10px">
         <button class="btn primary" data-act="ksave">Schlüssel speichern</button>`}
  </div>
  <p class="hint" style="text-align:center">Gym Tracker · läuft offline</p>`;
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-act]"); if (!t) return;
  const a = t.dataset.act;
  if (a === "bexport"){
    const blob = new Blob([JSON.stringify(gymLocal.exportData(), null, 1)], { type:"application/json" });
    const name = "gym-backup-" + today() + ".json";
    const file = new File([blob], name, { type:"application/json" });
    if (navigator.canShare && navigator.canShare({ files:[file] })){
      navigator.share({ files:[file], title:name }).then(() => { S.backupMsg = "✓ Backup erstellt."; render(); }).catch(() => {});
    } else {
      const u = URL.createObjectURL(blob), l = document.createElement("a");
      l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove();
      setTimeout(() => URL.revokeObjectURL(u), 2000);
      S.backupMsg = "✓ Backup gespeichert."; render();
    }
  }
  if (a === "bimport"){ const f = $("#bfile"); if (f) f.click(); }
  if (a === "ksave"){
    const k = ($("#kval").value || "").trim();
    if (!/^sk-ant-/.test(k)){ $("#kval").focus(); return; }
    gymLocal.setKey(k);
    claude.use("sample").then(s => { S.sample = s; S.canImg = !!s; render(); });
  }
  if (a === "kdel") ask("API-Schlüssel entfernen?", () => { gymLocal.setKey(""); S.sample = null; S.canImg = false; render(); });
});

document.addEventListener("change", e => {
  if (e.target.id !== "bfile") return;
  const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
  f.text().then(txt => {
    const obj = JSON.parse(txt);
    ask("Backup laden? Die aktuellen Daten auf diesem Handy werden ersetzt.", () => {
      try { gymLocal.importData(obj); S.draft = null; S.backupMsg = "✓ Backup geladen."; }
      catch(err){ S.backupMsg = "Datei konnte nicht gelesen werden."; }
      render();
    });
  }).catch(() => { S.backupMsg = "Datei konnte nicht gelesen werden."; render(); });
});

if ("serviceWorker" in navigator && location.protocol !== "file:"){
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
