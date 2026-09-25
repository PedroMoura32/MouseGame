# Kanban: publicação do app na Play Store

Atualizado em: 25/09/2026

**Regras para o Claude Code**

- Este arquivo é a fonte da verdade do quadro. Atualize-o sempre que uma tarefa mudar de estado.
- Para mover um cartão, recorte a seção `### ID · Título` inteira e cole embaixo da coluna nova.
- Colunas, nesta ordem: Backlog, Pendente, Em andamento (limite de 3), Impedimento, Homologação, Concluído.
- Não altere os IDs. Um cartão novo recebe o próximo número da fase (exemplo: F2-06).
- Cartão em Impedimento leva uma linha `- Nota:` dizendo o que está travando.
- Antes de mover um cartão para Concluído, confira a linha "Pronto quando".
- Mantenha cada campo em uma única linha e atualize a data acima.

## Backlog

### F2-05 · Fechar a versão final para produção
- Fase: 2 · Ideias e melhorias
- Prioridade: Alta
- Pronto quando: a versão candidata passou pela homologação e nenhum ajuste está aberto
- Depende de: F2-01, F2-02, F2-03 e F2-04 (os que forem aprovados)
- Nota: só esta versão precisa estar realmente pronta; o teste fechado pode rodar antes, com versões intermediárias

### F2-06 · Otimizar o service worker para economizar banda
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: o app só busca atualização em segundo plano de vez em quando, não em toda abertura
- Nota: não é urgente no volume esperado; hoje o sw.js sempre busca a rede em paralelo ao mostrar o cache

### F2-18 · Painel dos pais com histórico de evolução
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: existe uma tela separada (fora do fluxo das crianças) mostrando, por perfil, em que ela vai bem/mal e como isso mudou ao longo do tempo, não só o total de hoje
- Nota: depende de guardar histórico de partidas no localStorage, não só o total acumulado

### F2-28 · Limite de tempo por sessão/dia
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: o pai consegue definir um limite (sessão e/ou dia) numa tela protegida (a criança não consegue mudar sozinha), e o app avisa/trava de um jeito gentil quando o tempo acaba
- Depende de: F2-27
- Nota: não é urgente agora, segundo o Pedro; bem mais trabalhoso que o F2-27 (trava de acesso pra adulto, decidir o que acontece ao bater o limite, quando reseta) — desenhar com calma quando chegar a vez

### F2-19 · Canal de feedback dos pais
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: existe um jeito simples dos pais mandarem sugestão/opinião sobre o app, acessível do painel dos pais
- Nota: site é estático sem servidor; caminho mais simples é um link mailto: ou um formulário externo (Google Forms) — confirmar com o Pedro

### F2-23 · Divisão com "pausinhos" nas caixinhas
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: a divisão mostra N caixinhas (N = divisor) e a criança distribui as unidades uma a uma entre as caixinhas até esgotar o total; o resultado é quantos pausinhos ficaram em cada caixinha
- Nota: é como a filha de 8 anos aprende na escola (não é o formato de "chave"/divisão longa); é uma distribuição visual em grupos, não um novo tipo de pergunta — precisa de um componente interativo novo, mais parecido com um minijogo do treino do mouse do que com a conta armada atual

### F2-24 · Completar a palavra arrastando a letra que falta
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: mostra uma palavra simples com 1 vogal faltando (+ botão para ouvir a palavra), e a criança arrasta a vogal certa dentre as opções para o espaço vazio
- Nota: começar só com vogais faltando, como o próprio Pedro sugeriu; fazer depois do F2-09 (Letra inicial) validado com as filhas, para calibrar a dificuldade antes de partir para esta

### F2-25 · Traçar letras e números com o dedo/mouse
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: a letra ou número aparece grande na tela e a criança consegue "desenhar" por cima seguindo o traçado correto, com algum feedback se saiu muito do traço
- Nota: ideia de alfabetização motora (treinar a escrita da letra); é a mais complexa tecnicamente desse brainstorm (detectar se o traço do mouse seguiu o contorno certo) — avaliar viabilidade/esforço antes de estimar prazo

