/* ============================================================
   Bancos de conteúdo do Jogo dos Cliques (F2-45: extraído de script.js)

   Script clássico (não módulo ES — ver nota em script.js), carregado
   ANTES de script.js no index.html. Só dados e funções puras que montam
   esses dados; nada aqui depende de DOM, state ou de outro arquivo.

   Como adicionar conteúdo novo (é só editar os bancos abaixo):
   - Formas:  shapeItem(id, NOME, genero, forma, cor)
   - Cores:   colorItem(id, NOME, hex)
   - Animais: animalItem(id, NOME, genero, emoji)
   - Inglês:  EN_VOCAB (palavra + figura) e EN_PHRASES (frases)
   - Matemática: níveis em mathOperands() (script.js)
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

// "gameTitle": título mostrado dentro da tela de configuração (pedido do Pedro,
// pra reforçar "você escolheu isso" com um nome de jogo, não só o nome da categoria).
const CATEGORY_META = [
    { id: 'formas',     label: 'Formas',           emoji: '🔷', sub: 'círculo, estrela…',      gameTitle: 'Jogo das Formas' },
    { id: 'cores',      label: 'Cores',            emoji: '🎨', sub: 'vermelho, azul…',        gameTitle: 'Jogo das Cores' },
    { id: 'animais',    label: 'Animais',          emoji: '🐶', sub: 'cachorro, gato…',        gameTitle: 'Jogo dos Animais' },
    { id: 'numletras',  label: 'Números e Letras', emoji: '🔢', sub: '1, 2, A, B…',            gameTitle: 'Jogo de Números e Letras' },
    { id: 'ingles',     label: 'Inglês',           emoji: '💬', sub: 'dog, good morning…',      gameTitle: 'Jogo de Inglês' },
    { id: 'matematica', label: 'Matemática',       emoji: '🧮', sub: '+  −  ×  ÷',              gameTitle: 'Jogo de Matemática' },
    { id: 'leitura',    label: 'Leitura e Interpretação', emoji: '📖', sub: 'historinhas curtas', gameTitle: 'Jogo da Leitura e Interpretação' },
    { id: 'completar',  label: 'Completar Palavra', emoji: '🔤', sub: 'arraste a vogal',        gameTitle: 'Jogo de Completar a Palavra' },
    { id: 'mouse',      label: 'Treino do mouse',  emoji: '🖱️', sub: 'balões, alvos, rolar…',   gameTitle: 'Treino do Mouse' },
    { id: 'pintura',    label: 'Pintura Livre',    emoji: '🖍️', sub: 'desenhe à vontade',       gameTitle: 'Pintura Livre' },
    { id: 'mimica',     label: 'Mímica',           emoji: '🎭', sub: 'sorteia e mimica',        gameTitle: 'Jogo da Mímica' },
    { id: 'misturar',   label: 'Misturar Tudo',    emoji: '🎲', sub: 'formas, cores, animais…', gameTitle: 'Jogo de Misturar Tudo' },
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
            { id: 'quadros',  label: 'Atrás dos quadros', emoji: '🔍', sub: 'descubra a imagem' },
            { id: 'pausinhos', label: 'Pausinhos', emoji: '🥢', sub: 'divida nas caixinhas' },
            { id: 'tracar', label: 'Traçar', emoji: '✏️', sub: 'letras e números' },
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
const DRAG_CATEGORIES = ['formas', 'cores', 'animais', 'completar'];

// Quantas perguntas (jogos de quiz) ou rodadas (treino do mouse — cada rodada é mais longa).
const COUNTS = { quiz: [5, 10, 20, 30], mouse: [3, 5, 8, 10] };
const COUNT_DEFAULT_INDEX = 1;

// Texto do nível no treino do mouse (nos outros jogos o nível muda o nº de opções).
const DIFF_SUB_MOUSE = ['grande e devagar', 'tamanho normal', 'pequeno e rápido'];

// F2-25: dentro do minijogo "Traçar", filtra quais caracteres entram no sorteio
// (painel reaproveitado do F2-10 "Qual tabuada?" — ver panelExtra em menu.js).
const TRACE_SET_OPTIONS = [
    { id: 'tudo', label: 'Tudo', emoji: '🔤', sub: 'letras e números' },
    { id: 'vogais', label: 'Vogais', emoji: '🅰️', sub: 'A E I O U' },
    { id: 'consoantes', label: 'Consoantes', emoji: '🔡', sub: 'as outras letras' },
    { id: 'numeros', label: 'Números', emoji: '🔢', sub: '0 a 9' },
];

// F2-14: 6 avatares disponíveis desde o início; os outros 6 destravam com estrelas.
const AVATARS = [
    { glyph: '🦄', unlockAt: 0 }, { glyph: '🌸', unlockAt: 0 }, { glyph: '🐱', unlockAt: 0 },
    { glyph: '🐰', unlockAt: 0 }, { glyph: '🐼', unlockAt: 0 }, { glyph: '🍓', unlockAt: 0 },
    { glyph: '🦋', unlockAt: 10 }, { glyph: '🌈', unlockAt: 20 }, { glyph: '⭐', unlockAt: 30 },
    { glyph: '🐬', unlockAt: 50 }, { glyph: '🌷', unlockAt: 75 }, { glyph: '🐞', unlockAt: 100 },
    // F2-29: pedido do Pedro — mais avatares pra continuar destravando depois do 🐞
    { glyph: '🐢', unlockAt: 125 }, { glyph: '🦊', unlockAt: 150 },
    { glyph: '🐨', unlockAt: 175 }, { glyph: '🦁', unlockAt: 200 },
];
