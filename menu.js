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
