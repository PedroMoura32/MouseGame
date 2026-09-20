/* ============================================================
   Jogo dos Cliques
   Um joguinho para crianças treinarem o uso do mouse,
   associando objetos/nomes às respostas certas.

   Como adicionar conteúdo novo:
   - Formas:  adicione um item em CONTENT.formas (função shapeItem)
   - Cores:   adicione um item em CONTENT.cores  (função colorItem)
   - Animais: adicione um item em CONTENT.animais (função animalItem)
   - Números/Letras: geradas automaticamente mais abaixo
   Cada categoria é totalmente independente e escalável.
   ============================================================ */

'use strict';

/* -----------------------------------------------------------
   1) CONSTRUTORES DE ITENS
   Cada item sabe: como aparecer (kind + payload), qual é a
   pergunta (promptHTML) e como ser falado (speak).
----------------------------------------------------------- */

function shapeItem(id, name, article, shape, color) {
    return {
        id, name, kind: 'shape', shape, color,
        promptHTML: `Clique ${article} <b>${name}</b>`,
        speak: `Clique ${article} ${name}`,
    };
}

function colorItem(id, name, hex) {
    return {
        id, name, kind: 'color', hex,
        promptHTML: `Clique na cor <b>${name}</b>`,
        speak: `Clique na cor ${name}`,
    };
}

function animalItem(id, name, article, emoji) {
    return {
        id, name, kind: 'emoji', glyph: emoji,
        promptHTML: `Clique ${article} <b>${name}</b>`,
        speak: `Clique ${article} ${name}`,
    };
}

/* -----------------------------------------------------------
   2) BANCO DE CONTEÚDO
----------------------------------------------------------- */

const NUMBERS = [];
for (let n = 0; n <= 10; n++) {
    NUMBERS.push({
        id: 'num-' + n, name: String(n), kind: 'char', glyph: String(n),
        promptHTML: `Clique no número <b>${n}</b>`,
        speak: `Clique no número ${n}`,
    });
}

const LETTERS = [];
for (let i = 0; i < 26; i++) {
    const L = String.fromCharCode(65 + i);
    LETTERS.push({
        id: 'let-' + L, name: L, kind: 'char', glyph: L,
        promptHTML: `Clique na letra <b>${L}</b>`,
        speak: `Clique na letra ${L}`,
    });
}

const CONTENT = {
    formas: [
        shapeItem('circulo',   'CÍRCULO',   'no', 'circle',    '#e74c3c'),
        shapeItem('quadrado',  'QUADRADO',  'no', 'square',    '#3498db'),
        shapeItem('triangulo', 'TRIÂNGULO', 'no', 'triangle',  '#2ecc71'),
        shapeItem('retangulo', 'RETÂNGULO', 'no', 'rectangle', '#f39c12'),
        shapeItem('estrela',   'ESTRELA',   'na', 'star',      '#f1c40f'),
        shapeItem('coracao',   'CORAÇÃO',   'no', 'heart',     '#e84393'),
        shapeItem('losango',   'LOSANGO',   'no', 'diamond',   '#9b59b6'),
    ],
    cores: [
        colorItem('vermelha', 'VERMELHA', '#e74c3c'),
        colorItem('azul',     'AZUL',     '#3498db'),
        colorItem('amarela',  'AMARELA',  '#f1c40f'),
        colorItem('verde',    'VERDE',    '#2ecc71'),
        colorItem('laranja',  'LARANJA',  '#e67e22'),
        colorItem('roxa',     'ROXA',     '#9b59b6'),
        colorItem('rosa',     'ROSA',     '#ff6fb5'),
        colorItem('marrom',   'MARROM',   '#8b5a2b'),
        colorItem('cinza',    'CINZA',    '#95a5a6'),
        colorItem('preta',    'PRETA',    '#2c3e50'),
    ],
    animais: [
        animalItem('cachorro', 'CACHORRO', 'no', '🐶'),
        animalItem('gato',     'GATO',     'no', '🐱'),
        animalItem('leao',     'LEÃO',     'no', '🦁'),
        animalItem('cavalo',   'CAVALO',   'no', '🐴'),
        animalItem('vaca',     'VACA',     'na', '🐮'),
        animalItem('porco',    'PORCO',    'no', '🐷'),
        animalItem('galinha',  'GALINHA',  'na', '🐔'),
        animalItem('pato',     'PATO',     'no', '🦆'),
        animalItem('sapo',     'SAPO',     'no', '🐸'),
        animalItem('macaco',   'MACACO',   'no', '🐵'),
        animalItem('elefante', 'ELEFANTE', 'no', '🐘'),
        animalItem('peixe',    'PEIXE',    'no', '🐟'),
        animalItem('coelho',   'COELHO',   'no', '🐰'),
        animalItem('urso',     'URSO',     'no', '🐻'),
        animalItem('tigre',    'TIGRE',    'no', '🐯'),
        animalItem('abelha',   'ABELHA',   'na', '🐝'),
        animalItem('borboleta','BORBOLETA','na', '🦋'),
        animalItem('cobra',    'COBRA',    'na', '🐍'),
    ],
    // números e letras compartilham a mesma "categoria" no menu,
    // mas cada pergunta usa só um dos dois grupos (tudo número ou tudo letra).
    numletras: { num: NUMBERS, let: LETTERS },
};

