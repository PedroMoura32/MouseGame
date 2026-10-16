/* ============================================================
   Menu: construção e seleção (F2-45: extraído de script.js)

   Script clássico, carregado depois de dom.js/content.js (usa "el",
   "state" e os bancos de configuração — CATEGORY_META, DIFFICULTIES,
   MODES, SUB_OPTIONS, COUNTS, DRAG_CATEGORIES). buildMenu() só é
   chamada de main.js, no fim do carregamento.
   ============================================================ */

'use strict';

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
    if (!cfg) return;

    const isMouse = state.category === 'mouse';
    el.subTitle.textContent = isMouse ? term(cfg.title) : cfg.title;
    el.subListen.dataset.say = isMouse ? term(cfg.say) : cfg.say;
    el.subListen.setAttribute('aria-label', 'Ouvir: ' + el.subTitle.textContent);
    el.subGrid.innerHTML = '';
    const items = isMouse && IS_TOUCH ? cfg.items.filter((it) => it.id !== 'rolar') : cfg.items;
    el.subGrid.className = 'choice-grid' + (items.length === 3 ? ' choice-grid--3' : '');
    items.forEach((it) => buildChoice(
        el.subGrid,
        { value: it.id, label: it.label, emoji: it.emoji, sub: isMouse ? term(it.sub) : it.sub },
        (v) => { state.sub[state.category] = v; refreshExtraPanel(); },
        it.id === state.sub[state.category]));
}

// Painel "extra": um segundo nível de escolha que só faz sentido dentro de uma
// categoria/sub específica — hoje são dois casos (F2-10 "Qual tabuada?" dentro
// de Matemática > Multiplicar, e F2-25 "Quais caracteres?" dentro de Treino do
// mouse > Traçar). Só reconstrói o grid quando troca de caso (como refreshKindPanels),
// porque os itens de cada caso são diferentes.
let extraKind = null;
function refreshExtraPanel() {
    const isTabuada = state.category === 'matematica' && state.sub.matematica === 'multiplicar';
    const isTraceSet = state.category === 'mouse' && state.sub.mouse === 'tracar';
    el.panelExtra.hidden = !(isTabuada || isTraceSet);
    if (!isTabuada && !isTraceSet) { extraKind = null; return; }

    const kind = isTabuada ? 'tabuada' : 'traceset';
    if (kind === extraKind) return;
    extraKind = kind;
    el.extraGrid.innerHTML = '';

    if (isTabuada) {
        el.extraTitle.textContent = 'Qual tabuada?';
        el.extraListen.dataset.say = 'Escolha uma tabuada para treinar, ou todas misturadas';
        el.extraListen.setAttribute('aria-label', 'Ouvir: qual tabuada');
        const items = [{ id: 'todas', label: 'Todas', sub: 'misturadas' }]
            .concat(Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1), label: String(i + 1), sub: 'tabuada' })));
        items.forEach((it) => buildChoice(el.extraGrid,
            { value: it.id, label: it.label, sub: it.sub },
            (v) => { state.table = v; }, it.id === state.table));
    } else {
        el.extraTitle.textContent = 'Quais caracteres?';
        el.extraListen.dataset.say = 'Escolha quais letras ou números entram no traçar';
        el.extraListen.setAttribute('aria-label', 'Ouvir: quais caracteres');
        TRACE_SET_OPTIONS.forEach((it) => buildChoice(el.extraGrid,
            { value: it.id, label: it.label, emoji: it.emoji, sub: it.sub },
            (v) => { state.traceSet = v; }, it.id === state.traceSet));
    }
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

/* ---------- Wizard de etapas (F2-52) ---------- */
let configSteps = [];
let configStepIdx = 0;
const stepEls = {
    sub:    document.querySelector('.config-step[data-step="sub"]'),
    level:  document.querySelector('.config-step[data-step="level"]'),
    rounds: document.querySelector('.config-step[data-step="rounds"]'),
};

function buildConfigSteps() {
    configSteps = [];
    if (SUB_OPTIONS[state.category]) configSteps.push('sub');
    configSteps.push('level', 'rounds');
    configStepIdx = 0;

    el.stepDots.innerHTML = configSteps
        .map((_, i) => `<span class="step-dot${i === 0 ? ' is-active' : ''}"></span>`)
        .join('');
}

function showConfigStep() {
    const step = configSteps[configStepIdx];
    Object.values(stepEls).forEach((s) => { s.hidden = true; });
    stepEls[step].hidden = false;

    el.stepDots.querySelectorAll('.step-dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === configStepIdx);
        d.classList.toggle('is-done', i < configStepIdx);
    });

    const isLast = configStepIdx === configSteps.length - 1;
    el.nextStepBtn.hidden = isLast;
    el.startBtn.hidden = !isLast;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextConfigStep() {
    if (configStepIdx < configSteps.length - 1) {
        configStepIdx++;
        showConfigStep();
    }
}

function prevConfigStep() {
    if (configStepIdx > 0) {
        configStepIdx--;
        showConfigStep();
        return true;
    }
    return false;
}

el.nextStepBtn.addEventListener('click', nextConfigStep);

function buildMenu() {
    CATEGORY_META.forEach((c, i) => {
        const label = c.id === 'mouse' ? term(c.label) : c.label;
        const sub   = c.id === 'mouse' && IS_TOUCH ? 'memória, traçar, alvos…' : c.sub;
        const title = c.id === 'mouse' ? term(c.gameTitle) : c.gameTitle;
        const emoji = c.id === 'mouse' && IS_TOUCH ? '🤹' : c.emoji;
        buildChoice(
            el.categoryGrid,
            { value: c.id, label, emoji, sub },
            (v) => {
                state.category = v;
                if (v === 'pintura') { openDrawScreen(); return; }
                if (v === 'mimica') { openMimicaScreen(); return; }
                refreshMenuForCategory();
                buildConfigSteps();
                showConfigStep();
                el.configTitle.textContent = `${emoji} ${title}`;
                showScreen('config');
            }, i === 0);
    });

    DIFFICULTIES.forEach((d, i) => buildChoice(
        el.difficultyGrid,
        { value: d.id, label: d.label, emoji: d.emoji, sub: d.options + ' opções' },
        (v) => { state.difficulty = v; }, i === 0));

    MODES.forEach((m, i) => buildChoice(
        el.modeGrid,
        { value: m.id, label: term(m.label), emoji: m.emoji, sub: term(m.sub) },
        (v) => { state.mode = v; }, i === 0));

    // O painel "extra" (tabuada / F2-25 caracteres do Traçar) agora é montado sob
    // demanda em refreshExtraPanel(), porque são dois conjuntos de itens diferentes.

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
