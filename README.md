# @gmcr/srd-systems

Bundles de regras, presets de dados e condições para sistemas de RPG de mesa, consumido pelo [GM Control Room](https://github.com/flippelt/gm-control-room).

## Sistemas suportados

| ID            | Nome                            | Fonte das regras  | Licença do conteúdo |
| ------------- | ------------------------------- | ----------------- | ------------------- |
| `dnd5e-2014`  | Dungeons & Dragons 5e (2014)    | SRD 5.1           | CC-BY 4.0 (WotC)    |

Sistemas adicionais com conteúdo proprietário (V5, Blade Runner, Fallout, W&G, Imperium Maledictum, Cyberpunk RED) vivem em um pacote privado separado.

## Instalação

```bash
npm install @gmcr/srd-systems
```

## Uso

```ts
import { getSystem } from '@gmcr/srd-systems'

const dnd = await getSystem('dnd5e-2014')
if (!dnd) throw new Error('sistema não disponível')

// Presets de dados pra UI
console.log(dnd.dicePresets)

// Rolar um ataque
const attack = dnd.rules!.roll!('attack', {
  modifier: 5,
  targetAC: 18,
  advantage: true,
})
console.log(attack)
// { rolls: [..], total: .., notes: ['vantagem', 'acertou'] }
```

## Estrutura

Cada sistema implementa o contrato `System` (em [src/types.ts](src/types.ts)):

- `dicePresets` — botões de rolagem rápida específicos do sistema
- `conditions` — condições/status com descrição
- `trackerFields` — campos numéricos extras no tracker (ex: AC no D&D, Hunger no V5)
- `rules.roll(kind, params)` — rolagens automatizadas
- `rules.applyDamage(amount, target)` — redução de dano (resistência, vulnerabilidade, imunidade)

## Licença

MIT (código). Conteúdo derivado de SRDs mantém sua atribuição original — ver [LICENSE](LICENSE) e o cabeçalho de cada módulo de sistema.
