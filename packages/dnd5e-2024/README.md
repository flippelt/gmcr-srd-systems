# @lippelt/srd-dnd5e-2024

Módulo D&D 5e (2024 / "One D&D") para [`@lippelt/srd-core`](../core).

> D&D® é trademark da Wizards of the Coast LLC. Baseado no [System Reference Document 5.2](https://dnd.wizards.com/resources/systems-reference-document) sob **Creative Commons Attribution 4.0 International**.

## Diferenças vs `@lippelt/srd-dnd5e-2014`

- **Exaustão**: agora uma escala única 1..10 com **−2 cumulativo** em testes com d20 por nível; nível 10 = morte (em vez dos 6 níveis discretos do 5.1).
  - O parâmetro `exhaustion` em `roll('d20')` / `roll('attack')` / `roll('save')` aplica a penalidade automaticamente.
  - O tracker tem o campo `exhaustion` (0..10) pra registrar.
- **Condições**: 14 + Exaustão como entrada única (em vez de `exhaustion-1` até `exhaustion-6`).
- **Resto da matemática**: idêntica à 2014 — vantagem/desvantagem, crítico em 20 natural, CD de resistência = 8 + prof + mod etc.

## O que inclui

- **9 presets de dados** — d20 (+ vantagem/desvantagem), d4–d12, d100
- **15 condições** — Cego, Enfeitiçado, Surdo, Exaustão (nível), Amedrontado, Agarrado, Incapacitado, Invisível, Paralisado, Petrificado, Envenenado, Caído, Contido, Atordoado, Inconsciente
- **4 campos de status** — CA, Exaustão, Mortes ✓, Mortes ✗
- **Regras:** `check`, `attack`, `save`, `damage`, `applyDamage` (resistência/vulnerabilidade/imunidade)
- **Utilitários:** `abilityMod`, `spellSaveDC`, `spellAttackBonus`, `exhaustionPenalty`

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { dnd5e2024 } from '@lippelt/srd-dnd5e-2024'

register(dnd5e2024)
```

## Licença

[MIT](LICENSE) (código). Mecânica derivada do SRD 5.2 (CC-BY 4.0, Wizards of the Coast).
