/* ============================================================
   Jogo dos Cliques
   Joguinho para crianças treinarem o uso do mouse (clicar e
   arrastar), associando objetos/nomes às respostas certas.

   Como adicionar conteúdo novo (é só editar os bancos abaixo):
   - Formas:  shapeItem(id, NOME, genero, forma, cor)
   - Cores:   colorItem(id, NOME, hex)
   - Animais: animalItem(id, NOME, genero, emoji)
   - Inglês:  EN_VOCAB (palavra + figura) e EN_PHRASES (frases)
   - Matemática: níveis em mathOperands()
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

/* ---------- Inglês básico ----------
   Cada grupo tem "prefix" (usado na frase: "Click on THE dog") e
   itens [inglês, português, figura]. A figura pode ser um emoji,
   uma cor ('#hex') ou um dígito ('3'). As opções erradas sempre vêm
   do mesmo grupo, para a pergunta nunca ficar ambígua. */

function enItem(group, en, pt, visual) {
    const base = { id: `en-${group}-${en.toLowerCase()}`, group, en, pt, name: en };
    if (visual.startsWith('#')) return { ...base, kind: 'color', hex: visual };
    if (/^\d+$/.test(visual))   return { ...base, kind: 'char', glyph: visual };
    return { ...base, kind: 'emoji', glyph: visual };
}

const EN_VOCAB = {
    animals: { prefix: 'the ', items: [
        ['Dog', 'Cachorro', '🐶'], ['Cat', 'Gato', '🐱'], ['Lion', 'Leão', '🦁'], ['Horse', 'Cavalo', '🐴'],
        ['Cow', 'Vaca', '🐮'], ['Pig', 'Porco', '🐷'], ['Duck', 'Pato', '🦆'], ['Frog', 'Sapo', '🐸'],
        ['Monkey', 'Macaco', '🐵'], ['Rabbit', 'Coelho', '🐰'], ['Bear', 'Urso', '🐻'], ['Fish', 'Peixe', '🐟'],
        ['Elephant', 'Elefante', '🐘'], ['Bee', 'Abelha', '🐝'],
    ] },
    fruits: { prefix: 'the ', items: [
        ['Apple', 'Maçã', '🍎'], ['Banana', 'Banana', '🍌'], ['Grapes', 'Uvas', '🍇'], ['Orange', 'Laranja', '🍊'],
        ['Strawberry', 'Morango', '🍓'], ['Watermelon', 'Melancia', '🍉'], ['Pineapple', 'Abacaxi', '🍍'],
        ['Cherry', 'Cereja', '🍒'], ['Pear', 'Pera', '🍐'], ['Lemon', 'Limão', '🍋'],
    ] },
    colors: { prefix: 'the color ', items: [
        ['Red', 'Vermelho', '#e03131'], ['Blue', 'Azul', '#1c7ed6'], ['Yellow', 'Amarelo', '#f2c81e'],
        ['Green', 'Verde', '#2f9e44'], ['Orange', 'Laranja', '#e8590c'], ['Purple', 'Roxo', '#9c36b5'],
        ['Pink', 'Rosa', '#f06595'], ['Brown', 'Marrom', '#8b5a2b'], ['Black', 'Preto', '#343a40'],
        ['Gray', 'Cinza', '#adb5bd'],
    ] },
    numbers: { prefix: 'the number ', items: [
        ['One', 'Um', '1'], ['Two', 'Dois', '2'], ['Three', 'Três', '3'], ['Four', 'Quatro', '4'],
        ['Five', 'Cinco', '5'], ['Six', 'Seis', '6'], ['Seven', 'Sete', '7'], ['Eight', 'Oito', '8'],
        ['Nine', 'Nove', '9'], ['Ten', 'Dez', '10'],
    ] },
    family: { prefix: 'the ', items: [
        ['Mother', 'Mãe', '👩'], ['Father', 'Pai', '👨'], ['Baby', 'Bebê', '👶'], ['Boy', 'Menino', '👦'],
        ['Girl', 'Menina', '👧'], ['Grandma', 'Vovó', '👵'], ['Grandpa', 'Vovô', '👴'],
    ] },
    things: { prefix: 'the ', items: [
        ['House', 'Casa', '🏠'], ['Car', 'Carro', '🚗'], ['Book', 'Livro', '📖'], ['Ball', 'Bola', '⚽'],
        ['Tree', 'Árvore', '🌳'], ['Flower', 'Flor', '🌸'], ['Sun', 'Sol', '☀️'], ['Moon', 'Lua', '🌙'],
        ['Star', 'Estrela', '⭐'], ['Cake', 'Bolo', '🎂'], ['Bread', 'Pão', '🍞'], ['Milk', 'Leite', '🥛'],
    ] },
};

