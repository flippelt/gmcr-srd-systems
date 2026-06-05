# @lippelt/srd-pathfinder-2e

Módulo Pathfinder 2ª Edição para [`@lippelt/srd-core`](../core).

> Pathfinder® é trademark da Paizo Inc. Mecânica derivada do [Pathfinder Reference Document (PF2)](https://paizo.com/community/communityuse) sob a [ORC License](https://paizo.com/orclicense). Termos em PT-BR seguem a tradução Devir.

## Diferenças vs PF1e

- **Graus de sucesso** (Degrees of success): Sucesso Crítico (≥ CD+10), Sucesso (≥ CD), Falha (≥ CD−10), Falha Crítica (< CD−10). 20 natural sobe um grau, 1 natural desce um grau.
- **Penalidade de Múltiplos Ataques (PMA)**: 2º ataque −5, 3º ataque −10 — parâmetro `map` na rolagem de ataque.
- **Patentes de Proficiência**: Destreinado / Treinado / Especialista / Mestre / Lendário com bônus 0 / 2 / 4 / 6 / 8.
- **Economia de 3 ações**: tracker traz `quickened` (Acelerado) e `slowed` (Lento) como condições valoradas.
- **Pontos de Herói** e **Pontos de Foco** como recursos.

## O que inclui

- **7 presets de dados** — d20, d4–d12, d100
- **36 condições** (Desajeitado N, Condenado N, Drenado N, Morrendo N, Enfraquecido N, Amedrontado N, Acelerado, Lento N, Atordoado N, Estupefato N, Ferido N etc — todas com valor numérico).
- **8 campos de status** — CA, Fort, Ref, Vontade, Percepção, Velocidade, Pontos de Herói, Pontos de Foco
- **Regras:**
  - `roll('check'/'skill'/'perception', { modifier, dc? })` — retorna grau de sucesso.
  - `roll('attack', { modifier, targetAC, map? })` — PMA aplicada, grau de sucesso.
  - `roll('save', { modifier, dc })`
  - `roll('damage', { count, sides, modifier, critical? })` — crítico dobra o total.
- **Utilitários:** `abilityMod`, `proficiencyBonus(rank)`, `degreeOfSuccess(total, dc, natural)`

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { pathfinder2e } from '@lippelt/srd-pathfinder-2e'

register(pathfinder2e)
```

## Licença

[MIT](LICENSE) (código). Conteúdo do PRD PF2 sob ORC License.
