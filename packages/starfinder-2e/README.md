# @lippelt/srd-starfinder-2e

Módulo Starfinder 2ª Edição para [`@lippelt/srd-core`](../core).

> Starfinder® é trademark da Paizo Inc. Mecânica derivada do [Starfinder Second Edition Reference Document](https://paizo.com/community/communityuse) sob a [ORC License](https://paizo.com/orclicense).

## O que combina

SF2e une dois universos mecânicos:

- **De PF2e:** graus de sucesso ±10 (Sucesso Crítico / Sucesso / Falha / Falha Crítica), patentes de proficiência, economia de 3 ações (Acelerado/Lento valoradas), Penalidade de Múltiplos Ataques (PMA).
- **De SF1e:** CAE/CAC separadas pelo tipo do dano, Pontos de Vigor + PV (drena Vigor primeiro), Pontos de Determinação como recurso narrativo.

## O que inclui

- **7 presets de dados** — d20, d4–d12, d100
- **31 condições** (Desajeitado N, Amedrontado N, Acelerado, Lento N, Ferido N + Off-Guard e Superaquecido específicos do SF2).
- **10 campos de status** — CAE, CAC, Fort, Ref, Vontade, Percepção, Velocidade, SP (Vigor), RP (Determinação), Pontos de Herói.
- **Regras:**
  - `roll('check'/'skill'/'perception', { modifier, dc? })`
  - `roll('attack', { modifier, damageType: 'kinetic'|'energy', targetEAC?, targetKAC?, map? })`
  - `roll('save', { modifier, dc })`
  - `roll('damage', { count, sides, modifier, damageType?, critical? })` — crítico ×2.
- **Utilitários:** `abilityMod`, `proficiencyBonus(rank)`, `degreeOfSuccess(total, dc, natural)`, **`applyToStaminaThenHp`**.

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { starfinder2e } from '@lippelt/srd-starfinder-2e'

register(starfinder2e)
```

## Licença

[MIT](LICENSE) (código). Conteúdo do SF2 SRD sob ORC License.
