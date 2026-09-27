/* ============================================================
   Motor de perguntas (F2-45: extraído de script.js)

   Script clássico, carregado depois de content.js/utils.js/state.js/
   dom.js/screens.js/audio.js/render.js. Toda pergunta tem o mesmo
   formato, seja qual for o jogo:
     { key, correct, options, big?, prompt(mode) -> { html, speak } }
   "speak" é um texto (pt-BR) ou uma lista [{ text, lang }].

   Só lógica pura de sorteio/montagem de pergunta — a orquestração que
   efetivamente desenha a pergunta na tela (newQuestion/renderQuestion)
   fica em script.js, que chama buildQuestion() daqui.
   ============================================================ */

'use strict';

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

/* ---------- leitura e interpretação (F2-33; renomeado de "Leiturinha" em 27/09/2026
   — nome já usado por uma marca conhecida de assinatura de livros infantis no Brasil,
   achado da auditoria técnica) ---------- */

// Historinhas curtas ilustradas com emoji, pra treinar leitura (pensada pra
// filha de 8 anos, que já lê). Cada uma tem uma pergunta de compreensão simples
// (onde/o quê/de que cor), igual a um exercício de interpretação de texto da
// escola — segue o mesmo formato de "pergunta" do resto do app, com estrela.
const LEITURA_BANK = [
    { emoji: '🐱', story: 'A gata Mel dorme no sofá 🛋️ todas as tardes.', pergunta: 'Onde a gata Mel dorme?', resposta: 'No sofá' },
    { emoji: '🐶', story: 'O cachorro Rex adora correr atrás da bola ⚽ no quintal.', pergunta: 'Atrás de que o Rex corre?', resposta: 'Da bola' },
    { emoji: '🐰', story: 'O coelhinho Bolinha gosta muito de comer cenoura 🥕 no jardim.', pergunta: 'O que o coelhinho gosta de comer?', resposta: 'Cenoura' },
    { emoji: '🐦', story: 'O passarinho fez um ninho 🪺 bem no topo da árvore 🌳.', pergunta: 'Onde o passarinho fez o ninho?', resposta: 'No topo da árvore' },
    { emoji: '🐠', story: 'O peixinho dourado nada devagar dentro do aquário.', pergunta: 'Onde o peixinho nada?', resposta: 'No aquário' },
    { emoji: '🧒', story: 'Ana levou seu balão 🎈 amarelo para o parque hoje.', pergunta: 'De que cor era o balão da Ana?', resposta: 'Amarelo' },
    { emoji: '👦', story: 'Pedro guardou seus lápis de cor 🖍️ dentro da caixinha.', pergunta: 'Onde Pedro guardou os lápis?', resposta: 'Na caixinha' },
    { emoji: '🌧️', story: 'Hoje choveu muito e Sofia usou seu guarda-chuva 🌂 vermelho.', pergunta: 'De que cor era o guarda-chuva?', resposta: 'Vermelho' },
    { emoji: '☀️', story: 'No verão, a família foi à praia 🏖️ tomar sol.', pergunta: 'Para onde a família foi?', resposta: 'Para a praia' },
    { emoji: '🎂', story: 'No aniversário da Clara, todos comeram um bolo de chocolate.', pergunta: 'De que sabor era o bolo?', resposta: 'Chocolate' },
    { emoji: '📖', story: 'Antes de dormir, o menino gosta de ouvir uma história nova.', pergunta: 'O que o menino gosta de ouvir antes de dormir?', resposta: 'Uma história' },
    { emoji: '🚲', story: 'Miguel aprendeu a andar de bicicleta no parque com o pai.', pergunta: 'O que Miguel aprendeu a fazer?', resposta: 'Andar de bicicleta' },
    { emoji: '🦋', story: 'Uma borboleta colorida pousou bem devagar em cima da flor 🌸.', pergunta: 'Onde a borboleta pousou?', resposta: 'Na flor' },
    { emoji: '🐸', story: 'O sapinho verde pulou direto para dentro da lagoa.', pergunta: 'Para onde o sapinho pulou?', resposta: 'Para a lagoa' },
    { emoji: '🍦', story: 'No dia quente, Bia escolheu um sorvete de morango.', pergunta: 'De que sabor era o sorvete?', resposta: 'Morango' },
    { emoji: '🎒', story: 'Antes de ir pra escola, Théo arruma tudo dentro da mochila.', pergunta: 'Onde Théo arruma as coisas?', resposta: 'Na mochila' },
    { emoji: '🧸', story: 'O ursinho de pelúcia dorme todas as noites em cima da cama.', pergunta: 'Onde o ursinho dorme?', resposta: 'Na cama' },
    { emoji: '🌻', story: 'O girassol cresce alto e sempre vira o rosto para o sol ☀️.', pergunta: 'Para onde o girassol vira o rosto?', resposta: 'Para o sol' },
    { emoji: '🧁', story: 'Na festa, as crianças comeram cupcakes com cobertura rosa.', pergunta: 'De que cor era a cobertura?', resposta: 'Rosa' },
    { emoji: '🐧', story: 'O pinguim escorregou na neve ❄️ e caiu rindo no chão.', pergunta: 'Onde o pinguim escorregou?', resposta: 'Na neve' },
];

