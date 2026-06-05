# @lippelt/srd-starfinder-1e

Módulo Starfinder 1ª Edição para [`@lippelt/srd-core`](../core).

> Starfinder® é trademark da Paizo Inc. Mecânica derivada do [Starfinder SRD](https://www.aonsrd.com/) sob **Open Game License v1.0a**.

## O que inclui

- **7 presets de dados** — d20, d4–d12, d100
- **30 condições** do SRD (Dormindo, Sangrando, Queimando, Pasmo, Morrendo, Sobrecarregado, Enredado, Exausto, Fascinado, Fatigado, Desprevenido, Amedrontado, Agarrado, Desfocado, Paralisado, Imobilizado, Enojado, Cambaleante, Atordoado etc).
- **8 campos de status** — **CAE** (Energia) + **CAC** (Cinética) separadas, Fort, Ref, Vontade, BBA, **Pontos de Vigor (SP)**, **Pontos de Determinação (RP)**.
- **Regras:**
  - `roll('d20'/'check'/'ability'/'skill', { modifier })`
  - `roll('attack', { modifier, damageType: 'kinetic'|'energy', targetEAC?, targetKAC? })` — escolhe a CA correta conforme o tipo de dano.
  - `roll('save', { modifier, dc })`
  - `roll('damage', { count, sides, modifier, damageType? })`
- **Utilitários:** `abilityMod`, `spellSaveDC`, **`applyToStaminaThenHp`** (drena Vigor primeiro; sobra vai pra PV).

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { starfinder1e } from '@lippelt/srd-starfinder-1e'

register(starfinder1e)
```

## Licença

[MIT](LICENSE) (código). Conteúdo do Starfinder SRD sob OGL 1.0a.
