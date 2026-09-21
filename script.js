/* ============================================================
   Jogo dos Cliques
   Joguinho para crianças treinarem o uso do mouse (clicar e
   arrastar), associando objetos/nomes às respostas certas.

   Como adicionar conteúdo novo (é só editar CONTENT):
   - Formas:  shapeItem(id, NOME, genero, forma, cor)
   - Cores:   colorItem(id, NOME, hex)
   - Animais: animalItem(id, NOME, genero, emoji)
   - Números/Letras: gerados automaticamente
   "genero" é 'o' ou 'a' (para montar "Clique NO..." e "Arraste O...").
   ============================================================ */

'use strict';

/* -----------------------------------------------------------
   1) CONSTRUTORES DE ITENS
   Cada item guarda gênero + o "nome" (nounHTML/nounText) e o
   jogo monta a frase conforme o modo (clicar/arrastar).
----------------------------------------------------------- */

function shapeItem(id, name, gender, shape, color) {
    return { id, name, gender, kind: 'shape', shape, color, nounHTML: `<b>${name}</b>`, nounText: name };
}
function colorItem(id, name, hex) {
    return { id, name, gender: 'a', kind: 'color', hex, nounHTML: `cor <b>${name}</b>`, nounText: `cor ${name}` };
}
function animalItem(id, name, gender, emoji) {
    return { id, name, gender, kind: 'emoji', glyph: emoji, nounHTML: `<b>${name}</b>`, nounText: name };
}

/* -----------------------------------------------------------
   2) BANCO DE CONTEÚDO
----------------------------------------------------------- */

const NUMBERS = [];
for (let n = 0; n <= 10; n++) {
    NUMBERS.push({ id: 'num-' + n, name: String(n), gender: 'o', kind: 'char', glyph: String(n),
        nounHTML: `número <b>${n}</b>`, nounText: `número ${n}` });
}

const LETTERS = [];
for (let i = 0; i < 26; i++) {
    const L = String.fromCharCode(65 + i);
    LETTERS.push({ id: 'let-' + L, name: L, gender: 'a', kind: 'char', glyph: L,
        nounHTML: `letra <b>${L}</b>`, nounText: `letra ${L}` });
}