const CATEGORY_META = [
    { id: 'formas',    label: 'Formas',           emoji: '🔷', sub: 'círculo, estrela…' },
    { id: 'cores',     label: 'Cores',            emoji: '🎨', sub: 'vermelho, azul…' },
    { id: 'animais',   label: 'Animais',          emoji: '🐶', sub: 'cachorro, gato…' },
    { id: 'numletras', label: 'Números e Letras', emoji: '🔢', sub: '1, 2, A, B…' },
    { id: 'misturar',  label: 'Misturar Tudo',    emoji: '🎲', sub: 'um pouco de cada' },
];

const DIFFICULTIES = [
    { id: 'facil',   label: 'Fácil',   emoji: '🙂', options: 3 },
    { id: 'medio',   label: 'Médio',   emoji: '😃', options: 4 },
    { id: 'dificil', label: 'Difícil', emoji: '🤓', options: 6 },
];

const COUNT_OPTIONS = [5, 10, 20, 30];

/* -----------------------------------------------------------
   3) ESTADO DO JOGO
----------------------------------------------------------- */

const state = {
    category: 'formas',
    difficulty: 'facil',
    totalQuestions: 10,
    answered: 0,        // quantas perguntas já foram respondidas corretamente (avançadas)
    correctFirstTry: 0, // acertos sem errar antes (viram estrela)
    firstTry: true,     // se ainda não errou na pergunta atual
    correctItem: null,
    muted: false,
};

/* -----------------------------------------------------------
   4) ATALHOS PARA O DOM
----------------------------------------------------------- */

const $ = (sel) => document.querySelector(sel);

const screens = {
    menu: $('#screen-menu'),
    game: $('#screen-game'),
    results: $('#screen-results'),
};

const el = {
    categoryGrid: $('#category-grid'),
    difficultyGrid: $('#difficulty-grid'),
    countGrid: $('#count-grid'),
    customCount: $('#custom-count-input'),
    startBtn: $('#start-btn'),
    soundToggle: $('#sound-toggle'),

    qCurrent: $('#q-current'),
    qTotal: $('#q-total'),
    qScore: $('#q-score'),
    progressBar: $('#progress-bar'),
    promptText: $('#prompt-text'),
    repeatBtn: $('#repeat-btn'),
    options: $('#options'),
    feedback: $('#feedback'),
    quitBtn: $('#quit-btn'),

    resultsEmoji: $('#results-emoji'),
    resultsTitle: $('#results-title'),
    resultsCorrect: $('#results-correct'),
    resultsAnswered: $('#results-answered'),
    resultsStars: $('#results-stars'),
    playAgainBtn: $('#play-again-btn'),
    menuBtn: $('#menu-btn'),

    correctSound: $('#correct-sound'),
    wrongSound: $('#wrong-sound'),
};

/* -----------------------------------------------------------
   5) UTILITÁRIOS
----------------------------------------------------------- */

function randInt(max) { return Math.floor(Math.random() * max); }
function randomFrom(arr) { return arr[randInt(arr.length)]; }

// Embaralha uma cópia do array (Fisher–Yates).
function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Sorteia n itens distintos de um array.
function sample(arr, n) {
    return shuffle(arr).slice(0, n);
}

