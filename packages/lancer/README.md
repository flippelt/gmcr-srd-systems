# @lippelt/srd-lancer

Módulo Lancer para [@lippelt/srd-core](../core).

> This work is not an official Lancer product; it is a third party work, and is not affiliated with Massif Press. Published via the [Lancer Third Party License](https://massifpress.com/legal).

## O que inclui

- **Dice presets** — d20, d6/2d6/3d6/4d6, d3, "structure", "stress"
- **12 status conditions** (Impaired, Slowed, Immobilized, Lock On, Engaged, Stunned, Prone, Invisible, Shutdown, Hidden, Danger Zone, Burn) — nomes oficiais, resumos próprios
- **Tracker fields** — Structure (0-4), Stress (0-4), Heat, Armor (0-4), Evasion, E-Defense
- **Rules automatizadas:**
  - `roll('check' | 'skill', { modifier, accuracy?, difficulty? })` — d20 + acc/diff (cancelam 1-1; rola pelo líquido, pega maior pra acc / menor pra diff)
  - `roll('attack', { modifier, targetDefense?, accuracy?, difficulty? })` — d20 vs Evasion/E-Defense; crit em 20 natural
  - `roll('damage', { count, sides, modifier, type?, armor? })` — armor reduz kinetic/energy/explosive, ignora burn/heat
  - `roll('structure', {})` / `roll('stress', {})` — d6 nas tabelas de dano estrutural / de reator
  - `applyDamage(amount, { type, armor })` — mesma redução do damage roll

## Não inclui (3PP License)

Não redistribuímos texto ou arte oficial de Massif Press. As tabelas e descrições de condições são paráfrases mecânicas escritas do zero. Para regras detalhadas use o Lancer Core Book.

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { lancer } from '@lippelt/srd-lancer'

register(lancer)
```

## Licença

[MIT](LICENSE) (código). Mecânicas usadas sob a Lancer Third Party License da Massif Press.
