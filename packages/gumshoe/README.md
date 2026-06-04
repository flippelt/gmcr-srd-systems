# @gmcr/srd-gumshoe

Módulo GUMSHOE (mecânica genérica) para [@gmcr/srd-core](../core).

Baseado no [GUMSHOE SRD](https://site.pelgranepress.com/index.php/the-gumshoe-system-reference-document/) de Robin D. Laws / Pelgrane Press, sob a **Creative Commons Attribution 3.0 Unported**.

> Trail of Cthulhu, Night's Black Agents, Ashen Stars, Esoterrorists, Mutant City Blues, Fear Itself são Product Identity da Pelgrane Press — não estão neste pacote.

## O que inclui

- **10 dice presets** — d6 + variantes de spend (d6+1 a d6+4), 5 categorias de dano (d6−2 a d6+2)
- **8 conditions** — Hurt, Seriously Wounded, Shaken, Stunned, Unconscious, Insane, Pursued, Connected
- **4 tracker fields** — Stability, Sanity, Athletics pool, Sense Trouble pool
- **Rules:**
  - `roll('general' | 'check', { spend?, difficulty? })` — 1d6 + pontos gastos vs DC (padrão 4)
  - `roll('stability' | 'sanity', { spend?, difficulty? })` — mesma mecânica, marcada como teste de Estabilidade
  - `roll('damage', { modifier })` — 1d6 + modificador da arma
- **`investigativeSpend(ability, amount)`** — não rola; registra gasto de pool de perícia de investigação (no GUMSHOE, achar pistas é automático; pontos compram informação extra)

## Não inclui

Settings específicos (Cthulhu Mythos, anomalies do Mutant City Blues, etc) são Product Identity. Use este pacote como base genérica e adicione conteúdo do livro original na sua mesa.

## Uso

```ts
import { register } from '@gmcr/srd-core'
import { gumshoe } from '@gmcr/srd-gumshoe'

register(gumshoe)
```

## Licença

[MIT](LICENSE) (código). Mecânica deriva do GUMSHOE SRD (CC-BY 3.0).
