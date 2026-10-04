# Distrito Zero

> **Reconstrua a polícia. Recupere a cidade.**

Distrito Zero é um jogo de gestão e simulação urbana em visão isométrica no qual o jogador assume o comando de uma estrutura policial precária em uma cidade degradada por crime, abandono, corrupção e perda de confiança pública.

O objetivo não é apenas aumentar a força policial. O jogador deve recuperar a capacidade operacional da polícia, reduzir a criminalidade, melhorar a confiança da população e criar condições para que os bairros voltem a se desenvolver.

A cidade deve reagir visualmente às decisões do jogador.

O projeto será desenvolvido com uma arquitetura **AI-first**: explícita, modular, determinística, altamente testável e organizada para que agentes de IA possam implementar, validar, depurar e evoluir partes do jogo com o mínimo de ambiguidade possível.

---

## 1. Princípio central

> **O jogador não melhora apenas números. Ele precisa ver a cidade reagindo.**

A evolução da cidade deve ser perceptível no próprio mapa.

No início, o jogador pode encontrar:

- prédios abandonados;
- comércio fechado;
- ruas degradadas;
- pouca iluminação;
- lixo e áreas sem manutenção;
- pouca circulação de pessoas;
- alta criminalidade;
- baixa confiança na polícia;
- uma delegacia pequena e precária;
- pátio vazio;
- poucos policiais;
- ausência de setores especializados.

Conforme segurança, confiança, estabilidade, infraestrutura e atividade econômica melhoram, a cidade começa a responder:

- imóveis são reformados;
- lojas reabrem;
- novas lojas aparecem;
- residências melhoram;
- ruas recebem manutenção;
- iluminação aumenta;
- praças e espaços públicos são recuperados;
- mais cidadãos circulam;
- tráfego cresce;
- serviços se expandem;
- bairros se tornam visualmente mais vivos.

Segurança é uma condição importante para o desenvolvimento, mas **não deve ser o único fator**.

A evolução de um bairro pode considerar indicadores como:

```text
segurança
+ confiança da população
+ estabilidade
+ atividade econômica
+ infraestrutura
+ qualidade de vida
```

---

# 2. Fantasia do jogador

O jogador é o responsável por reconstruir a capacidade policial da cidade.

Ele não controla diretamente um único personagem.

Ele administra um sistema.

Entre suas responsabilidades estarão:

- contratar policiais;
- montar equipes;
- comprar viaturas;
- organizar patrulhamento;
- despachar unidades;
- investigar crimes;
- administrar presos;
- combater corrupção interna;
- desenvolver setores da delegacia;
- distribuir recursos;
- monitorar bairros;
- responder a crises;
- recuperar confiança pública;
- ampliar a capacidade operacional da cidade.

A principal fantasia é observar uma cidade inicialmente degradada começar a funcionar novamente por causa das decisões tomadas durante a campanha.

---

# 3. Cidade viva

A cidade não deve ser apenas um cenário.

Ela é um sistema simulado.

Cidadãos, policiais, criminosos, veículos, estabelecimentos e bairros possuem estados e comportamentos próprios.

Exemplo de rotina de cidadão:

```text
casa
↓
deslocamento
↓
trabalho
↓
comércio
↓
lazer
↓
casa
```

Exemplo de ocorrência:

```text
criminoso encontra oportunidade
↓
crime é iniciado
↓
vítima reage
↓
crime é denunciado
↓
central recebe ocorrência
↓
unidade é despachada
↓
viatura se desloca
↓
policial chega
↓
ocorrência é resolvida
↓
consequências afetam bairro e população
```

Nem tudo precisa ser simulado com a mesma profundidade.

O jogo deve usar níveis de simulação para manter desempenho e evitar complexidade desnecessária.

---

# 4. Visão 3D Low Poly Isométrica

O mundo principal será apresentado em **3D Low Poly com Câmera Isométrica (Ortográfica)**.

O visual é isométrico clássico (projeção ortográfica inclinada a 45° horizontal e 35.264° vertical), combinando o charme e legibilidade estratégica dos jogos de gestão e estratégia com o poder do 3D leve (curvas naturais de veículos, iluminação dinâmica dia/noite, sombras reais e profundidade automática).

A câmera deve permitir:

