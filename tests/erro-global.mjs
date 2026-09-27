/* Regressão do handler global de erro (F2-43, achado da auditoria de 26/09/2026):
   um erro não tratado deve mostrar uma tela amigável, nunca travar em branco. */

import assert from 'node:assert/strict';
import { withBrowser } from './lib/harness.mjs';

await withBrowser(async (b) => {
    await b.goto();
    await b.criarPerfil('Ana');
    assert.equal(await b.ev(`document.body.textContent.includes('Algo deu errado')`), false, 'Fallback não deveria aparecer em uso normal');

    // erro síncrono não tratado
    await b.ev(`setTimeout(() => { throw new Error('erro de teste') }, 50)`);
    await b.sleep(400);
    assert.equal(await b.ev(`document.body.textContent.includes('Algo deu errado')`), true, 'Fallback deveria aparecer após um erro não tratado');
});

await withBrowser(async (b) => {
    await b.goto();

    // promise rejeitada sem .catch
    await b.ev(`(() => { Promise.reject(new Error('rejeicao de teste')); return true; })()`);
    await b.sleep(400);
    assert.equal(await b.ev(`document.body.textContent.includes('Algo deu errado')`), true, 'Fallback deveria aparecer após uma promise rejeitada sem catch');

    // o botão "Recomeçar" recarrega a página de verdade
    await b.ev(`window.__antesDoClique = true`);
    const pos = await b.ev(`(() => {
        const btn = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Recomeçar'));
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`);
    await b.mouse('mouseMoved', pos.x, pos.y);
    await b.mouse('mousePressed', pos.x, pos.y);
    await b.mouse('mouseReleased', pos.x, pos.y);
    await b.sleep(1200);
    assert.equal(await b.ev(`typeof window.__antesDoClique === 'undefined'`), true, 'A variável de antes deveria ter sumido após um reload de verdade');
});

console.log('OK — erro-global');
