/* ============================================================
   Pintura Livre (F2-21, F2-30) — extraído de script.js (F2-45)

   Script clássico, carregado depois de script.js (usa "el", "screens" e
   "showScreen" de lá, e "randomFrom" de utils.js). Sem certo ou errado,
   só pra desenhar. Não passa pela tela de configuração (sem nível/
   quantidade — não faz sentido aqui).
   ============================================================ */

'use strict';

const DRAW_COLORS = ['#4a2f4a', '#e0559b', '#6fc3ee', '#ffd76a', '#b596ee', '#38d9a9', '#ff922b', '#ffffff'];
// F2-30: espessura do traço (px) e cor especial "glitter" (não é uma cor sólida, é um efeito)
const DRAW_SIZES = [4, 8, 14, 22];
const GLITTER = 'glitter';
const GLITTER_COLORS = ['#ffd76a', '#ff922b', '#e0559b', '#b596ee', '#6fc3ee', '#38d9a9', '#ffffff'];

let drawCtx = null;
let drawColor = DRAW_COLORS[0];
let drawSize = DRAW_SIZES[1];
let drawing = false;
let drawLast = null;

function drawLocalPoint(e) {
    const r = el.drawCanvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function resizeDrawCanvas() {
    // Sem isso, o canvas fica borrado/errado se o tamanho em CSS não bater com o buffer.
    const rect = el.drawCanvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    el.drawCanvas.width = rect.width;
    el.drawCanvas.height = rect.height;
    drawCtx = el.drawCanvas.getContext('2d');
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
}
window.addEventListener('resize', () => { if (screens.draw.classList.contains('is-active')) resizeDrawCanvas(); });

function renderDrawPalette() {
    el.drawPalette.innerHTML = '';
    const selectSwatch = (c, b) => {
        drawColor = c;
        el.drawPalette.querySelectorAll('.draw-swatch').forEach((s) => s.classList.remove('is-selected'));
        b.classList.add('is-selected');
    };
    DRAW_COLORS.forEach((c, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'draw-swatch' + (i === 0 ? ' is-selected' : '');
        b.style.background = c;
        b.setAttribute('aria-label', 'Cor ' + (i + 1));
        b.addEventListener('click', () => selectSwatch(c, b));
        el.drawPalette.appendChild(b);
    });
    // F2-30: opção especial de glitter, por cima das cores (não é sólida)
    const g = document.createElement('button');
    g.type = 'button';
    g.className = 'draw-swatch draw-swatch--glitter';
    g.setAttribute('aria-label', 'Glitter');
    g.title = 'Glitter ✨';
    g.addEventListener('click', () => selectSwatch(GLITTER, g));
    el.drawPalette.appendChild(g);
}

// F2-30: espessura do pincel — 4 tamanhos, mostrados como bolinhas crescentes
function renderDrawSizes() {
    el.drawSizes.innerHTML = '';
    DRAW_SIZES.forEach((s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'draw-size' + (s === drawSize ? ' is-selected' : '');
        b.setAttribute('aria-label', 'Espessura ' + (i + 1));
        b.innerHTML = `<span class="draw-size-dot" style="width:${s}px;height:${s}px"></span>`;
        b.addEventListener('click', () => {
            drawSize = s;
            el.drawSizes.querySelectorAll('.draw-size').forEach((x) => x.classList.remove('is-selected'));
            b.classList.add('is-selected');
        });
        el.drawSizes.appendChild(b);
    });
}

// F2-30: espalha pontinhos coloridos aleatórios ao redor de um ponto (efeito glitter)
function glitterDab(x, y, size) {
    const n = Math.max(2, Math.round(size / 3));
    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * size * 0.6;
        drawCtx.fillStyle = randomFrom(GLITTER_COLORS);
        drawCtx.beginPath();
        drawCtx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, Math.max(1, size * 0.12), 0, Math.PI * 2);
        drawCtx.fill();
    }
}

function openDrawScreen() {
    showScreen('draw');
    // o canvas só tem o tamanho final depois do layout da tela acontecer
    requestAnimationFrame(() => { resizeDrawCanvas(); });
}

function drawStart(e) {
    e.preventDefault();
    drawing = true;
    const p = drawLocalPoint(e);
    drawLast = p;
    if (drawColor === GLITTER) {
        glitterDab(p.x, p.y, drawSize);
        return;
    }
    drawCtx.fillStyle = drawColor;
    drawCtx.beginPath();
    drawCtx.arc(p.x, p.y, drawSize / 2, 0, Math.PI * 2);   // um pontinho ao tocar, mesmo sem arrastar
    drawCtx.fill();
}
function drawMove(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = drawLocalPoint(e);
    if (drawColor === GLITTER) {
        // espalha vários pontinhos ao longo do trecho andado, não só no ponto final
        const dist = Math.hypot(p.x - drawLast.x, p.y - drawLast.y);
        const steps = Math.max(1, Math.round(dist / 4));
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            glitterDab(drawLast.x + (p.x - drawLast.x) * t, drawLast.y + (p.y - drawLast.y) * t, drawSize);
        }
    } else {
        drawCtx.strokeStyle = drawColor;
        drawCtx.lineWidth = drawSize;
        drawCtx.beginPath();
        drawCtx.moveTo(drawLast.x, drawLast.y);
        drawCtx.lineTo(p.x, p.y);
        drawCtx.stroke();
    }
    drawLast = p;
}
function drawEnd() { drawing = false; }

el.drawCanvas.addEventListener('pointerdown', drawStart);
el.drawCanvas.addEventListener('pointermove', drawMove);
window.addEventListener('pointerup', drawEnd);
window.addEventListener('pointercancel', drawEnd);
el.drawClearBtn.addEventListener('click', () => drawCtx && drawCtx.clearRect(0, 0, el.drawCanvas.width, el.drawCanvas.height));
el.drawExitBtn.addEventListener('click', () => showScreen('menu'));
renderDrawPalette();
renderDrawSizes();
