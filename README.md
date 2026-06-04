# @gmcr/srd-core

Contrato e registry para sistemas RPG plugáveis, consumido pelo [GM Control Room](https://github.com/flippelt/gm-control-room).

**Este pacote não inclui nenhum sistema.** Cada sistema vive em seu próprio repositório/pacote — você instala apenas os que sua mesa usa.

## Pacotes de sistema disponíveis

| Pacote                          | Sistema                       | Status |
| ------------------------------- | ----------------------------- | ------ |
| [`@gmcr/srd-dnd5e-2014`](https://github.com/flippelt/gmcr-srd-dnd5e-2014) | D&D 5e (SRD 5.1, CC-BY 4.0) | ativo |

Sistemas adicionais (Lancer, GUMSHOE, Vampire V5, Blade Runner, Fallout, Wrath & Glory, Imperium Maledictum, Cyberpunk RED) ainda não publicados.

## Instalação

```bash
npm install @gmcr/srd-core @gmcr/srd-dnd5e-2014
```

## Uso

```ts
import { register, getSystem } from '@gmcr/srd-core'
import { dnd5e2014 } from '@gmcr/srd-dnd5e-2014'

// Uma vez, no bootstrap do app:
register(dnd5e2014)

// Em qualquer ponto que precise das regras/presets:
const sys = getSystem('dnd5e-2014')
if (!sys) throw new Error('sistema não registrado')

const attack = sys.rules!.roll!('attack', {
  modifier: 5,
  targetAC: 18,
  advantage: true,
})
```

## Para autores de novos sistemas

Implemente o contrato `System` de [`src/types.ts`](src/types.ts):

```ts
import type { System } from '@gmcr/srd-core'

export const meuSistema: System = {
  id: 'meu-sistema',
  name: 'Meu Sistema',
  ruleVersion: '1.0',
  dicePresets: [...],
  conditions: [...],
  trackerFields: [...],
  rules: {
    roll: (kind, params) => { /* ... */ },
    applyDamage: (incoming, target) => { /* ... */ },
  },
}
```

Publique em um pacote separado (`@vendor/srd-meu-sistema`) e o consumidor faz `register(meuSistema)`.

## Licença

[MIT](LICENSE). Conteúdo derivado de SRDs em pacotes de sistema individuais mantém atribuição própria.
