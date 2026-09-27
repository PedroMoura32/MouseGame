/* ============================================================
   Inicialização (F2-45: extraído de script.js)

   Script clássico, carregado por ÚLTIMO em index.html — depois de
   profiles.js. Só existe porque esse é o único trecho de script.js que
   roda imediatamente (não dentro de um handler) E depende de coisas de
   profiles.js (a lista "profiles", getCurrentId()...), que por sua vez
   depende de "el" (definido em script.js). Essa ordem — script.js ->
   ... -> profiles.js -> main.js — resolve os dois lados da dependência.
   ============================================================ */

'use strict';

buildMenu();

state.profile = profiles.find((p) => p.id === getCurrentId()) || null;
if (state.profile) {
    updateProfileBar();
    startPlaytimeTracking();
    showScreen('menu');
} else {
    renderProfiles();
    showScreen('profiles');
}