const CONTENT = {
    formas: [
        shapeItem('circulo',   'CÍRCULO',   'o', 'circle',    '#e64980'),
        shapeItem('quadrado',  'QUADRADO',  'o', 'square',    '#4dabf7'),
        shapeItem('triangulo', 'TRIÂNGULO', 'o', 'triangle',  '#38d9a9'),
        shapeItem('retangulo', 'RETÂNGULO', 'o', 'rectangle', '#ffa94d'),
        shapeItem('estrela',   'ESTRELA',   'a', 'star',      '#ffd43b'),
        shapeItem('coracao',   'CORAÇÃO',   'o', 'heart',     '#f06595'),
        shapeItem('losango',   'LOSANGO',   'o', 'diamond',   '#9775fa'),
    ],
    cores: [
        colorItem('vermelha', 'VERMELHA', '#e03131'),
        colorItem('azul',     'AZUL',     '#1c7ed6'),
        colorItem('amarela',  'AMARELA',  '#f2c81e'),
        colorItem('verde',    'VERDE',    '#2f9e44'),
        colorItem('laranja',  'LARANJA',  '#e8590c'),
        colorItem('roxa',     'ROXA',     '#9c36b5'),
        colorItem('rosa',     'ROSA',     '#f06595'),
        colorItem('marrom',   'MARROM',   '#8b5a2b'),
        colorItem('cinza',    'CINZA',    '#adb5bd'),
        colorItem('preta',    'PRETA',    '#343a40'),
    ],
    animais: [
        animalItem('cachorro', 'CACHORRO', 'o', '🐶'),
        animalItem('gato',     'GATO',     'o', '🐱'),
        animalItem('leao',     'LEÃO',     'o', '🦁'),
        animalItem('cavalo',   'CAVALO',   'o', '🐴'),
        animalItem('vaca',     'VACA',     'a', '🐮'),
        animalItem('porco',    'PORCO',    'o', '🐷'),
        animalItem('galinha',  'GALINHA',  'a', '🐔'),
        animalItem('pato',     'PATO',     'o', '🦆'),
        animalItem('sapo',     'SAPO',     'o', '🐸'),
        animalItem('macaco',   'MACACO',   'o', '🐵'),
        animalItem('elefante', 'ELEFANTE', 'o', '🐘'),
        animalItem('peixe',    'PEIXE',    'o', '🐟'),
        animalItem('coelho',   'COELHO',   'o', '🐰'),
        animalItem('urso',     'URSO',     'o', '🐻'),
        animalItem('tigre',    'TIGRE',    'o', '🐯'),
        animalItem('abelha',   'ABELHA',   'a', '🐝'),
        animalItem('borboleta','BORBOLETA','a', '🦋'),
        animalItem('cobra',    'COBRA',    'a', '🐍'),
    ],
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

const MODES = [
    { id: 'clicar',   label: 'Clicar',   emoji: '👆', sub: 'clique na resposta' },
    { id: 'arrastar', label: 'Arrastar', emoji: '✊', sub: 'arraste até o alvo' },
];

const COUNT_OPTIONS = [5, 10, 20, 30];

const AVATARS = ['🦄', '🌸', '🦋', '🌈', '🐱', '🐰', '🐼', '⭐', '🐬', '🍓', '🌷', '🐞'];

/* Tempos de experiência */
const SUSPENSE_MS = 1100;  // "aguardar a validação" após escolher
const ADVANCE_MS = 1300;   // depois do acerto, antes da próxima

/* -----------------------------------------------------------
   3) ESTADO
----------------------------------------------------------- */

const state = {
    category: 'formas',
    difficulty: 'facil',
    mode: 'clicar',
    totalQuestions: 10,
    answered: 0,
    correctFirstTry: 0,
    firstTry: true,
    correctItem: null,
    muted: false,
    profile: null,
};

let busy = false;        // trava durante o "suspense"/comemoração
let lastCorrectId = null;

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

/* -----------------------------------------------------------
   4) DOM
----------------------------------------------------------- */

const $ = (sel) => document.querySelector(sel);

const screens = {
    profiles: $('#screen-profiles'),
    menu: $('#screen-menu'),
    game: $('#screen-game'),
    results: $('#screen-results'),
};

const el = {
    // perfis
    profilesList: $('#profiles-list'),
    profileCreate: $('#profile-create'),
    newName: $('#new-name'),
    avatarPicker: $('#avatar-picker'),
    createConfirm: $('#create-confirm'),
    createCancel: $('#create-cancel'),
    // barra de perfil
    pbAvatar: $('#pb-avatar'),
    pbName: $('#pb-name'),
    pbStars: $('#pb-stars'),
    switchProfile: $('#switch-profile'),
    // menu
    categoryGrid: $('#category-grid'),
    difficultyGrid: $('#difficulty-grid'),
    countGrid: $('#count-grid'),
    modeGrid: $('#mode-grid'),
    customCount: $('#custom-count-input'),
    startBtn: $('#start-btn'),
    soundToggle: $('#sound-toggle'),
    // jogo
    qCurrent: $('#q-current'),
    qTotal: $('#q-total'),
    qScore: $('#q-score'),
    progressBar: $('#progress-bar'),
    promptText: $('#prompt-text'),
    repeatBtn: $('#repeat-btn'),
    dropZone: $('#drop-zone'),
    options: $('#options'),
    feedback: $('#feedback'),
    quitBtn: $('#quit-btn'),
    // resultado
    resultsEmoji: $('#results-emoji'),
    resultsTitle: $('#results-title'),
    resultsCorrect: $('#results-correct'),
    resultsAnswered: $('#results-answered'),
    resultsStars: $('#results-stars'),
    resultsName: $('#results-name'),
    resultsProfileStars: $('#results-profile-stars'),
    playAgainBtn: $('#play-again-btn'),
    menuBtn: $('#menu-btn'),
    // sons
    correctSound: $('#correct-sound'),
    wrongSound: $('#wrong-sound'),
};

/* -----------------------------------------------------------
   5) UTILITÁRIOS
----------------------------------------------------------- */

function randInt(max) { return Math.floor(Math.random() * max); }
function randomFrom(arr) { return arr[randInt(arr.length)]; }

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function sample(arr, n) { return shuffle(arr).slice(0, n); }

function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove('is-active'));
    screens[name].classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Monta a frase da pergunta conforme o modo de jogo.
