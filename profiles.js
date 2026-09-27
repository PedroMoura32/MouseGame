/* ============================================================
   Perfis, tempo de jogo e painel dos pais (F2-45: extraído de script.js)

   Script clássico, carregado depois de script.js (usa "el", "state",
   "showScreen", "ACHIEVEMENTS", "CATEGORY_META" de lá, e "AVATARS" de
   content.js, "randInt"/"randRange" de utils.js) e antes de main.js (que
   chama funções daqui na inicialização).
   ============================================================ */

'use strict';

/* -----------------------------------------------------------
   13) PERFIS (localStorage)
----------------------------------------------------------- */

const STORE_KEY = 'mousegame.profiles.v1';
const CUR_KEY = 'mousegame.current.v1';

// Valida que o dado salvo é mesmo um array antes de confiar nele — um valor corrompido
// mas "truthy" (ex.: {} ou uma string) passaria pelo || [] antigo e derrubaria o app
// inteiro no primeiro .forEach/.filter/.map (achado da auditoria de 26/09/2026).
function loadProfiles() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORE_KEY));
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
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

function updateProfileBar() {
    if (!state.profile) return;
    el.pbAvatar.textContent = state.profile.avatar;
    el.pbName.textContent = state.profile.name;
    el.pbStars.textContent = state.profile.stars || 0;
}

/* -----------------------------------------------------------
   13c) PAINEL DOS PAIS (F2-18)
   Tela separada do fluxo das crianças: por perfil, mostra tempo de
   jogo, estrelas por dia, desempenho por categoria (usando o
   histórico leve do F2-18/logHistory) e as conquistas do F2-15.
   Protegida por um desafio simples (conta que uma criança pequena
   dificilmente resolve), só pra não abrir sem querer — não é uma
   senha de verdade, o app não tem servidor pra guardar uma senha.
----------------------------------------------------------- */

function sumLastDays(days, n) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        sum += days[dateKey(d)] || 0;
    }
    return sum;
}

function formatMinutes(ms) {
    const totalMin = Math.round(ms / 60000);
    if (totalMin < 1) return '< 1 min';
    if (totalMin < 60) return `${totalMin} min`;
    const h = Math.floor(totalMin / 60), m = totalMin % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
}