### F3-01 · Criar a conta de desenvolvedor no Google Play Console
- Fase: 3 · Conta e teste fechado
- Prioridade: Alta
- Pronto quando: a conta está paga (US$ 25) e com a verificação de identidade aprovada
- Nota: a verificação pode levar alguns dias, então vale abrir a conta cedo
- Nota: passo manual do Pedro (pagamento + identidade); eu não consigo fazer essa parte
- Nota: o Pedro decidiu esperar terminar a Fase 2 e validar o app antes de abrir a conta

### F3-02 · Escrever e publicar a política de privacidade
- Fase: 3 · Conta e teste fechado
- Prioridade: Alta
- Pronto quando: o texto está publicado em uma URL fixa e pública
- Nota: será curta, porque o app não coleta nenhum dado

### F3-03 · Teste fechado com 12 pessoas por 14 dias
- Fase: 3 · Conta e teste fechado
- Prioridade: Alta
- Pronto quando: a trilha de teste fechado teve pelo menos 12 testadores por 14 dias seguidos
- Depende de: F1-05, F3-01 e F3-04
- Nota: pode começar em paralelo com a Fase 2; o .aab de teste é atualizado conforme os ajustes avançam

### F3-04 · Preencher os formulários de conteúdo do app no Play Console
- Fase: 3 · Conta e teste fechado
- Prioridade: Alta
- Pronto quando: classificação indicativa, público-alvo e formulário de segurança de dados estão preenchidos e aprovados
- Depende de: F3-01 e F3-02
- Nota: o Play Console exige isso antes de liberar qualquer trilha, inclusive o teste fechado

### F3-05 · Configurar o perfil de pagamentos para vender o app pago
- Fase: 3 · Conta e teste fechado
- Prioridade: Alta
- Pronto quando: a conta de pagamentos está configurada e o preço do app já pode ser definido
- Depende de: F3-01
- Nota: sem isso o app não pode ser publicado como pago; dá para fazer em paralelo com o resto da Fase 3

### F4-01 · Preparar a ficha da loja
- Fase: 4 · Produção
- Prioridade: Alta
- Pronto quando: descrição e capturas de tela estão preenchidas no Play Console
- Depende de: F3-01
- Nota: a classificação indicativa e o público-alvo ficaram no F3-04, para não duplicar

### F4-04 · Copyright e número de versão no app
- Fase: 4 · Produção
- Prioridade: Média
- Pronto quando: existe um rodapé/tela discreta com "© [ano] Pedro Moura" e a versão do app (visível para o Pedro identificar qual build está rodando, útil para suporte/depuração)
- Nota: ideia do Pedro; ainda não decidido onde exatamente aparece (tela de perfis? menu?) nem o formato do número de versão (ligado ao twa-manifest.json / manifest.webmanifest?) — desenhar quando chegar a vez

### F4-03 · Decidir estratégia de lançamento: grátis primeiro, pago depois
- Fase: 4 · Produção
- Prioridade: Média
- Pronto quando: está decidido entre (a) publicar já pago desde o início, (b) dois apps separados — um grátis e um pago dias depois — ou (c) um único app grátis com compra dentro dele para desbloquear
- Nota: o Google Play não deixa mudar um app já publicado como grátis para pago depois (só o caminho inverso é permitido); "grátis agora, pago depois" de verdade exige um segundo app (pacote diferente) ou uma compra dentro do app já grátis
- Nota: o Pedro quer terminar a Fase 2 e validar o projeto antes de abrir a conta do Play Console (F3-01) e decidir isso

### F4-02 · Pedir acesso à produção e publicar
- Fase: 4 · Produção
- Prioridade: Alta
- Pronto quando: o app está publicado na Play Store
- Depende de: F2-05, F3-03, F3-05 e F4-01

## Pendente

## Em andamento

_(vazio)_


## Impedimento

_(vazio)_

## Homologação

_(vazio)_

## Concluído

