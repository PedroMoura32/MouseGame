/* ============================================================
   App instalável (PWA) — extraído de script.js (F2-45)

   Script clássico, carregado depois de dom.js (usa "el.installBtn").
   Service worker (sw.js) guarda o jogo no aparelho: depois da primeira
   visita ele abre mesmo sem internet. O botão "Instalar app" aparece
   sozinho quando o navegador permite instalar.
   ============================================================ */

'use strict';

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => { /* funciona normal, só não fica offline */ });
    });
}

let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    el.installBtn.hidden = false;
});
el.installBtn.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    try { await installPrompt.userChoice; } catch (_) { /* ignorado */ }
    installPrompt = null;
    el.installBtn.hidden = true;
});
window.addEventListener('appinstalled', () => { el.installBtn.hidden = true; });
