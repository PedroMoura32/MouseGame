/* ============================================================
   Harness de teste — Chrome headless via CDP puro (sem Playwright/
   Puppeteer instalado). Usado por todo arquivo em tests/*.mjs.

   Uso básico:
     import { withBrowser } from './lib/harness.mjs';
     await withBrowser(async (b) => {
         await b.goto();
         await b.click('.algum-seletor');
         const texto = await b.ev(`document.querySelector('h1').textContent`);
         assert.strictEqual(texto, 'esperado');
     });

   Cada teste sobe seu próprio Chrome (perfil novo, localStorage limpo),
   então os arquivos podem rodar em paralelo sem interferir um no outro
   (usam portas de depuração diferentes, calculadas a partir de um
   número base + um sorteio, pra evitar colisão).
   ============================================================ */

import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(HERE, '..', '..');
export const APP_URL = pathToFileURL(join(REPO_ROOT, 'index.html')).href;

// Windows: caminho padrão do Chrome instalado. Ajuste aqui se o seu for diferente,
// ou defina a variável de ambiente CHROME_PATH antes de rodar os testes.
const CHROME_PATH = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl(port) {
    for (let i = 0; i < 60; i++) {
        try {
            const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
            const page = list.find((t) => t.type === 'page');
            if (page) return page.webSocketDebuggerUrl;
        } catch (_) { /* Chrome ainda subindo */ }
        await sleep(250);
    }
    throw new Error('Chrome não respondeu a tempo na porta ' + port);
}

/**
 * Sobe um Chrome headless, conecta via CDP e devolve um objeto "b" com utilitários
 * pro teste, chamando fn(b). Sempre encerra o Chrome no final (sucesso ou falha).
 */
export async function withBrowser(fn, opts = {}) {
    const port = opts.port || (9500 + Math.floor(Math.random() * 400));
    const width = opts.width || 1366;
    const height = opts.height || 900;
    const shotsDir = opts.shotsDir || join(REPO_ROOT, 'tests', '.shots');

    const chrome = spawn(CHROME_PATH, [
        '--headless=new', `--remote-debugging-port=${port}`, '--no-first-run', '--disable-gpu',
        `--user-data-dir=${mkdtempSync(join(tmpdir(), 'mg-test-'))}`, 'about:blank',
    ], { stdio: 'ignore' });

    let ws;
    const consoleErrors = [];
    try {
        ws = new WebSocket(await getWsUrl(port));
        await new Promise((res, rej) => {
            ws.addEventListener('open', res);
            ws.addEventListener('error', rej);
        });

        let id = 0;
        const pending = new Map();
        ws.addEventListener('message', (m) => {
            const d = JSON.parse(m.data);
            if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
            if (d.method === 'Runtime.exceptionThrown') {
                consoleErrors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
            }
            if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
                consoleErrors.push(d.params.args.map((a) => a.value || a.description).join(' '));
            }
        });
        const send = (method, params = {}) => new Promise((res) => {
            const i = ++id;
            pending.set(i, res);
            ws.send(JSON.stringify({ id: i, method, params }));
        });
        const ev = async (expr) => {
            const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
            if (r.result?.exceptionDetails) {
                throw new Error('ev() falhou: ' + expr.slice(0, 200) + ' -> ' + JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
            }
            return r.result?.result?.value;
        };

        await send('Page.enable');
        await send('Runtime.enable');
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });

        const click = (sel) => ev(`document.querySelector(${JSON.stringify(sel)}).click()`);
        const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 });
        const setViewport = (w, h, mobile = false) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
        const setColorScheme = (scheme) => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
        const shot = async (name) => {
            mkdirSync(shotsDir, { recursive: true });
            const r = await send('Page.captureScreenshot', { format: 'png' });
            writeFileSync(join(shotsDir, name + '.png'), Buffer.from(r.result.data, 'base64'));
        };

        // Espera uma pergunta ser respondida de verdade (o app tem um "suspense" de
        // ~1.1s antes de validar) — clicar e só ler o estado logo em seguida é a fonte
        // nº 1 de teste falso-negativo neste projeto (documentado no histórico do time).
        const responder = async (certo) => {
            const antes = await ev(`state.answered`);
            const idx = await ev(`[...document.querySelectorAll('#options .option')].findIndex(o=>(o.getAttribute('aria-label')===state.question.correct.name)===${certo})`);
            await ev(`document.querySelectorAll('#options .option')[${idx}].click()`);
            for (let i = 0; i < 20; i++) {
                await sleep(150);
                const depois = await ev(`state.answered`);
                const t = await ev(`document.querySelector('.screen.is-active').id`);
                if (depois > antes || t !== 'screen-game') break;
            }
            for (let i = 0; i < 20; i++) {
                if (await ev(`document.querySelector('.screen.is-active').id`) !== 'screen-game') break;
                if (await ev(`document.querySelectorAll('#options .option.is-correct, #options .option.is-wrong').length === 0`)) break;
                await sleep(150);
            }
            await sleep(150);
        };

        const goto = async (url = APP_URL) => {
            await send('Page.navigate', { url });
            await sleep(900);
            await ev('localStorage.clear()').catch(() => {});
            await send('Page.navigate', { url });
            await sleep(1300);
        };

        const criarPerfil = async (nome = 'Ana') => {
            await click('.profile-card--add');
            await ev(`document.querySelector('#new-name').value = ${JSON.stringify(nome)}`);
            await click('#create-confirm');
            await sleep(400);
        };

        const b = { send, ev, click, mouse, shot, sleep, setViewport, setColorScheme, responder, goto, criarPerfil, consoleErrors, port };
        await fn(b);
    } finally {
        try { ws?.close(); } catch (_) {}
        try { chrome.kill(); } catch (_) {}
    }
}