function buildPrompt(item, mode) {
    if (mode === 'arrastar') {
        return { html: `Arraste ${item.gender} ${item.nounHTML}`, speak: `Arraste ${item.gender} ${item.nounText}` };
    }
    const prep = item.gender === 'o' ? 'no' : 'na';
    return { html: `Clique ${prep} ${item.nounHTML}`, speak: `Clique ${prep} ${item.nounText}` };
}

/* -----------------------------------------------------------
   6) NARRAÇÃO (só sob demanda) + SONS
----------------------------------------------------------- */

let ptVoice = null;
function loadVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    ptVoice = voices.find((v) => /pt[-_]BR/i.test(v.lang))
        || voices.find((v) => /^pt/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) {
    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
}

// "force" = narração pedida por um botão de acessibilidade (toca mesmo mudo).
function speak(text, force) {
    if (!force && state.muted) return;
    if (!('speechSynthesis' in window)) return;
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
        if (p && p.catch) p.catch(() => {});
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
   8) GERAÇÃO E RENDER DA PERGUNTA
----------------------------------------------------------- */

function poolForCategory(catId) {
    if (catId === 'numletras') {
        return Math.random() < 0.5 ? CONTENT.numletras.num : CONTENT.numletras.let;
    }
    return CONTENT[catId];
}

function optionCount() {
    const diff = DIFFICULTIES.find((d) => d.id === state.difficulty);
    return diff ? diff.options : 4;
}

function newQuestion() {
    const catId = state.category === 'misturar'
        ? randomFrom(['formas', 'cores', 'animais', 'numletras'])
        : state.category;

    const pool = poolForCategory(catId);
    const count = Math.min(optionCount(), pool.length);

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
    const dragMode = state.mode === 'arrastar';

    el.promptText.innerHTML = buildPrompt(correct, state.mode).html;

    // Zona de soltar só aparece no modo arrastar.
    el.dropZone.hidden = !dragMode;
    el.dropZone.classList.remove('is-over', 'is-filled');

    el.options.setAttribute('data-count', String(count));
    el.options.classList.toggle('is-drag', dragMode);
    el.options.classList.remove('is-busy');
    el.options.innerHTML = '';

    options.forEach((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option';
        btn.innerHTML = renderItemInner(item);
        btn.setAttribute('aria-label', item.name);
        if (dragMode) {
            btn.addEventListener('pointerdown', (e) => startDrag(e, btn, item));
        } else {
            btn.addEventListener('click', () => handleSelection(item, btn));
        }
        el.options.appendChild(btn);
    });

    el.feedback.textContent = '';
    el.feedback.className = 'feedback';

    busy = false;
    updateHud();
    // Sem narração automática: a criança lê. Fala só se clicar no 🔊.
}

/* -----------------------------------------------------------
   9) MODO ARRASTAR (pointer events: mouse + toque)
----------------------------------------------------------- */

let drag = null;

