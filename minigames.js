/* ============================================================
   Treino do mouse — minijogos de habilidade motora

   Cada minijogo é uma função create(api) que devolve:
     { prompt: { html, speak }, start(), destroy() }

   "api" é fornecida pelo script.js:
     field          elemento onde o minijogo desenha tudo
     level          0 (fácil), 1 (médio) ou 2 (difícil)
     size()         { w, h } do campo
     hint(texto)    mensagem neutra embaixo (dicas)
     mistake(texto) registra um erro (a rodada deixa de ganhar estrela)
     done()         a rodada terminou com sucesso

   Habilidades treinadas:
     baloes   -> duplo clique
     alvos    -> clicar com precisão em alvos que se mexem
     rolar    -> usar a rodinha do mouse (rolar a página)
     caminho  -> arrastar sem sair do trilho (controle fino)
     memoria  -> cliques + memória visual (achar os pares)
     quadros  -> cliques + adivinhação (descobrir a imagem escondida)
   ============================================================ */

'use strict';

const MINIGAMES = (() => {

    /* ---------- utilitários ---------- */

    const rand = (a, b) => a + Math.random() * (b - a);
    const randInt = (a, b) => Math.floor(rand(a, b + 1));
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) { const j = randInt(0, i); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
    }
    const sample = (arr, n) => shuffle(arr).slice(0, n);

    // Laço de animação com passo de tempo (dt em segundos). Devolve a função "parar".
    function loop(step) {
        let id = 0, last = 0, on = true;
        const frame = (t) => {
            if (!on) return;
            const dt = Math.min(0.05, (t - (last || t)) / 1000);   // limita salto (aba em segundo plano)
            last = t;
            step(dt);
            id = requestAnimationFrame(frame);
        };
        id = requestAnimationFrame(frame);
        return () => { on = false; cancelAnimationFrame(id); };
    }

    // Sons gerados por código (sem arquivos): estouro de balão e "blip".
    let audioCtx = null;
    function audio() {
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            return audioCtx;
        } catch (_) { return null; }
    }
    function popSfx() {
        const ac = audio(); if (!ac) return;
        const len = Math.floor(ac.sampleRate * 0.14);
        const buf = ac.createBuffer(1, len, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
        const src = ac.createBufferSource(); src.buffer = buf;
        const g = ac.createGain(); g.gain.value = 0.4;
        src.connect(g); g.connect(ac.destination); src.start();
    }
    function blipSfx(freq) {
        const ac = audio(); if (!ac) return;
        const t = ac.currentTime;
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
        o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.12);
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.18);
    }

    // Posição do ponteiro dentro do campo (a origem é a borda interna, onde os filhos são posicionados).
    function localPoint(field, e) {
        const r = field.getBoundingClientRect();
        return { x: e.clientX - r.left - field.clientLeft, y: e.clientY - r.top - field.clientTop };
    }

    function el(tag, cls, parent) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (parent) parent.appendChild(e);
        return e;
    }

    /* ============================================================
       1) BALÕES — duplo clique
       ============================================================ */

    function balloonSVG(color) {
        return `<svg viewBox="0 0 60 92" aria-hidden="true">`
            + `<path d="M30 66 Q22 78 30 90" stroke="#9a7aa0" stroke-width="1.5" fill="none"/>`
            + `<polygon points="26,60 34,60 30,67" fill="${color}"/>`
            + `<ellipse cx="30" cy="32" rx="25" ry="30" fill="${color}"/>`
            + `<ellipse cx="20" cy="20" rx="6" ry="10" fill="#fff" opacity=".4"/>`
            + `</svg>`;
    }

    function baloes(api) {
        const cfg = [{ n: 3, size: 120, speed: 26 }, { n: 5, size: 96, speed: 42 }, { n: 7, size: 80, speed: 60 }][api.level];
        const COLORS = ['#f47cb5', '#6fc3ee', '#ffd76a', '#b596ee', '#63e6be', '#ff922b'];
        const DOUBLE_MS = 550;   // tempo máximo entre os dois cliques
        const prompt = {
            html: 'Dê <b>2 cliques rápidos</b> em cada balão 🎈',
            speak: 'Dê dois cliques rápidos em cada balão',
        };
        let items = [], stopLoop = null, left = 0;

        function press(b) {
            if (!b.alive) return;
            const now = performance.now();
            if (b.lastDown && now - b.lastDown <= DOUBLE_MS) { pop(b); return; }
            b.lastDown = now;
            b.frozenUntil = now + DOUBLE_MS + 150;   // o balão "espera" o segundo clique
            b.inner.classList.remove('bump'); void b.inner.offsetWidth; b.inner.classList.add('bump');
            setTimeout(() => b.inner.classList.remove('bump'), 380);   // volta a balançar
            api.hint('Boa! Agora clique de novo, bem rápido! ⚡');
            clearTimeout(b.timer);
            b.timer = setTimeout(() => {
                b.lastDown = 0;
                if (b.alive) api.hint(`Dê 2 cliques rápidos no balão 🎈 (faltam ${left})`);
            }, DOUBLE_MS + 60);
        }

        function pop(b) {
            b.alive = false;
            clearTimeout(b.timer);
            b.inner.classList.remove('bump');
            b.inner.classList.add('pop');
            popSfx();
            left--;
            setTimeout(() => b.el.remove(), 320);
            if (left <= 0) api.done();
            else api.hint(`Estourou! Faltam ${left} 🎈`);
        }

        function start() {
            destroy();
            api.field.innerHTML = '';
            const { w, h } = api.size();
            const bw = Math.max(56, Math.min(cfg.size, w * 0.2, h * 0.3));
            const bh = bw * 1.5;
            left = cfg.n;
            for (let i = 0; i < cfg.n; i++) {
                const ang = rand(0, Math.PI * 2), sp = cfg.speed * rand(0.7, 1.25);
                const b = { x: rand(0, Math.max(1, w - bw)), y: rand(0, Math.max(1, h - bh)), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
                    bw, bh, alive: true, lastDown: 0, frozenUntil: 0, timer: 0 };
                b.el = el('div', 'mg-balloon', api.field);
                b.el.style.width = bw + 'px'; b.el.style.height = bh + 'px';
                b.inner = el('div', 'mg-balloon-inner', b.el);
                b.inner.style.animationDelay = (-rand(0, 2)) + 's';
                b.inner.innerHTML = balloonSVG(COLORS[i % COLORS.length]);
                b.el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); press(b); });
                b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
                items.push(b);
            }
            api.hint(`Faltam ${left} balões 🎈`);
            stopLoop = loop((dt) => {
                const now = performance.now();
                items.forEach((b) => {
                    if (!b.alive || now < b.frozenUntil) return;
                    b.x += b.vx * dt; b.y += b.vy * dt;
                    if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
                    if (b.x > w - b.bw) { b.x = w - b.bw; b.vx = -Math.abs(b.vx); }
                    if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
                    if (b.y > h - b.bh) { b.y = h - b.bh; b.vy = -Math.abs(b.vy); }
                    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
                });
            });
        }

        function destroy() {
            if (stopLoop) stopLoop();
            stopLoop = null;
            items.forEach((b) => clearTimeout(b.timer));
            items = [];
            api.field.innerHTML = '';
        }

        return { prompt, start, destroy };
    }

    /* ============================================================
       2) ALVOS — clicar em alvos que se mexem
       ============================================================ */

    function alvos(api) {
        const cfg = [{ n: 3, size: 104, speed: 90 }, { n: 4, size: 78, speed: 150 }, { n: 6, size: 60, speed: 230 }][api.level];
        const theme = pick([
            { e: '🐝', nome: 'abelhinhas' }, { e: '🦋', nome: 'borboletas' }, { e: '⭐', nome: 'estrelas' },
            { e: '🐞', nome: 'joaninhas' }, { e: '🐟', nome: 'peixinhos' },
        ]);
        const prompt = { html: `Clique em todas as <b>${theme.nome}</b> ${theme.e}`, speak: `Clique em todas as ${theme.nome}` };
        const MAX_MISSES = 3;   // cliques fora do alvo permitidos sem perder a estrela
        let items = [], stopLoop = null, left = 0, caught = 0, misses = 0;

        function onBackground(e) {
            if (e.target.closest && e.target.closest('.mg-target')) return;
            const p = localPoint(api.field, e);
            const rip = el('div', 'mg-ripple', api.field);
            rip.style.left = p.x + 'px';
            rip.style.top = p.y + 'px';
            setTimeout(() => rip.remove(), 500);
            misses++;
            if (misses === MAX_MISSES + 1) api.mistake('Quase! Tente acertar bem em cima do alvo 🎯');
        }

        function start() {
            destroy();
            api.field.innerHTML = '';
            const { w, h } = api.size();
            const sz = Math.max(46, Math.min(cfg.size, w * 0.2, h * 0.32));
            left = cfg.n; caught = 0; misses = 0;
            for (let i = 0; i < cfg.n; i++) {
                const ang = rand(0, Math.PI * 2), sp = cfg.speed * rand(0.75, 1.2);
                const t = { x: rand(0, Math.max(1, w - sz)), y: rand(0, Math.max(1, h - sz)), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, sz, alive: true };
                // camada de fora = posição (script); camada de dentro = animações (CSS)
                t.el = el('div', 'mg-target', api.field);
                t.el.style.width = t.el.style.height = sz + 'px';
                t.el.style.fontSize = (sz * 0.78) + 'px';
                t.inner = el('div', 'mg-target-inner', t.el);
                t.inner.textContent = theme.e;
                t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;
                t.el.addEventListener('pointerdown', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (!t.alive) return;
                    t.alive = false;
                    t.inner.classList.add('caught');
                    blipSfx(520 + caught * 90); caught++; left--;
                    setTimeout(() => t.el.remove(), 300);
                    if (left <= 0) api.done(); else api.hint(`Pegou! Faltam ${left} ${theme.e}`);
                });
                items.push(t);
            }
            api.field.addEventListener('pointerdown', onBackground);
            api.hint(`Faltam ${left} ${theme.e}`);
            stopLoop = loop((dt) => {
                items.forEach((t) => {
                    if (!t.alive) return;
                    t.x += t.vx * dt; t.y += t.vy * dt;
                    if (t.x < 0) { t.x = 0; t.vx = Math.abs(t.vx); }
                    if (t.x > w - t.sz) { t.x = w - t.sz; t.vx = -Math.abs(t.vx); }
                    if (t.y < 0) { t.y = 0; t.vy = Math.abs(t.vy); }
                    if (t.y > h - t.sz) { t.y = h - t.sz; t.vy = -Math.abs(t.vy); }
                    t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;
                });
            });
        }

        function destroy() {
            if (stopLoop) stopLoop();
            stopLoop = null;
            api.field.removeEventListener('pointerdown', onBackground);
            items = [];
            api.field.innerHTML = '';
        }

        return { prompt, start, destroy };
    }

    /* ============================================================
       3) ROLAR — usar a rodinha do mouse
       ============================================================ */

    function rolar(api) {
        const cfg = [{ screens: 2.2, similar: 0, decor: 6 }, { screens: 4, similar: 4, decor: 8 }, { screens: 7, similar: 8, decor: 10 }][api.level];
        const TARGETS = [
            { e: '🎁', n: 'presente', art: 'o' }, { e: '🧸', n: 'ursinho', art: 'o' }, { e: '🍦', n: 'sorvete', art: 'o' },
            { e: '🚀', n: 'foguete', art: 'o' }, { e: '👑', n: 'coroa', art: 'a' }, { e: '🎈', n: 'balão', art: 'o' },
        ];
        const DECOR = ['🌸', '🌼', '🍄', '🌳', '🦋', '🐞', '🌷', '☁️', '🍀', '🌿'];
        const target = pick(TARGETS);
        const down = Math.random() < 0.6;
        const dirWord = down ? 'baixo' : 'cima';
        const prompt = {
            html: `Gire a rodinha para <b>${dirWord}</b> e ache ${target.art} <b>${target.n}</b> ${target.e}`,
            speak: `Gire a rodinha do mouse para ${dirWord} e ache ${target.art} ${target.n}`,
        };
        let finished = false;

        function start() {
            destroy();
            finished = false;
            api.field.innerHTML = '';
            const { w, h } = api.size();
            const total = Math.round(h * cfg.screens);
            const scroller = el('div', 'mg-scroller', api.field);
            const inner = el('div', 'mg-scroll-inner', scroller);
            inner.style.height = total + 'px';

            // enfeites (não clicáveis)
            const count = Math.round(cfg.decor * cfg.screens);
            for (let i = 0; i < count; i++) {
                const d = el('span', 'mg-decor', inner);
                d.textContent = pick(DECOR);
                d.style.left = rand(2, 90) + '%';
                d.style.top = rand(0, total - 50) + 'px';
                d.style.fontSize = randInt(26, 48) + 'px';
                d.style.transform = `rotate(${randInt(-25, 25)}deg)`;
            }

            // o tesouro: perto do fim (ou do começo) do caminho de rolagem
            const ts = clamp(Math.min(w, h) * 0.17, 46, 76);
            const tx = rand(w * 0.05, Math.max(w * 0.06, w - ts - 34));
            const ty = down ? rand(total - h * 0.55, total - ts - 12) : rand(12, h * 0.55 - ts);
            const found = el('button', 'mg-find', inner);
            found.type = 'button';
            found.textContent = target.e;
            found.setAttribute('aria-label', target.n);
            found.style.cssText = `left:${tx}px; top:${ty}px; width:${ts}px; height:${ts}px; font-size:${ts * 0.8}px`;
            found.addEventListener('click', () => {
                if (finished) return;
                finished = true;
                found.classList.add('found');
                blipSfx(700);
                api.done();
            });

            // parecidos: outros objetos que enganam (clicar neles é erro)
            const others = TARGETS.filter((t) => t !== target);
            for (let i = 0; i < cfg.similar; i++) {
                const o = pick(others);
                const dx = rand(w * 0.05, Math.max(w * 0.06, w - ts - 34));
                let dy = rand(h * 0.9, total - h * 0.4);
                if (Math.abs(dy - ty) < ts * 1.6 && Math.abs(dx - tx) < ts * 1.6) dy = (dy + h * 0.8) % Math.max(1, total - ts);
                const b = el('button', 'mg-find mg-decoy', inner);
                b.type = 'button';
                b.textContent = o.e;
                b.setAttribute('aria-label', o.n);
                b.style.cssText = `left:${dx}px; top:${dy}px; width:${ts}px; height:${ts}px; font-size:${ts * 0.8}px`;
                b.addEventListener('click', () => {
                    if (finished) return;
                    b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle');
                    api.mistake(`Esse não é ${target.art} ${target.n}! Procure de novo 🔎`);
                });
            }

            // dica visual até a primeira rolagem
            const hintEl = el('div', 'mg-scroll-hint', api.field);
            hintEl.innerHTML = `<span class="mg-wheel">🖱️</span><span class="mg-arrow">${down ? '⬇️' : '⬆️'}</span><span>Gire a rodinha do mouse</span>`;
            scroller.addEventListener('scroll', () => {
                if (Math.abs(scroller.scrollTop - startTop) > 40) hintEl.classList.add('gone');
            }, { passive: true });

            // "para cima": começa no fim da página (o máximo de rolagem é a altura do conteúdo menos a do campo)
            const startTop = down ? 0 : scroller.scrollHeight - scroller.clientHeight;
            scroller.scrollTop = startTop;
            api.hint(`Gire a rodinha do mouse para ${dirWord} 🖱️`);
        }

        function destroy() { api.field.innerHTML = ''; }

        return { prompt, start, destroy };
    }

    /* ============================================================
       4) CAMINHO — arrastar sem sair do trilho
       ============================================================ */

    function caminho(api) {
        const cfg = [{ lanes: 2, w: 86 }, { lanes: 3, w: 62 }, { lanes: 4, w: 46 }][api.level];
        const pair = pick([
            { a: '🐭', an: 'ratinho', aArt: 'o', b: '🧀', bn: 'queijo', bArt: 'o' },
            { a: '🐶', an: 'cachorrinho', aArt: 'o', b: '🦴', bn: 'osso', bArt: 'o' },
            { a: '🐰', an: 'coelhinho', aArt: 'o', b: '🥕', bn: 'cenoura', bArt: 'a' },
            { a: '🐝', an: 'abelhinha', aArt: 'a', b: '🌸', bn: 'flor', bArt: 'a' },
            { a: '🐵', an: 'macaquinho', aArt: 'o', b: '🍌', bn: 'banana', bArt: 'a' },
        ]);
        const prompt = {
            html: `Arraste ${pair.aArt} <b>${pair.an}</b> ${pair.a} pelo caminho até ${pair.bArt} <b>${pair.bn}</b> ${pair.b}`,
            speak: `Arraste ${pair.aArt} ${pair.an} pelo caminho até ${pair.bArt} ${pair.bn}`,
        };
        const NS = 'http://www.w3.org/2000/svg';
        let pts = [], tw = 0, cur = null, drag = null, finished = false, charEl = null, charInner = null, goalR = 0;

        // distância de um ponto ao trilho (linha poligonal)
        function distToPath(x, y) {
            let best = Infinity;
            for (let i = 0; i < pts.length - 1; i++) {
                const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
                const dx = x2 - x1, dy = y2 - y1;
                const t = clamp(((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1), 0, 1);
                best = Math.min(best, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)));
            }
            return best;
        }
        // testa o trajeto inteiro entre dois pontos (evita "pular" o trilho num movimento rápido)
        function onPath(p0, p1) {
            const len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            const steps = Math.max(1, Math.ceil(len / 5));
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                if (distToPath(p0.x + (p1.x - p0.x) * t, p0.y + (p1.y - p0.y) * t) > tw / 2 + 3) return false;
            }
            return true;
        }

        function buildPath(W, H) {
            const horizontal = W >= H * 0.85;             // celular em pé: trilhos na vertical
            const A = horizontal ? W : H, B = horizontal ? H : W;
            let lanes = cfg.lanes, pad, spacing;
            tw = cfg.w;
            const fit = () => { pad = tw / 2 + 18; spacing = (B - 2 * pad) / (lanes - 1); return spacing >= tw * 1.7; };
            while (!fit()) { if (lanes > 2) lanes--; else if (tw > 30) tw -= 4; else break; }

            // pontos (a = ao longo, b = através); as curvas alternam de lado com folga aleatória
            const inset = () => rand(0, A * 0.1);
            const line = [];
            let x = pad;
            for (let i = 0; i < lanes; i++) {
                const b = pad + i * spacing;
                line.push([x, b]);
                const last = i === lanes - 1;
                x = (i % 2 === 0) ? A - pad - (last ? 0 : inset()) : pad + (last ? 0 : inset());
                line.push([x, b]);
            }
            const flipA = Math.random() < 0.5, flipB = Math.random() < 0.5;
            return line.map(([a, b]) => {
                const aa = flipA ? A - a : a, bb = flipB ? B - b : b;
                return horizontal ? [aa, bb] : [bb, aa];
            });
        }

        function place() {
            charEl.style.transform = `translate(${cur.x}px, ${cur.y}px) translate(-50%, -50%)`;
        }

        function fail() {
            const d = drag; drag = null;
            try { charEl.releasePointerCapture(d.id); } catch (_) {}
            charEl.classList.remove('grab');
            api.mistake('Ops! Fique dentro do caminho 🙂');
            cur = { x: pts[0][0], y: pts[0][1] };
            place();
            charInner.classList.remove('shake'); void charInner.offsetWidth; charInner.classList.add('shake');
        }

        function start() {
            destroy();
            finished = false; drag = null;
            api.field.innerHTML = '';
            const { w, h } = api.size();
            pts = buildPath(w, h);
            const goal = pts[pts.length - 1];
            cur = { x: pts[0][0], y: pts[0][1] };

            // trilho (SVG): borda, fundo claro e linha pontilhada de guia
            const svg = document.createElementNS(NS, 'svg');
            svg.setAttribute('class', 'mg-path');
            svg.setAttribute('width', w); svg.setAttribute('height', h);
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            const d = 'M ' + pts.map((p) => p.join(' ')).join(' L ');
            [[tw + 12, 'var(--accent)', 0.85, ''], [tw, '#ffffff', 1, ''], [4, '#f9b6d6', 1, '1 13']].forEach(([sw, col, op, dash]) => {
                const p = document.createElementNS(NS, 'path');
                p.setAttribute('d', d);
                p.setAttribute('fill', 'none');
                p.setAttribute('stroke-linejoin', 'round'); p.setAttribute('stroke-linecap', 'round');
                p.setAttribute('stroke-width', sw); p.setAttribute('opacity', op);
                p.style.stroke = col;
                if (dash) p.setAttribute('stroke-dasharray', dash);
                svg.appendChild(p);
            });
            api.field.appendChild(svg);

            const cs = clamp(tw * 0.95, 42, 74);
            goalR = Math.max(tw * 0.5, 28);
            const gs = cs * 1.15;
            const goalEl = el('div', 'mg-goal', api.field);
            goalEl.textContent = pair.b;
            goalEl.style.cssText = `left:${goal[0] - gs / 2}px; top:${goal[1] - gs / 2}px; width:${gs}px; height:${gs}px; font-size:${cs * 0.85}px`;

            // fora = posição (script); dentro = animações (CSS)
            charEl = el('div', 'mg-char', api.field);
            charEl.style.width = charEl.style.height = cs + 'px';
            charEl.style.fontSize = (cs * 0.82) + 'px';
            charInner = el('div', 'mg-char-inner', charEl);
            charInner.textContent = pair.a;
            place();

            charEl.addEventListener('pointerdown', (e) => {
                if (finished) return;
                e.preventDefault();
                const p = localPoint(api.field, e);
                drag = { id: e.pointerId, ox: p.x - cur.x, oy: p.y - cur.y };
                try { charEl.setPointerCapture(e.pointerId); } catch (_) {}
                charEl.classList.add('grab');
            });
            charEl.addEventListener('pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id || finished) return;
                const p = localPoint(api.field, e);
                const next = { x: p.x - drag.ox, y: p.y - drag.oy };
                if (!onPath(cur, next)) { fail(); return; }
                cur = next; place();
                if (Math.hypot(cur.x - goal[0], cur.y - goal[1]) <= goalR) {
                    finished = true; drag = null;
                    cur = { x: goal[0], y: goal[1] }; place();
                    charEl.classList.remove('grab'); charInner.classList.add('win');
                    api.done();
                }
            });
            const release = (e) => {
                if (drag && e.pointerId === drag.id) { drag = null; charEl.classList.remove('grab'); }
            };
            charEl.addEventListener('pointerup', release);
            charEl.addEventListener('pointercancel', release);

            api.hint('Segure o bichinho e leve até o final, sem sair do caminho 🛤️');
        }

        function destroy() { drag = null; charEl = null; charInner = null; api.field.innerHTML = ''; }

        return { prompt, start, destroy };
    }

    /* ============================================================
       5) MEMÓRIA — achar os pares (F2-20)
       ============================================================ */

    const MEMORY_GLYPHS = ['🐶', '🐱', '🦁', '🐴', '🐮', '🐷', '🦆', '🐸', '🐵', '🐰', '🐻', '🐟', '🍓', '⭐', '🎈', '🌸', '🦋', '🐝'];
    const MEMORY_GRID = [[3, 2], [4, 2], [4, 3]];   // [colunas, linhas] por nível — colunas×linhas = pares×2

    function memoria(api) {
        const [cols, rows] = MEMORY_GRID[api.level];
        const pairs = (cols * rows) / 2;
        const prompt = { html: `Encontre os ${pairs} pares iguais! 🃏`, speak: `Encontre os ${pairs} pares de cartas iguais` };
        let flipped = [], matched = 0, locked = false;

        function start() {
            destroy();
            api.field.innerHTML = '';
            const { w, h } = api.size();
            const items = sample(MEMORY_GLYPHS, pairs);
            const deck = shuffle([...items, ...items]);
            matched = 0; flipped = []; locked = false;

            const gap = 10;
            const size = clamp(Math.min((w - gap * (cols - 1)) / cols, (h - gap * (rows - 1)) / rows), 44, 190);
            const gridW = size * cols + gap * (cols - 1), gridH = size * rows + gap * (rows - 1);
            const ox = (w - gridW) / 2, oy = (h - gridH) / 2;

            deck.forEach((glyph, i) => {
                const col = i % cols, row = Math.floor(i / cols);
                const card = el('button', 'mg-card', api.field);
                card.type = 'button';
                card.style.cssText = `width:${size}px; height:${size}px; left:${ox + col * (size + gap)}px; top:${oy + row * (size + gap)}px; font-size:${size * 0.5}px`;
                const inner = el('div', 'mg-card-inner', card);
                el('div', 'mg-card-face mg-card-back', inner).textContent = '❓';
                el('div', 'mg-card-face mg-card-front', inner).textContent = glyph;
                const c = { glyph, el: card, matched: false };
                card.addEventListener('pointerdown', (e) => { e.preventDefault(); flip(c); });
            });
            api.hint(`Ache os ${pairs} pares 🃏`);
        }

        function flip(c) {
            if (locked || c.matched || c.el.classList.contains('is-flipped') || flipped.length >= 2) return;
            c.el.classList.add('is-flipped');
            flipped.push(c);
            if (flipped.length < 2) return;

            locked = true;
            const [a, b] = flipped;
            if (a.glyph === b.glyph) {
                a.matched = b.matched = true;
                a.el.classList.add('is-matched'); b.el.classList.add('is-matched');
                matched++;
                flipped = []; locked = false;
                blipSfx(560 + matched * 60);
                if (matched === pairs) api.done();
                else api.hint(`Boa! Faltam ${pairs - matched} ${pairs - matched === 1 ? 'par' : 'pares'}`);
            } else {
                setTimeout(() => {
                    a.el.classList.remove('is-flipped'); b.el.classList.remove('is-flipped');
                    flipped = []; locked = false;
                    api.mistake('Quase! Tenta lembrar onde estava 🧠');
                }, 800);
            }
        }

        function destroy() { flipped = []; api.field.innerHTML = ''; }

        return { prompt, start, destroy };
    }

    /* ============================================================
       6) ATRÁS DOS QUADROS — descobrir a imagem escondida (F2-32)
       Clica nos quadrados (linha numérica + coluna com letra) pra
       revelar aos poucos o que está por trás, e adivinha entre as
       opções. Errar uma opção revela mais 1 quadrado de brinde.
       ============================================================ */

    const QUADROS_BANK = [
        { e: '🐘', n: 'elefante' }, { e: '🌈', n: 'arco-íris' }, { e: '🍕', n: 'pizza' },
        { e: '🚗', n: 'carro' }, { e: '🏠', n: 'casa' }, { e: '🌻', n: 'girassol' },
        { e: '🦋', n: 'borboleta' }, { e: '🐢', n: 'tartaruga' }, { e: '🎈', n: 'balão' },
        { e: '🌙', n: 'lua' }, { e: '⭐', n: 'estrela' }, { e: '🍎', n: 'maçã' },
        { e: '🐬', n: 'golfinho' }, { e: '🦁', n: 'leão' }, { e: '🐝', n: 'abelha' },
        { e: '🍓', n: 'morango' }, { e: '🐼', n: 'panda' }, { e: '🚀', n: 'foguete' },
    ];
    const QUADROS_LETTERS = 'ABCDE';

    function quadros(api) {
        const cfg = [{ cols: 3, rows: 3, opts: 3 }, { cols: 4, rows: 4, opts: 4 }, { cols: 5, rows: 5, opts: 6 }][api.level];
        const prompt = {
            html: 'Clique nos quadrados e descubra o que está escondido! 🔍',
            speak: 'Clique nos quadrados e descubra o que está escondido',
        };
        let answered = false;

        function start() {
            destroy();
            api.field.innerHTML = '';
            const { w, h } = api.size();

            const target = pick(QUADROS_BANK);
            const options = shuffle([target, ...sample(QUADROS_BANK.filter((x) => x !== target), cfg.opts - 1)]);

            // envelope que centraliza tudo (o tabuleiro em cima, as opções embaixo)
            const wrap = el('div', 'mg-quadros-wrap', api.field);

            // tabuleiro quadrado, deixando uma faixa embaixo pras opções de resposta
            const optsH = Math.max(56, h * 0.24);
            const side = clamp(Math.min(w, h - optsH - 14), 120, 520);
            const board = el('div', 'mg-quadros-board', wrap);
            board.style.cssText = `width:${side}px; height:${side}px;`;

            const pic = el('div', 'mg-quadros-pic', board);
            pic.textContent = target.e;
            pic.style.fontSize = (side * 0.78) + 'px';

            const grid = el('div', 'mg-quadros-grid', board);
            grid.style.cssText = `grid-template-columns: repeat(${cfg.cols}, 1fr); grid-template-rows: repeat(${cfg.rows}, 1fr);`;
            const cells = [];
            const openCell = (cell) => cell.classList.add('is-open');
            for (let r = 0; r < cfg.rows; r++) {
                for (let c = 0; c < cfg.cols; c++) {
                    const cell = el('button', 'mg-quadros-cell', grid);
                    cell.type = 'button';
                    cell.textContent = QUADROS_LETTERS[c] + (r + 1);
                    cell.addEventListener('pointerdown', (e) => { e.preventDefault(); openCell(cell); });
                    cells.push(cell);
                }
            }

            const optsWrap = el('div', 'mg-quadros-opts', wrap);
            options.forEach((opt) => {
                const b = el('button', 'mg-quadros-opt', optsWrap);
                b.type = 'button';
                b.innerHTML = `<span class="mg-quadros-opt-emoji">${opt.e}</span><span>${opt.n}</span>`;
                b.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    if (answered || b.disabled) return;
                    if (opt === target) {
                        answered = true;
                        cells.forEach(openCell);
                        b.classList.add('is-correct');
                        blipSfx(700);
                        api.done();
                    } else {
                        b.disabled = true;
                        b.classList.add('is-wrong');
                        const closed = cells.filter((c) => !c.classList.contains('is-open'));
                        if (closed.length) openCell(pick(closed));   // uma dica de brinde a cada erro
                        api.mistake(`Não é ${opt.n}! Tenta de novo 🔎`);
                    }
                });
            });

            api.hint('Clique nos quadrados pra revelar a imagem 🔍');
        }

        function destroy() { answered = false; api.field.innerHTML = ''; }

        return { prompt, start, destroy };
    }

    return {
        baloes:  { create: baloes },
        alvos:   { create: alvos },
        rolar:   { create: rolar },
        caminho: { create: caminho },
        memoria: { create: memoria },
        quadros: { create: quadros },
    };
})();
