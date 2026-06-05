# @lippelt/srd-gumshoe

Módulo GUMSHOE (mecânica genérica) para [@lippelt/srd-core](../core).

> GUMSHOE™ é trademark da Pelgrane Press. Mecânica derivada do [GUMSHOE SRD](https://site.pelgranepress.com/index.php/the-gumshoe-system-reference-document/) de Robin D. Laws, sob **Creative Commons Attribution 3.0 Unported**. GUMSHOE não tem tradução oficial PT-BR; alguns rótulos mantêm o original em inglês com explicação no resumo.

> Trail of Cthulhu, Night's Black Agents, Ashen Stars, Esoterrorists, Mutant City Blues, Fear Itself são Product Identity da Pelgrane Press — não estão neste pacote.

## O que inclui

- **10 presets de dados** — d6 + variantes de gasto de pontos (d6+1 a d6+4), 5 categorias de dano (d6−2 a d6+2).
- **8 condições** — Ferido, Gravemente Ferido, Abalado, Atordoado, Inconsciente, Insano, Perseguido, Conectado.
- **4 campos de status** — Estabilidade, Sanidade, reserva de Atletismo, reserva de Pressentir Perigo (Sense Trouble).
- **Regras:**
  - `roll('general' | 'check', { spend?, difficulty? })` — 1d6 + pontos gastos vs Dificuldade (padrão 4).
  - `roll('stability' | 'sanity', { spend?, difficulty? })` — mesma mecânica, marcada como teste de Estabilidade/Sanidade.
  - `roll('damage', { modifier })` — 1d6 + modificador da arma.
- **`investigativeSpend(ability, amount)`** — não rola; registra gasto de reserva de perícia investigativa (em GUMSHOE, encontrar pistas é automático; pontos compram informação extra).

## Não inclui

Settings específicos (Mythos de Cthulhu, anomalias de Mutant City Blues etc) são Product Identity. Use este pacote como base genérica e adicione conteúdo do livro original na sua mesa.

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { gumshoe } from '@lippelt/srd-gumshoe'

register(gumshoe)
```

## Licença

[MIT](LICENSE) (código). Mecânica derivada do GUMSHOE SRD (CC-BY 3.0).