function startDrag(e, tile, item) {
    if (busy || tile.classList.contains('is-dimmed')) return;
    e.preventDefault();
    const rect = tile.getBoundingClientRect();
    const ghost = tile.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.classList.remove('is-dragging-src');
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    document.body.appendChild(ghost);
    tile.classList.add('is-dragging-src');

    drag = { ghost, item, tile, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
    window.addEventListener('pointercancel', onDragEnd);
}

function isOverDrop(x, y) {
    const r = el.dropZone.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function onDragMove(e) {
    if (!drag) return;
    drag.ghost.style.left = (e.clientX - drag.offsetX) + 'px';
    drag.ghost.style.top = (e.clientY - drag.offsetY) + 'px';
    el.dropZone.classList.toggle('is-over', isOverDrop(e.clientX, e.clientY));
}

function onDragEnd(e) {
    if (!drag) return;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    window.removeEventListener('pointercancel', onDragEnd);

    const d = drag;
    drag = null;
    d.ghost.remove();
    d.tile.classList.remove('is-dragging-src');
    el.dropZone.classList.remove('is-over');

    if (isOverDrop(e.clientX, e.clientY)) {
        handleSelection(d.item, d.tile);
    }
}

/* -----------------------------------------------------------
   10) VALIDAÇÃO (com delay de "suspense")
----------------------------------------------------------- */

const CHEERS = ['Muito bem! 🎉', 'Isso! 🌟', 'Você acertou! 👏', 'Boa! 🥳', 'Perfeito! ✨'];
const TRY_AGAIN = ['Quase! Tenta de novo. 💪', 'Ops! Procura de novo. 🙂', 'Não foi essa. Tenta outra! 👀'];

function handleSelection(item, sourceEl) {
    if (busy) return;
    busy = true;

    el.options.classList.add('is-busy');
    if (state.mode === 'arrastar') el.dropZone.classList.add('is-filled');
    sourceEl.classList.add('is-checking');
    el.feedback.textContent = '🤔 Vamos ver...';
    el.feedback.className = 'feedback is-checking';

    schedule(() => {
        sourceEl.classList.remove('is-checking');
        const isCorrect = item.id === state.correctItem.id;
        if (isCorrect) revealCorrect(sourceEl);
        else revealWrong(sourceEl);
    }, SUSPENSE_MS);
}

function revealCorrect(sourceEl) {
    sourceEl.classList.add('is-correct');
    el.feedback.textContent = randomFrom(CHEERS);
    el.feedback.className = 'feedback is-correct';
    playSound(el.correctSound);
    burstConfetti();

    el.options.querySelectorAll('.option').forEach((b) => { b.disabled = true; b.classList.add('is-locked'); });
    state.answered++;
    if (state.firstTry) state.correctFirstTry++;
    updateHud();

    schedule(nextStep, ADVANCE_MS); // busy volta a false em renderQuestion
}

function revealWrong(sourceEl) {
    state.firstTry = false;
    sourceEl.classList.add('is-wrong', 'is-dimmed');
    sourceEl.disabled = true;
    el.feedback.textContent = randomFrom(TRY_AGAIN);
    el.feedback.className = 'feedback is-wrong';
    playSound(el.wrongSound);
    el.dropZone.classList.remove('is-filled');
    el.options.classList.remove('is-busy');
    busy = false; // permite tentar de novo
}

function nextStep() {
    if (state.answered >= state.totalQuestions) showResults();
    else newQuestion();
}

function updateHud() {
    el.qCurrent.textContent = Math.min(state.answered + 1, state.totalQuestions);
    el.qTotal.textContent = state.totalQuestions;
    el.qScore.textContent = state.correctFirstTry;
    el.progressBar.style.width = ((state.answered / state.totalQuestions) * 100) + '%';
}

/* -----------------------------------------------------------
   11) RESULTADO
----------------------------------------------------------- */

function showResults() {
    cancelPending();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

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
    el.resultsStars.textContent = correct <= 12 ? ('⭐'.repeat(correct) || '—') : `⭐ x ${correct}`;

    // Acumula estrelas no perfil.
    if (state.profile) {
        state.profile.stars = (state.profile.stars || 0) + correct;
        state.profile.games = (state.profile.games || 0) + 1;
        saveProfiles(profiles);
        updateProfileBar();
        el.resultsName.textContent = state.profile.name;
        el.resultsProfileStars.textContent = state.profile.stars;
    }

    showScreen('results');
    if (pct >= 0.5) setTimeout(() => burstConfetti(true), 300);
}

/* -----------------------------------------------------------
   12) CONFETE (canvas, sem dependências)
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

const CONFETTI_COLORS = ['#e0559b', '#f783ac', '#b197fc', '#74c0fc', '#ffd43b', '#ff922b', '#63e6be'];

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
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
    });
    confettiPieces = confettiPieces.filter((p) => p.y < confettiCanvas.height + 30);
    if (confettiPieces.length > 0) {
        confettiRAF = requestAnimationFrame(drawConfetti);
    } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiRAF = null;
    }
}

/* -----------------------------------------------------------
   13) PERFIS (localStorage)
----------------------------------------------------------- */

const STORE_KEY = 'mousegame.profiles.v1';
const CUR_KEY = 'mousegame.current.v1';

function loadProfiles() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (_) { return []; }
}
function saveProfiles(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (_) {}
}
function getCurrentId() { try { return localStorage.getItem(CUR_KEY); } catch (_) { return null; } }
function setCurrentId(id) { try { localStorage.setItem(CUR_KEY, id); } catch (_) {} }

let profiles = loadProfiles();
let pendingAvatar = AVATARS[0];

function renderProfiles() {
    el.profileCreate.hidden = true;
    el.profilesList.innerHTML = '';

    profiles.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        // Nome vem de um campo de texto: monta via DOM (textContent), sem innerHTML.
        const del = document.createElement('button');
        del.className = 'pc-delete';
        del.title = 'Apagar';
        del.setAttribute('aria-label', `Apagar ${p.name}`);
        del.textContent = '🗑';
        del.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteProfile(p);
        });

        const avatar = document.createElement('span');
        avatar.className = 'pc-avatar';
        avatar.textContent = p.avatar;

        const name = document.createElement('div');
        name.className = 'pc-name';
        name.textContent = p.name;

        const stars = document.createElement('div');
        stars.className = 'pc-stars';
        stars.textContent = `⭐ ${p.stars || 0}`;

        card.append(del, avatar, name, stars);
        card.addEventListener('click', () => selectProfile(p));
        el.profilesList.appendChild(card);
    });

    const add = document.createElement('div');
    add.className = 'profile-card profile-card--add';
    add.innerHTML = `<span class="pc-plus">＋</span><span>Nova jogadora</span>`;
    add.addEventListener('click', openCreate);
    el.profilesList.appendChild(add);
}

