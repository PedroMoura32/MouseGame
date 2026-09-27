/* ============================================================
   Renderização dos itens (F2-45: extraído de script.js)

   Script clássico, sem dependência de nada além dos próprios dados do
   item passado (nenhum acoplamento com state/el/outros arquivos).
   ============================================================ */

'use strict';

function shapeSVG(shape, color) {
    const shapes = {
        circle:    `<circle cx="50" cy="50" r="44"/>`,
        square:    `<rect x="8" y="8" width="84" height="84" rx="10"/>`,
        triangle:  `<polygon points="50,6 94,92 6,92"/>`,
        rectangle: `<rect x="4" y="26" width="92" height="48" rx="10"/>`,
        diamond:   `<polygon points="50,4 92,50 50,96 8,50"/>`,
        star:      `<polygon points="50,4 61,38 97,38 68,60 79,94 50,72 21,94 32,60 3,38 39,38"/>`,
        heart:     `<path d="M50 88 L14 52 A20 20 0 0 1 50 26 A20 20 0 0 1 86 52 Z"/>`,
    };
    return `<svg viewBox="0 0 100 100" fill="${color}" aria-hidden="true">${shapes[shape] || ''}</svg>`;
}

function renderItemInner(item) {
    switch (item.kind) {
        case 'shape': return shapeSVG(item.shape, item.color);
        case 'color': return `<span class="swatch" style="background:${item.hex}"></span>`;
        case 'emoji': return `<span class="glyph">${item.glyph}</span>`;
        case 'char': {
            // números com mais dígitos usam letra menor para caberem na peça
            const n = item.glyph.length;
            return `<span class="glyph" style="--k:${n >= 3 ? 0.36 : n === 2 ? 0.44 : 0.5}">${item.glyph}</span>`;
        }
        case 'text':  return `<span class="label-text">${item.label}</span>`;
        default:      return '';
    }
}
