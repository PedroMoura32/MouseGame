/* ============================================================
   Mímica (F2-34) — extraído de script.js (F2-45)

   Script clássico, carregado depois de script.js (usa "el" e "showScreen"
   de lá, e "randInt" de utils.js). Sorteia uma palavra (+ emoji de apoio)
   pra uma pessoa mimicar. Não é "clique na resposta certa": sem estrela,
   sem configuração — é só um sorteador pra uma brincadeira física entre
   as pessoas.
   ============================================================ */

'use strict';

const MIMICA_WORDS = [
    { word: 'Dormir', emoji: '😴' }, { word: 'Correr', emoji: '🏃' }, { word: 'Nadar', emoji: '🏊' },
    { word: 'Voar', emoji: '✈️' }, { word: 'Chorar', emoji: '😢' }, { word: 'Dançar', emoji: '💃' },
    { word: 'Pular', emoji: '🤸' }, { word: 'Cantar', emoji: '🎤' }, { word: 'Ler', emoji: '📖' },
    { word: 'Escrever', emoji: '✍️' }, { word: 'Dirigir', emoji: '🚗' }, { word: 'Comer', emoji: '🍽️' },
    { word: 'Escovar os dentes', emoji: '🪥' }, { word: 'Tomar banho', emoji: '🚿' }, { word: 'Rir', emoji: '😂' },
    { word: 'Elefante', emoji: '🐘' }, { word: 'Gato', emoji: '🐱' }, { word: 'Macaco', emoji: '🐒' },
    { word: 'Coelho', emoji: '🐰' }, { word: 'Passarinho', emoji: '🐦' }, { word: 'Cavalo', emoji: '🐴' },
    { word: 'Jogar bola', emoji: '⚽' }, { word: 'Andar de bicicleta', emoji: '🚲' }, { word: 'Tocar violão', emoji: '🎸' },
    { word: 'Sorvete derretendo', emoji: '🍦' }, { word: 'Robô', emoji: '🤖' }, { word: 'Fantasma', emoji: '👻' },
    { word: 'Abrir um presente', emoji: '🎁' }, { word: 'Escalar uma montanha', emoji: '🧗' }, { word: 'Pescar', emoji: '🎣' },
];

let lastMimicaIdx = -1;

function nextMimicaWord() {
    let idx = randInt(MIMICA_WORDS.length);
    if (MIMICA_WORDS.length > 1) while (idx === lastMimicaIdx) idx = randInt(MIMICA_WORDS.length);
    lastMimicaIdx = idx;
    const pick = MIMICA_WORDS[idx];
    el.mimicaEmoji.textContent = pick.emoji;
    el.mimicaWord.textContent = pick.word;
}

function openMimicaScreen() {
    showScreen('mimica');
    nextMimicaWord();
}

el.mimicaNextBtn.addEventListener('click', nextMimicaWord);
el.mimicaExitBtn.addEventListener('click', () => showScreen('menu'));
