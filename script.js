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

// Objetos para contar (F2-08 "Contar com emojis") — pensado para quem ainda não lê.
// "gender": 'o' ou 'a', para "Quantos morangos" vs "Quantas estrelas".
const COUNTABLES = [
    { id: 'morango',   glyph: '🍓', plural: 'morangos',   gender: 'o' },
    { id: 'estrela',   glyph: '⭐', plural: 'estrelas',   gender: 'a' },
    { id: 'bola',      glyph: '⚽', plural: 'bolas',      gender: 'a' },
    { id: 'coracao',   glyph: '💗', plural: 'corações',   gender: 'o' },
    { id: 'borboleta', glyph: '🦋', plural: 'borboletas', gender: 'a' },
    { id: 'abelha',    glyph: '🐝', plural: 'abelhas',    gender: 'a' },
    { id: 'flor',      glyph: '🌸', plural: 'flores',     gender: 'a' },
    { id: 'balao',     glyph: '🎈', plural: 'balões',     gender: 'o' },
];

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
        ['Star', 'Estrela', '⭐'],
    ] },
    foods: { prefix: 'the ', items: [
        ['Bread', 'Pão', '🍞'], ['Milk', 'Leite', '🥛'], ['Cake', 'Bolo', '🎂'], ['Pizza', 'Pizza', '🍕'],
        ['Rice', 'Arroz', '🍚'], ['Egg', 'Ovo', '🥚'], ['Cheese', 'Queijo', '🧀'], ['Juice', 'Suco', '🧃'],
        ['Ice cream', 'Sorvete', '🍦'], ['Popcorn', 'Pipoca', '🍿'],
    ] },
    body: { prefix: 'the ', items: [
        ['Hand', 'Mão', '✋'], ['Foot', 'Pé', '🦶'], ['Eye', 'Olho', '👁️'], ['Ear', 'Orelha', '👂'],
        ['Nose', 'Nariz', '👃'], ['Mouth', 'Boca', '👄'], ['Arm', 'Braço', '💪'], ['Leg', 'Perna', '🦵'],
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

// Dias da semana: só entram na tradução (não têm uma figura que faça sentido mostrar).
const EN_DAYS = [
    ['Monday', 'Segunda-feira'], ['Tuesday', 'Terça-feira'], ['Wednesday', 'Quarta-feira'],
    ['Thursday', 'Quinta-feira'], ['Friday', 'Sexta-feira'], ['Saturday', 'Sábado'], ['Sunday', 'Domingo'],
].map(([en, pt], i) => ({ id: 'en-day-' + i, group: 'days', en, pt, name: en }));

/* ---------- Matemática ---------- */

const MATH_OPS = {
    somar:       { sym: '+', say: 'mais' },
    subtrair:    { sym: '−', say: 'menos' },
    multiplicar: { sym: '×', say: 'vezes' },
    dividir:     { sym: '÷', say: 'dividido por' },
};

// Nomes e objetos usados nos problemas com enunciado (F2-13). Sempre com
// quantidades >= 2 nas contas (ver wordProblemOperands), então o plural do
// objeto está sempre certo — não precisa lidar com singular/plural aqui.
const WORD_CHARACTERS = ['Ana', 'Pedro', 'Lucas', 'Sofia', 'Miguel', 'Laura', 'Davi', 'Júlia', 'Beatriz', 'Théo'];
const WORD_OBJECTS = [
    { plural: 'carrinhos' }, { plural: 'bolinhas' }, { plural: 'figurinhas' }, { plural: 'balões' },
    { plural: 'docinhos' }, { plural: 'lápis' }, { plural: 'adesivos' }, { plural: 'bonecos' },
];

/* ---------- Menu ---------- */

const CATEGORY_META = [
    { id: 'formas',     label: 'Formas',           emoji: '🔷', sub: 'círculo, estrela…' },
    { id: 'cores',      label: 'Cores',            emoji: '🎨', sub: 'vermelho, azul…' },
    { id: 'animais',    label: 'Animais',          emoji: '🐶', sub: 'cachorro, gato…' },
    { id: 'numletras',  label: 'Números e Letras', emoji: '🔢', sub: '1, 2, A, B…' },
    { id: 'ingles',     label: 'Inglês',           emoji: '💬', sub: 'dog, good morning…' },
    { id: 'matematica', label: 'Matemática',       emoji: '🧮', sub: '+  −  ×  ÷' },
    { id: 'mouse',      label: 'Treino do mouse',  emoji: '🖱️', sub: 'balões, alvos, rolar…' },
    { id: 'pintura',    label: 'Pintura Livre',    emoji: '🖍️', sub: 'desenhe à vontade' },
    { id: 'misturar',   label: 'Misturar Tudo',    emoji: '🎲', sub: 'formas, cores, animais…' },
];

// Escolha extra que aparece só para algumas categorias.
const SUB_OPTIONS = {
    numletras: {
        title: 'O que praticar?',
        say: 'Escolha o que praticar',
        items: [
            { id: 'reconhecer', label: 'Reconhecer',   emoji: '🔢', sub: 'clique no certo' },
            { id: 'contar',     label: 'Contar',       emoji: '🍓', sub: 'quantos tem aqui?' },
            { id: 'inicial',    label: 'Letra inicial', emoji: '🔤', sub: 'com que letra começa?' },
            { id: 'misturar',   label: 'Misturar',     emoji: '🎲', sub: 'um pouco de cada' },
        ],
    },
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
            { id: 'numero_faltando', label: 'Número que falta', emoji: '❓', sub: '5 + ? = 8' },
            { id: 'problemas',   label: 'Problemas',   emoji: '📖', sub: 'com historinha' },
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
            { id: 'memoria',  label: 'Memória',  emoji: '🃏', sub: 'ache os pares' },
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

// F2-14: 6 avatares disponíveis desde o início; os outros 6 destravam com estrelas.
const AVATARS = [
    { glyph: '🦄', unlockAt: 0 }, { glyph: '🌸', unlockAt: 0 }, { glyph: '🐱', unlockAt: 0 },
    { glyph: '🐰', unlockAt: 0 }, { glyph: '🐼', unlockAt: 0 }, { glyph: '🍓', unlockAt: 0 },
    { glyph: '🦋', unlockAt: 10 }, { glyph: '🌈', unlockAt: 20 }, { glyph: '⭐', unlockAt: 30 },
    { glyph: '🐬', unlockAt: 50 }, { glyph: '🌷', unlockAt: 75 }, { glyph: '🐞', unlockAt: 100 },
];

/* Tempos de experiência */
const SUSPENSE_MS = 1100;   // "aguardar a validação" após escolher
const ADVANCE_MS = 1300;    // depois do acerto, antes da próxima
const WRONG_SHOW_MS = 800;  // (arrastar) peça errada fica no alvo antes de voltar

/* -----------------------------------------------------------
   3) ESTADO
----------------------------------------------------------- */

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
    config: $('#screen-config'),
    game: $('#screen-game'),
    draw: $('#screen-draw'),
    results: $('#screen-results'),
};

const el = {
    // perfis
    profilesList: $('#profiles-list'),
    profileCreate: $('#profile-create'),
    newName: $('#new-name'),
    avatarPicker: $('#avatar-picker'),
    newAutoread: $('#new-autoread'),
    createConfirm: $('#create-confirm'),
    createCancel: $('#create-cancel'),
    exportProfilesBtn: $('#export-profiles-btn'),
    importProfilesBtn: $('#import-profiles-btn'),
    importProfilesInput: $('#import-profiles-input'),
    // barra de perfil (compartilhada entre as telas de menu e configuração)
    profileBar: $('#profile-bar'),
    pbAvatar: $('#pb-avatar'),
    pbName: $('#pb-name'),
    pbStars: $('#pb-stars'),
    switchProfile: $('#switch-profile'),
    // menu / configuração do jogo
    categoryGrid: $('#category-grid'),
    configBackBtn: $('#config-back-btn'),
    configTitle: $('#config-title'),
    panelSub: $('#panel-sub'),
    subTitle: $('#sub-title'),
    subListen: $('#sub-listen'),
    subGrid: $('#sub-grid'),
    panelExtra: $('#panel-extra'),
    extraGrid: $('#extra-grid'),
    difficultyGrid: $('#difficulty-grid'),
    countTitle: $('#count-title'),
    countListen: $('#count-listen'),
    countGrid: $('#count-grid'),
    panelMode: $('#panel-mode'),
    modeGrid: $('#mode-grid'),
    customCount: $('#custom-count-input'),
    startBtn: $('#start-btn'),
    // pintura livre (F2-21)
    drawPalette: $('#draw-palette'),
    drawCanvas: $('#draw-canvas'),
    drawClearBtn: $('#draw-clear-btn'),
    drawExitBtn: $('#draw-exit-btn'),
    // jogo
    hudLabel: $('#hud-label'),
    playfield: $('#playfield'),
    installBtn: $('#install-btn'),
    themeToggle: $('#theme-toggle'),
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
    resultsAchievement: $('#results-achievement'),
    reviewBtn: $('#review-btn'),
    playAgainBtn: $('#play-again-btn'),
    menuBtn: $('#menu-btn'),
    // trocar de avatar (F2-14)
    avatarSwitcher: $('#avatar-switcher'),
    avatarSwitcherGrid: $('#avatar-switcher-grid'),
    switcherAutoread: $('#switcher-autoread'),
    avatarSwitcherClose: $('#avatar-switcher-close'),
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
    document.body.classList.toggle('is-drawing', name === 'draw');   // pintura livre também cabe na janela inteira
    el.profileBar.hidden = !(name === 'menu' || name === 'config');   // só faz sentido junto do menu/configuração
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

// F2-02: fala a pergunta/instrução atual sozinha, só se o perfil tiver essa opção ligada
// (pensada pra quem ainda não lê); o resto do app continua manual, no botão 🔊.
function autoReadCurrentQuestion() {
    if (!state.profile || !state.profile.autoRead || !state.question) return;
    speak(state.question.prompt(state.mode).speak);
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

// Quantos [n] cabem no nível escolhido (fácil/médio/difícil).
function countRangeForDifficulty(difficulty) {
    const lvl = { facil: 0, medio: 1, dificil: 2 }[difficulty] || 0;
    return [[2, 5], [3, 7], [5, 10]][lvl];
}

// F2-08 "Contar com emojis": mostra um grupo de figuras e pergunta quantas tem.
// Pensado para quem ainda não lê — a pergunta inteira também é falada.
function countingQuestion(count) {
    const obj = randomFrom(COUNTABLES);
    const [min, max] = countRangeForDifficulty(state.difficulty);
    const n = randRange(min, max);
    const options = nearbyNumberOptions(n, count);
    const correct = options.find((o) => o.name === String(n));
    const cluster = Array(n).fill(`<span>${obj.glyph}</span>`).join('');
    const quantos = obj.gender === 'a' ? 'Quantas' : 'Quantos';
    return {
        key: `contar:${obj.id}:${n}`, correct, options,
        prompt: () => ({
            html: `<span class="count-cluster">${cluster}</span>${quantos} <b>${obj.plural}</b> tem aqui?`,
            speak: `${quantos} ${obj.plural} tem aqui?`,
        }),
    };
}

// F2-09 "Letra inicial": mostra um bichinho e pergunta com que letra o nome começa.
function initialLetterQuestion(count) {
    const item = randomFrom(CONTENT.animais);
    const letter = item.name[0];
    const alphabet = LETTERS.map((l) => l.name);
    const toOpt = (l) => ({ id: 'il-' + l, name: l, kind: 'char', glyph: l });
    const correct = toOpt(letter);
    const options = shuffle([correct, ...sample(alphabet.filter((l) => l !== letter), count - 1).map(toOpt)]);
    const prep = item.gender === 'o' ? 'o' : 'a';
    return {
        key: `inicial:${item.id}`, correct, options,
        prompt: () => ({
            html: `<span class="glyph-hero">${item.glyph}</span>Com que letra ${prep} <b>${item.name}</b> começa?`,
            speak: `Com que letra ${prep} ${item.name} começa?`,
        }),
    };
}

// Números e Letras: dependendo da escolha extra, ou é o reconhecimento clássico
// (clicar no número/letra) ou uma das duas novas atividades.
function numLetrasQuestion(count) {
    const sub = state.sub.numletras;
    const mode = sub === 'misturar' ? randomFrom(['reconhecer', 'contar', 'inicial']) : sub;
    if (mode === 'contar') return countingQuestion(count);
    if (mode === 'inicial') return initialLetterQuestion(count);
    return classicQuestion('numletras', count);
}

/* ---------- inglês ---------- */

// Fala em inglês: "Click on the dog" -> figuras.
function englishFigures(count) {
    const { prefix, items } = EN_GROUPS[randomFrom(Object.keys(EN_GROUPS))];
    const n = Math.min(count, items.length);
    const correct = randomFrom(items);
    const options = shuffle([correct, ...sample(items.filter((it) => it.id !== correct.id), n - 1)]);
    return {
        key: 'fig:' + correct.id, correct, options, speakEn: correct.en,
        prompt: () => ({
            html: `Click on ${prefix}<b>${correct.en}</b>`,
            speak: [{ text: `Click on ${prefix}${correct.en}`, lang: 'en-US' }],
        }),
    };
}

// "O que significa Good morning?" / "Como se diz Bom dia em inglês?" -> textos.
// Além do vocabulário com figura (EN_GROUPS), entram frases e dias da semana
// (que não têm uma figura que faça sentido mostrar, por isso só aparecem aqui).
function englishTranslation(count) {
    const pick = Math.random();
    const groupKey = pick < 0.25 ? 'phrases' : pick < 0.4 ? 'days' : randomFrom(Object.keys(EN_GROUPS));
    const items = groupKey === 'phrases' ? EN_PHRASES : groupKey === 'days' ? EN_DAYS : EN_GROUPS[groupKey].items;
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
        key: `tr:${source.id}:${toPt ? 'pt' : 'en'}`, correct, options, speakEn: source.en,
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
// "table" (opcional): tabuada específica escolhida (F2-10) — só vale para multiplicar.
function mathOperands(op, difficulty, table) {
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
            const a = table && table !== 'todas' ? Number(table) : randRange(aMin, aMax);
            const b = randRange(bMin, bMax);
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

// Opções numéricas "perto" de um valor certo (reaproveitado por matemática e contagem).
function nearbyNumberOptions(value, count) {
    const near = [], far = [];
    [1, 2, 3, 4, 5, 6].forEach((d) => near.push(value + d, value - d));
    [10].forEach((d) => far.push(value + d, value - d));
    const distractors = [...shuffle(near), ...shuffle(far)].filter((v) => v >= 0);

    const values = [value];
    for (const v of distractors) {
        if (values.length >= count) break;
        if (!values.includes(v)) values.push(v);
    }
    return shuffle(values.map(numberOption));
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
    const sub = state.sub.matematica;
    if (sub === 'numero_faltando') return missingOperandQuestion(count);
    if (sub === 'problemas') return wordProblemQuestion(count);

    const opKey = sub === 'misturar' ? randomFrom(Object.keys(MATH_OPS)) : sub;
    const op = MATH_OPS[opKey];
    const { a, b, answer } = mathOperands(opKey, state.difficulty, opKey === 'multiplicar' ? state.table : undefined);

    const options = nearbyNumberOptions(answer, count);
    const correct = options.find((o) => o.name === String(answer));
    return {
        key: `${a}${op.sym}${b}`, correct, options, big: true,
        prompt: () => ({
            html: mathStackHTML(a, op.sym, b),
            speak: `Quanto é ${a} ${op.say} ${b}?`,
        }),
    };
}

// F2-11 "Número que falta": "5 + ? = 8" em vez de sempre pedir o resultado.
// O segundo número (b) é sempre o que falta, para manter simples de ler.
function missingOperandQuestion(count) {
    const opKey = randomFrom(Object.keys(MATH_OPS));
    const op = MATH_OPS[opKey];
    const { a, b, answer } = mathOperands(opKey, state.difficulty);
    const options = nearbyNumberOptions(b, count);
    const correct = options.find((o) => o.name === String(b));
    return {
        key: `falta:${a}${op.sym}?=${answer}`, correct, options, big: true,
        prompt: () => ({
            html: `${a} <span class="math-op">${op.sym}</span> <span class="math-blank">?</span> = ${answer}`,
            speak: `${a} ${op.say} quanto é ${answer}?`,
        }),
    };
}

// F2-13 "Problemas com enunciado": historinha curta em vez da conta pronta.
// Números sempre >= 2 (ver wordProblemOperands), então o plural do objeto
// nunca erra e não precisa de lógica de concordância.
function wordProblemOperands(opKey, difficulty) {
    const lvl = { facil: 0, medio: 1, dificil: 2 }[difficulty] || 0;
    switch (opKey) {
        case 'somar': { const [min, max] = [[2, 6], [2, 10], [5, 20]][lvl]; const a = randRange(min, max), b = randRange(min, max); return { a, b, answer: a + b }; }
        case 'subtrair': { const [min, max] = [[4, 8], [6, 15], [10, 30]][lvl]; const a = randRange(min, max), b = randRange(2, a - 1); return { a, b, answer: a - b }; }
        case 'multiplicar': { const max = [4, 6, 9][lvl]; const a = randRange(2, max), b = randRange(2, max); return { a, b, answer: a * b }; }
        default: { const b = randRange(2, [3, 5, 8][lvl]), q = randRange(2, [4, 6, 9][lvl]); return { a: b * q, b, answer: q }; } // dividir
    }
}

function wordProblemSentence(opKey, name, a, b, plural) {
    switch (opKey) {
        case 'somar':       return `${name} tinha ${a} ${plural} e ganhou mais ${b}. Com quantos ${plural} ${name} ficou?`;
        case 'subtrair':    return `${name} tinha ${a} ${plural} e deu ${b}. Com quantos ${plural} ${name} ficou?`;
        case 'multiplicar': return `${name} tem ${a} sacolinhas com ${b} ${plural} em cada uma. Quantos ${plural} tem ao todo?`;
        default:            return `${name} tem ${a} ${plural} para dividir entre ${b} amigos, em partes iguais. Quantos ${plural} cada amigo ganha?`;
    }
}

function wordProblemQuestion(count) {
    const opKey = randomFrom(Object.keys(MATH_OPS));
    const { a, b, answer } = wordProblemOperands(opKey, state.difficulty);
    const name = randomFrom(WORD_CHARACTERS);
    const obj = randomFrom(WORD_OBJECTS);
    const sentence = wordProblemSentence(opKey, name, a, b, obj.plural);
    const options = nearbyNumberOptions(answer, count);
    const correct = options.find((o) => o.name === String(answer));
    return {
        key: `problema:${opKey}:${a}:${b}:${name}:${obj.plural}`, correct, options,
        prompt: () => ({ html: sentence, speak: sentence }),
    };
}

/* ---------- escolhe o jogo ---------- */

function buildQuestion(count) {
    if (state.category === 'ingles') return englishQuestion(count);
    if (state.category === 'matematica') return mathQuestion(count);
    if (state.category === 'numletras') return numLetrasQuestion(count);
    const cat = state.category === 'misturar'
        ? randomFrom(['formas', 'cores', 'animais', 'numletras'])
        : state.category;
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
    state.wrongAttempts = 0;
    state.hintGiven = false;
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
    autoReadCurrentQuestion(); // F2-02: só fala sozinho se o perfil tiver a opção ligada
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
    autoReadCurrentQuestion(); // F2-02
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
    if (state.firstTry) {
        state.correctFirstTry++;
        state.starsEarned++;   // treino do mouse fica de fora da regra "2 acertos = 1 estrela" (F2-17)
        state.curStreak++;
        state.bestStreak = Math.max(state.bestStreak, state.curStreak);
    } else {
        state.curStreak = 0;
    }
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

    // Inglês (F2-12): fala a palavra/frase certa em inglês, para reforçar a pronúncia.
    // Timer solto (não usa schedule()) para não cancelar o avanço para a próxima pergunta.
    if (state.question.speakEn) setTimeout(() => speak([{ text: state.question.speakEn, lang: 'en-US' }]), 550);

    el.options.querySelectorAll('.option').forEach((b) => { b.disabled = true; b.classList.add('is-locked'); });
    state.answered++;

    if (state.firstTry) {
        state.correctFirstTry++;
        state.curStreak++;
        state.bestStreak = Math.max(state.bestStreak, state.curStreak);
        if (!state.reviewMode) {
            // F2-17: no nível Difícil, cada 2 acertos de primeira valem 1 estrela.
            if (state.difficulty === 'dificil') {
                if (state.correctFirstTry % 2 === 0) state.starsEarned++;
            } else {
                state.starsEarned++;
            }
        }
    } else {
        state.curStreak = 0;
        // F2-16: errou ao menos uma vez — guarda pra oferecer revisão opcional no resultado.
        if (!state.reviewMode) state.missed.push(state.question);
    }
    updateHud();

    schedule(nextStep, ADVANCE_MS); // busy volta a false em renderQuestion
}

function revealWrong(sourceEl, piece) {
    state.firstTry = false;
    state.wrongAttempts++;
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
        maybeGiveHint();
    };

    if (piece === sourceEl) {
        release();
    } else {
        // Arrastar: a peça errada balança no alvo e só então "volta" ao lugar.
        piece.classList.add('is-wrong');
        schedule(release, WRONG_SHOW_MS);
    }
}

// F2-03: depois do 2º erro na mesma pergunta, elimina uma opção errada pra ajudar
// (só 1 vez por pergunta). Em "fácil" (3 opções) normalmente já não sobra nada pra
// eliminar nesse ponto — o efeito aparece mais em médio/difícil, que é onde ajuda de fato.
function maybeGiveHint() {
    if (state.wrongAttempts < 2 || state.hintGiven || !state.question) return;
    const candidates = [...el.options.querySelectorAll('.option')]
        .filter((b) => !b.disabled && b.getAttribute('aria-label') !== state.question.correct.name);
    if (candidates.length === 0) return;
    state.hintGiven = true;
    const pick = randomFrom(candidates);
    pick.disabled = true;
    pick.classList.add('is-hint-out');
    el.feedback.textContent = '💡 Vou te ajudar: essa aqui não é!';
    el.feedback.className = 'feedback is-checking';
}

function nextStep() {
    if (state.reviewMode) { nextReviewQuestion(); return; }
    if (state.answered >= state.totalQuestions) showResults();
    else newQuestion();
}

// F2-16: revisão opcional do que errou. Reaproveita as perguntas exatas que
// já foram geradas (cada uma já é autossuficiente: prompt/correta/opções),
// então não precisa gerar de novo — só tocar de novo na mesma ordem.
function startReview() {
    state.reviewQueue = state.missed.slice();
    state.missed = [];
    state.reviewMode = true;
    state.answered = 0;
    state.totalQuestions = state.reviewQueue.length;
    el.hudLabel.textContent = 'Revisão';
    cancelPending();
    showScreen('game');
    updateHud();
    nextReviewQuestion();
}

function nextReviewQuestion() {
    if (state.reviewQueue.length === 0) { showReviewComplete(); return; }
    const q = state.reviewQueue.shift();
    state.question = q;
    state.firstTry = true;
    state.wrongAttempts = 0;
    state.hintGiven = false;
    renderQuestion(q);
}

// Tela simples ao final da revisão — não mexe em estrelas/partidas do perfil,
// porque a revisão não vale ponto (combinado com o Pedro).
function showReviewComplete() {
    state.reviewMode = false;
    cancelPending();
    stopSpeech();
    el.resultsEmoji.textContent = '👍';
    el.resultsTitle.textContent = 'Revisão concluída!';
    el.resultsScore.innerHTML = 'Você revisou o que tinha errado. Continue praticando!';
    el.resultsStars.textContent = '';
    el.resultsAchievement.hidden = true;
    el.reviewBtn.hidden = true;
    if (state.profile) {
        el.resultsName.textContent = state.profile.name;
        el.resultsProfileStars.textContent = state.profile.stars || 0;
    }
    state.resultSpeech = 'Revisão concluída! Você revisou o que tinha errado. Continue praticando!';
    showScreen('results');
}

function updateHud() {
    el.qCurrent.textContent = Math.min(state.answered + 1, state.totalQuestions);
    el.qTotal.textContent = state.totalQuestions;
    el.qScore.textContent = state.starsEarned;
    el.progressBar.style.width = ((state.answered / state.totalQuestions) * 100) + '%';
}

/* -----------------------------------------------------------
   10b) CONQUISTAS (F2-15)
   Checadas ao final de cada rodada (nunca durante a revisão opcional).
   Guardadas em profile.achievements — lista de ids já desbloqueados,
   pra não repetir o aviso depois de desbloqueada uma vez.
----------------------------------------------------------- */

const ACHIEVEMENTS = [
    { id: 'primeira_partida',   label: 'Primeira Partida', emoji: '🎉', check: (p) => (p.games || 0) >= 1 },
    { id: 'cinco_partidas',     label: 'Cinco Partidas',   emoji: '🎮', check: (p) => (p.games || 0) >= 5 },
    { id: 'vinte_partidas',     label: 'Vinte Partidas',   emoji: '🕹️', check: (p) => (p.games || 0) >= 20 },
    { id: 'cinquenta_estrelas', label: '50 Estrelas',      emoji: '⭐', check: (p) => (p.stars || 0) >= 50 },
    { id: 'cem_estrelas',       label: '100 Estrelas',     emoji: '🌟', check: (p) => (p.stars || 0) >= 100 },
    { id: 'sequencia_10',       label: 'Sequência de 10',  emoji: '🔥', check: (p, s) => (s.bestStreak || 0) >= 10 },
    { id: 'tres_dias',          label: '3 Dias Seguidos',  emoji: '📅', check: (p) => consecutiveDays(p) >= 3 },
];

// Quantos dias seguidos (contando hoje) o perfil tem tempo de jogo registrado — usa o
// cronômetro do F2-27 (profile.playtime.days), sem precisar de nenhum dado novo.
function consecutiveDays(profile) {
    const days = (profile.playtime && profile.playtime.days) || {};
    let streak = 0;
    for (let i = 0; ; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (days[dateKey(d)] > 0) streak++; else break;
    }
    return streak;
}

function checkAchievements(profile, sessionStats) {
    profile.achievements = profile.achievements || [];
    const unlocked = [];
    ACHIEVEMENTS.forEach((a) => {
        if (!profile.achievements.includes(a.id) && a.check(profile, sessionStats)) {
            profile.achievements.push(a.id);
            unlocked.push(a);
        }
    });
    return unlocked;
}

/* -----------------------------------------------------------
   11) RESULTADO
----------------------------------------------------------- */

function showResults() {
    cancelPending();
    stopSpeech();

    const answered = state.answered;
    const correct = state.correctFirstTry;   // quantas acertou de primeira (mensagem)
    const stars = state.starsEarned;         // quantas estrelas isso realmente valeu (F2-17)
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
    el.resultsStars.textContent = stars <= 12 ? ('⭐'.repeat(stars) || '—') : `⭐ x ${stars}`;

    // Texto do botão "ouvir resultado" (para quem ainda não lê).
    let speech = `${title} ` + (mouse
        ? `Você fez ${correct} de ${answered} rodadas sem errar. `
        : `Você acertou de primeira ${correct} de ${answered}. `);

    // F2-16: oferece revisar o que errou, só se algo foi errado (não vale estrela extra).
    el.reviewBtn.hidden = state.missed.length === 0;
    el.reviewBtn.textContent = `Revisar o que errei (${state.missed.length}) 🔁`;

    // Acumula estrelas no perfil e confere conquistas novas (F2-15).
    let unlocked = [];
    if (state.profile) {
        state.profile.stars = (state.profile.stars || 0) + stars;
        state.profile.games = (state.profile.games || 0) + 1;
        unlocked = checkAchievements(state.profile, { bestStreak: state.bestStreak });
        saveProfiles(profiles);
        updateProfileBar();
        el.resultsName.textContent = state.profile.name;
        el.resultsProfileStars.textContent = state.profile.stars;

        const total = state.profile.stars;
        speech = `${state.profile.name}! ` + speech
            + `Agora você tem ${total} ${total === 1 ? 'estrela' : 'estrelas'} no total. `;
    }

    if (unlocked.length) {
        el.resultsAchievement.hidden = false;
        el.resultsAchievement.innerHTML = unlocked.map((a) => `${a.emoji} <b>${a.label}</b>`).join(' · ');
        speech += `Você desbloqueou uma conquista nova: ${unlocked.map((a) => a.label).join(', ')}! `;
    } else {
        el.resultsAchievement.hidden = true;
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
   12b) PINTURA LIVRE (F2-21)
   Sem certo ou errado, só pra desenhar. Não passa pela tela de
   configuração (sem nível/quantidade — não faz sentido aqui).
----------------------------------------------------------- */

const DRAW_COLORS = ['#4a2f4a', '#e0559b', '#6fc3ee', '#ffd76a', '#b596ee', '#38d9a9', '#ff922b', '#ffffff'];

let drawCtx = null;
let drawColor = DRAW_COLORS[0];
let drawing = false;
let drawLast = null;

function drawLocalPoint(e) {
    const r = el.drawCanvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function resizeDrawCanvas() {
    // Sem isso, o canvas fica borrado/errado se o tamanho em CSS não bater com o buffer.
    const rect = el.drawCanvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    el.drawCanvas.width = rect.width;
    el.drawCanvas.height = rect.height;
    drawCtx = el.drawCanvas.getContext('2d');
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
}
window.addEventListener('resize', () => { if (screens.draw.classList.contains('is-active')) resizeDrawCanvas(); });

function renderDrawPalette() {
    el.drawPalette.innerHTML = '';
    DRAW_COLORS.forEach((c, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'draw-swatch' + (i === 0 ? ' is-selected' : '');
        b.style.background = c;
        b.setAttribute('aria-label', 'Cor ' + (i + 1));
        b.addEventListener('click', () => {
            drawColor = c;
            el.drawPalette.querySelectorAll('.draw-swatch').forEach((s) => s.classList.remove('is-selected'));
            b.classList.add('is-selected');
        });
        el.drawPalette.appendChild(b);
    });
}

function openDrawScreen() {
    showScreen('draw');
    // o canvas só tem o tamanho final depois do layout da tela acontecer
    requestAnimationFrame(() => { resizeDrawCanvas(); });
}

function drawStart(e) {
    e.preventDefault();
    drawing = true;
    const p = drawLocalPoint(e);
    drawLast = p;
    drawCtx.fillStyle = drawColor;
    drawCtx.beginPath();
    drawCtx.arc(p.x, p.y, 4, 0, Math.PI * 2);   // um pontinho ao tocar, mesmo sem arrastar
    drawCtx.fill();
}
function drawMove(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = drawLocalPoint(e);
    drawCtx.strokeStyle = drawColor;
    drawCtx.lineWidth = 8;
    drawCtx.beginPath();
    drawCtx.moveTo(drawLast.x, drawLast.y);
    drawCtx.lineTo(p.x, p.y);
    drawCtx.stroke();
    drawLast = p;
}
function drawEnd() { drawing = false; }

el.drawCanvas.addEventListener('pointerdown', drawStart);
el.drawCanvas.addEventListener('pointermove', drawMove);
window.addEventListener('pointerup', drawEnd);
window.addEventListener('pointercancel', drawEnd);
el.drawClearBtn.addEventListener('click', () => drawCtx && drawCtx.clearRect(0, 0, el.drawCanvas.width, el.drawCanvas.height));
el.drawExitBtn.addEventListener('click', () => showScreen('menu'));
renderDrawPalette();

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
let pendingAvatar = AVATARS[0].glyph;

/* -----------------------------------------------------------
   13b) TEMPO DE JOGO (por perfil — para o futuro painel dos pais)
   Conta desde que o perfil é escolhido até trocar de perfil ou fechar
   a aba/app. Pausa sozinha quando a aba fica em segundo plano, para
   não contar tempo com o app esquecido aberto. Guardado por dia
   (chave "AAAA-MM-DD") dentro do próprio perfil, em profiles[].playtime.
   Não aparece em lugar nenhum ainda — só junta dado para o painel dos
   pais (mais para frente); nada disto é visível para a criança.
----------------------------------------------------------- */

const PLAYTIME_FLUSH_MS = 15000;   // grava no localStorage a cada 15s (perde no máximo isso se fechar de repente)

let playtimeTickHandle = null;
let playtimeLastMark = 0;   // performance.now() da última vez que o tempo foi somado

function dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayKey() { return dateKey(new Date()); }

function addPlaytime(ms) {
    if (!state.profile || ms <= 0) return;
    const p = state.profile;
    p.playtime = p.playtime || { days: {} };
    const key = todayKey();
    p.playtime.days[key] = (p.playtime.days[key] || 0) + ms;
    saveProfiles(profiles);
}

// Soma o tempo desde a última marcação e reinicia a marcação (chamado a cada "tick" e nas pausas).
function playtimeFlush() {
    if (!playtimeLastMark) return;
    const now = performance.now();
    addPlaytime(now - playtimeLastMark);
    playtimeLastMark = now;
}

function startPlaytimeTracking() {
    stopPlaytimeTracking();
    playtimeLastMark = performance.now();
    playtimeTickHandle = setInterval(playtimeFlush, PLAYTIME_FLUSH_MS);
}

function stopPlaytimeTracking() {
    if (playtimeTickHandle) { playtimeFlush(); clearInterval(playtimeTickHandle); playtimeTickHandle = null; }
    playtimeLastMark = 0;
}

// Aba em segundo plano (trocou de app, minimizou...): pausa; ao voltar, retoma.
document.addEventListener('visibilitychange', () => {
    if (!state.profile) return;
    if (document.hidden) {
        if (playtimeTickHandle) { playtimeFlush(); clearInterval(playtimeTickHandle); playtimeTickHandle = null; }
    } else if (!playtimeTickHandle) {
        playtimeLastMark = performance.now();
        playtimeTickHandle = setInterval(playtimeFlush, PLAYTIME_FLUSH_MS);
    }
});
// Último esforço para não perder os segundos desde o flush anterior ao fechar a aba.
window.addEventListener('pagehide', playtimeFlush);
window.addEventListener('beforeunload', playtimeFlush);

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
    pendingAvatar = AVATARS[0].glyph;
    el.newAutoread.checked = false;
    renderAvatarPicker();
    el.profileCreate.hidden = false;
    el.profileCreate.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.newName.focus();
}

// F2-14: perfil novo começa com 0 estrelas, então só os avatares "unlockAt: 0" ficam
// clicáveis aqui; os outros aparecem com cadeado, só pra mostrar que tem mais pra destravar.
function renderAvatarPicker() {
    el.avatarPicker.innerHTML = '';
    AVATARS.forEach((a) => {
        const unlocked = a.unlockAt === 0;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'avatar-opt' + (a.glyph === pendingAvatar ? ' is-selected' : '') + (unlocked ? '' : ' is-locked');
        b.disabled = !unlocked;
        b.innerHTML = unlocked ? a.glyph : `<span class="avatar-lock">🔒</span><span class="avatar-lock-req">${a.unlockAt}⭐</span>`;
        if (unlocked) {
            b.addEventListener('click', () => { pendingAvatar = a.glyph; renderAvatarPicker(); });
        }
        el.avatarPicker.appendChild(b);
    });
}

// F2-14: clicar no avatar da barra de perfil abre a troca (avatares já destravados por estrelas).
function openAvatarSwitcher() {
    if (!state.profile) return;
    const stars = state.profile.stars || 0;
    el.switcherAutoread.checked = !!state.profile.autoRead;
    el.avatarSwitcherGrid.innerHTML = '';
    AVATARS.forEach((a) => {
        const unlocked = stars >= a.unlockAt;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'avatar-opt' + (a.glyph === state.profile.avatar ? ' is-selected' : '') + (unlocked ? '' : ' is-locked');
        b.disabled = !unlocked;
        b.innerHTML = unlocked ? a.glyph : `<span class="avatar-lock">🔒</span><span class="avatar-lock-req">${a.unlockAt}⭐</span>`;
        if (unlocked) {
            b.addEventListener('click', () => {
                state.profile.avatar = a.glyph;
                saveProfiles(profiles);
                updateProfileBar();
                el.avatarSwitcher.hidden = true;
            });
        }
        el.avatarSwitcherGrid.appendChild(b);
    });
    el.avatarSwitcher.hidden = false;
}

function createProfile() {
    const name = (el.newName.value || '').trim() || 'Jogadora';
    // F2-02: leitura automática das perguntas, desligada por padrão (opt-in por perfil)
    const p = { id: 'p' + Date.now() + randInt(1000), name, avatar: pendingAvatar, stars: 0, games: 0, autoRead: el.newAutoread.checked };
    profiles.push(p);
    saveProfiles(profiles);
    selectProfile(p);
}

function selectProfile(p) {
    state.profile = p;
    setCurrentId(p.id);
    updateProfileBar();
    startPlaytimeTracking();
    showScreen('menu');
}

function deleteProfile(p) {
    if (!window.confirm(`Apagar a jogadora "${p.name}"? As estrelas dela serão perdidas.`)) return;
    profiles = profiles.filter((x) => x.id !== p.id);
    saveProfiles(profiles);
    if (state.profile && state.profile.id === p.id) {
        stopPlaytimeTracking();
        state.profile = null;
        setCurrentId('');
    }
    renderProfiles();
}

/* F2-01: backup/restauração dos perfis (o localStorage some se o navegador for limpo,
   ou não existe no aparelho novo — este é o jeito de levar as jogadoras de um lado pro outro). */
function exportProfiles() {
    const payload = { app: 'jogo-dos-cliques', version: 1, exportadoEm: new Date().toISOString(), profiles };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jogo-dos-cliques-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Importa por soma (nunca sobrescreve): jogadoras cujo id já existe são ignoradas,
// pra nunca apagar estrelas/avatar por engano ao importar um backup antigo.
function importProfilesFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        let data;
        try { data = JSON.parse(String(reader.result)); }
        catch (_) { window.alert('Não consegui ler esse arquivo — ele não parece um backup válido.'); return; }

        const incoming = Array.isArray(data) ? data : Array.isArray(data && data.profiles) ? data.profiles : null;
        if (!incoming) { window.alert('Esse arquivo não parece ser um backup do Jogo dos Cliques.'); return; }

        const existingIds = new Set(profiles.map((p) => p.id));
        const novos = incoming.filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string' && !existingIds.has(p.id));
        const repetidos = incoming.length - novos.length;

        if (novos.length === 0) {
            window.alert(repetidos > 0
                ? 'Essas jogadoras já estão neste aparelho — nada novo para importar.'
                : 'Não encontrei nenhuma jogadora válida nesse arquivo.');
            return;
        }

        profiles = profiles.concat(novos);
        saveProfiles(profiles);
        renderProfiles();
        window.alert(`Pronto! ${novos.length} jogadora(s) importada(s)` + (repetidos > 0 ? ` (${repetidos} já existiam e foram ignoradas).` : '.'));
    };
    reader.readAsText(file);
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
        (v) => { state.sub[state.category] = v; refreshExtraPanel(); },
        it.id === state.sub[state.category]));
}

// F2-10 "Tabuada específica": só aparece dentro de Matemática > Multiplicar.
// O grid (1 a 10 + Todas) é montado uma única vez em buildMenu(); aqui só
// mostra/esconde, igual ao panel-mode.
function refreshExtraPanel() {
    el.panelExtra.hidden = !(state.category === 'matematica' && state.sub.matematica === 'multiplicar');
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
    el.countTitle.textContent = mouse ? 'Quantas rodadas?' : 'Quantas perguntas?';
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
    refreshExtraPanel();
}

function buildMenu() {
    CATEGORY_META.forEach((c, i) => buildChoice(
        el.categoryGrid,
        { value: c.id, label: c.label, emoji: c.emoji, sub: c.sub },
        (v) => {
            state.category = v;
            if (v === 'pintura') { openDrawScreen(); return; }   // sem opções pra configurar: vai direto desenhar
            refreshMenuForCategory();
            el.configTitle.textContent = `${c.emoji} ${c.label}`;
            showScreen('config');   // escolheu o jogo: vai para a tela de configurar esse jogo
        }, i === 0));

    DIFFICULTIES.forEach((d, i) => buildChoice(
        el.difficultyGrid,
        { value: d.id, label: d.label, emoji: d.emoji, sub: d.options + ' opções' },
        (v) => { state.difficulty = v; }, i === 0));

    MODES.forEach((m, i) => buildChoice(
        el.modeGrid,
        { value: m.id, label: m.label, emoji: m.emoji, sub: m.sub },
        (v) => { state.mode = v; }, i === 0));

    // Tabuada específica (F2-10): "Todas" + 1 a 10. Só fica visível via refreshExtraPanel().
    const tableItems = [{ id: 'todas', label: 'Todas', sub: 'misturadas' }]
        .concat(Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1), label: String(i + 1), sub: 'tabuada' })));
    tableItems.forEach((it, i) => buildChoice(
        el.extraGrid,
        { value: it.id, label: it.label, sub: it.sub },
        (v) => { state.table = v; }, i === 0));

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
    state.starsEarned = 0;
    state.curStreak = 0;
    state.bestStreak = 0;
    state.missed = [];
    state.reviewMode = false;
    state.reviewQueue = [];
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
el.reviewBtn.addEventListener('click', startReview);
el.playAgainBtn.addEventListener('click', startGame);
el.menuBtn.addEventListener('click', () => showScreen('menu'));
el.switchProfile.addEventListener('click', () => { stopPlaytimeTracking(); renderProfiles(); showScreen('profiles'); });
el.pbAvatar.addEventListener('click', openAvatarSwitcher);
el.avatarSwitcherClose.addEventListener('click', () => { el.avatarSwitcher.hidden = true; });
el.switcherAutoread.addEventListener('change', () => {
    if (!state.profile) return;
    state.profile.autoRead = el.switcherAutoread.checked;
    saveProfiles(profiles);
});
el.configBackBtn.addEventListener('click', () => showScreen('menu'));

el.createConfirm.addEventListener('click', createProfile);
el.createCancel.addEventListener('click', () => { el.profileCreate.hidden = true; });
el.newName.addEventListener('keydown', (e) => { if (e.key === 'Enter') createProfile(); });

el.exportProfilesBtn.addEventListener('click', exportProfiles);
el.importProfilesBtn.addEventListener('click', () => el.importProfilesInput.click());
el.importProfilesInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importProfilesFromFile(file);
    e.target.value = ''; // permite importar o mesmo arquivo de novo, se precisar
});

/* -----------------------------------------------------------
   16a2) MODO NOTURNO (F2-22)
   Sem escolha salva, segue a preferência do sistema (@media prefers-color-
   scheme no CSS). Clicar no botão salva uma escolha explícita, que passa
   a valer independente do sistema, até a pessoa mudar de novo.
----------------------------------------------------------- */

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
    startPlaytimeTracking();
    showScreen('menu');
} else {
    renderProfiles();
    showScreen('profiles');
}