- pan;
- zoom;
- seleção de prédios;
- seleção de unidades;
- seleção de ocorrências;
- visualização de bairros;
- acompanhamento de viaturas e NPCs;
- leitura clara do estado da cidade.

O cenário será composto por elementos separados:

```text
terreno
+ ruas
+ calçadas
+ prédios
+ árvores
+ postes
+ objetos
+ veículos
+ cidadãos
+ policiais
+ criminosos
+ efeitos
+ sombras
```

Não deve existir uma única imagem gigante representando toda a cidade.

---

# 5. Delegacia como prédio vivo

A delegacia é diferente dos demais prédios da cidade.

Ela possui uma visão interna própria e deve crescer visualmente conforme o jogador progride.

Exemplo inicial:

```text
Delegacia Nível 1

- recepção simples
- pequena área administrativa
- cela básica
- pátio vazio
- poucos policiais
- sem arsenal
- sem oficina
- sem investigação especializada
```

A evolução ocorre através de módulos.

Exemplos:

```text
Recepção
Administração
Cela
Arsenal
Oficina
Pátio
Investigação
Inteligência
Corregedoria
Unidade tática
Perícia
Depósito
Treinamento
Garagem
Centro de comando
```

Um módulo pode possuir:

- nível;
- capacidade;
- funcionários;
- custo;
- tempo de construção;
- manutenção;
- requisitos;
- efeitos de gameplay;
- representação visual.

---

# 6. Evolução visual da delegacia

Upgrades precisam aparecer fisicamente.

Exemplo: construção da oficina.

```text
terreno vazio
↓
preparação da área
↓
materiais e cones
↓
estrutura parcial
↓
estrutura completa
↓
oficina operacional
```

Depois de construída, a oficina passa a ter atividade.

Exemplo:

```text
viatura danificada
↓
entra na oficina
↓
mecânico trabalha
↓
reparo progride
↓
viatura retorna ao serviço
```

O mesmo princípio vale para:

- arsenal;
- investigação;
- celas;
- pátio;
- garagem;
- treinamento;
- inteligência;
- perícia;
- centro de comando.

O jogador deve perceber que sua delegacia está ficando maior, mais ocupada e mais sofisticada.

---

# 7. Viaturas e pátio

Viaturas não devem ser apenas números em uma interface.

Elas existem visualmente.

Exemplo:

```text
início:
0 viaturas

compra:
1 viatura

resultado visual:
a primeira viatura aparece no pátio
```

As viaturas poderão possuir estados:

```text
disponível
em patrulha
despachada
em perseguição
danificada
em manutenção
aguardando equipe
fora de serviço
```

Ao sofrer dano, a viatura pode ser levada para a oficina e permanecer visualmente lá enquanto o reparo acontece.

---

# 8. Prédios da cidade

Prédios comuns não precisam possuir interior jogável.

A evolução deles será principalmente externa.

Um imóvel pode possuir diferentes estágios visuais.

Exemplo:

```text
abandonado
↓
degradado
↓
em reforma
↓
recuperado
↓
expandido
```

Um comércio pode evoluir assim:

```text
fechado
↓
fachada sendo reformada
↓
comércio simples
↓
comércio ativo
↓
comércio expandido
```

O objetivo é permitir que o jogador olhe para o mapa e reconheça o estado de cada região sem depender apenas de gráficos ou indicadores.

---

# 9. Bairros

A cidade será dividida em bairros ou distritos.

Cada bairro possui indicadores próprios.

Exemplo:

```ts
type DistrictState = {
  security: number;
  trust: number;
  economy: number;
  infrastructure: number;
  qualityOfLife: number;
  criminalInfluence: number;
};
```

Esses valores influenciam:

- criminalidade;
- comércio;
- abandono;
- circulação de pessoas;
- valor dos imóveis;
- tipos de ocorrência;
- comportamento da população;
- intensidade de patrulhamento necessária;
- oportunidades de desenvolvimento.

Um bairro recuperado deve parecer diferente de um bairro em colapso.

---

# 10. Criminalidade

Crimes devem surgir a partir da simulação e das condições da cidade.

Possíveis categorias:

- furto;
- roubo;
- assalto;
- invasão;
- tráfico;
- vandalismo;
- agressão;
- homicídio;
- crime organizado;
- corrupção;
- crimes financeiros;
- crimes especiais.

Cada incidente pode possuir:

```text
local
horário
gravidade
vítima
suspeito
testemunhas
evidências
risco
status
unidades envolvidas
resultado
```

Nem toda ocorrência deve ser resolvida apenas enviando uma viatura.

Algumas podem gerar:

- investigação;
- coleta de provas;
- busca;
- prisão;
- interrogatório;
- processo;
- inteligência;
- acompanhamento prolongado.

---

# 11. Corrupção policial

Corrupção é uma das mecânicas centrais previstas para o jogo.

Policiais podem possuir atributos ocultos ou parcialmente conhecidos relacionados a:

- ética;
- lealdade;
- ambição;
- medo;
- pressão;
- exposição a grupos criminosos;
- histórico disciplinar.

O jogador pode precisar:

- investigar denúncias;
- acompanhar comportamentos suspeitos;
- afastar agentes;
- criar operações internas;
- fortalecer corregedoria;
- lidar com consequências políticas e operacionais.

A corrupção não deve ser um evento aleatório sem contexto.

Ela deve surgir de condições sistêmicas.

---

# 12. Cidade que reage

Este é um princípio obrigatório do projeto.

A cidade precisa responder às mudanças do jogo em três dimensões:

### Mecânica

Indicadores mudam.

### Comportamental

NPCs mudam suas rotinas e decisões.

### Visual

O mapa muda de aparência.

Exemplo:

```text
quadrilha controla bairro
↓
criminalidade alta
↓
comércio fecha
↓
população evita ruas
↓
operação policial reduz influência criminosa
↓
patrulhamento estabiliza área
↓
confiança sobe
↓
atividade econômica retorna
↓
lojas reabrem
↓
prédios são reformados
↓
mais cidadãos circulam
```

A recuperação não precisa acontecer imediatamente.

Ela deve possuir tempo, etapas e consequências.

---

# 13. Arquitetura AI-first

O projeto será construído para que agentes de IA consigam trabalhar com segurança.

O objetivo não é simplesmente reduzir o número de tecnologias.

O objetivo é deixar o sistema **difícil de interpretar errado**.

Um agente novo no projeto deve conseguir descobrir rapidamente:

- onde determinada regra pertence;
- quais arquivos podem ser alterados;
- quais invariantes precisam ser preservadas;
- como reproduzir um cenário;
- como testar uma mudança;
- como executar a aplicação;
- como validar se uma tarefa terminou corretamente.

Princípios obrigatórios:

```text
tipagem forte
módulos pequenos
funções puras sempre que possível
contratos explícitos
testes automatizados
estado determinístico
logs estruturados
seeds reproduzíveis
dependências controladas
baixo acoplamento
documentação próxima ao código
```

---

# 14. O Game Core é o coração do projeto

As regras do jogo não devem depender do renderer, React ou navegador.

O Core deve trabalhar com TypeScript puro sempre que possível.

Fluxo conceitual:

```text
GameState
↓
Command
↓
Rules
↓
Events
↓
New GameState
```

Exemplo:

```ts
dispatchUnit(state, {
  incidentId: "incident-123",
  unitId: "unit-7"
});
```

Resultado conceitual:

```ts
{
  state: newState,
  events: [
    {
      type: "UNIT_DISPATCHED",
      incidentId: "incident-123",
      unitId: "unit-7"
    }
  ]
}
```

---

# 15. Eventos explícitos

O jogo deve produzir eventos compreensíveis.

Exemplos:

```text
CRIME_STARTED
CRIME_REPORTED
INCIDENT_CREATED
UNIT_DISPATCHED
UNIT_ARRIVED
SUSPECT_IDENTIFIED
SUSPECT_ARRESTED
EVIDENCE_COLLECTED
CASE_OPENED
OFFICER_ASSIGNED
VEHICLE_DAMAGED
VEHICLE_SENT_TO_REPAIR
BUILDING_UPGRADE_STARTED
BUILDING_UPGRADE_COMPLETED
DISTRICT_SECURITY_CHANGED
BUSINESS_REOPENED
BUILDING_RENOVATED
CORRUPTION_SUSPECTED
OFFICER_SUSPENDED
```

Eventos ajudam em:

- testes;
- replay;
- auditoria;
- debug;
- observabilidade;
- animações;
- saves;
- sincronização futura;
- desenvolvimento por IA.

---

# 16. Seeds determinísticos

Simulações relevantes devem poder ser reproduzidas.