function openCreate() {
    el.newName.value = '';
    pendingAvatar = AVATARS[0];
    renderAvatarPicker();
    el.profileCreate.hidden = false;
    el.profileCreate.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.newName.focus();
}

function renderAvatarPicker() {
    el.avatarPicker.innerHTML = '';
    AVATARS.forEach((a) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'avatar-opt' + (a === pendingAvatar ? ' is-selected' : '');
        b.textContent = a;
        b.addEventListener('click', () => {
            pendingAvatar = a;
            renderAvatarPicker();
        });
        el.avatarPicker.appendChild(b);
    });
}

function createProfile() {
    const name = (el.newName.value || '').trim() || 'Jogadora';
    const p = { id: 'p' + Date.now() + randInt(1000), name, avatar: pendingAvatar, stars: 0, games: 0 };
    profiles.push(p);
    saveProfiles(profiles);
    selectProfile(p);
}

function selectProfile(p) {
    state.profile = p;
    setCurrentId(p.id);
    updateProfileBar();
    showScreen('menu');
}

function deleteProfile(p) {
    if (!window.confirm(`Apagar a jogadora "${p.name}"? As estrelas dela serão perdidas.`)) return;
    profiles = profiles.filter((x) => x.id !== p.id);
    saveProfiles(profiles);
    if (state.profile && state.profile.id === p.id) {
        state.profile = null;
        setCurrentId('');
    }
    renderProfiles();
}

