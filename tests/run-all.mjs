/* Roda todo arquivo tests/*.mjs (menos este e lib/), um de cada vez, e resume
   quantos passaram/falharam. Uso: node tests/run-all.mjs */

import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const arquivos = readdirSync(HERE)
    .filter((f) => f.endsWith('.mjs') && f !== 'run-all.mjs')
    .sort();

let ok = 0, falhou = 0;
for (const arquivo of arquivos) {
    process.stdout.write(`\n=== ${arquivo} ===\n`);
    const r = spawnSync(process.execPath, [join(HERE, arquivo)], { stdio: 'inherit' });
    if (r.status === 0) ok++; else falhou++;
}

console.log(`\n${ok} passaram, ${falhou} falharam, de ${arquivos.length} arquivos.`);
process.exit(falhou > 0 ? 1 : 0);