Exemplo:

```text
seed = 873429
tick = 18420
```

Um bug deve poder ser reexecutado com os mesmos dados.

Exemplo futuro:

```bash
pnpm simulate --seed=873429 --ticks=18420
```

Isso permite que um agente de IA reproduza situações como:

> "A viatura ficou presa e nunca chegou à ocorrência."

em vez de depender de tentar fazer o problema acontecer novamente por sorte.

---

# 17. Observabilidade

O jogo deve explicar o que aconteceu.

Exemplo:

```text
08:32 CITIZEN_MOVED
08:34 CRIMINAL_SELECTED_TARGET
08:34 ROBBERY_STARTED
08:35 CRIME_REPORTED
08:36 UNIT_DISPATCHED
08:39 UNIT_ARRIVED
08:42 SUSPECT_ARRESTED
```

O objetivo não é construir um sistema gigantesco de telemetria.

É permitir que humanos e IA entendam uma cadeia de causa e efeito.

---

# 18. Renderer

A renderização visual deve ser uma camada separada.

Direção técnica oficial:

**Three.js + TypeScript (3D Low Poly Isométrico)**

Responsabilidades:

- renderizar cidade 3D low poly com câmera ortográfica isométrica;
- carregar modelos modulares leves (.glb / .gltf);
- iluminação e sombras em tempo real (ciclo dia/noite);
- rotação e movimentação suave de viaturas ao longo de vias;
- câmera ortográfica com pan e zoom fluido;
- seleção de prédios e viaturas via raycasting 3D;
- partículas e efeitos visuais (sirenes azul/vermelha piscantes, fumaça, cones de luz);
- ordenação nativa por z-buffer de GPU (sem bugs de sobreposição);
- performance ultra-otimizada para rodar em hardware integrado e mobile.

O renderer **não decide regras de gameplay**.

Ele recebe estados e eventos do Core.

Exemplo:

```text
Core:
UNIT_DISPATCHED

Renderer:
viatura sai do pátio em 3D
↓
segue malha viária com curvas suaves
↓
chega ao local da ocorrência
```

A tecnologia oficial e exclusiva de renderização é o **Three.js**, renderizando a cidade em 3D Low Poly sob visão isométrica (câmera ortográfica). Essa escolha garante animações naturais de trânsito, sombras dinâmicas do ciclo dia/noite e total consistência visual sem demandar dezenas de spritesheets 2D cortados em ângulos fixos.

---

# 19. Renderização escalável, câmera e níveis de detalhe (LOD)

O Distrito Zero deverá manter a existência lógica do mundo separada da representação visual. Prédios, NPCs, veículos e eventos continuam existindo no `game-core` independentemente de estarem visíveis na câmera.

O Three.js deverá apenas ajustar a quantidade de detalhes exibidos conforme a distância e o nível de zoom.

### Diretrizes de renderização e câmera

- Prédios não devem aparecer ou desaparecer abruptamente na frente do jogador (`pop-in`).
- O zoom altera o nível de detalhe visual, não a existência dos objetos no mundo.
- Regiões próximas da câmera devem ser pré-carregadas antes de entrarem na área visível.
- A cidade deverá possuir uma margem de renderização ao redor da câmera para evitar que elementos "nasçam" visivelmente na tela.
- Mudanças entre níveis de detalhe devem ocorrer de maneira suave, utilizando transições, fade ou substituição visual discreta quando necessário.
- NPCs e veículos distantes podem existir apenas como estado simplificado da simulação.
- Conforme a câmera se aproxima, esses estados podem ser materializados visualmente em NPCs, veículos e animações.
- Regiões distantes podem utilizar simulação simplificada para reduzir uso de CPU.
- Apenas elementos relevantes e próximos precisam executar animações completas, pathfinding detalhado e comportamento visual.
- O sistema deverá priorizar bom desempenho em máquinas com hardware simples e vídeo integrado.

### Exemplo conceitual

```text
REGIÃO DISTANTE
Simulação abstrata
População, economia, crimes, veículos e estado do bairro
        ↓

REGIÃO PRÓXIMA
Objetos pré-carregados
Prédios + ruas + veículos principais
        ↓

REGIÃO VISÍVEL / ZOOM PRÓXIMO
Renderização completa
NPCs + animações + viaturas + efeitos + detalhes urbanos
```

