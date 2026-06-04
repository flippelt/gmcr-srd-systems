# gmcr-srd-systems

Monorepo de regras, presets e condições para sistemas de RPG de mesa, consumido pelo [GM Control Room](https://github.com/flippelt/gm-control-room).

Cada sistema é um pacote publicável independente — você instala só os que sua mesa usa.

## Pacotes

| Pacote                                                            | Versão | Sistema                       | Licença do conteúdo |
| ----------------------------------------------------------------- | ------ | ----------------------------- | ------------------- |
| [`@gmcr/srd-core`](packages/core)                                 | 0.1.0  | Contrato + registry           | MIT                 |
| [`@gmcr/srd-dnd5e-2014`](packages/dnd5e-2014)                     | 0.1.0  | D&D 5e (2014) — SRD 5.1       | CC-BY 4.0 (WotC)    |

Sistemas planejados (`lancer`, `gumshoe-trail`, `vampire-v5`, `blade-runner`, `fallout-2d20`, `wng`, `imperium-maledictum`, `cyberpunk-red`) virão como novos pacotes em `packages/`. Os com conteúdo proprietário podem ficar num monorepo privado separado.

## Instalação (consumidor)

```bash
npm install @gmcr/srd-core @gmcr/srd-dnd5e-2014
```

```ts
import { register, getSystem } from '@gmcr/srd-core'
import { dnd5e2014 } from '@gmcr/srd-dnd5e-2014'

register(dnd5e2014)

const sys = getSystem('dnd5e-2014')!
const result = sys.rules!.roll!('attack', { modifier: 5, targetAC: 18, advantage: true })
```

## Desenvolvimento

```bash
npm install           # instala todos os workspaces
npm test              # roda tests de todos os pacotes
npm run typecheck     # tsc em todos
npm run lint          # eslint root + packages
npm run build         # tsup em todos
```

Para trabalhar em um pacote específico:

```bash
npm test  -w packages/dnd5e-2014
npm run dev -w packages/core
```

## Releases independentes

Cada pacote tem seu próprio `version` em `packages/*/package.json`. Tags seguem o padrão `core@v0.1.0` ou `dnd5e-2014@v0.1.0`. Publish é manual por enquanto (`npm publish -w packages/core`); workflow tag-trigger pode automatizar no futuro.

## Autores de novos sistemas

Crie `packages/<nome>/` implementando o contrato `System` de `@gmcr/srd-core`. Veja `packages/dnd5e-2014/` como referência.

## Licença

[MIT](LICENSE). Conteúdo derivado de SRDs em cada pacote mantém atribuição própria.
