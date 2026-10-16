/* ============================================================
   Dedinho Esperto
   Jogo educativo para crianças: formas, cores, animais, inglês,
   matemática, leitura e coordenação motora.

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
   6) NARRAÇÃO (só sob demanda) + SONS — movido para audio.js (F2-45)
----------------------------------------------------------- */

/* -----------------------------------------------------------
   7) RENDERIZAÇÃO DOS ITENS — movido para render.js (F2-45)
----------------------------------------------------------- */

/* -----------------------------------------------------------
   8) PERGUNTAS
   Bancos e funções de montagem de pergunta (optionCount .. buildQuestion)
   movidos para questions.js (F2-45) — o que fica aqui é só a orquestração
   que efetivamente desenha a pergunta na tela.
----------------------------------------------------------- */

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
    // F2-49: no touch, exclui "rolar" (rodinha do mouse não existe no celular)
    const keys = Object.keys(MINIGAMES).filter((k) => !(IS_TOUCH && k === 'rolar'));
    const chosen = state.sub.mouse;
    const key = chosen === 'misturar' ? randomFrom(keys.filter((k) => k !== lastKey)) : chosen;
    lastKey = key;

    const api = {
        field: el.playfield,
        level: Math.max(0, DIFFICULTIES.findIndex((d) => d.id === state.difficulty)),
        size: () => ({ w: el.playfield.clientWidth, h: el.playfield.clientHeight }),
        hint: (text) => { el.feedback.textContent = text; el.feedback.className = 'feedback is-checking'; },
        // F2-25: "opts.playSound" deixa um minijogo tocar um som próprio (ex.: o "Traçar"
        // usa um som mais suave, já que ali é comum sair do traço várias vezes seguidas na
        // mesma letra) em vez do som de erro padrão — sem opts, comportamento idêntico a antes.
        mistake: (text, opts) => {
            state.firstTry = false;
            if (opts && opts.playSound) opts.playSound(); else playSound(el.wrongSound);
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
   10b) CONQUISTAS (F2-15) — movido para results.js (F2-45)
----------------------------------------------------------- */

/* -----------------------------------------------------------
   11) RESULTADO — movido para results.js (F2-45)
----------------------------------------------------------- */

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
   14) MENU: construção e seleção — movido para menu.js (F2-45)
----------------------------------------------------------- */

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
// F2-45: referência indireta — showResults agora mora em results.js, carregado depois deste arquivo.
el.quitBtn.addEventListener('click', () => showResults());
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
el.configBackBtn.addEventListener('click', () => { if (!prevConfigStep()) showScreen('menu'); });

// F2-45: idem — createProfile só existe depois que profiles.js carrega.
el.createConfirm.addEventListener('click', () => createProfile());
el.createCancel.addEventListener('click', () => { el.profileCreate.hidden = true; });
el.newName.addEventListener('keydown', (e) => { if (e.key === 'Enter') createProfile(); });

el.appFooter.textContent = `© ${new Date().getFullYear()} Pedro Moura · v${APP_VERSION}`;

/* -----------------------------------------------------------
   16a2) MODO NOTURNO (F2-22) — movido para theme.js (F2-45)
----------------------------------------------------------- */

/* -----------------------------------------------------------
   16b) APP INSTALÁVEL (PWA) — movido para pwa.js (F2-45)
----------------------------------------------------------- */

/* -----------------------------------------------------------
   17) INICIALIZAÇÃO
   Movido para main.js nesta etapa (F2-45) — precisa rodar depois de
   profiles.js (usa "profiles", "getCurrentId" etc.), carregado por
   último em index.html.
----------------------------------------------------------- */
