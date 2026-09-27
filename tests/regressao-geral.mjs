/* Regressão ampla: cobre um pouco de cada jogo principal, pra pegar quebras óbvias
   depois de qualquer mudança no script.js/minigames.js/styles.css. Não substitui um
   teste dedicado de uma feature nova — é a rede de segurança "não quebrei o resto". */

import assert from 'node:assert/strict';
import { withBrowser } from './lib/harness.mjs';

await withBrowser(async (b) => {
    await b.goto();
    await b.criarPerfil('Ana');

    // Formas (clássico, clicar): 5 perguntas até o resultado, 5 estrelas
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Formas')).click()`);
    await b.sleep(150);
    await b.ev(`[...document.querySelectorAll('#count-grid .choice')].find(c=>c.textContent.includes('5'))?.click()`);
    await b.click('#start-btn'); await b.sleep(700);
    for (let i = 0; i < 5; i++) await b.responder(true);
    await b.sleep(1200);
    assert.equal(await b.ev(`document.querySelector('.screen.is-active').id`), 'screen-results', 'Formas deveria terminar no resultado');
    assert.equal(await b.ev(`state.starsEarned`), 5, 'Formas fácil: 5 acertos deveriam valer 5 estrelas');
    await b.click('#menu-btn'); await b.sleep(300);

    // Matemática > Problemas
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Matemática')).click()`);
    await b.sleep(150);
    await b.ev(`[...document.querySelectorAll('#sub-grid .choice')].find(c=>c.textContent.includes('Problemas')).click()`);
    await b.click('#start-btn'); await b.sleep(700);
    const promptProblema = await b.ev(`document.querySelector('#prompt-text').textContent`);
    assert.ok(promptProblema.length > 20, 'Problema de matemática deveria ter um enunciado com historinha');
    await b.click('#quit-btn'); await b.sleep(1500);
    assert.equal(await b.ev(`document.querySelector('.screen.is-active').id`), 'screen-results');
    await b.click('#menu-btn'); await b.sleep(300);

    // Números e Letras > Contar
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Números')).click()`);
    await b.sleep(150);
    await b.ev(`[...document.querySelectorAll('#sub-grid .choice')].find(c=>c.textContent.includes('Contar')).click()`);
    await b.click('#start-btn'); await b.sleep(700);
    assert.match(await b.ev(`document.querySelector('#prompt-text').textContent`), /Quantos?|Quantas?/, 'Contar deveria perguntar "quantos/quantas"');
    await b.click('#quit-btn'); await b.sleep(1500);
    await b.click('#menu-btn'); await b.sleep(300);

    // Inglês: sempre 3 opções por padrão (fácil)
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Inglês')).click()`);
    await b.sleep(150);
    await b.click('#start-btn'); await b.sleep(700);
    assert.equal(await b.ev(`document.querySelectorAll('#options .option').length`), 3);
    await b.click('#quit-btn'); await b.sleep(1500);
    await b.click('#menu-btn'); await b.sleep(300);

    // Treino do mouse > Balões: playfield visível, não #options
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Treino')).click()`);
    await b.sleep(150);
    await b.ev(`[...document.querySelectorAll('#sub-grid .choice')].find(c=>c.textContent.includes('Balões')).click()`);
    await b.click('#start-btn'); await b.sleep(900);
    assert.equal(await b.ev(`!document.querySelector('#playfield').hidden`), true, 'Treino do mouse deveria mostrar o #playfield');
    await b.click('#quit-btn'); await b.sleep(1500);
    await b.click('#menu-btn'); await b.sleep(300);

    // Revisão (F2-16): erra 1 de propósito, revisa, acaba em "Revisão concluída!"
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Formas')).click()`);
    await b.sleep(150);
    await b.ev(`[...document.querySelectorAll('#count-grid .choice')].find(c=>c.textContent.includes('5'))?.click()`);
    await b.click('#start-btn'); await b.sleep(700);
    // errar não avança a pergunta (é "tenta de novo"): o próximo acerto fecha a MESMA
    // pergunta que errou, então precisa de 1 acerto a mais que o total de perguntas.
    await b.responder(false);
    for (let i = 0; i < 5; i++) await b.responder(true);
    await b.sleep(1200);
    assert.equal(await b.ev(`!document.querySelector('#review-btn').hidden`), true, 'Botão de revisão deveria aparecer depois de errar');
    await b.click('#review-btn'); await b.sleep(700);
    await b.responder(true);
    await b.sleep(2200);
    assert.equal(await b.ev(`document.querySelector('#results-title').textContent`), 'Revisão concluída!');
    await b.click('#menu-btn'); await b.sleep(300);

    // Pintura Livre: vai direto pra tela de desenho, "Sair" volta pro menu
    await b.ev(`[...document.querySelectorAll('#category-grid .choice')].find(c=>c.textContent.includes('Pintura')).click()`);
    await b.sleep(300);
    assert.equal(await b.ev(`document.querySelector('.screen.is-active').id`), 'screen-draw');
    await b.click('#draw-exit-btn'); await b.sleep(300);
    assert.equal(await b.ev(`document.querySelector('.screen.is-active').id`), 'screen-menu');

    // Trocar de perfil volta pra tela de perfis
    await b.click('#switch-profile'); await b.sleep(300);
    assert.equal(await b.ev(`document.querySelector('.screen.is-active').id`), 'screen-profiles');

    assert.deepEqual(b.consoleErrors, [], 'Não deveria haver nenhum erro de console durante toda a regressão');
});

console.log('OK — regressao-geral');
