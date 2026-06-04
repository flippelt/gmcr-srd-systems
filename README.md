# gmcr-srd-systems

Monorepo de regras, presets e condições para sistemas de RPG de mesa, consumido pelo [GM Control Room](https://github.com/flippelt/gm-control-room).

Cada sistema é um pacote publicável independente — você instala só os que sua mesa usa.

## Pacotes

| Pacote                                                            | Versão | Sistema                       | Licença do conteúdo |
| ----------------------------------------------------------------- | ------ | ----------------------------- | ------------------- |
| [`@lippelt/srd-core`](packages/core)                                 | 0.1.0  | Contrato + registry           | MIT                 |
| [`@lippelt/srd-dnd5e-2014`](packages/dnd5e-2014)                     | 0.1.0  | D&D 5e (2014) — SRD 5.1       | CC-BY 4.0 (WotC)    |
| [`@lippelt/srd-dnd5e-2024`](packages/dnd5e-2024)                     | 0.1.0  | D&D 5e (2024) — SRD 5.2       | CC-BY 4.0 (WotC)    |
| [`@lippelt/srd-lancer`](packages/lancer)                             | 0.1.0  | Lancer (Massif Press)         | Lancer 3PP License  |
| [`@lippelt/srd-gumshoe`](packages/gumshoe)                           | 0.1.0  | GUMSHOE (Pelgrane Press)      | CC-BY 3.0           |
| [`@lippelt/srd-daggerheart`](packages/daggerheart)                   | 0.1.0  | Daggerheart (Darrington Press) | DPCGL              |
| [`@lippelt/srd-candela-obscura`](packages/candela-obscura)           | 0.1.0  | Candela Obscura (Darrington)  | DPCGL               |

**Próximos sistemas para este monorepo público** (têm SRD/licença aberta):

- `dnd-3.5` — D&D 3.5 (Wizards, [OGL 1.0a](https://opengamingfoundation.org/ogl.html) — SRD 3.5)
- `pathfinder-1e` — Pathfinder 1ª Edição (Paizo, OGL 1.0a)
- `pathfinder-2e` — Pathfinder 2ª Edição (Paizo, [ORC License](https://paizo.com/orclicense))
- `starfinder-1e` — Starfinder 1ª Edição (Paizo, OGL 1.0a)
- `starfinder-2e` — Starfinder 2ª Edição (Paizo, ORC License)

**Em monorepo privado separado** (`vampire-v5`, `blade-runner`, `fallout-2d20`, `wng`, `imperium-maledictum`, `cyberpunk-red`, `ordem-paranormal`) — conteúdo proprietário do dono do livro. Ordem Paranormal pode migrar pra cá quando a Jambô oficializar a licença aberta que está estudando.

## Instalação (consumidor)

```bash
npm install @lippelt/srd-core @lippelt/srd-dnd5e-2014
```

```ts
import { register, getSystem } from '@lippelt/srd-core'
import { dnd5e2014 } from '@lippelt/srd-dnd5e-2014'

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

Cada pacote tem seu próprio `version` em `packages/*/package.json`. Releases são acionados por **tags** no formato `<pacote>@v<versão>`:

```
core@v0.1.1
dnd5e-2014@v0.2.0
lancer@v0.1.5
gumshoe@v0.1.0
```

Quando uma tag desse formato é pushada para `main`, o workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) faz checkout, build, test do pacote alvo e roda `npm publish` (com `--provenance`).

### Setup inicial (uma vez)

1. **Criar o scope `@gmcr` no npm** (caso ainda não exista):
   ```bash
   npm login
   npm org create gmcr
   ```
2. **Gerar token de automação** em [npmjs.com/settings/{user}/tokens](https://www.npmjs.com/settings/) (tipo "Automation").
3. **Adicionar como secret** do repo:
   `gh secret set NPM_TOKEN --repo flippelt/gmcr-srd-systems`

### Para publicar uma versão

```bash
# 1. bump no package.json correspondente
cd packages/dnd5e-2014
npm version patch    # ou minor/major

# 2. commit + push (via PR como sempre)
# 3. tag + push da tag
git tag dnd5e-2014@v0.1.1
git push origin dnd5e-2014@v0.1.1
```

O workflow valida que a versão da tag bate com a do `package.json` antes de publicar.

## Autores de novos sistemas

Crie `packages/<nome>/` implementando o contrato `System` de `@lippelt/srd-core`. Veja `packages/dnd5e-2014/` como referência.

## Licença

[MIT](LICENSE). Conteúdo derivado de SRDs em cada pacote mantém atribuição própria.
