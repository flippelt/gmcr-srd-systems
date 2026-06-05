# @lippelt/srd-dnd-3.5

Módulo D&D 3.5 para [`@lippelt/srd-core`](../core).

> Dungeons & Dragons® é trademark da Wizards of the Coast LLC. Mecânica derivada do [System Reference Document 3.5](https://www.opengamingfoundation.org/) sob a **Open Game License v1.0a**.

## O que inclui

- **7 presets de dados** — d20, d4–d12, d100
- **24 condições** do SRD 3.5 (Cego, Encolhido, Pasmo, Morrendo, Amedrontado, Agarrado, Indefeso, Em Pânico, Paralisado, Petrificado, Imobilizado, Caído, Abalado, Enojado, Aturdido etc — nomes em inglês no `id`, rótulos em PT-BR seguindo a tradução Devir).
- **5 campos de status** — CA, Fort, Ref, Vontade, BBA
- **Regras automatizadas:**
  - `roll('d20'/'check'/'ability'/'skill', { modifier })` — d20 + modificador, anota 20/1 natural.
  - `roll('attack', { modifier, targetAC, critRange? })` — ataque vs CA, marca crítico (20 natural sempre ameaça + faixa de ameaça).
  - `roll('save', { modifier, dc })` — teste de resistência; 20 natural passa, 1 natural falha automaticamente.
  - `roll('damage', { count, sides, modifier, critMultiplier? })` — multiplica os dados em crítico (×2/×3/×4).
- **Utilitários:** `abilityMod`, `spellSaveDC`

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { dnd35 } from '@lippelt/srd-dnd-3.5'

register(dnd35)
```

## Licença

[MIT](LICENSE) (código). Conteúdo do SRD 3.5 sob OGL 1.0a.
