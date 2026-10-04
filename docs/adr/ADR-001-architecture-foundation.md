# ADR-001: Fundação Arquitetural AI-First e Desacoplamento do Game Core

## Status
Aceito

## Contexto
O projeto **Distrito Zero** visa ser um simulador de gestão policial e evolução urbana 100% orientado ao desenvolvimento assistido por agentes de IA. Projetos tradicionais sofrem com vazamentos de regras de negócio para a camada de interface (React) ou para a engine de jogo (Phaser/Pixi), além de dependência prematura de infraestruturas pesadas (NestJS, Docker, PostgreSQL).

## Decisão
1. **Separação Estrita de Responsabilidades:**
   - `packages/game-core`: Regras de negócio determinísticas puras em TypeScript, sem qualquer dependência do DOM ou de renderizadores.
   - `packages/game-data`: Definições declarativas de crimes, upgrades, viaturas e dados iniciais da cidade.
   - `packages/shared-types`: Contratos e tipos compartilhados.
   - `apps/game`: Interface operacional em React 18 e visualizador isométrico desacoplado com PixiJS / 2D Canvas.

2. **Fluxo Determinístico de Estado:**
   - `State + Command -> Rules -> Events -> New State`
   - O loop de simulação avança em ticks com gerador pseudo-aleatório baseado em seed (Mulberry32), garantindo 100% de reproducibilidade em testes unitários automatizados com Vitest.

3. **Renderização com Níveis de Detalhe (LOD):**
   - O mundo lógico sempre existe no Game Core; a camada visual apenas renderiza o que está próximo e visível, com margem de segurança para prevenir pop-in.

4. **Eliminação de Infraestrutura Prematura:**
   - Desenvolvimento local-first / offline-first, sem dependência de bancos relacionais ou backend no estágio de fundação.