### F2-03 · Dica após erros
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: depois de um erro, o app mostra uma dica que ajuda a acertar na próxima
- Nota: já estava pendente antes do mapeamento
- Nota: confirmado com o Pedro — a dica só aparece depois do 2º erro na mesma pergunta (1 erro ainda é tentativa normal), e é genérica pra qualquer categoria: elimina uma opção errada ainda não tentada (fica cinza com um 💡), reduzindo as escolhas restantes. Só 1 dica por pergunta. Em "Fácil" (3 opções) normalmente já não sobra nada pra eliminar depois do 2º erro — o efeito aparece mesmo em Médio/Difícil, testado nos dois. Testado: contador de erros e a dica resetam certinho na pergunta seguinte, e em Fácil não trava mesmo sem ter o que eliminar

### F2-02 · Leitura automática
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: o app lê o conteúdo em voz alta sem a pessoa precisar tocar em nada
- Nota: já estava pendente antes do mapeamento
- Nota: confirmado com o Pedro — em vez de ligar pra todo mundo (o que reverteria a decisão anterior de "leitura só sob demanda" que ele tinha gostado), virou uma opção por perfil, desligada por padrão. Quando ligada (na criação da jogadora ou depois, no seletor de avatar), cada pergunta nova é falada sozinha assim que aparece — no jogo clássico e no Treino do mouse — sem precisar tocar no 🔊; o resto do app (menu, resultado) continua manual. Testado: perfil com a opção liga fala sozinho, desligar pelo seletor para na hora, perfil padrão nunca fala sozinho mas o botão manual continua funcionando

### F2-01 · Backup de perfis
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: a pessoa consegue salvar os perfis e restaurá-los em outro aparelho
- Nota: já estava pendente antes do mapeamento
- Nota: implementado na tela de perfis com dois botões discretos "Exportar backup" (baixa um `.json` com todas as jogadoras do aparelho) e "Importar backup" (escolhe um arquivo `.json` e soma ao que já existe). Importação nunca sobrescreve: jogadoras com o mesmo id já salvo são ignoradas, evitando perder estrelas por engano ao importar um backup antigo por cima; sempre mostra quantas foram importadas/ignoradas. Testado exportar, importar arquivo com 1 repetida + 1 nova, importar o mesmo arquivo de novo (nada muda), e dois casos de arquivo inválido (JSON quebrado e JSON sem perfis) sem travar a página. Revisão visual também corrigiu 3 cores fixas que tinham escapado da auditoria do modo escuro (F2-22): botão de apagar jogadora, borda do campo de nome e borda dos avatares na criação de perfil

### F2-22 · Modo noturno
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: existe um tema com cores escuras, selecionável ou automático pela preferência do sistema
- Nota: botão 🌙/☀️ na barra superior alterna entre claro/escuro; sem escolha explícita, segue a preferência do sistema (e reage se o sistema mudar em tempo real); a escolha explícita fica salva e persiste entre sessões. Aplicado antes da primeira pintura da página, pra não "piscar" o tema errado. Paleta escura cobre todas as telas (perfis, menu, config, jogo, resultado, pintura, treino do mouse)
- Nota: implementado com variáveis CSS (`--bg`, `--card`, `--ink`, cores de acerto/erro, fundo dos cartões de escolha, etc.) redefinidas num bloco `@media (prefers-color-scheme: dark)` e espelhadas em `:root[data-theme="dark"]` para a escolha manual. Testado contraste de texto em ~9 elementos-chave (razões de 6.4 a 12.05, bem acima do mínimo de 4.5 do WCAG AA); revisão visual pegou um bug real (cards de escolha tipo "Subtrair"/"Multiplicar" ficaram ilegíveis no escuro por causa de uma cor de fundo fixa que o teste de contraste automático não cobria) e foi corrigido
- Nota: decisão deliberada — o campo de jogo do Treino do mouse (baloẽs, alvos, memória etc.) permanece com fundo claro fixo nos dois temas, tratado como uma "folha de papel" à parte; evita uma auditoria muito maior de cor por minijogo e mantém o conteúdo sempre legível

### F2-21 · Pintura livre
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: existe uma tela de desenho livre com o mouse/dedo, sem certo ou errado, só para brincar
- Nota: implementado como uma nova categoria "Pintura Livre" no menu principal, que pula a tela de configuração e vai direto para uma tela de desenho em tela cheia (canvas), com paleta de 8 cores, botão limpar e botão sair (volta ao menu, não à config). Testado mouse e toque, troca de cor, traço contínuo suave, limpar apaga tudo, sem rolagem lateral no celular

