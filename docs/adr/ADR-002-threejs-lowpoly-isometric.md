# ADR-002: Adoção do Three.js para Renderização 3D Low Poly com Câmera Isométrica (Ortográfica)

## Status
Aceito

## Contexto
Originalmente, a camada visual do Distrito Zero havia sido planejada para 2D isométrico clássico com PixiJS (desenho de sprites planos). Contudo, a direção artística desejada (conforme visual de referência) e as necessidades de simulação urbana revelaram que:
1. Viaturas e carros no 2D exigem dezenas de spritesheets recortados em 4 a 8 direções para fazer uma curva simples, gerando atrito e inconsistência visual.
2. A iluminação de dia e noite em 2D demanda aplicação de máscaras artificiais sobre texturas.
3. Ordenação de profundidade 2D (z-sorting) é suscetível a erros de sobreposição entre prédios altos e carros.
4. Packs modernos de assets 3D Low Poly (formato `.glb` / `.gltf`) são abundantes, modulares, padronizados e extremamente leves.

## Decisão
Substituir o motor de renderização da aplicação visual por **Three.js**, configurado para:
1. **Câmera Ortográfica Isométrica:**
   - Câmera travada no ângulo clássico de 45° horizontal (azimute) e 35.264° vertical (elevação), gerando a projeção isométrica perfeita dos jogos de gestão e estratégia.
2. **Modelos 3D Low Poly Modulares:**
   - Prédios, viaturas, postes, árvores e calçadas carregados como malhas 3D (.glb).
3. **Iluminação e Sombras Nativas:**
   - Luz direcional com sombras dinâmicas no asfalto e ciclo de iluminação dia/noite integrado ao relógio do `game-core`.
4. **Desacoplamento Rigoroso:**
   - O Three.js atua puramente como camada de apresentação visual no cliente web, lendo o estado determinístico do `game-core`. Nenhuma regra de negócio, economia ou lógica policial é processada no motor gráfico.
