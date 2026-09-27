/* Regressão dos achados de segurança da auditoria de 26/09/2026 (F2-01/F2-42):
   - um nome de perfil com payload de injeção nunca deve executar, em lugar nenhum
   - localStorage corrompido nunca deve travar o app inteiro
   Ver Kanban.md (F2-42) para o contexto completo. */

import assert from 'node:assert/strict';
import { withBrowser } from './lib/harness.mjs';

const PAYLOAD = '<img src=x onerror=window.__pwned=true>';

await withBrowser(async (b) => {
    await b.goto();

    // Nome de perfil com payload nunca deve executar, nem na lista nem no painel dos pais
    await b.criarPerfil(PAYLOAD);
    await b.ev(`showScreen('profiles'); renderProfiles();`);
    assert.equal(await b.ev(`document.querySelector('.pc-name').textContent`), PAYLOAD, 'Nome deveria aparecer como texto puro na lista de perfis');
    assert.equal(await b.ev(`!!window.__pwned`), false, 'Payload não deveria ter executado ao renderizar a lista de perfis');

    await b.click('#parent-panel-link'); await b.sleep(200);
    await b.ev(`(() => {
        const texto = document.querySelector('#parent-gate-question').textContent;
        const m = texto.match(/(\\d+) × (\\d+)/);
        document.querySelector('#parent-gate-input').value = String(Number(m[1]) * Number(m[2]));
        document.querySelector('#parent-gate-confirm').click();
    })()`);
    await b.sleep(300);
    assert.equal(await b.ev(`document.querySelector('.parent-card-name').textContent`), PAYLOAD, 'Nome deveria aparecer como texto puro no painel dos pais');
    assert.equal(await b.ev(`!!window.__pwned`), false, 'Payload não deveria ter executado ao renderizar o painel dos pais');
});

await withBrowser(async (b) => {
    await b.goto();

    // localStorage corrompido de 3 formas diferentes: nunca deve travar o app
    for (const valorCorrompido of ['{"oops":true}', '"so uma string"', '42']) {
        await b.ev(`localStorage.setItem('mousegame.profiles.v1', ${JSON.stringify(valorCorrompido)})`);
        await b.send('Page.reload', { ignoreCache: true });
        await b.sleep(1300);
        assert.equal(await b.ev(`Array.isArray(profiles)`), true, `profiles deveria ser array mesmo com storage = ${valorCorrompido}`);
        assert.equal(await b.ev(`profiles.length`), 0);
        assert.equal(await b.ev(`document.querySelector('.screen.is-active') ? document.querySelector('.screen.is-active').id : null`), 'screen-profiles');
    }

    // depois de tudo isso, o app ainda funciona normalmente
    await b.criarPerfil('Ana');
    assert.equal(await b.ev(`document.querySelector('.screen.is-active').id`), 'screen-menu');

    assert.deepEqual(b.consoleErrors, [], 'Nenhum erro de console esperado, mesmo com storage corrompido');
});

console.log('OK — seguranca');