function leituraQuestion(count) {
    const item = randomFrom(LEITURA_BANK);
    const n = Math.min(count, LEITURA_BANK.length);
    const toOpt = (it) => ({ id: 'leit-' + it.resposta, name: it.resposta, kind: 'text', label: it.resposta });
    const correct = toOpt(item);
    const wrongPool = LEITURA_BANK.filter((it) => it.resposta !== item.resposta);
    const options = shuffle([correct, ...sample(wrongPool, n - 1).map(toOpt)]);
    return {
        key: `leit:${item.resposta}`, correct, options,
        prompt: () => ({
            html: `<span class="glyph-hero">${item.emoji}</span>${item.story}<br><b>${item.pergunta}</b>`,
            speak: `${item.story} ${item.pergunta}`,
        }),
    };
}

/* ---------- completar a palavra (F2-24) ---------- */

// Banco de palavras simples (maiúsculas, sem acento pra simplificar o "achar a vogal").
// A dificuldade muda o tamanho da palavra, não a quantidade de opções (as vogais são
// sempre as 5, faz mais sentido do que variar 3/4/6 aqui).
const PALAVRA_BANK = [
    { word: 'LUA', emoji: '🌙' }, { word: 'OVO', emoji: '🥚' }, { word: 'UVA', emoji: '🍇' },
    { word: 'GATO', emoji: '🐱' }, { word: 'PATO', emoji: '🦆' }, { word: 'SAPO', emoji: '🐸' },
    { word: 'URSO', emoji: '🐻' }, { word: 'VACA', emoji: '🐮' }, { word: 'BOLA', emoji: '⚽' },
    { word: 'CASA', emoji: '🏠' }, { word: 'MESA', emoji: '🪑' }, { word: 'FLOR', emoji: '🌸' },
    { word: 'GALO', emoji: '🐓' }, { word: 'PEIXE', emoji: '🐟' }, { word: 'LIVRO', emoji: '📖' },
    { word: 'COELHO', emoji: '🐰' }, { word: 'ABELHA', emoji: '🐝' }, { word: 'BANANA', emoji: '🍌' },
    { word: 'PIPOCA', emoji: '🍿' }, { word: 'CAVALO', emoji: '🐴' }, { word: 'GALINHA', emoji: '🐔' },
    { word: 'MORANGO', emoji: '🍓' }, { word: 'FOGUETE', emoji: '🚀' }, { word: 'SORVETE', emoji: '🍦' },
    { word: 'CACHORRO', emoji: '🐶' },
];
const VOGAIS = ['A', 'E', 'I', 'O', 'U'];

function palavraPoolForDifficulty(difficulty) {
    const lvl = { facil: 0, medio: 1, dificil: 2 }[difficulty] || 0;
    const [min, max] = [[3, 5], [5, 7], [6, 99]][lvl];
    const pool = PALAVRA_BANK.filter((it) => it.word.length >= min && it.word.length <= max);
    return pool.length ? pool : PALAVRA_BANK;
}

function completarPalavraQuestion() {
    const item = randomFrom(palavraPoolForDifficulty(state.difficulty));
    const vowelIdx = [...item.word].reduce((acc, ch, i) => (VOGAIS.includes(ch) ? [...acc, i] : acc), []);
    const blankIdx = randomFrom(vowelIdx);
    const correctLetter = item.word[blankIdx];
    const letters = [...item.word].map((ch, i) => i === blankIdx
        ? `<span class="completar-blank">?</span>`
        : `<span class="completar-letter">${ch}</span>`).join('');

    const toOpt = (l) => ({ id: 'vogal-' + l, name: l, kind: 'char', glyph: l });
    const correct = toOpt(correctLetter);
    const options = shuffle(VOGAIS.map(toOpt));   // sempre as 5 vogais, não depende do nível

    return {
        key: `completar:${item.word}:${blankIdx}`, correct, options,
        prompt: () => ({
            html: `<span class="glyph-hero">${item.emoji}</span><span class="completar-word">${letters}</span>`,
            speak: item.word,   // "ouvir a palavra" (botão 🔊 já existente) fala a palavra inteira, como pista
        }),
    };
}

/* ---------- escolhe o jogo ---------- */

function buildQuestion(count) {
    if (state.category === 'ingles') return englishQuestion(count);
    if (state.category === 'matematica') return mathQuestion(count);
    if (state.category === 'numletras') return numLetrasQuestion(count);
    if (state.category === 'leitura') return leituraQuestion(count);
    if (state.category === 'completar') return completarPalavraQuestion();
    const cat = state.category === 'misturar'
        ? randomFrom(['formas', 'cores', 'animais', 'numletras'])
        : state.category;
    return classicQuestion(cat, count);
}
