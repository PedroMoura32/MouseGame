/* ============================================================
   Confete (F2-45: extraído de script.js)

   Script clássico, carregado DEPOIS de script.js (usa o "$" definido lá,
   em DOM, e "randomFrom" de utils.js). Só depende do canvas #confetti já
   existir no HTML — sem outro acoplamento com o resto do jogo além da
   função burstConfetti(big), chamada de dentro de script.js (na tela de
   resultado) num setTimeout, então a ordem de carregamento não importa
   pra essa chamada (já vai ter rodado quando o timeout disparar).
   ============================================================ */

'use strict';

const confettiCanvas = $('#confetti');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiRAF = null;

function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

const CONFETTI_COLORS = ['#e0559b', '#f783ac', '#b197fc', '#74c0fc', '#ffd43b', '#ff922b', '#63e6be'];

function burstConfetti(big) {
    const amount = big ? 160 : 70;
    const w = confettiCanvas.width;
    for (let i = 0; i < amount; i++) {
        confettiPieces.push({
            x: w / 2 + (Math.random() - 0.5) * w * 0.5,
            y: -20 - Math.random() * 60,
            vx: (Math.random() - 0.5) * 6,
            vy: 2 + Math.random() * 4,
            size: 6 + Math.random() * 8,
            color: randomFrom(CONFETTI_COLORS),
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.3,
        });
    }
    if (!confettiRAF) confettiRAF = requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
    });
    confettiPieces = confettiPieces.filter((p) => p.y < confettiCanvas.height + 30);
    if (confettiPieces.length > 0) {
        confettiRAF = requestAnimationFrame(drawConfetti);
    } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiRAF = null;
    }
}
