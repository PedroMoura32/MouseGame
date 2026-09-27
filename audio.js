/* ============================================================
   Narração (sob demanda) e sons (F2-45: extraído de script.js)

   Script clássico, carregado depois de state.js (usa "state.profile"/
   "state.question"/"state.mode" em autoReadCurrentQuestion).
   ============================================================ */

'use strict';

const voices = { 'pt-BR': null, 'en-US': null };

function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const all = window.speechSynthesis.getVoices();
    voices['pt-BR'] = all.find((v) => /pt[-_]BR/i.test(v.lang)) || all.find((v) => /^pt/i.test(v.lang)) || null;
    voices['en-US'] = all.find((v) => /en[-_]US/i.test(v.lang)) || all.find((v) => /^en/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

function stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// Palavras em MAIÚSCULAS (COELHO, MACACO...) são soletradas por muitas vozes.
// Passamos para minúsculas só na hora de falar; letras soltas (A, B) ficam como estão.
function speakable(text, lang) {
    return text.replace(/\p{L}{2,}/gu, (w) => w.toLocaleLowerCase(lang));
}

// F2-02: fala a pergunta/instrução atual sozinha, só se o perfil tiver essa opção ligada
// (pensada pra quem ainda não lê); o resto do app continua manual, no botão 🔊.
function autoReadCurrentQuestion() {
    if (!state.profile || !state.profile.autoRead || !state.question) return;
    speak(state.question.prompt(state.mode).speak);
}

// "parts" = texto (pt-BR) ou lista [{ text, lang }] para misturar idiomas.
// F2-35: passar { slow: true } fala bem mais devagar (pensado pro jogo de Inglês).
function speak(parts, opts = {}) {
    if (!('speechSynthesis' in window)) return;
    const list = typeof parts === 'string' ? [{ text: parts, lang: 'pt-BR' }] : parts;
    try {
        window.speechSynthesis.cancel();
        list.forEach((seg) => {
            const u = new SpeechSynthesisUtterance(speakable(seg.text, seg.lang));
            u.lang = seg.lang;
            u.rate = opts.slow ? 0.5 : (seg.lang === 'en-US' ? 0.85 : 0.95);
            u.pitch = 1.1;
            if (voices[seg.lang]) u.voice = voices[seg.lang];
            window.speechSynthesis.speak(u);
        });
    } catch (_) { /* narração é opcional */ }
}

function playSound(audio) {
    try {
        audio.currentTime = 0;
        const p = audio.play();
        if (p && p.catch) p.catch(() => {});
    } catch (_) { /* som é opcional */ }
}
