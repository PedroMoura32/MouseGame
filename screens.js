/* ============================================================
   Navegação entre telas (F2-45: extraído de script.js)

   Script clássico, carregado depois de dom.js (usa "el"/"screens").
   BACK_ACTION e showScreen chamam funções de outros arquivos (stopSpeech,
   stopRound, showResults, renderProfiles, stopPlaytimeTracking) só de
   dentro de funções/handlers — nunca no nível superior — então a ordem
   de carregamento entre este arquivo e aqueles não importa: quando o
   usuário realmente aciona alguma dessas ações, tudo já carregou.
   ============================================================ */

'use strict';

// Largura da barra de rolagem (0 em telas de toque): usada para alinhar o botão "Começar!" à direita.
function updateScrollbarWidth() {
    const w = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--sbw', Math.max(0, w) + 'px');
}
window.addEventListener('resize', updateScrollbarWidth);

// F2-41: o botão "voltar" (navegador ou do próprio Android) navegava pra FORA do
// app inteiro, porque as trocas de tela nunca mexiam no histórico. Agora cada tela
// que não seja "profiles" (a raiz) empilha uma entrada de histórico; o "voltar" some
// essa entrada e cai num popstate, que a gente escuta e usa pra decidir pra onde ir
// dentro do próprio app — reaproveitando exatamente a mesma ação do botão visível de
// cada tela (Voltar/Sair/Encerrar), então o comportamento é idêntico ao de tocar nele.
let currentScreenName = null;
let handlingPopstate = false;

const BACK_ACTION = {
    menu:    () => { stopPlaytimeTracking(); renderProfiles(); showScreen('profiles'); },
    config:  () => showScreen('menu'),
    game:    () => showResults(),
    draw:    () => showScreen('menu'),
    mimica:  () => showScreen('menu'),
    parent:  () => showScreen('profiles'),
    results: () => showScreen('menu'),
};

window.addEventListener('popstate', () => {
    handlingPopstate = true;
    const action = BACK_ACTION[currentScreenName];
    if (action) action(); else showScreen('profiles');
    handlingPopstate = false;
});

function showScreen(name) {
    stopSpeech();
    if (name !== 'game') stopRound();   // fora do jogo, nenhum minijogo fica rodando
    Object.values(screens).forEach((s) => s.classList.remove('is-active'));
    screens[name].classList.add('is-active');
    document.body.classList.toggle('is-playing', name === 'game');   // tela do jogo cabe na janela (sem rolar)
    document.body.classList.toggle('is-drawing', name === 'draw');   // pintura livre também cabe na janela inteira
    el.profileBar.hidden = !(name === 'menu' || name === 'config');   // só faz sentido junto do menu/configuração
    updateScrollbarWidth();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (handlingPopstate) {
        // já estamos respondendo a um "voltar": só reetiqueta a entrada atual,
        // sem empilhar mais uma (senão cada "voltar" precisaria de 2 toques).
        if (name !== 'profiles') history.replaceState({ screen: name }, '', location.href);
    } else if (name !== 'profiles' && currentScreenName !== name) {
        history.pushState({ screen: name }, '', location.href);
    }
    currentScreenName = name;
}

// Frase (formas, cores, animais, números e letras) conforme o modo de jogo.
function buildPrompt(item, mode) {
    if (mode === 'arrastar') {
        return { html: `Arraste ${item.gender} ${item.nounHTML}`, speak: `Arraste ${item.gender} ${item.nounText}` };
    }
    const prep = item.gender === 'o' ? 'no' : 'na';
    return { html: `Clique ${prep} ${item.nounHTML}`, speak: `Clique ${prep} ${item.nounText}` };
}