### Princípio arquitetural

> **O mundo existe no Game Core. O Three.js apenas escolhe quanto desse mundo precisa ser representado visualmente naquele momento.**

Essa abordagem deverá permitir uma cidade grande e visualmente viva sem exigir que todos os objetos, personagens e animações estejam sendo processados e renderizados simultaneamente.

---

# 20. Interface

React será utilizado para a interface operacional.

Responsabilidades:

- HUD;
- menus;
- painel da delegacia;
- gestão de policiais;
- gestão de viaturas;
- relatórios;
- orçamento;
- investigação;
- indicadores;
- configurações;
- árvore de evolução;
- telas administrativas.

React não deve controlar diretamente o loop da simulação.

---

# 21. Estrutura inicial do repositório

O projeto começa organizado como workspace simples.

Não usaremos infraestrutura pesada apenas para parecer "enterprise".

Estrutura inicial:

```text
distrito-zero/
│
├── apps/
│   └── game/
│
├── packages/
│   ├── game-core/
│   ├── game-data/
│   └── shared-types/
│
├── docs/
│
├── tests/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

### `apps/game`

Aplicação visual.

Contém:

- React;
- Three.js (3D Low Poly Isométrico);
- HUD;
- menus;
- integração com o Core.

### `packages/game-core`

Regras puras do jogo.

Contém:

- simulação;
- commands;
- events;
- systems;
- state;
- regras;
- seeds;
- ticks;
- validações.

### `packages/game-data`

Conteúdo declarativo.

Exemplos:

```text
crimes
veículos
prédios
upgrades
custos
equipamentos
tipos de NPC
progressão
```

### `packages/shared-types`

Contratos compartilhados.

Deve permanecer pequeno.

---

# 22. Stack inicial

```text
TypeScript
React
Three.js
Vite
pnpm workspaces
Vitest
IndexedDB
Git
GitHub
```

Ferramentas adicionais só entram quando houver uma necessidade concreta.

---

# 23. O que NÃO entra no início

Não começar com:

```text
NestJS
PostgreSQL
Redis
WebSockets
Docker obrigatório
microserviços
Tauri
Capacitor
ranking online
coop online
autenticação complexa
infraestrutura cloud
```

Isso não significa que essas tecnologias foram descartadas.

Significa apenas que **não serão implementadas antes de existir um jogo que prove que precisa delas**.

---

# 24. Persistência

A primeira implementação será local.

Preferência:

```text
IndexedDB
```

A regra de gameplay não deve depender da implementação de persistência.

Contrato conceitual:

```ts
interface SaveRepository {
  save(game: GameState): Promise<void>;
  load(): Promise<GameState | null>;
}
```

Inicialmente:

```text
IndexedDbSaveRepository
```

Futuramente:

```text
CloudSaveRepository
```

O Core não precisa saber qual implementação está sendo usada.

---

# 25. Online no futuro

Funcionalidades online podem incluir:

- cloud save;
- ranking;
- eventos globais;
- amigos;
- cooperação;
- desafios;
- estatísticas;
- sincronização entre dispositivos.

Essas funcionalidades só devem ser implementadas quando o loop principal já estiver validado.

---

# 26. Desenvolvimento por vertical slices

Não construiremos todo o Core antes de ver o jogo funcionando.

Também não construiremos a camada visual inteira antes das regras.

A abordagem será através de pequenos ciclos completos.

Primeira referência de vertical slice:

```text
1 rua
+
1 delegacia
+
1 cidadão
+
1 criminoso
+
1 policial
+
1 viatura
+
1 crime
+
1 ocorrência
+
1 despacho
+
1 resposta
+
1 prisão
+
1 consequência para o bairro
```

Fluxo:

```text
cidadão anda
↓
crime acontece
↓
ocorrência é criada
↓
jogador despacha unidade
↓
viatura sai
↓
policial chega
↓
situação é resolvida
↓
suspeito é preso
↓
jogador recebe resultado
↓
estado do bairro é afetado
```

Este pequeno ciclo deve funcionar de ponta a ponta antes de adicionarmos dezenas de sistemas.

---

# 27. Primeira meta visual

A primeira cidade não precisa ser bonita.

Ela precisa ser:

- legível;
- funcional;
- interativa;
- reproduzível;
- substituível por assets melhores;
- suficiente para validar gameplay.

Arte provisória não significa arquitetura provisória.

---

# 28. Assets

No início, priorizar assets:

- gratuitos;
- legalmente utilizáveis;
- modulares;
- consistentes;
- isométricos;
- adequados para prototipação.

Toda dependência artística deve possuir registro de licença.

Estrutura sugerida:

```text
docs/assets/
```

Cada pacote deve registrar:

```text
nome
autor
origem
licença
restrições
atribuição necessária
uso permitido
```

Nunca assumir que "gratuito" significa automaticamente "uso comercial irrestrito".

---

# 29. Personagens

Personagens podem utilizar spritesheets.

Estados iniciais possíveis:

```text
idle
walk
run
work
sit
enter_vehicle
exit_vehicle
arrest
```

O número inicial de direções deve ser definido pela necessidade visual do protótipo.

Não devemos criar dezenas de animações antes de validar o loop principal.

---

# 30. Veículos

Veículos podem possuir:

- posição;
- rota;
- velocidade;
- combustível futuramente;
- integridade;
- equipe;
- status operacional;
- manutenção;
- tipo.

A movimentação lógica pertence ao Core.

A movimentação visual pertence ao renderer.

---

# 31. Construções e upgrades

Todo upgrade relevante deve possuir dois estados:

### Estado de gameplay

Exemplo:

```text
oficina:
level: 2
repairCapacity: 3
repairSpeed: 1.4
```

### Estado visual

Exemplo:

```text
oficina nível 2:
- prédio maior
- duas vagas
- mais equipamentos
- mais NPCs trabalhando
```

A representação visual nunca deve ser a única fonte da verdade.

---

# 32. Desenvolvimento urbano

A recuperação dos bairros será gradual.

Uma possível regra conceitual:

```text
segurança suficiente
+
confiança mínima
+
atividade econômica possível
+
tempo de estabilidade
↓
chance de recuperação urbana
```

A recuperação pode gerar eventos como:

```text
BUILDING_RENOVATION_STARTED
BUSINESS_REOPENED
NEW_BUSINESS_CREATED
STREET_REPAIR_STARTED
PUBLIC_LIGHTING_RESTORED
PROPERTY_UPGRADED
```

Isso transforma a recuperação urbana em gameplay sistêmico, não apenas decoração.

---

# 33. Pobreza e desenvolvimento

O jogo não deve representar pobreza como algo que desaparece automaticamente porque há mais policiamento.

O modelo deve reconhecer que segurança é apenas parte de um sistema urbano maior.

O objetivo é representar uma cidade fictícia de forma coerente dentro da proposta do jogo, sem transformar questões sociais complexas em uma única barra simplista.

---

# 34. Regras para desenvolvimento com IA

Toda tarefa implementada por IA deve, sempre que aplicável:

1. identificar o módulo correto;
2. preservar contratos existentes;
3. adicionar ou atualizar testes;
4. evitar dependências novas sem justificativa;
5. executar os testes relevantes;
6. registrar mudanças arquiteturais importantes;
7. manter funções pequenas;
8. preferir comportamento determinístico;
9. evitar regras escondidas em UI;
10. evitar lógica de gameplay dentro do renderer.

---

# 35. Definition of Done

Uma tarefa não termina apenas quando "parece funcionar".

Quando aplicável, deve existir:

```text
implementação
+ tipagem
+ teste
+ cenário reproduzível
+ documentação necessária
+ ausência de erros de lint/typecheck
```

Para mudanças visuais:

```text
implementação
+ comportamento correto
+ integração com estado real
+ validação visual
```

---

# 36. Documentação

Este README é a fonte principal da visão do projeto.

Decisões técnicas importantes devem ser registradas em:

```text
docs/adr/
```

ADR = Architecture Decision Record.

Exemplos:

```text
ADR-001-architecture-foundation.md
ADR-002-threejs-lowpoly-renderer.md
ADR-003-deterministic-simulation.md
```

O objetivo é evitar que decisões importantes fiquem perdidas em conversas.

---

# 37. Roadmap inicial

## Fase 0 — Fundação

Criar:

- workspace;
- game-core;
- game-data;
- shared-types;
- app React;
- renderer Three.js (3D Low Poly Isométrico);
- Vitest;
- seed determinístico;
- relógio/tick da simulação.

## Fase 1 — Primeiro vertical slice

Criar:

- pequeno mapa;
- delegacia;
- cidadão;
- criminoso;
- policial;
- viatura;
- crime;
- ocorrência;
- despacho;
- prisão;
- feedback visual.

## Fase 2 — Delegacia viva

Criar:

- pátio;
- compra de viatura;
- módulo de oficina;
- construção visual;
- reparo de viatura;
- policiais trabalhando.

## Fase 3 — Bairro reativo

Criar:

- indicadores de bairro;
- segurança;
- confiança;
- atividade econômica;
- edifícios degradados;
- primeiras reformas;
- comércio reabrindo.

## Fase 4 — Simulação expandida

Criar:

- múltiplos crimes;
- múltiplas unidades;
- escalas de policiais;
- patrulhamento;
- investigação;
- equipamentos;
- corrupção inicial.

## Fase 5 — Cidade maior

Criar:

- múltiplos bairros;
- progressão territorial;
- sistemas econômicos maiores;
- novos tipos de prédio;
- evolução visual mais rica.

## Fase 6 — Serviços online

Somente após validação do jogo:

- backend;
- conta;
- cloud save;
- ranking;
- coop;
- eventos online.

---

# 38. Primeira versão jogável

A primeira versão considerada realmente jogável deve permitir:

```text
abrir o jogo
↓
observar pequena cidade
↓
receber ocorrência
↓
selecionar unidade
↓
despachar viatura
↓
acompanhar deslocamento
↓
resolver ocorrência
↓
receber consequência
↓
ver indicadores mudarem
↓
fazer primeiro upgrade
```

Se esse fluxo não for divertido, nenhuma quantidade de backend, ranking ou infraestrutura vai resolver o problema.

---

# 39. Direção de produto

Distrito Zero deve priorizar:

1. simulação compreensível;
2. decisões com consequências;
3. evolução visual;
4. cidade viva;
5. delegacia viva;
6. clareza operacional;
7. progressão perceptível;
8. sistemas conectados;
9. capacidade de reproduzir acontecimentos;
10. facilidade de evolução por IA.

---

# 40. O papel da IA

A IA será tratada como parte central do processo de desenvolvimento.

Ela poderá ajudar em:

- arquitetura;
- implementação;
- testes;
- refatoração;
- documentação;
- debugging;
- ferramentas internas;
- geração de conteúdo estruturado;
- montagem de mapas;
- lógica de NPCs;
- sistemas de gameplay;
- integração de assets;
- scripts e automações.

A IA não deve ser tratada como responsável por decidir sozinha o que o jogo precisa ser.

---

# 41. O papel do diretor do projeto

O responsável pelo projeto define:

- visão;
- regras;
- prioridades;
- sensação desejada;
- identidade;
- mecânicas;
- balanceamento;
- o que é divertido;
- o que deve mudar;
- o que deve ser descartado.

Em termos simples:

```text
Direção humana:
o que deve existir
e como deve ser sentido

