/* ============================================================
   Estado do jogo (F2-45: extraído de script.js)

   Script clássico, carregado logo após content.js/utils.js — antes de
   tudo que lê/escreve nesses valores. Sem dependência de nada além de
   setTimeout/clearTimeout (nativos do navegador).
   ============================================================ */

'use strict';

/* Tempos de experiência */
const SUSPENSE_MS = 1100;   // "aguardar a validação" após escolher
const ADVANCE_MS = 1300;    // depois do acerto, antes da próxima
const WRONG_SHOW_MS = 800;  // (arrastar) peça errada fica no alvo antes de voltar

const state = {
    category: 'formas',
    sub: { ingles: 'misturar', matematica: 'somar', mouse: 'misturar', numletras: 'misturar' },
    table: 'todas',        // tabuada específica (só usado quando matematica === 'multiplicar')
    difficulty: 'facil',
    mode: 'clicar',
    totalQuestions: 10,
    answered: 0,
    correctFirstTry: 0,   // quantas perguntas acertou de primeira (mostrado na mensagem de resultado)
    starsEarned: 0,       // estrelas ganhas de verdade nesta rodada (ver F2-17: no nível Difícil, 2 acertos = 1 estrela)
    curStreak: 0,         // sequência atual de acertos de primeira seguidos (F2-15)
    bestStreak: 0,        // maior sequência desta rodada
    missed: [],           // perguntas erradas ao menos uma vez, pra revisar depois (F2-16)
    reviewMode: false,    // true durante a revisão opcional (não ganha estrela)
    reviewQueue: [],
    firstTry: true,
    wrongAttempts: 0,      // erros nesta pergunta específica (zera a cada pergunta nova) — ver F2-03
    hintGiven: false,      // já eliminou uma opção errada como dica nesta pergunta? (só 1 por pergunta)
    question: null,       // pergunta atual (ver "8) PERGUNTAS", script.js)
    resultSpeech: '',     // texto lido no botão "ouvir resultado"
    profile: null,
};

let busy = false;        // trava durante o "suspense"/comemoração
let lastKey = null;      // evita repetir a mesma pergunta em sequência
let round = null;        // minijogo em andamento (treino do mouse)

// Só existe um timer de jogo por vez (suspense OU avanço). Guardado para
// poder cancelar ao encerrar/reiniciar e não vazar para outra tela/partida.
let pendingTimer = null;
function schedule(fn, ms) {
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => { pendingTimer = null; fn(); }, ms);
}
function cancelPending() {
    clearTimeout(pendingTimer);
    pendingTimer = null;
}