### F2-20 · Jogo da memória (pares)
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: existe um minijogo de virar cartas em pares, usando conteúdo já existente (formas, animais, etc.) como imagem das cartas
- Nota: implementado como novo minijogo "Memória" dentro do Treino do mouse, com flip 3D nas cartas e grade que cresce por nível (3x2/4x2/4x3 = 3/4/6 pares), sorteando emojis de um banco de 18. Cada rodada completa = um tabuleiro; segue a mesma contagem de estrelas 1:1 do treino do mouse (fora da regra do F2-17). Testado sequência completa de várias rodadas, acerto/erro de par, centralização da grade em desktop e celular

### F2-17 · Regra de estrelas por acerto ajustável
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: no nível Difícil, cada 2 acertos de primeira valem 1 estrela (nos outros níveis continua 1 acerto = 1 estrela)
- Nota: confirmado com o Pedro — liga ao nível Difícil, vale para qualquer perfil (não é por idade cadastrada)
- Nota: implementado com dois contadores separados — correctFirstTry (acertos, usado na mensagem "acertou de primeira X de Y") e starsEarned (estrelas de verdade, usado no HUD e somado ao perfil). Treino do mouse fica de fora da regra (1:1 sempre). Testado: Fácil 10 certas = 10 estrelas; Difícil 10 certas = 5 estrelas; Difícil 5 certas (ímpar) = 2 estrelas, não arredonda para cima

### F2-16 · Revisar o que errou, de forma opcional
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: no fim da rodada, se errou alguma, o app pergunta se quer revisar; se topar, repete só as erradas, mas essas não valem estrela nova
- Nota: implementado com um botão "Revisar o que errei (N)" que só aparece se algo foi errado nesta rodada. A revisão reaproveita as perguntas exatas (autossuficientes: prompt/correta/opções já geradas), sem gerar de novo. Termina numa tela simples "Revisão concluída!", sem mexer em estrelas nem no contador de partidas do perfil. Testado: revisão não duplica estrelas nem partidas, revisa exatamente as que errou

### F2-15 · Conquistas/troféus
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: existem selos por marcos (ex.: "10 acertos seguidos", "jogou 3 dias seguidos"), visíveis no perfil, além da contagem de estrelas
- Nota: 7 conquistas implementadas (partidas, estrelas, sequência de 10 acertos numa rodada, 3 dias seguidos jogando — reaproveitando o cronômetro do F2-27). Guardadas em profile.achievements; aparecem num banner dourado no resultado só quando desbloqueadas na hora. Testado: desbloqueia certo, não repete depois de já desbloqueada, sequência e dias consecutivos calculam certo
- Nota: ainda não tem uma tela própria para ver todas as conquistas já ganhas — só o aviso na hora que desbloqueia. Fica pro painel dos pais (F2-18) ou uma versão futura

### F2-14 · Avatares desbloqueáveis com estrelas
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: existem avatares extras, além dos atuais, que só ficam disponíveis no seletor depois que o perfil atinge X estrelas
- Nota: 6 avatares livres desde o início + 6 que destravam em 10/20/30/50/75/100 estrelas. Criar perfil novo só mostra os 6 livres (os outros aparecem com cadeado, à mostra). Depois de criado, clicar no avatar da barra de perfil abre um seletor com os que já destravou. Testado: bloqueio certo em cada faixa, troca persiste no localStorage, sem rolagem lateral no celular

### F2-08 · Contar com emojis
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: mostra um grupo de emojis (ex.: 3 morangos) e pergunta "quantos tem aqui?", com opções de resposta em número, sem depender de leitura
- Nota: pensado para a caçula (5 anos)
- Nota: implementado dentro de Números e Letras > "Contar". Faixa de quantidade por nível (2-5/3-7/5-10); "Quantos"/"Quantas" concorda com o gênero de cada objeto (corrigi um bug real: "Quantos abelhas" saía errado, agora "Quantas abelhas"). Testado com os 8 objetos, sem depender de sorteio aleatório