function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove('is-active'));
    screens[name].classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* -----------------------------------------------------------
   6) NARRAÇÃO (Web Speech API)
----------------------------------------------------------- */

let ptVoice = null;

function loadVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    ptVoice = voices.find((v) => /pt[-_]BR/i.test(v.lang))
        || voices.find((v) => /^pt/i.test(v.lang))
        || null;
}

if ('speechSynthesis' in window) {
    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
}

function speak(text) {
    if (state.muted || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        u.rate = 0.95;
        u.pitch = 1.1;
        if (ptVoice) u.voice = ptVoice;
        window.speechSynthesis.speak(u);
    } catch (_) { /* narração é opcional */ }
}

function playSound(audio) {
    if (state.muted) return;
    try {
        audio.currentTime = 0;
        const p = audio.play();
        if (p && p.catch) p.catch(() => {}); // ignora bloqueio de autoplay
    } catch (_) { /* som é opcional */ }
}

/* -----------------------------------------------------------
   7) RENDERIZAÇÃO DOS ITENS
----------------------------------------------------------- */

function shapeSVG(shape, color) {
    const shapes = {
        circle:    `<circle cx="50" cy="50" r="44"/>`,
        square:    `<rect x="8" y="8" width="84" height="84" rx="10"/>`,
        triangle:  `<polygon points="50,6 94,92 6,92"/>`,
        rectangle: `<rect x="4" y="26" width="92" height="48" rx="10"/>`,
        diamond:   `<polygon points="50,4 92,50 50,96 8,50"/>`,
        star:      `<polygon points="50,4 61,38 97,38 68,60 79,94 50,72 21,94 32,60 3,38 39,38"/>`,
        heart:     `<path d="M50 88 L14 52 A20 20 0 0 1 50 26 A20 20 0 0 1 86 52 Z"/>`,
    };
    return `<svg viewBox="0 0 100 100" fill="${color}" aria-hidden="true">${shapes[shape] || ''}</svg>`;
}

// Devolve o HTML interno de um botão de opção.
function renderItemInner(item) {
    switch (item.kind) {
        case 'shape': return shapeSVG(item.shape, item.color);
        case 'color': return `<span class="swatch" style="background:${item.hex}"></span>`;
        case 'emoji':
        case 'char':  return `<span class="glyph">${item.glyph}</span>`;
        default:      return '';
    }
}

/* -----------------------------------------------------------
   8) GERAÇÃO DE PERGUNTAS
----------------------------------------------------------- */

// Escolhe o "pool" de itens conforme a categoria da rodada.
function poolForCategory(catId) {
    if (catId === 'numletras') {
        return Math.random() < 0.5 ? CONTENT.numletras.num : CONTENT.numletras.let;
    }
    return CONTENT[catId];
}

let lastCorrectId = null;

function optionCount() {
    const diff = DIFFICULTIES.find((d) => d.id === state.difficulty);
    return diff ? diff.options : 4;
}

function newQuestion() {
    // No modo "misturar", cada pergunta usa uma categoria sorteada.
    const catId = state.category === 'misturar'
        ? randomFrom(['formas', 'cores', 'animais', 'numletras'])
        : state.category;

    const pool = poolForCategory(catId);
    const count = Math.min(optionCount(), pool.length);

    // Evita repetir a mesma resposta correta duas vezes seguidas.
    let candidates = pool.filter((it) => it.id !== lastCorrectId);
    if (candidates.length === 0) candidates = pool;
    const correct = randomFrom(candidates);
    lastCorrectId = correct.id;

    const distractors = sample(pool.filter((it) => it.id !== correct.id), count - 1);
    const options = shuffle([correct, ...distractors]);

    state.correctItem = correct;
    state.firstTry = true;

    renderQuestion(correct, options, count);
}

function renderQuestion(correct, options, count) {
    el.promptText.innerHTML = correct.promptHTML;

    el.options.setAttribute('data-count', String(count));
    el.options.innerHTML = '';

    options.forEach((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option';
        btn.innerHTML = renderItemInner(item);
        btn.setAttribute('aria-label', item.name);
        btn.addEventListener('click', () => onOptionClick(btn, item));
        el.options.appendChild(btn);
    });

    el.feedback.textContent = '';
    el.feedback.className = 'feedback';

    updateHud();
    // Fala a pergunta (pequeno atraso para não cortar a transição).
    setTimeout(() => speak(correct.speak), 250);
}

