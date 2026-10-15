/* Minijogo "Traçar" (F2-25, Treino do mouse): simula um traçado de verdade com
   eventos de ponteiro reais (não só clique) sobre o caminho-guia renderizado,
   cobrindo os dois lados da regra:
   1) seguir certinho o traço (mesmo que à mão livre/com densificação) completa
      o caractere e avança de rodada
   2) se afastar de propósito do traço dispara o aviso de erro (reseta aquele
      traço, sem perder a rodada inteira) */

import assert from 'node:assert/strict';
import { withBrowser } from './lib/harness.mjs';

// Espera até expr (uma condição avaliada na página) ficar truthy, verificando
// de tempos em tempos — evita sleep fixo "no chute" (o avanço de rodada do
// treino do mouse tem um delay de ~1,8s; esperar mais que isso sempre, ou
// menos que isso às vezes, dá teste lento ou instável).
async function waitFor(b, expr, timeoutMs = 3000) {
    const inicio = Date.now();
    while (Date.now() - inicio < timeoutMs) {
        if (await b.ev(expr)) return true;
        await b.sleep(100);
    }
    return false;
}

// Acha o traço ATUALMENTE ativo (o primeiro ainda não concluído — os já
// concluídos ficam com dashoffset '0'; igual ou mais de um caractere pode ter
// vários traços, um de cada vez, na ordem certa) e devolve seus pontos em
// pixels de tela, já absolutos.
const GET_ACTIVE_STROKE = `
(() => {
    const field = document.querySelector('#playfield');
    const rect = field.getBoundingClientRect();
    const fills = [...document.querySelectorAll('path.mg-tracar-fill')];
    const ativo = fills.find((p) => p.style.strokeDashoffset !== '0');
    if (!ativo) return null;
    const nums = ativo.getAttribute('d').match(/-?\\d+(\\.\\d+)?/g).map(Number);
    const pts = [];
    for (let i = 0; i < nums.length; i += 2) pts.push({ x: nums[i] + rect.left, y: nums[i + 1] + rect.top });
    return pts;
})()
`;

async function dispatchDrag(b, points) {
    const pid = 77;
    const down = points[0];
    await b.ev(`document.elementFromPoint(${down.x}, ${down.y})
        .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: ${down.x}, clientY: ${down.y}, pointerId: ${pid} }))`);
    for (const p of points.slice(1)) {
        await b.ev(`document.querySelector('.mg-tracar-surface').dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: ${p.x}, clientY: ${p.y}, pointerId: ${pid} }))`);
        await b.sleep(15);
    }
    const last = points[points.length - 1];
    await b.ev(`document.querySelector('.mg-tracar-surface').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: ${last.x}, clientY: ${last.y}, pointerId: ${pid} }))`);
}

// Pontos esparsos (os vértices do traço) viram um trajeto mais denso, pra
// simular um dedo arrastando de verdade (não "teleportando" entre vértices).
function densify(pts, stepPx = 6) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], c = pts[i];
        const dist = Math.hypot(c.x - a.x, c.y - a.y);
        const steps = Math.max(1, Math.round(dist / stepPx));
        for (let s = 1; s <= steps; s++) out.push({ x: a.x + (c.x - a.x) * s / steps, y: a.y + (c.y - a.y) * s / steps });
    }
    return out;
}

await withBrowser(async (b) => {
    await b.goto();
    await b.criarPerfil('Ana');
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Treino')).click()`);
    await b.sleep(150);
    await b.ev(`[...document.querySelectorAll('#sub-grid .choice')].find(c=>c.textContent.includes('Traçar')).click()`);
    await b.ev(`[...document.querySelectorAll('#count-grid .choice')].find(c=>c.textContent.includes('5'))?.click()`);
    await b.click('#start-btn');
    await b.sleep(700);

    // 1) seguir o traço certo, um stroke de cada vez, até completar o caractere inteiro.
    const rodadaInicial = await b.ev(`document.querySelector('#q-current').textContent`);
    const charInicial = await b.ev(`document.querySelector('#prompt-text b')?.textContent`);
    for (let tentativa = 0; tentativa < 6; tentativa++) {
        const stroke = await b.ev(GET_ACTIVE_STROKE);
        if (!stroke) break;   // já não há mais stroke pendente (caractere completo)
        await dispatchDrag(b, densify(stroke));
        await b.sleep(200);
        if ((await b.ev(`document.querySelector('#prompt-text b')?.textContent`)) !== charInicial) break;
    }
    const avancou = await waitFor(b, `document.querySelector('#q-current').textContent !== ${JSON.stringify(rodadaInicial)}`);
    assert.ok(avancou, 'Seguir certinho o traço deveria completar o caractere e avançar de rodada');

    // 2) se afastar de propósito do traço (bem longe, num canto) dispara o erro.
    await waitFor(b, GET_ACTIVE_STROKE.replace(/^/, '!!'));   // espera a próxima rodada já ter desenhado seu traço
    const stroke2 = await b.ev(GET_ACTIVE_STROKE);
    const field = await b.ev(`(() => { const r = document.querySelector('#playfield').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
    const inicio = stroke2[0];
    const canto = { x: field.x + field.w * 0.03, y: field.y + field.h * 0.03 };
    await dispatchDrag(b, [inicio, canto]);
    await b.sleep(300);
    assert.match(await b.ev(`document.querySelector('#feedback').className`), /is-wrong/,
        'Afastar-se do traço deveria disparar o aviso de erro');

    assert.deepEqual(b.consoleErrors, [], 'Não deveria haver nenhum erro de console');
});

console.log('OK — tracar');