const EN_GROUPS = {};
Object.keys(EN_VOCAB).forEach((g) => {
    EN_GROUPS[g] = {
        prefix: EN_VOCAB[g].prefix,
        items: EN_VOCAB[g].items.map(([en, pt, visual]) => enItem(g, en, pt, visual)),
    };
});

// Frases: só entram no jogo de tradução (não têm figura).
const EN_PHRASES = [
    ['Good morning', 'Bom dia'], ['Good afternoon', 'Boa tarde'], ['Good night', 'Boa noite'],
    ['Hello', 'Olá'], ['Goodbye', 'Tchau'], ['Thank you', 'Obrigado(a)'], ['Please', 'Por favor'],
    ['Sorry', 'Desculpa'], ['Yes', 'Sim'], ['No', 'Não'], ['Welcome', 'Bem-vindo(a)'],
    ['See you later', 'Até logo'], ['Happy birthday', 'Feliz aniversário'], ['I love you', 'Eu te amo'],
    ['How are you?', 'Como vai você?'],
].map(([en, pt], i) => ({ id: 'en-phrase-' + i, group: 'phrases', en, pt, name: en }));

/* ---------- Matemática ---------- */

const MATH_OPS = {
    somar:       { sym: '+', say: 'mais' },
    subtrair:    { sym: '−', say: 'menos' },
    multiplicar: { sym: '×', say: 'vezes' },
    dividir:     { sym: '÷', say: 'dividido por' },
};

/* ---------- Menu ---------- */

const CATEGORY_META = [
    { id: 'formas',     label: 'Formas',           emoji: '🔷', sub: 'círculo, estrela…' },
    { id: 'cores',      label: 'Cores',            emoji: '🎨', sub: 'vermelho, azul…' },
    { id: 'animais',    label: 'Animais',          emoji: '🐶', sub: 'cachorro, gato…' },
    { id: 'numletras',  label: 'Números e Letras', emoji: '🔢', sub: '1, 2, A, B…' },
    { id: 'ingles',     label: 'Inglês',           emoji: '💬', sub: 'dog, good morning…' },
    { id: 'matematica', label: 'Matemática',       emoji: '🧮', sub: '+  −  ×  ÷' },
    { id: 'mouse',      label: 'Treino do mouse',  emoji: '🖱️', sub: 'balões, alvos, rolar…' },
    { id: 'misturar',   label: 'Misturar Tudo',    emoji: '🎲', sub: 'formas, cores, animais…' },
];

// Escolha extra que aparece só para algumas categorias.
const SUB_OPTIONS = {
    ingles: {
        title: 'Que tipo de inglês?',
        say: 'Escolha o tipo de pergunta em inglês',
        items: [
            { id: 'figuras',  label: 'Figuras',   emoji: '🖼️', sub: 'ache a figura' },
            { id: 'traducao', label: 'Tradução',  emoji: '🔁', sub: 'inglês e português' },
            { id: 'misturar', label: 'Misturar',  emoji: '🎲', sub: 'um pouco de cada' },
        ],
    },
    matematica: {
        title: 'Qual operação?',
        say: 'Escolha a operação de matemática',
        items: [
            { id: 'somar',       label: 'Somar',       emoji: '➕', sub: 'mais' },
            { id: 'subtrair',    label: 'Subtrair',    emoji: '➖', sub: 'menos' },
            { id: 'multiplicar', label: 'Multiplicar', emoji: '✖️', sub: 'vezes' },
            { id: 'dividir',     label: 'Dividir',     emoji: '➗', sub: 'dividido' },
            { id: 'misturar',    label: 'Misturar',    emoji: '🎲', sub: 'todas' },
        ],
    },
    // Os ids são as chaves de MINIGAMES (minigames.js)
    mouse: {
        title: 'Qual treino?',
        say: 'Escolha o treino do mouse',
        items: [
            { id: 'baloes',   label: 'Balões',   emoji: '🎈', sub: '2 cliques' },
            { id: 'alvos',    label: 'Alvos',    emoji: '🎯', sub: 'que se mexem' },
            { id: 'rolar',    label: 'Rolar',    emoji: '📜', sub: 'a rodinha' },
            { id: 'caminho',  label: 'Caminho',  emoji: '🐭', sub: 'arrastar' },
            { id: 'misturar', label: 'Misturar', emoji: '🎲', sub: 'todos' },
        ],
    },
};

const DIFFICULTIES = [
    { id: 'facil',   label: 'Fácil',   emoji: '🙂', options: 3 },
    { id: 'medio',   label: 'Médio',   emoji: '😃', options: 4 },
    { id: 'dificil', label: 'Difícil', emoji: '🤓', options: 6 },
];