function updateProfileBar() {
    if (!state.profile) return;
    el.pbAvatar.textContent = state.profile.avatar;
    el.pbName.textContent = state.profile.name;
    el.pbStars.textContent = state.profile.stars || 0;
}

/* -----------------------------------------------------------
   14) MENU: construção e seleção
----------------------------------------------------------- */

function buildChoice(container, meta, onSelect, isSelected) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice' + (isSelected ? ' is-selected' : '');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(isSelected));
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
        onSelect(meta.value);
    });
    container.appendChild(btn);
}

function buildMenu() {
    CATEGORY_META.forEach((c, i) => buildChoice(
        el.categoryGrid,
        { value: c.id, label: c.label, emoji: c.emoji, sub: c.sub },
        (v) => { state.category = v; }, i === 0));

    DIFFICULTIES.forEach((d, i) => buildChoice(
        el.difficultyGrid,
        { value: d.id, label: d.label, emoji: d.emoji, sub: d.options + ' opções' },
        (v) => { state.difficulty = v; }, i === 0));

    COUNT_OPTIONS.forEach((n, i) => buildChoice(
        el.countGrid,
        { value: String(n), label: String(n), sub: 'perguntas' },
        (v) => { state.totalQuestions = parseInt(v, 10); el.customCount.value = ''; }, i === 1));

    MODES.forEach((m, i) => buildChoice(
        el.modeGrid,
        { value: m.id, label: m.label, emoji: m.emoji, sub: m.sub },
        (v) => { state.mode = v; }, i === 0));

    state.category = 'formas';
    state.difficulty = 'facil';
    state.mode = 'clicar';
    state.totalQuestions = 10;
}

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

// Botões de "ouvir" do menu (acessibilidade): falam mesmo se mudo.
document.querySelectorAll('.listen-btn').forEach((b) => {
    b.addEventListener('click', () => speak(b.dataset.say, true));
});

/* -----------------------------------------------------------
   15) CONTROLE DE FLUXO
----------------------------------------------------------- */

function startGame() {
    if (!state.totalQuestions || state.totalQuestions < 1) state.totalQuestions = 10;
    state.totalQuestions = Math.min(state.totalQuestions, 99);

    cancelPending();
    state.answered = 0;
    state.correctFirstTry = 0;
    lastCorrectId = null;
    busy = false;

    showScreen('game');
    updateHud();
    newQuestion();
}

function toggleSound() {
    state.muted = !state.muted;
    el.soundToggle.textContent = state.muted ? '🔈' : '🔊';
    el.soundToggle.classList.toggle('is-muted', state.muted);
    el.soundToggle.setAttribute('aria-pressed', String(state.muted));
    if (state.muted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

/* -----------------------------------------------------------
   16) EVENTOS
----------------------------------------------------------- */

el.startBtn.addEventListener('click', startGame);
el.quitBtn.addEventListener('click', showResults);
el.repeatBtn.addEventListener('click', () => {
    if (state.correctItem) speak(buildPrompt(state.correctItem, state.mode).speak, true);
});
el.soundToggle.addEventListener('click', toggleSound);
el.playAgainBtn.addEventListener('click', startGame);
el.menuBtn.addEventListener('click', () => showScreen('menu'));
el.switchProfile.addEventListener('click', () => { renderProfiles(); showScreen('profiles'); });

el.createConfirm.addEventListener('click', createProfile);
el.createCancel.addEventListener('click', () => { el.profileCreate.hidden = true; });
el.newName.addEventListener('keydown', (e) => { if (e.key === 'Enter') createProfile(); });

/* -----------------------------------------------------------
   17) INICIALIZAÇÃO
----------------------------------------------------------- */

buildMenu();

state.profile = profiles.find((p) => p.id === getCurrentId()) || null;
if (state.profile) {
    updateProfileBar();
    showScreen('menu');
} else {
    renderProfiles();
    showScreen('profiles');
}