IA:
como transformar essa decisão
em software testado e funcional
```

---

# 42. Regra de ouro

> **Menos infraestrutura prematura. Mais jogo funcionando.**

E, ao mesmo tempo:

> **Não construir rápido de qualquer maneira. Construir simples, modular e preparado para crescer.**

---

# 43. Visão final

A experiência desejada é começar olhando para uma cidade que parece quase perdida.

A delegacia é pequena.

O pátio está vazio.

A polícia possui poucos recursos.

Comércios estão fechados.

Bairros estão degradados.

A população perdeu confiança.

O jogador começa a reorganizar a polícia, responder melhor às ocorrências, investigar crimes, enfrentar corrupção, recuperar regiões e reconstruir a capacidade institucional da cidade.

Com o tempo, aquilo que antes aparecia apenas como estatística passa a aparecer no próprio mapa:

- a primeira viatura;
- a primeira oficina;
- o arsenal;
- uma delegacia maior;
- lojas reabrindo;
- prédios sendo reformados;
- ruas mais cheias;
- bairros recuperados;
- uma cidade que voltou a funcionar.

Essa transformação é o coração de **Distrito Zero**.

---

## Status

**Projeto em fase de fundação arquitetural e definição do primeiro vertical slice.**

A prioridade imediata é criar uma base pequena, executável, determinística e visualmente funcional antes de expandir conteúdo ou infraestrutura.
