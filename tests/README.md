# Testes do Jogo dos Cliques

Testes de ponta a ponta, rodando o app de verdade num Chrome headless (via
CDP puro — não precisa instalar Playwright/Puppeteer, só o Node e o próprio
Chrome já instalados na máquina). Não fazem parte do site publicado; servem
só pra rodar localmente antes de publicar uma mudança.

## Como rodar

```
node tests/run-all.mjs        # todos de uma vez
node tests/regressao-geral.mjs   # só um arquivo específico
```

Cada teste sobe seu próprio Chrome com um perfil novo (localStorage limpo),
então pode rodar isolado sem afetar seu navegador de verdade.

Se o Chrome não estiver no caminho padrão do Windows
(`C:\Program Files\Google\Chrome\Application\chrome.exe`), defina antes:

```
set CHROME_PATH=C:\caminho\pro\chrome.exe
node tests/run-all.mjs
```

## O que existe hoje

- `regressao-geral.mjs` — passa por um pouco de cada jogo principal
  (Formas, Matemática, Números e Letras, Inglês, Treino do mouse, revisão,
  pintura, troca de perfil). Roda depois de QUALQUER mudança, é a rede de
  segurança "não quebrei o resto".
- `seguranca.mjs` — os dois achados críticos da auditoria de 26/09/2026
  (F2-42): nome de perfil com payload de injeção nunca deve executar;
  localStorage corrompido nunca deve travar o app.
- `erro-global.mjs` — o handler de erro (F2-43) mostra a tela amigável de
  "Recomeçar" em vez de travar em branco, e não aparece durante uso normal.
- `back-button.mjs` — o botão voltar do navegador/Android (F2-41) navega
  dentro do app em vez de sair da página.
- `lib/harness.mjs` — o driver reaproveitado por todos os testes acima
  (sobe o Chrome, conecta via CDP, dá acesso a `ev`, `click`, `responder`,
  `goto`, `criarPerfil`, etc.). Novos testes começam importando daqui.

## Escrevendo um teste novo

```js
import assert from 'node:assert/strict';
import { withBrowser } from './lib/harness.mjs';

await withBrowser(async (b) => {
    await b.goto();
    await b.criarPerfil('Ana');
    // ... clicar, ev(), assert.equal(...) ...
});

console.log('OK — nome-do-teste');
```

`b.responder(true/false)` já espera o "suspense" de ~1.1s do jogo antes de
ler o resultado — usar isso em vez de `sleep` fixo evita o erro mais comum
ao escrever um teste aqui (ler o estado rápido demais, antes da resposta
ser processada de verdade).

## O que ainda não está coberto

Cada funcionalidade nova (jogos, minijogos, painel dos pais, etc.) foi
testada manualmente durante o desenvolvimento (ver Kanban.md, nas notas de
cada cartão em "Concluído"), mas nem tudo virou teste versionado aqui ainda
— só os itens acima, que eram os mais críticos/frágeis. Ao mexer numa área
sem teste, vale considerar escrever um novo arquivo aqui primeiro.
