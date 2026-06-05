# @lippelt/srd-pathfinder-1e

Módulo Pathfinder 1ª Edição para [`@lippelt/srd-core`](../core).

> Pathfinder® é trademark da Paizo Inc. Mecânica derivada do [Pathfinder Reference Document](https://paizo.com/community/communityuse) sob **Open Game License v1.0a**. Termos em PT-BR seguem a tradução Devir/New Order Editora.

## O que inclui

- **7 presets de dados** — d20, d4–d12, d100
- **32 condições** do PRD (Sangrando, Quebrado, Pasmo, Ofuscado, Morrendo, Drenado de Energia, Desprevenido, Amedrontado, Agarrado, Indefeso, Incorpóreo, Invisível, Enjoado, Em Pânico, Paralisado, Petrificado, Imobilizado, Caído, Abalado, Enojado, Cambaleante, Atordoado etc).
- **9 campos de status** — CA, CA de Toque, CA Desprevenida, Fort, Ref, Vontade, BBA, **BMC**, **DMC**
- **Regras:**
  - `roll('d20'/'check'/'ability'/'skill', { modifier })`
  - `roll('attack', { modifier, targetAC, critRange? })` — 20 natural ameaça; faixa de ameaça.
  - `roll('save', { modifier, dc })` — 20 natural passa, 1 natural falha automaticamente.
  - `roll('damage', { count, sides, modifier, critMultiplier? })`
  - `roll('combat-maneuver'/'maneuver', { cmb, targetCMD })` — manobras (BMC vs DMC).
- **Utilitários:** `abilityMod`, `spellSaveDC`, `combatManeuverDefense`

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { pathfinder1e } from '@lippelt/srd-pathfinder-1e'

register(pathfinder1e)
```

## Licença

[MIT](LICENSE) (código). Conteúdo do PRD sob OGL 1.0a.