const MODES = [
    { id: 'clicar',   label: 'Clicar',   emoji: '👆', sub: 'clique na resposta' },
    { id: 'arrastar', label: 'Arrastar', emoji: '✊', sub: 'arraste até o alvo' },
];

// O modo arrastar só existe para estes jogos (nos outros, só clicar).
const DRAG_CATEGORIES = ['formas', 'cores', 'animais'];

// Quantas perguntas (jogos de quiz) ou rodadas (treino do mouse — cada rodada é mais longa).
const COUNTS = { quiz: [5, 10, 20, 30], mouse: [3, 5, 8, 10] };
const COUNT_DEFAULT_INDEX = 1;

// Texto do nível no treino do mouse (nos outros jogos o nível muda o nº de opções).
const DIFF_SUB_MOUSE = ['grande e devagar', 'tamanho normal', 'pequeno e rápido'];

const AVATARS = ['🦄', '🌸', '🦋', '🌈', '🐱', '🐰', '🐼', '⭐', '🐬', '🍓', '🌷', '🐞'];

/* Tempos de experiência */
const SUSPENSE_MS = 1100;   // "aguardar a validação" após escolher
const ADVANCE_MS = 1300;    // depois do acerto, antes da próxima
const WRONG_SHOW_MS = 800;  // (arrastar) peça errada fica no alvo antes de voltar

/* -----------------------------------------------------------
   3) ESTADO
----------------------------------------------------------- */