/* -----------------------------------------------------------
   9) INTERAÇÃO
----------------------------------------------------------- */

const CHEERS = ['Muito bem! 🎉', 'Isso! 🌟', 'Você acertou! 👏', 'Boa! 🥳', 'Perfeito! ✨'];
const TRY_AGAIN = ['Quase! Tenta de novo. 💪', 'Ops! Procura de novo. 🙂', 'Não foi essa. Tenta outra! 👀'];

function onOptionClick(btn, item) {
    if (btn.disabled) return;

    const isCorrect = item.id === state.correctItem.id;

    if (isCorrect) {
        btn.classList.add('is-correct');
        el.feedback.textContent = randomFrom(CHEERS);
        el.feedback.className = 'feedback is-correct';
        playSound(el.correctSound);
        speak('Muito bem!');
        burstConfetti();

        // Trava todas as opções e conta o acerto.
        el.options.querySelectorAll('.option').forEach((b) => { b.disabled = true; });
        state.answered++;
        if (state.firstTry) state.correctFirstTry++;
        updateHud();

        setTimeout(nextStep, 1300);
    } else {
        state.firstTry = false;
        btn.classList.add('is-wrong');
        btn.classList.add('is-dimmed'); // some suavemente para ajudar por eliminação
        btn.disabled = true;
        el.feedback.textContent = randomFrom(TRY_AGAIN);
        el.feedback.className = 'feedback is-wrong';
        playSound(el.wrongSound);
    }
}

function nextStep() {
    if (state.answered >= state.totalQuestions) {
        showResults();
    } else {
        newQuestion();
    }
}

function updateHud() {
    // "Pergunta X de N": mostra a pergunta em andamento.
    el.qCurrent.textContent = Math.min(state.answered + 1, state.totalQuestions);
    el.qTotal.textContent = state.totalQuestions;
    el.qScore.textContent = state.correctFirstTry;
    const pct = (state.answered / state.totalQuestions) * 100;
    el.progressBar.style.width = pct + '%';
}

/* -----------------------------------------------------------
   10) RESULTADO
----------------------------------------------------------- */

function showResults() {
    window.speechSynthesis && window.speechSynthesis.cancel();

    const answered = state.answered;
    const correct = state.correctFirstTry;
    const pct = answered > 0 ? correct / answered : 0;

    let emoji, title, phrase;
    if (pct >= 0.9)      { emoji = '🏆'; title = 'Você é uma estrela!'; phrase = 'Uhuul!'; }
    else if (pct >= 0.7) { emoji = '🎉'; title = 'Mandou super bem!';   phrase = 'Que orgulho!'; }
    else if (pct >= 0.5) { emoji = '💪'; title = 'Muito bom!';          phrase = 'Continue praticando!'; }
    else                 { emoji = '😊'; title = 'Boa tentativa!';      phrase = 'Vamos jogar de novo?'; }

    el.resultsEmoji.textContent = emoji;
    el.resultsTitle.textContent = title;
    el.resultsCorrect.textContent = correct;
    el.resultsAnswered.textContent = answered;

    // Mostra até 10 estrelas para não estourar a tela; acima disso, resume.
    if (correct <= 12) {
        el.resultsStars.textContent = '⭐'.repeat(correct) || '—';
    } else {
        el.resultsStars.textContent = `⭐ x ${correct}`;
    }

    showScreen('results');
    speak(`${phrase} Você acertou ${correct} de ${answered}.`);
    if (pct >= 0.5) setTimeout(() => burstConfetti(true), 300);
}

/* -----------------------------------------------------------
   11) CONFETE (canvas, sem dependências)
----------------------------------------------------------- */

const confettiCanvas = $('#confetti');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiRAF = null;

function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

const CONFETTI_COLORS = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#ff6fb5', '#fdcb6e'];

