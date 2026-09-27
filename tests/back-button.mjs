/* Regressão do botão voltar do navegador/Android (F2-41): apertar voltar em qualquer
   tela deve navegar DENTRO do app, igual ao botão visível de cada tela, e só sair do
   app de verdade quando já está na tela de perfis (a raiz). */

import assert from 'node:assert/strict';
import { withBrowser } from './lib/harness.mjs';

const tela = (b) => b.ev(`document.querySelector('.screen.is-active').id`);
const voltar = async (b) => { await b.ev(`history.back()`); await b.sleep(500); };

await withBrowser(async (b) => {
    await b.goto();
    await b.criarPerfil('Ana');
    assert.equal(await tela(b), 'screen-menu');

    // config -> voltar -> menu
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Formas')).click()`);
    await b.sleep(200);
    assert.equal(await tela(b), 'screen-config');
    await voltar(b);
    assert.equal(await tela(b), 'screen-menu', 'voltar na config deveria cair no menu');

    // jogo em andamento -> voltar -> resultado (igual ao botão Encerrar)
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Formas')).click()`);
    await b.sleep(150);
    await b.click('#start-btn'); await b.sleep(700);
    assert.equal(await tela(b), 'screen-game');
    await voltar(b);
    assert.equal(await tela(b), 'screen-results', 'voltar no jogo deveria cair no resultado');

    // resultado -> voltar -> menu
    await voltar(b);
    assert.equal(await tela(b), 'screen-menu', 'voltar no resultado deveria cair no menu');

    // menu -> voltar -> perfis
    await voltar(b);
    assert.equal(await tela(b), 'screen-profiles', 'voltar no menu deveria cair nos perfis');
});

await withBrowser(async (b) => {
    await b.goto();
    await b.criarPerfil('Ana');

    // pintura -> voltar -> menu
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Pintura')).click()`);
    await b.sleep(300);
    await voltar(b);
    assert.equal(await tela(b), 'screen-menu', 'voltar na pintura deveria cair no menu');

    // mímica -> voltar -> menu
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Mímica')).click()`);
    await b.sleep(300);
    await voltar(b);
    assert.equal(await tela(b), 'screen-menu', 'voltar na mímica deveria cair no menu');

    // painel dos pais -> voltar -> perfis
    await b.ev(`showScreen('profiles'); renderProfiles();`); await b.sleep(100);
    await b.click('#parent-panel-link'); await b.sleep(200);
    await b.ev(`(() => {
        const texto = document.querySelector('#parent-gate-question').textContent;
        const m = texto.match(/(\\d+) × (\\d+)/);
        document.querySelector('#parent-gate-input').value = String(Number(m[1]) * Number(m[2]));
        document.querySelector('#parent-gate-confirm').click();
    })()`);
    await b.sleep(300);
    assert.equal(await tela(b), 'screen-parent');
    await voltar(b);
    assert.equal(await tela(b), 'screen-profiles', 'voltar no painel dos pais deveria cair nos perfis');

    assert.deepEqual(b.consoleErrors, []);
});

console.log('OK — back-button');
