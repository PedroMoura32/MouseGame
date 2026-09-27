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

// F2-45: script.js está sendo dividido em arquivos por assunto (content.js,
// minigames.js, e outros que vêm em etapas seguintes — ver Kanban). São todos
// scripts clássicos carregados em sequência no index.html (não módulos ES: o
// jogo precisa continuar abrindo direto via file://, sem servidor, e o Chrome
// bloqueia "import" de módulo nesse protocolo por CORS). Cada arquivo é só uma
// fatia do mesmo escopo global de sempre — CONTENT, MINIGAMES etc. definidos
// em outro arquivo continuam acessíveis aqui normalmente.
//
// Bancos de conteúdo (CONTENT, CATEGORY_META, EN_VOCAB, MATH_OPS, AVATARS...)
// e os construtores de item (shapeItem/colorItem/animalItem) moraram aqui até
// esta etapa e agora estão em content.js.

// F4-04: versão exibida no rodapé da tela de perfis — bump manual a cada lançamento
// que valha a pena identificar (ajuda a saber qual build está rodando em suporte/depuração).
const APP_VERSION = '1.0.0';

/* -----------------------------------------------------------
   3) ESTADO — movido para state.js (F2-45)
----------------------------------------------------------- */

/* -----------------------------------------------------------
   4) DOM — movido para dom.js (F2-45)
----------------------------------------------------------- */

/* -----------------------------------------------------------
   5) UTILITÁRIOS
   randInt/randomFrom/randRange/shuffle/sample moraram aqui até esta etapa
   e agora estão em utils.js; updateScrollbarWidth/BACK_ACTION/showScreen/
   buildPrompt foram para screens.js.
----------------------------------------------------------- */

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
    el.repeatSlowBtn.hidden = state.category !== 'ingles'; // F2-35: só faz sentido no jogo de Inglês

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
    el.repeatSlowBtn.hidden = true; // F2-35: treino do mouse não é o jogo de Inglês
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

// F2-18: histórico leve de partidas, pra alimentar o painel dos pais (desempenho por
// categoria e evolução ao longo do tempo — antes só existia o total acumulado).
// Cap de 300 entradas pra não crescer sem limite no localStorage; guarda daqui pra frente
// (perfis já existentes só passam a ter histórico a partir da próxima partida).
const HISTORY_MAX = 300;
function logHistory(profile, entry) {
    profile.history = profile.history || [];
    profile.history.push(entry);
    if (profile.history.length > HISTORY_MAX) profile.history = profile.history.slice(-HISTORY_MAX);
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
        logHistory(state.profile, { date: todayKey(), category: state.category, difficulty: state.difficulty, answered, correct, stars });
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
   Movido para confetti.js nesta etapa (F2-45) — carregado depois deste
   arquivo em index.html, então "$" e "randomFrom" já existem quando roda.
----------------------------------------------------------- */

/* -----------------------------------------------------------
   12b) PINTURA LIVRE (F2-21) — movido para draw.js (F2-45)
----------------------------------------------------------- */

/* -----------------------------------------------------------
   12c) MÍMICA (F2-34) — movido para mimica.js (F2-45)
----------------------------------------------------------- */

/* -----------------------------------------------------------
   13) PERFIS (localStorage)
   Movido para profiles.js nesta etapa (F2-45) — perfis, tempo de jogo
   (13b) e painel dos pais (13c), carregado depois deste arquivo.
----------------------------------------------------------- */

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
            if (v === 'mimica') { openMimicaScreen(); return; }  // idem: vai direto pra tela de mímica
            refreshMenuForCategory();
            el.configTitle.textContent = `${c.emoji} ${c.gameTitle}`;
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
el.repeatSlowBtn.addEventListener('click', () => {
    if (state.question) speak(state.question.prompt(state.mode).speak, { slow: true });
});
el.resultsListen.addEventListener('click', () => speak(state.resultSpeech));
el.reviewBtn.addEventListener('click', startReview);
el.playAgainBtn.addEventListener('click', startGame);
el.menuBtn.addEventListener('click', () => showScreen('menu'));
el.switchProfile.addEventListener('click', () => { stopPlaytimeTracking(); renderProfiles(); showScreen('profiles'); });
// F2-45: referência indireta (arrow function), não direta — openAvatarSwitcher só existe
// depois que profiles.js carrega (este arquivo roda antes dele), e essa linha executa
// imediatamente; a arrow function só resolve o nome quando o clique realmente acontecer.
el.pbAvatar.addEventListener('click', () => openAvatarSwitcher());
el.avatarSwitcherClose.addEventListener('click', () => { el.avatarSwitcher.hidden = true; });
el.switcherAutoread.addEventListener('change', () => {
    if (!state.profile) return;
    state.profile.autoRead = el.switcherAutoread.checked;
    saveProfiles(profiles);
});
el.configBackBtn.addEventListener('click', () => showScreen('menu'));

// F2-45: idem — createProfile só existe depois que profiles.js carrega.
el.createConfirm.addEventListener('click', () => createProfile());
el.createCancel.addEventListener('click', () => { el.profileCreate.hidden = true; });
el.newName.addEventListener('keydown', (e) => { if (e.key === 'Enter') createProfile(); });

el.appFooter.textContent = `© ${new Date().getFullYear()} Pedro Moura · v${APP_VERSION}`;

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
   Movido para main.js nesta etapa (F2-45) — precisa rodar depois de
   profiles.js (usa "profiles", "getCurrentId" etc.), carregado por
   último em index.html.
----------------------------------------------------------- */