### F2-09 · Letra inicial (fonética)
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: mostra um bichinho/objeto e pede para clicar na letra com que o nome dele começa, entre 3 opções
- Nota: pensado para a caçula; primeiro contato com leitura sem exigir que ela já leia
- Nota: implementado dentro de Números e Letras > "Letra inicial", reaproveitando o banco de animais. Testado: a letra certa sempre bate com a primeira letra do nome do bicho, em todos os animais do banco

### F2-10 · Tabuada específica para treinar
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: dá para escolher treinar só uma tabuada por vez (ex.: só do 7), dentro de Matemática (Multiplicar)
- Nota: implementado como um painel extra ("Qual tabuada?") que só aparece quando Multiplicar está escolhido — Todas + 1 a 10. Testado que o número escolhido aparece sempre como o primeiro fator da conta

### F2-11 · Conta com número faltando
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: aparece uma conta tipo "5 + ? = 8" e as opções são os possíveis números que faltam, em vez de sempre pedir o resultado final
- Nota: implementado como escolha própria dentro de Matemática ("Número que falta"), sempre escondendo o segundo número da conta. Testado que a conta sempre fecha certo com a opção correta

### F2-12 · Mais vocabulário em inglês + pronúncia ao acertar
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: novos grupos de palavras (comidas, corpo, dias da semana) no banco de inglês, e a voz em inglês pronuncia a palavra certa quando a criança acerta
- Nota: grupos "foods" e "body" novos (com figura, entram em Figuras e Tradução); dias da semana entram só na Tradução (não têm uma figura que faça sentido mostrar), igual às frases prontas. Pronúncia: ao acertar qualquer pergunta de inglês, fala a palavra/frase certa em voz en-US cerca de 0,5s depois. Testado e confirmado (ouvi "bear", "eight", "moon" nos testes)

### F2-13 · Problemas com enunciado em matemática
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: existe um sub-modo de Matemática com historinhas curtas (ex.: "Fulano tinha 3 carrinhos e sumiu 1, com quantos ele ficou?"), mapeadas para as 4 operações, com banco de variações de personagens/objetos
- Nota: pensado para a filha de 8 anos (já lê); mistura leitura + conta
- Nota: implementado como escolha própria dentro de Matemática ("Problemas"), com 10 nomes e 8 objetos. Números sempre ≥ 2 nas contas, para o plural do objeto nunca errar. Testado: a conta do enunciado sempre bate com a resposta certa, e os dois números aparecem escritos na frase

### F2-27 · Cronômetro de tempo de jogo (sessão e por dia)
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: o app conta o tempo de cada perfil desde que é escolhido até trocar/fechar, soma por dia, e isso alimenta o futuro painel dos pais (F2-18)
- Nota: ideia do Pedro; por perfil (cada criança tem sua contagem separada), pausa sozinho quando a aba sai de foco, soma ao total do dia a cada reabertura. Nada disso aparece na tela ainda — é só a contagem por trás, para o F2-18 mostrar depois
- Nota: implementado em `profiles[].playtime.days['AAAA-MM-DD']`, com flush a cada 15s (evita perder muito se a aba fechar sem avisar). Testado: começa a contar ao escolher o perfil, pausa/retoma com visibilitychange, para ao trocar de perfil, cada perfil conta separado, soma ao total existente ao reabrir a página, e persiste de verdade no localStorage — tudo bateu

### F2-26 · Botões do resultado lado a lado e do mesmo tamanho
- Fase: 2 · Ideias e melhorias
- Prioridade: Média
- Pronto quando: "Jogar de novo" e "Voltar ao início" ficam com o mesmo tamanho, lado a lado, sem um induzir mais que o outro
- Nota: pedido do Pedro — o botão "Jogar de novo" gigante parecia empurrar a criança a ficar sempre jogando. Testado em 4 larguras (1366 a 320px), sem rolagem lateral