const state = {
    category: 'formas',
    sub: { ingles: 'misturar', matematica: 'somar', mouse: 'misturar' },
    difficulty: 'facil',
    mode: 'clicar',
    totalQuestions: 10,
    answered: 0,
    correctFirstTry: 0,
    firstTry: true,
    question: null,       // pergunta atual (ver "8) PERGUNTAS")
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
    panelSub: $('#panel-sub'),
    subTitle: $('#sub-title'),
    subListen: $('#sub-listen'),
    subGrid: $('#sub-grid'),
    difficultyGrid: $('#difficulty-grid'),
    countTitle: $('#count-title'),
    countListen: $('#count-listen'),
    countGrid: $('#count-grid'),
    panelMode: $('#panel-mode'),
    modeGrid: $('#mode-grid'),
    customCount: $('#custom-count-input'),
    startBtn: $('#start-btn'),
    // jogo
    hudLabel: $('#hud-label'),
    playfield: $('#playfield'),
    installBtn: $('#install-btn'),
    qCurrent: $('#q-current'),
    qTotal: $('#q-total'),
    qScore: $('#q-score'),
    progressBar: $('#progress-bar'),
    promptText: $('#prompt-text'),
    repeatBtn: $('#repeat-btn'),
    dropZone: $('#drop-zone'),
    optionsArea: $('#options-area'),
    options: $('#options'),
    feedback: $('#feedback'),
    quitBtn: $('#quit-btn'),
    // resultado
    resultsEmoji: $('#results-emoji'),
    resultsTitle: $('#results-title'),
    resultsScore: $('#results-score'),
    resultsStars: $('#results-stars'),
    resultsName: $('#results-name'),
    resultsProfileStars: $('#results-profile-stars'),
    resultsListen: $('#results-listen'),
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

// Largura da barra de rolagem (0 em telas de toque): usada para alinhar o botão "Começar!" à direita.
function updateScrollbarWidth() {
    const w = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--sbw', Math.max(0, w) + 'px');
}
window.addEventListener('resize', updateScrollbarWidth);

function showScreen(name) {
    stopSpeech();
    if (name !== 'game') stopRound();   // fora do jogo, nenhum minijogo fica rodando
    Object.values(screens).forEach((s) => s.classList.remove('is-active'));
    screens[name].classList.add('is-active');
    document.body.classList.toggle('is-playing', name === 'game');   // tela do jogo cabe na janela (sem rolar)
    updateScrollbarWidth();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Frase (formas, cores, animais, números e letras) conforme o modo de jogo.
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

// "parts" = texto (pt-BR) ou lista [{ text, lang }] para misturar idiomas.
function speak(parts) {
    if (!('speechSynthesis' in window)) return;
    const list = typeof parts === 'string' ? [{ text: parts, lang: 'pt-BR' }] : parts;
    try {
        window.speechSynthesis.cancel();
        list.forEach((seg) => {
            const u = new SpeechSynthesisUtterance(speakable(seg.text, seg.lang));
            u.lang = seg.lang;
            u.rate = seg.lang === 'en-US' ? 0.85 : 0.95;
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
        case 'emoji': return `<span class="glyph">${item.glyph}</span>`;
        case 'char': {
            // números com mais dígitos usam letra menor para caberem na peça
            const n = item.glyph.length;
            return `<span class="glyph" style="--k:${n >= 3 ? 0.36 : n === 2 ? 0.44 : 0.5}">${item.glyph}</span>`;
        }
        case 'text':  return `<span class="label-text">${item.label}</span>`;
        default:      return '';
    }
}

/* -----------------------------------------------------------
   8) PERGUNTAS
   Toda pergunta tem o mesmo formato, seja qual for o jogo:
     { key, correct, options, big?, prompt(mode) -> { html, speak } }
   "speak" é um texto (pt-BR) ou uma lista [{ text, lang }].
----------------------------------------------------------- */

function optionCount() {
    const diff = DIFFICULTIES.find((d) => d.id === state.difficulty);
    return diff ? diff.options : 4;
}

/* ---------- formas, cores, animais, números e letras ---------- */

function poolForCategory(catId) {
    if (catId === 'numletras') {
        return Math.random() < 0.5 ? CONTENT.numletras.num : CONTENT.numletras.let;
    }
    return CONTENT[catId];
}

function classicQuestion(catId, count) {
    const pool = poolForCategory(catId);
    const n = Math.min(count, pool.length);
    const correct = randomFrom(pool);
    const options = shuffle([correct, ...sample(pool.filter((it) => it.id !== correct.id), n - 1)]);
    return { key: correct.id, correct, options, prompt: (mode) => buildPrompt(correct, mode) };
}

/* ---------- inglês ---------- */

// Fala em inglês: "Click on the dog" -> figuras.
function englishFigures(count) {
    const { prefix, items } = EN_GROUPS[randomFrom(Object.keys(EN_GROUPS))];
    const n = Math.min(count, items.length);
    const correct = randomFrom(items);
    const options = shuffle([correct, ...sample(items.filter((it) => it.id !== correct.id), n - 1)]);
    return {
        key: 'fig:' + correct.id, correct, options,
        prompt: () => ({
            html: `Click on ${prefix}<b>${correct.en}</b>`,
            speak: [{ text: `Click on ${prefix}${correct.en}`, lang: 'en-US' }],
        }),
    };
}

// "O que significa Good morning?" / "Como se diz Bom dia em inglês?" -> textos.
function englishTranslation(count) {
    const groupKey = Math.random() < 0.4 ? 'phrases' : randomFrom(Object.keys(EN_GROUPS));
    const items = groupKey === 'phrases' ? EN_PHRASES : EN_GROUPS[groupKey].items;
    const toPt = Math.random() < 0.5;   // true: inglês -> português
    const n = Math.min(count, items.length);

    const asOption = (it) => {
        const label = toPt ? it.pt : it.en;
        return { id: `tr-${it.id}-${toPt ? 'pt' : 'en'}`, name: label, kind: 'text', label };
    };
    const source = randomFrom(items);
    const correct = asOption(source);
    const options = shuffle([correct, ...sample(items.filter((it) => it.id !== source.id), n - 1).map(asOption)]);

    return {
        key: `tr:${source.id}:${toPt ? 'pt' : 'en'}`, correct, options,
        prompt: () => (toPt
            ? { html: `O que significa <b>${source.en}</b>?`,
                speak: [{ text: 'O que significa', lang: 'pt-BR' }, { text: source.en, lang: 'en-US' }] }
            : { html: `Como se diz <b>${source.pt}</b> em inglês?`,
                speak: `Como se diz ${source.pt} em inglês?` }),
    };
}

function englishQuestion(count) {
    const type = state.sub.ingles === 'misturar' ? randomFrom(['figuras', 'traducao']) : state.sub.ingles;
    return type === 'figuras' ? englishFigures(count) : englishTranslation(count);
}

/* ---------- matemática ---------- */

// Números de cada operação por nível (fácil / médio / difícil).
function mathOperands(op, difficulty) {
    const lvl = { facil: 0, medio: 1, dificil: 2 }[difficulty] || 0;
    switch (op) {
        case 'somar': {
            const [min, max] = [[1, 5], [5, 15], [15, 60]][lvl];
            const a = randRange(min, max), b = randRange(min, max);
            return { a, b, answer: a + b };
        }
        case 'subtrair': {
            const [min, max] = [[3, 10], [10, 30], [30, 99]][lvl];
            const a = randRange(min, max), b = randRange(1, a - 1);
            return { a, b, answer: a - b };
        }
        case 'multiplicar': {
            const [[aMin, aMax], [bMin, bMax]] = [[[1, 5], [1, 3]], [[2, 10], [2, 10]], [[6, 12], [6, 12]]][lvl];
            const a = randRange(aMin, aMax), b = randRange(bMin, bMax);
            return { a, b, answer: a * b };
        }
        default: { // dividir: sempre divisão exata
            const [[bMin, bMax], [qMin, qMax]] = [[[2, 3], [1, 5]], [[2, 5], [2, 10]], [[2, 10], [2, 12]]][lvl];
            const b = randRange(bMin, bMax), q = randRange(qMin, qMax);
            return { a: b * q, b, answer: q };
        }
    }
}

function numberOption(v) {
    return { id: 'ans-' + v, name: String(v), kind: 'char', glyph: String(v) };
}

// Conta "armada": um número em cima do outro, sinal à esquerda, linha embaixo.
// Cada dígito fica numa caixinha de largura fixa para as casas (unidade,
// dezena...) ficarem alinhadas, seja qual for a fonte.
function mathStackHTML(a, sym, b) {
    const digits = (n) => String(n).split('').map((d) => `<span class="d">${d}</span>`).join('');
    return `<span class="math-stack" role="img" aria-label="${a} ${sym} ${b}">`
        + `<span class="mrow mrow--top"><span class="num">${digits(a)}</span></span>`
        + `<span class="mrow"><span class="op">${sym}</span><span class="num">${digits(b)}</span></span>`
        + `<span class="mline"></span>`
        + `<span class="mrow mrow--answer"><span class="num"><span class="d">?</span></span></span>`
        + `</span>`;
}

function mathQuestion(count) {
    const opKey = state.sub.matematica === 'misturar' ? randomFrom(Object.keys(MATH_OPS)) : state.sub.matematica;
    const op = MATH_OPS[opKey];
    const { a, b, answer } = mathOperands(opKey, state.difficulty);

    // Respostas erradas: números "perto" da certa (primeiro os mais próximos).
    const near = [], far = [];
    [1, 2, 3, 4, 5, 6].forEach((d) => near.push(answer + d, answer - d));
    [10].forEach((d) => far.push(answer + d, answer - d));
    const distractors = [...shuffle(near), ...shuffle(far)].filter((v) => v >= 0);

    const values = [answer];
    for (const v of distractors) {
        if (values.length >= count) break;
        if (!values.includes(v)) values.push(v);
    }

    const correct = numberOption(answer);
    const options = shuffle(values.map(numberOption));
    return {
        key: `${a}${op.sym}${b}`, correct, options, big: true,
        prompt: () => ({
            html: mathStackHTML(a, op.sym, b),
            speak: `Quanto é ${a} ${op.say} ${b}?`,
        }),
    };
}

/* ---------- escolhe o jogo ---------- */

function buildQuestion(count) {
    const cat = state.category === 'misturar'
        ? randomFrom(['formas', 'cores', 'animais', 'numletras'])
        : state.category;
    if (cat === 'ingles') return englishQuestion(count);
    if (cat === 'matematica') return mathQuestion(count);
    return classicQuestion(cat, count);
}

function newQuestion() {
    if (state.category === 'mouse') { newRound(); return; }
    const count = optionCount();
    let q = buildQuestion(count);
    for (let tries = 0; tries < 8 && q.key === lastKey; tries++) q = buildQuestion(count);
    lastKey = q.key;

    state.question = q;
    state.firstTry = true;
    renderQuestion(q);
}

function renderQuestion(q) {
    const dragMode = state.mode === 'arrastar';

    stopSpeech();
    stopRound();
    el.playfield.hidden = true;     // (o campo dos minijogos só aparece no treino do mouse)
    el.options.hidden = false;
    el.promptText.innerHTML = q.prompt(state.mode).html;
    el.promptText.classList.toggle('is-big', !!q.big);

    // Zona de soltar só aparece no modo arrastar.
    el.dropZone.hidden = !dragMode;
    el.dropZone.classList.remove('is-over');
    clearDropPiece();

    el.options.classList.toggle('is-drag', dragMode);
    el.options.classList.remove('is-busy');
    el.options.innerHTML = '';

    q.options.forEach((item) => {
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
    layoutOptions();
    // Sem narração automática: a criança lê. Fala só se clicar no 🔊.
}

/* Tamanho das opções: cabem SEMPRE no espaço disponível (largura e altura da
   janela). Testa quantas colunas usar (1, 2, 3...) e fica com o arranjo que dá
   as peças maiores; as linhas quebram sozinhas e ficam centralizadas. */
const OPTION_MAX = 240;   // lado máximo da peça (px)

function layoutOptions() {
    const n = el.options.children.length;
    const W = el.optionsArea.clientWidth;
    const H = el.optionsArea.clientHeight;
    if (!n || !W || !H) return;   // tela do jogo não está visível

    const gap = W < 520 || H < 420 ? 10 : 16;
    let best = { s: 0, cols: 1 };
    for (let cols = 1; cols <= n; cols++) {
        const rows = Math.ceil(n / cols);
        const s = Math.min((W - (cols - 1) * gap) / cols, (H - (rows - 1) * gap) / rows, OPTION_MAX);
        if (s > best.s + 0.5) best = { s, cols };   // empate: fica com menos colunas (linhas mais equilibradas)
    }

    const s = Math.max(48, Math.floor(best.s));
    el.options.style.setProperty('--s', s + 'px');
    el.options.style.setProperty('--gap', gap + 'px');
    el.options.style.maxWidth = (best.cols * s + (best.cols - 1) * gap) + 'px';
}

// Recalcula quando a janela muda de tamanho (girar o tablet, redimensionar, zoom...).
// Se um minijogo está rodando, a rodada recomeça no tamanho novo (com um pequeno atraso).
let resizeTimer = 0;
function onAreaResize() {
    layoutOptions();
    if (!round) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const w = el.playfield.clientWidth, h = el.playfield.clientHeight;
        if (round && !busy && (Math.abs(w - round.w) > 2 || Math.abs(h - round.h) > 2)) startRound();
    }, 250);
}
if ('ResizeObserver' in window) new ResizeObserver(onAreaResize).observe(el.optionsArea);
else window.addEventListener('resize', onAreaResize);

/* -----------------------------------------------------------
   8b) TREINO DO MOUSE (minijogos — ver minigames.js)
   Cada "pergunta" é uma rodada de um minijogo. Estrela = rodada
   concluída sem nenhum erro.
----------------------------------------------------------- */

function stopRound() {
    if (round) { try { round.game.destroy(); } catch (_) {} round = null; }
}

// (Re)inicia a rodada atual no tamanho atual do campo. O tamanho é guardado ANTES de
// desenhar: se algo mexer no campo durante o desenho, a checagem de redimensionamento
// percebe a diferença e redesenha.
function startRound() {
    round.w = el.playfield.clientWidth;
    round.h = el.playfield.clientHeight;
    round.game.start();
}

function newRound() {
    stopRound();
    stopSpeech();
    el.options.hidden = true;
    el.options.innerHTML = '';
    el.dropZone.hidden = true;
    clearDropPiece();
    el.playfield.hidden = false;
    el.playfield.innerHTML = '';

    // "misturar" alterna entre os minijogos (sem repetir o anterior)
    const keys = Object.keys(MINIGAMES);
    const chosen = state.sub.mouse;
    const key = chosen === 'misturar' ? randomFrom(keys.filter((k) => k !== lastKey)) : chosen;
    lastKey = key;

    const api = {
        field: el.playfield,
        level: Math.max(0, DIFFICULTIES.findIndex((d) => d.id === state.difficulty)),
        size: () => ({ w: el.playfield.clientWidth, h: el.playfield.clientHeight }),
        hint: (text) => { el.feedback.textContent = text; el.feedback.className = 'feedback is-checking'; },
        mistake: (text) => {
            state.firstTry = false;
            playSound(el.wrongSound);
            el.feedback.textContent = text;
            el.feedback.className = 'feedback is-wrong';
        },
        done: () => completeRound(),
    };
    const game = MINIGAMES[key].create(api);
    round = { game, key, w: 0, h: 0 };
    state.question = { key, prompt: () => game.prompt };

    el.promptText.innerHTML = game.prompt.html;
    el.promptText.classList.remove('is-big');
    el.feedback.textContent = '';
    el.feedback.className = 'feedback';
    state.firstTry = true;
    busy = false;
    updateHud();
    startRound();
}

function completeRound() {
    if (busy) return;
    busy = true;
    el.feedback.textContent = randomFrom(CHEERS);
    el.feedback.className = 'feedback is-correct';
    playSound(el.correctSound);
    burstConfetti();
    state.answered++;
    if (state.firstTry) state.correctFirstTry++;
    updateHud();
    schedule(nextStep, ADVANCE_MS + 500);
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

    if (e.type !== 'pointercancel' && isOverDrop(e.clientX, e.clientY)) {
        handleSelection(d.item, d.tile, placePieceInZone(d.tile));
    }
}

// A peça fica DENTRO do alvo enquanto o jogo "confere" a resposta.
// O lugar de origem fica esmaecido, como se a peça tivesse saído dele.
function placePieceInZone(tile) {
    clearDropPiece();
    const piece = document.createElement('div');
    piece.className = 'option drop-piece';
    piece.innerHTML = tile.innerHTML;
    el.dropZone.appendChild(piece);
    el.dropZone.classList.add('is-filled');
    tile.classList.add('is-ghosted');
    return piece;
}

function clearDropPiece() {
    el.dropZone.querySelectorAll('.drop-piece').forEach((p) => p.remove());
    el.dropZone.classList.remove('is-filled');
}

/* -----------------------------------------------------------
   10) VALIDAÇÃO (com delay de "suspense")
----------------------------------------------------------- */

const CHEERS = ['Muito bem! 🎉', 'Isso! 🌟', 'Você acertou! 👏', 'Boa! 🥳', 'Perfeito! ✨'];
const TRY_AGAIN = ['Quase! Tenta de novo. 💪', 'Ops! Procura de novo. 🙂', 'Não foi essa. Tenta outra! 👀'];

// sourceEl = a opção escolhida; pieceEl = quem mostra o resultado
// (no modo clicar é a própria opção; no arrastar, a peça dentro do alvo).
function handleSelection(item, sourceEl, pieceEl) {
    if (busy) return;
    busy = true;
    const piece = pieceEl || sourceEl;

    el.options.classList.add('is-busy');
    piece.classList.add('is-checking');
    el.feedback.textContent = '🤔 Vamos ver...';
    el.feedback.className = 'feedback is-checking';

    schedule(() => {
        piece.classList.remove('is-checking');
        if (item.id === state.question.correct.id) revealCorrect(piece);
        else revealWrong(sourceEl, piece);
    }, SUSPENSE_MS);
}

function revealCorrect(piece) {
    piece.classList.add('is-correct');
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

function revealWrong(sourceEl, piece) {
    state.firstTry = false;
    el.feedback.textContent = randomFrom(TRY_AGAIN);
    el.feedback.className = 'feedback is-wrong';
    playSound(el.wrongSound);

    const release = () => {
        sourceEl.classList.remove('is-ghosted');
        sourceEl.classList.add('is-wrong', 'is-dimmed');
        sourceEl.disabled = true;
        clearDropPiece();
        el.options.classList.remove('is-busy');
        busy = false; // permite tentar de novo
    };

    if (piece === sourceEl) {
        release();
    } else {
        // Arrastar: a peça errada balança no alvo e só então "volta" ao lugar.
        piece.classList.add('is-wrong');
        schedule(release, WRONG_SHOW_MS);
    }
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
    stopSpeech();

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
    // Treino do mouse fala em "rodadas sem errar"; os outros jogos em "acertou de primeira".
    const mouse = state.category === 'mouse';
    el.resultsScore.innerHTML = mouse
        ? `Você fez <b>${correct}</b> de <b>${answered}</b> rodadas sem errar!`
        : `Você acertou de primeira <b>${correct}</b> de <b>${answered}</b>!`;
    el.resultsStars.textContent = correct <= 12 ? ('⭐'.repeat(correct) || '—') : `⭐ x ${correct}`;

    // Texto do botão "ouvir resultado" (para quem ainda não lê).
    let speech = `${title} ` + (mouse
        ? `Você fez ${correct} de ${answered} rodadas sem errar. `
        : `Você acertou de primeira ${correct} de ${answered}. `);

    // Acumula estrelas no perfil.
    if (state.profile) {
        state.profile.stars = (state.profile.stars || 0) + correct;
        state.profile.games = (state.profile.games || 0) + 1;
        saveProfiles(profiles);
        updateProfileBar();
        el.resultsName.textContent = state.profile.name;
        el.resultsProfileStars.textContent = state.profile.stars;

        const total = state.profile.stars;
        speech = `${state.profile.name}! ` + speech
            + `Agora você tem ${total} ${total === 1 ? 'estrela' : 'estrelas'} no total. `;
    }
    state.resultSpeech = speech + phrase;

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

// "Como jogar?" só aparece onde o arrastar existe; nos outros jogos volta para "clicar".
function refreshModePanel() {
    const canDrag = DRAG_CATEGORIES.includes(state.category);
    el.panelMode.hidden = !canDrag;
    if (!canDrag && state.mode !== 'clicar') {
        state.mode = 'clicar';
        el.modeGrid.querySelectorAll('.choice').forEach((c, i) => {   // MODES[0] = clicar
            c.classList.toggle('is-selected', i === 0);
            c.setAttribute('aria-checked', String(i === 0));
        });
    }
}

// Mostra a escolha extra (tipo de inglês / operação) só quando faz sentido.
function refreshSubPanel() {
    const cfg = SUB_OPTIONS[state.category];
    el.panelSub.hidden = !cfg;
    if (!cfg) return;

    el.subTitle.textContent = cfg.title;
    el.subListen.dataset.say = cfg.say;
    el.subListen.setAttribute('aria-label', 'Ouvir: ' + cfg.title);
    el.subGrid.innerHTML = '';
    el.subGrid.className = 'choice-grid' + (cfg.items.length === 3 ? ' choice-grid--3' : '');
    cfg.items.forEach((it) => buildChoice(
        el.subGrid,
        { value: it.id, label: it.label, emoji: it.emoji, sub: it.sub },
        (v) => { state.sub[state.category] = v; },
        it.id === state.sub[state.category]));
}

// Treino do mouse conta "rodadas" (não "perguntas") e o nível muda tamanho/velocidade.
// Só refaz os textos/botões quando o tipo de jogo muda (quiz <-> treino do mouse).
let menuKind = null;
function refreshKindPanels() {
    const kind = state.category === 'mouse' ? 'mouse' : 'quiz';
    if (kind === menuKind) return;
    menuKind = kind;
    const mouse = kind === 'mouse';

    // nível: legenda de cada botão
    el.difficultyGrid.querySelectorAll('.choice-sub').forEach((s, i) => {
        s.textContent = mouse ? DIFF_SUB_MOUSE[i] : DIFFICULTIES[i].options + ' opções';
    });

    // quantidade
    const list = COUNTS[kind];
    el.countTitle.textContent = mouse ? '3. Quantas rodadas?' : '3. Quantas perguntas?';
    el.countListen.dataset.say = mouse ? 'Quantas rodadas você quer jogar?' : 'Quantas perguntas você quer responder?';
    el.countGrid.innerHTML = '';
    el.customCount.value = '';
    list.forEach((n, i) => buildChoice(
        el.countGrid,
        { value: String(n), label: String(n), sub: mouse ? 'rodadas' : 'perguntas' },
        (v) => { state.totalQuestions = parseInt(v, 10); el.customCount.value = ''; }, i === COUNT_DEFAULT_INDEX));
    state.totalQuestions = list[COUNT_DEFAULT_INDEX];
}

function refreshMenuForCategory() {
    refreshSubPanel();
    refreshModePanel();
    refreshKindPanels();
}

function buildMenu() {
    CATEGORY_META.forEach((c, i) => buildChoice(
        el.categoryGrid,
        { value: c.id, label: c.label, emoji: c.emoji, sub: c.sub },
        (v) => { state.category = v; refreshMenuForCategory(); }, i === 0));

    DIFFICULTIES.forEach((d, i) => buildChoice(
        el.difficultyGrid,
        { value: d.id, label: d.label, emoji: d.emoji, sub: d.options + ' opções' },
        (v) => { state.difficulty = v; }, i === 0));

    MODES.forEach((m, i) => buildChoice(
        el.modeGrid,
        { value: m.id, label: m.label, emoji: m.emoji, sub: m.sub },
        (v) => { state.mode = v; }, i === 0));

    state.category = 'formas';
    state.difficulty = 'facil';
    state.mode = 'clicar';
    refreshMenuForCategory();
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

// Botões de "ouvir" do menu (acessibilidade).
document.querySelectorAll('.listen-btn').forEach((b) => {
    b.addEventListener('click', () => speak(b.dataset.say));
});

/* -----------------------------------------------------------
   15) CONTROLE DE FLUXO
----------------------------------------------------------- */

function startGame() {
    if (!state.totalQuestions || state.totalQuestions < 1) state.totalQuestions = 10;
    state.totalQuestions = Math.min(state.totalQuestions, 99);

    if (!DRAG_CATEGORIES.includes(state.category)) state.mode = 'clicar';

    cancelPending();
    stopRound();
    state.answered = 0;
    state.correctFirstTry = 0;
    lastKey = null;
    busy = false;
    el.hudLabel.textContent = state.category === 'mouse' ? 'Rodada' : 'Pergunta';
    // no treino do mouse a dica pode ter 2 linhas: reserva a altura para o campo não "pular"
    document.body.classList.toggle('is-mouse', state.category === 'mouse');

    showScreen('game');
    updateHud();
    newQuestion();
}

/* -----------------------------------------------------------
   16) EVENTOS
----------------------------------------------------------- */

el.startBtn.addEventListener('click', startGame);
el.quitBtn.addEventListener('click', showResults);
el.repeatBtn.addEventListener('click', () => {
    if (state.question) speak(state.question.prompt(state.mode).speak);
});
el.resultsListen.addEventListener('click', () => speak(state.resultSpeech));
el.playAgainBtn.addEventListener('click', startGame);
el.menuBtn.addEventListener('click', () => showScreen('menu'));
el.switchProfile.addEventListener('click', () => { renderProfiles(); showScreen('profiles'); });

el.createConfirm.addEventListener('click', createProfile);
el.createCancel.addEventListener('click', () => { el.profileCreate.hidden = true; });
el.newName.addEventListener('keydown', (e) => { if (e.key === 'Enter') createProfile(); });

/* -----------------------------------------------------------
   16b) APP INSTALÁVEL (PWA)
   Service worker (sw.js) guarda o jogo no aparelho: depois da primeira
   visita ele abre mesmo sem internet. O botão "Instalar app" aparece
   sozinho quando o navegador permite instalar.
----------------------------------------------------------- */

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
