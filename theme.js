/* ============================================================
   Modo noturno (F2-22) — extraído de script.js (F2-45)

   Script clássico, carregado depois de dom.js (usa "el.themeToggle").
   Sem escolha salva, segue a preferência do sistema (@media prefers-color-
   scheme no CSS). Clicar no botão salva uma escolha explícita, que passa
   a valer independente do sistema, até a pessoa mudar de novo.
   ============================================================ */

'use strict';

const THEME_KEY = 'mousegame.theme.v1';

function isDarkNow() {
    const chosen = document.documentElement.getAttribute('data-theme');
    if (chosen === 'dark') return true;
    if (chosen === 'light') return false;
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function updateThemeToggleIcon() {
    const dark = isDarkNow();
    el.themeToggle.textContent = dark ? '☀️' : '🌙';
    el.themeToggle.setAttribute('aria-label', dark ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
}
el.themeToggle.addEventListener('click', () => {
    const next = isDarkNow() ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
    document.documentElement.setAttribute('data-theme', next);
    updateThemeToggleIcon();
});
// Se a pessoa nunca escolheu manualmente, o ícone acompanha o sistema mudando ao vivo.
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        try { if (!localStorage.getItem(THEME_KEY)) updateThemeToggleIcon(); } catch (_) { updateThemeToggleIcon(); }
    });
}
updateThemeToggleIcon();