### F2-07 · Reorganizar o menu em duas etapas
- Fase: 2 · Ideias e melhorias
- Prioridade: Alta
- Pronto quando: "Escolha o jogo" vira sua própria tela; ao escolher, abre uma segunda tela só com as opções daquele jogo (nível, quantidade, sub-escolha, modo), com um botão para voltar e trocar de jogo
- Nota: ideia do Pedro; com 7 jogos e várias sub-opções cada, a página única atual está ficando cheia. Fazer isso ANTES de encaixar as próximas ideias (F2-08 em diante), para não empilhar ainda mais na tela única atual
- Nota: implementado — `#screen-menu` agora só escolhe o jogo; `#screen-config` (nova) mostra sub-escolha/nível/quantidade/modo do jogo escolhido, com botão "← Voltar". Barra de perfil virou elemento único fora das duas telas (`#profile-bar`), mostrada/escondida pelo showScreen(). Testado: navegação, painéis condicionais (Matemática com sub e sem modo; Formas sem sub e com modo), jogo completo ida e volta, trocar perfil a partir da config, mobile sem rolagem lateral. Kanban não commitado ainda no git (arquivo novo, `?? Kanban.md`)

### F2-04 · Brainstorm de novas ideias
- Fase: 2 · Ideias e melhorias
- Prioridade: Baixa
- Pronto quando: existe uma lista priorizada e cada ideia aprovada virou um cartão neste quadro
- Nota: sessão de 2026-09-24; 19 ideias aprovadas viraram F2-07 a F2-25, organizadas em 6 lotes por prioridade (estrutura do menu → conteúdo novo → motivação → painel dos pais → novas atividades → mais complexas)

### F1-05 · Gerar o .aab com o bubblewrap build
- Fase: 1 · Base técnica
- Prioridade: Alta
- Pronto quando: o arquivo .aab foi gerado sem erro e está pronto para upload
- Depende de: F1-03
- Nota: app-release-bundle.aab (2 MB) assinado, em MouseGame-android/. Dois bugs do Bubblewrap no Windows corrigidos no caminho: (1) o SDK moderno usa cmdline-tools/latest, mas o Bubblewrap procura tools/ ou bin/ na raiz — corrigido com uma junção de pasta; (2) o Bubblewrap chama java/jarsigner sem aspas via cmd.exe, o que quebra com espaço no caminho (ex.: "Program Files") — corrigido usando uma cópia do JDK num caminho sem espaço; o jarsigner do .aab ainda falhou por um bug de PATH e foi assinado manualmente com o caminho completo.

### F1-01 · Criar o repositório PedroMoura32.github.io
- Fase: 1 · Base técnica
- Prioridade: Alta
- Pronto quando: o repositório existe, o GitHub Pages responde na raiz e há um arquivo .nojekyll (sem ele o Pages ignora a pasta .well-known)
- Nota: repositório criado pelo Pedro; publiquei .nojekyll, index.html e a base do assetlinks.json; https://pedromoura32.github.io/ responde 200

### F1-03 · Instalar o Bubblewrap e rodar o bubblewrap init
- Fase: 1 · Base técnica
- Prioridade: Alta
- Pronto quando: o projeto Android foi gerado a partir do manifesto do jogo publicado e a keystore existe com backup guardado
- Depende de: F1-02
- Nota: pacote com.pedromoura.jogodoscliques, projeto em MouseGame-android/ (dentro do OneDrive); keystore gerada, senha mostrada ao Pedro para salvar em gerenciador de senhas + backup separado

### F1-04 · Publicar o assetlinks.json de verdade
- Fase: 1 · Base técnica
- Prioridade: Alta
- Pronto quando: a URL https://PedroMoura32.github.io/.well-known/assetlinks.json abre com o nome do pacote e o SHA-256 da keystore
- Depende de: F1-01 e F1-03
- Nota: publicado e confirmado ao vivo (200, content-type application/json, pacote e impressão digital corretos)

### F1-02 · Instalar JDK 17 e Android SDK (command-line tools)
- Fase: 1 · Base técnica
- Prioridade: Alta
- Pronto quando: java -version mostra 17 e o sdkmanager roda sem erro
- Nota: JDK 17.0.20 (Temurin) instalado via winget; cmdline-tools baixado direto do Google (build 15859902, checksum conferido) em Android\Sdk\cmdline-tools\latest; sdkmanager 22.0 funcionando e licenças aceitas. O SDK já tinha build-tools 35.0.1, platform-tools e android-35 de outro projeto.