function burstConfetti(big) {
    const amount = big ? 160 : 70;
    const w = confettiCanvas.width;
    for (let i = 0; i < amount; i++) {
        confettiPieces.push({
            x: w / 2 + (Math.random() - 0.5) * w * 0.5,
            y: -20 - Math.random() * 60,
            vx: (Math.random() - 0.5) * 6,
            vy: 2 + Math.random() * 4,
            size: 6 + Math.random() * 8,
            color: randomFrom(CONFETTI_COLORS),
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.3,
        });
    }
    if (!confettiRAF) confettiRAF = requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravidade
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
    });
    // Remove peças que saíram da tela.
    confettiPieces = confettiPieces.filter((p) => p.y < confettiCanvas.height + 30);

    if (confettiPieces.length > 0) {
        confettiRAF = requestAnimationFrame(drawConfetti);
    } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiRAF = null;
    }
}

/* -----------------------------------------------------------
   12) MENU: construção e seleção
----------------------------------------------------------- */

function buildChoice(container, meta, group, isSelected) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice' + (isSelected ? ' is-selected' : '');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(isSelected));
    btn.dataset.value = meta.value;
    btn.innerHTML =
        (meta.emoji ? `<span class="choice-emoji">${meta.emoji}</span>` : '') +
        `<span>${meta.label}</span>` +
        (meta.sub ? `<span class="choice-sub">${meta.sub}</span>` : '');
    btn.addEventListener('click', () => {
        container.querySelectorAll('.choice').forEach((c) => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('is-selected');
        btn.setAttribute('aria-checked', 'true');
        group.onSelect(meta.value);
    });
    container.appendChild(btn);
}

function buildMenu() {
    // Categorias
    CATEGORY_META.forEach((c, i) => buildChoice(
        el.categoryGrid,
        { value: c.id, label: c.label, emoji: c.emoji, sub: c.sub },
        { onSelect: (v) => { state.category = v; } },
        i === 0,
    ));

    // Dificuldades
    DIFFICULTIES.forEach((d, i) => buildChoice(
        el.difficultyGrid,
        { value: d.id, label: d.label, emoji: d.emoji, sub: d.options + ' opções' },
        { onSelect: (v) => { state.difficulty = v; } },
        i === 0,
    ));

    // Quantidade de perguntas
    COUNT_OPTIONS.forEach((n, i) => buildChoice(
        el.countGrid,
        { value: String(n), label: String(n), sub: 'perguntas' },
        { onSelect: (v) => { state.totalQuestions = parseInt(v, 10); el.customCount.value = ''; } },
        i === 1, // padrão: 10 perguntas
    ));

    // Estado inicial coerente com as seleções padrão
    state.category = 'formas';
    state.difficulty = 'facil';
    state.totalQuestions = 10;
}

// Número personalizado desmarca os botões e ajusta o total.
el.customCount.addEventListener('input', () => {
    const v = parseInt(el.customCount.value, 10);
    if (!isNaN(v) && v > 0) {
        el.countGrid.querySelectorAll('.choice').forEach((c) => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-checked', 'false');
        });
        state.totalQuestions = Math.min(v, 99);
    }
});

/* -----------------------------------------------------------
   13) CONTROLE DE FLUXO
----------------------------------------------------------- */

function startGame() {
    // Garante um total válido.
    if (!state.totalQuestions || state.totalQuestions < 1) state.totalQuestions = 10;
    state.totalQuestions = Math.min(state.totalQuestions, 99);

    state.answered = 0;
    state.correctFirstTry = 0;
    lastCorrectId = null;

    showScreen('game');
    updateHud();
    newQuestion();
}

function quitGame() {
    showResults();
}

function toggleSound() {
    state.muted = !state.muted;
    el.soundToggle.textContent = state.muted ? '🔈' : '🔊';
    el.soundToggle.classList.toggle('is-muted', state.muted);
    el.soundToggle.setAttribute('aria-pressed', String(state.muted));
    if (state.muted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

/* -----------------------------------------------------------
   14) EVENTOS
----------------------------------------------------------- */

el.startBtn.addEventListener('click', startGame);
el.quitBtn.addEventListener('click', quitGame);
el.repeatBtn.addEventListener('click', () => {
    if (state.correctItem) speak(state.correctItem.speak);
});
el.soundToggle.addEventListener('click', toggleSound);
el.playAgainBtn.addEventListener('click', startGame);
el.menuBtn.addEventListener('click', () => showScreen('menu'));

/* -----------------------------------------------------------
   15) INICIALIZAÇÃO
----------------------------------------------------------- */

buildMenu();
showScreen('menu');
