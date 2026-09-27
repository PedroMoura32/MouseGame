/* ============================================================
   Conquistas (F2-15) e tela de resultado (F2-45: extraído de script.js)

   Script clássico, carregado depois de profiles.js (usa dateKey/
   saveProfiles/profiles/updateProfileBar de lá, além de state/el/
   showScreen/cancelPending/stopSpeech/burstConfetti de outros arquivos
   já carregados antes) — tudo referenciado só dentro de função, nunca
   no nível superior, então a ordem exata não é crítica, mas faz sentido
   lógico vir logo depois de profiles.js.
   ============================================================ */

'use strict';

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