function renderProfileCard(p) {
    const days = (p.playtime && p.playtime.days) || {};
    const history = p.history || [];

    // Desempenho por categoria: agregado do histórico (só existe daqui pra frente).
    const byCat = {};
    history.forEach((h) => {
        byCat[h.category] = byCat[h.category] || { answered: 0, correct: 0 };
        byCat[h.category].answered += h.answered;
        byCat[h.category].correct += h.correct;
    });
    const catRows = Object.keys(byCat).map((catId) => {
        const meta = CATEGORY_META.find((c) => c.id === catId);
        const stats = byCat[catId];
        const pct = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
        return { label: meta ? `${meta.emoji} ${meta.label}` : catId, pct };
    }).sort((a, b) => a.pct - b.pct); // pior desempenho primeiro — onde ela precisa de mais atenção

    // Estrelas por dia, últimos 14 dias (gráfico simples de barras).
    const starsByDay = {};
    history.forEach((h) => { starsByDay[h.date] = (starsByDay[h.date] || 0) + h.stars; });
    const last14 = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (13 - i));
        const key = dateKey(d);
        return { key, stars: starsByDay[key] || 0 };
    });
    const maxStars = Math.max(1, ...last14.map((d) => d.stars));

    const achRows = ACHIEVEMENTS.map((a) => ({ ...a, unlocked: (p.achievements || []).includes(a.id) }));

    const card = document.createElement('div');
    card.className = 'parent-card';
    // Achado da auditoria de 26/09/2026: p.name/p.avatar são dados do perfil (digitados
    // pela própria pessoa), nunca interpolados direto em innerHTML — só via textContent,
    // igual ao resto do app (renderProfiles). O restante do template usa só dado do
    // próprio código (rótulos de categoria, conquistas, números calculados), sem risco.
    card.innerHTML = `
        <div class="parent-card-head">
            <span class="parent-card-avatar"></span>
            <span class="parent-card-name"></span>
            <span class="parent-card-stars"></span>
        </div>
        <div class="parent-section">
            <h3>Tempo de jogo</h3>
            <div class="parent-playtime">
                <span>Hoje: <b>${formatMinutes(days[todayKey()] || 0)}</b></span>
                <span>Últimos 7 dias: <b>${formatMinutes(sumLastDays(days, 7))}</b></span>
                <span>Total: <b>${formatMinutes(Object.values(days).reduce((s, v) => s + v, 0))}</b></span>
            </div>
        </div>
        <div class="parent-section">
            <h3>Estrelas nos últimos 14 dias</h3>
            <div class="parent-chart">
                ${last14.map((d) => `<div class="parent-bar" style="height:${Math.max(4, Math.round((d.stars / maxStars) * 100))}%" title="${d.key}: ${d.stars} ⭐"></div>`).join('')}
            </div>
        </div>
        <div class="parent-section">
            <h3>Desempenho por categoria</h3>
            ${catRows.length === 0
                ? '<p class="parent-empty">Ainda não há dados suficientes — jogue mais um pouco pra ver o desempenho por categoria.</p>'
                : catRows.map((c) => `
                    <div class="parent-cat-row">
                        <span class="parent-cat-label">${c.label}</span>
                        <div class="parent-cat-bar"><div class="parent-cat-fill" style="width:${c.pct}%"></div></div>
                        <span class="parent-cat-pct">${c.pct}%</span>
                    </div>`).join('')}
        </div>
        <div class="parent-section">
            <h3>Conquistas</h3>
            <div class="parent-achievements">
                ${achRows.map((a) => `<span class="parent-ach${a.unlocked ? ' is-unlocked' : ''}">${a.unlocked ? a.emoji : '🔒'} ${a.label}</span>`).join('')}
            </div>
        </div>
    `;
    card.querySelector('.parent-card-avatar').textContent = p.avatar;
    card.querySelector('.parent-card-name').textContent = p.name;
    card.querySelector('.parent-card-stars').textContent = `⭐ ${p.stars || 0}`;
    return card;
}

function renderParentDashboard() {
    el.parentDashboard.innerHTML = '';
    if (profiles.length === 0) {
        el.parentDashboard.innerHTML = '<p class="parent-empty">Nenhuma jogadora cadastrada ainda.</p>';
        return;
    }
    profiles.forEach((p) => el.parentDashboard.appendChild(renderProfileCard(p)));
}

// Desafio simples (não é senha de verdade — o app não tem servidor pra guardar uma):
// uma multiplicação que uma criança pequena dificilmente resolve de cabeça. Uma vez
// acertado, não pede de novo nesta mesma sessão (evita repetir a cada clique).
let parentUnlockedThisSession = false;
let parentGateAnswer = 0;

function newParentChallenge() {
    const a = randRange(6, 9), b = randRange(6, 9);
    parentGateAnswer = a * b;
    el.parentGateQuestion.textContent = `Quanto é ${a} × ${b}?`;
}

function openParentGate() {
    if (parentUnlockedThisSession) { openParentDashboard(); return; }
    newParentChallenge();
    el.parentGateInput.value = '';
    el.parentGateError.hidden = true;
    el.parentGate.hidden = false;
    el.parentGateInput.focus();
}

function checkParentGate() {
    if (Number(el.parentGateInput.value) === parentGateAnswer) {
        parentUnlockedThisSession = true;
        el.parentGate.hidden = true;
        openParentDashboard();
    } else {
        el.parentGateError.hidden = false;
        newParentChallenge();   // desafio novo, pra não dar pra "adivinhar" repetindo
        el.parentGateInput.value = '';
        el.parentGateInput.focus();
    }
}

function openParentDashboard() {
    showScreen('parent');
    renderParentDashboard();
}

el.parentPanelLink.addEventListener('click', openParentGate);
el.parentGateConfirm.addEventListener('click', checkParentGate);
el.parentGateInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkParentGate(); });
el.parentGateCancel.addEventListener('click', () => { el.parentGate.hidden = true; });
el.parentBackBtn.addEventListener('click', () => showScreen('profiles'));
