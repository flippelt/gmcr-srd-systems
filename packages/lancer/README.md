# @lippelt/srd-lancer

Módulo Lancer para [@lippelt/srd-core](../core).

> Lancer™ é trademark da Massif Press. Este trabalho não é um produto oficial de Lancer; é um trabalho de terceiros, publicado sob a [Lancer Third Party License](https://massifpress.com/legal). Lancer tem edição oficial em português (**Tria Editora**) — os rótulos das condições/estados usam os termos oficiais dessa tradução; os resumos são paráfrases próprias (não redistribuímos texto oficial).

## O que inclui

- **Presets de dados** — d20, d6/2d6/3d6/4d6, d3, "structure" (estrutura), "stress" (estresse)
- **12 condições/estados** (Impedido, Lento, Imobilizado, Travado, Engajado, Atordoado, Prostrado, Invisível, Desligado, Escondido, Zona de Perigo, Queimadura) — termos oficiais da edição Tria; resumos próprios em PT-BR.
- **Campos de status** — Structure (0–4), Stress (0–4), Heat, Armor (0–4), Evasion, E-Defense
- **Regras automatizadas:**
  - `roll('check' | 'skill', { modifier, accuracy?, difficulty? })` — d20 + Accuracy/Difficulty (cancelam 1-1; rola o líquido, pega o maior pra accuracy / o menor pra difficulty).
  - `roll('attack', { modifier, targetDefense?, accuracy?, difficulty? })` — d20 vs Evasion/E-Defense; crítico em 20 natural.
  - `roll('damage', { count, sides, modifier, type?, armor? })` — Armor reduz dano cinético/energético/explosivo; ignora burn/heat.
  - `roll('structure', {})` / `roll('stress', {})` — d6 nas tabelas de dano estrutural / de reator.
  - `applyDamage(amount, { type, armor })` — mesma redução da rolagem de dano.

## Não inclui (3PP License)

Não redistribuímos texto ou arte oficial da Massif Press. As tabelas e descrições de condições são paráfrases mecânicas escritas do zero. Para regras detalhadas use o Lancer Core Book.

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { lancer } from '@lippelt/srd-lancer'

register(lancer)
```

## Licença

[MIT](LICENSE) (código). Mecânicas usadas sob a Lancer Third Party License da Massif Press.
