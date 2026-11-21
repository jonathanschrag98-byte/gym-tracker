# Gym Tracker – Handy-App (PWA)

Eigenständige Version des claude.ai-Artefakts „Gym Tracker“, installierbar auf dem Handy-Homescreen.

- `index.html` – die App (aus dem Artefakt übernommen)
- `platform.js` – ersetzt den claude.ai-Speicher durch lokalen Speicher auf dem Gerät; Coach/Screenshot-Import über eigenen Claude-API-Schlüssel (optional)
- `settings.js` – Einstellungen (⚙️): Backup speichern/laden, API-Schlüssel
- `sw.js`, `manifest.webmanifest`, Icons – Offline-Betrieb und Installation

Lokal testen: `node .claude/serve.js` → http://localhost:8642

Fürs Handy muss die App über HTTPS erreichbar sein (z. B. GitHub Pages). Danach:
- iPhone (Safari): Teilen → „Zum Home-Bildschirm“
- Android (Chrome): Menü → „App installieren“

Daten liegen nur auf dem Handy → regelmäßig unter ⚙️ ein Backup speichern.
Nach Änderungen an den Dateien in `sw.js` die Versionsnummer (`gym-vN`) erhöhen.
