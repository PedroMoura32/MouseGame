/* ============================================================
   Utilitários genéricos (F2-45: extraído de script.js)

   Script clássico, carregado antes de script.js. Funções puras de
   sorteio/embaralhamento usadas por vários jogos — sem dependência
   de DOM, state ou qualquer outro arquivo.
   ============================================================ */

'use strict';

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
