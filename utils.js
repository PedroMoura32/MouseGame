/* ============================================================
   Utilitários genéricos (F2-45: extraído de script.js)

   Script clássico, carregado antes de script.js. Funções puras de
   sorteio/embaralhamento usadas por vários jogos — sem dependência
   de DOM, state ou qualquer outro arquivo.
   ============================================================ */

'use strict';

// F2-48: IS_TOUCH é definido no <head> inline (antes de qualquer script).
// Aqui só garantimos que existe, caso algum teste rode sem o index.html.
if (typeof IS_TOUCH === 'undefined') {
    var IS_TOUCH = (navigator.maxTouchPoints || 0) > 0
                   && matchMedia('(pointer: coarse)').matches;
}

// F2-49: troca termos de PC ("clique") pela versão touch ("toque") quando IS_TOUCH.
// Usada nos textos que o usuário vê — IDs internos e nomes de variável NÃO mudam.
const _TOUCH = {
    'Clique':'Toque','clique':'toque','Cliques':'Toques','cliques':'toques',
    'Clicar':'Tocar','clicar':'tocar','clica':'toca',
    '2 cliques':'2 toques','clique na resposta':'toque na resposta',
    'Treino do Mouse':'Treino de Coordenação','Treino do mouse':'Treino de Coordenação',
    'treino do mouse':'treino de coordenação',
    'Escolha o treino do mouse':'Escolha o treino de coordenação',
};
function term(pc) { return IS_TOUCH ? (_TOUCH[pc] || pc) : pc; }

function randInt(max) { return Math.floor(Math.random() * max); }
function randomFrom(arr) { return arr[randInt(arr.length)]; }
function randRange(min, max) { return min + randInt(max - min + 1); }

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function sample(arr, n) { return shuffle(arr).slice(0, n); }
