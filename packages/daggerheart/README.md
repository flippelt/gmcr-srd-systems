# @lippelt/srd-daggerheart

Módulo Daggerheart para [`@lippelt/srd-core`](../core).

> Daggerheart™ é trademark da [Darrington Press LLC](https://darringtonpress.com/). Mecânica derivada do [Daggerheart SRD](https://www.daggerheart.com/srd/) sob a [Darrington Press Community Gaming License (DPCGL)](https://darringtonpress.com/license/). Daggerheart tem edição oficial em português (**Jambô Editora**) — os rótulos usam os termos oficiais dessa tradução (ex.: Stress → **Fadiga**, thresholds Maior/Grave); os resumos são paráfrases próprias.

## O que inclui

- **Dados de Dualidade** — `roll('check' | 'duality', { modifier, difficulty?, advantage?, disadvantage? })` rola 2d12 (Esperança / Medo). Anota o resultado: `with-hope`, `with-fear` ou `critical` (Esperança = Medo).
- **Limiares de dano** — `applyDamage(amount, { major, severe, armorMark? })` retorna marcações de PV (0..3) conforme a banda (Maior / Grave). `armorMark: true` reduz a severidade em 1 banda.
- **Rolagem de dano** — `roll('damage', { count, sides, modifier })` simples.
- **10 condições** — Imobilizado, Vulnerável, Oculto, Em Chamas, Envenenado, Atordoado, Distraído, Camuflado, Carregado, Caído.
- **10 campos de status** — PV/PVmax, Fadiga/PFmax, Armadura, Esperança, Evasão, Limiar Maior, Limiar Grave, Dificuldade.
- **7 presets de dados** — Dualidade + d4/d6/d8/d10/d12 (dano) + d20.

## Não inclui

Conteúdo do *campaign frame* (Witherwild), nomes de classes/ancestrias/comunidades específicas, lore. Use o livro/SRD oficial pra esse material.

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { daggerheart } from '@lippelt/srd-daggerheart'

register(daggerheart)
```

## Licença

[MIT](LICENSE) (código). Mecânicas usam o Daggerheart SRD via DPCGL.
