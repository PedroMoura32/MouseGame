/* ============================================================
   Referências de DOM (F2-45: extraído de script.js)

   Script clássico, carregado logo após content.js/utils.js/state.js —
   antes de tudo que usa "$"/"screens"/"el". Só resolve seletores no HTML
   já carregado (os <script> ficam no fim do <body>, então o DOM já
   existe); sem nenhuma outra dependência.
   ============================================================ */

'use strict';

const $ = (sel) => document.querySelector(sel);

const screens = {
    profiles: $('#screen-profiles'),
    menu: $('#screen-menu'),
    config: $('#screen-config'),
    game: $('#screen-game'),
    draw: $('#screen-draw'),
    mimica: $('#screen-mimica'),
    results: $('#screen-results'),
    parent: $('#screen-parent'),
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
    appFooter: $('#app-footer'),
    // painel dos pais (F2-18)
    parentPanelLink: $('#parent-panel-link'),
    parentBackBtn: $('#parent-back-btn'),
    parentDashboard: $('#parent-dashboard'),
    parentGate: $('#parent-gate'),
    parentGateQuestion: $('#parent-gate-question'),
    parentGateInput: $('#parent-gate-input'),
    parentGateError: $('#parent-gate-error'),
    parentGateConfirm: $('#parent-gate-confirm'),
    parentGateCancel: $('#parent-gate-cancel'),
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
    drawSizes: $('#draw-sizes'),
    drawCanvas: $('#draw-canvas'),
    drawClearBtn: $('#draw-clear-btn'),
    drawExitBtn: $('#draw-exit-btn'),
    // mímica (F2-34)
    mimicaEmoji: $('#mimica-emoji'),
    mimicaWord: $('#mimica-word'),
    mimicaNextBtn: $('#mimica-next-btn'),
    mimicaExitBtn: $('#mimica-exit-btn'),
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
    repeatSlowBtn: $('#repeat-slow-btn'),
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
