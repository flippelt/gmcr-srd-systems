# gmcr-srd-systems

[![CI](https://img.shields.io/github/actions/workflow/status/flippelt/gmcr-srd-systems/ci.yml?label=CI)](https://github.com/flippelt/gmcr-srd-systems/actions) [![npm](https://img.shields.io/npm/v/@lippelt/srd-core?label=%40lippelt%2Fsrd-core)](https://www.npmjs.com/package/@lippelt/srd-core) [![Last commit](https://img.shields.io/github/last-commit/flippelt/gmcr-srd-systems)](https://github.com/flippelt/gmcr-srd-systems/commits) [![License](https://img.shields.io/github/license/flippelt/gmcr-srd-systems)](https://github.com/flippelt/gmcr-srd-systems/blob/main/LICENSE) ![Top language](https://img.shields.io/github/languages/top/flippelt/gmcr-srd-systems) ![Repo size](https://img.shields.io/github/repo-size/flippelt/gmcr-srd-systems) ![Issues](https://img.shields.io/github/issues/flippelt/gmcr-srd-systems)

Monorepo de regras, presets e condições para sistemas de RPG de mesa. Pensado pra ser consumido por painéis de mesa e VTTs leves — **agnóstico de UI**. Usado em produção pelo [GM Control Room](https://github.com/flippelt/gm-control-room).

Cada sistema é um pacote npm publicado independentemente — você instala só os que sua mesa usa.

[![CI](https://github.com/flippelt/gmcr-srd-systems/actions/workflows/ci.yml/badge.svg)](https://github.com/flippelt/gmcr-srd-systems/actions/workflows/ci.yml)

## Pacotes públicos

| Pacote | Versão | Sistema | Licença do conteúdo |
| --- | --- | --- | --- |
| [`@lippelt/srd-core`](packages/core) | [`1.0.0`](https://www.npmjs.com/package/@lippelt/srd-core) | Contrato + registro | MIT |
| [`@lippelt/srd-dnd-3.5`](packages/dnd-3.5) | [`1.0.0`](https://www.npmjs.com/package/@lippelt/srd-dnd-3.5) | D&D 3.5 — SRD 3.5 | OGL 1.0a (WotC) |
| [`@lippelt/srd-dnd5e-2014`](packages/dnd5e-2014) | [`1.0.0`](https://www.npmjs.com/package/@lippelt/srd-dnd5e-2014) | D&D 5e (2014) — SRD 5.1 | CC-BY 4.0 (WotC) |
| [`@lippelt/srd-dnd5e-2024`](packages/dnd5e-2024) | [`1.0.0`](https://www.npmjs.com/package/@lippelt/srd-dnd5e-2024) | D&D 5e (2024) — SRD 5.2 | CC-BY 4.0 (WotC) |
| [`@lippelt/srd-pathfinder-1e`](packages/pathfinder-1e) | [`1.0.0`](https://www.npmjs.com/package/@lippelt/srd-pathfinder-1e) | Pathfinder 1e — PRD | OGL 1.0a (Paizo) |
| [`@lippelt/srd-pathfinder-2e`](packages/pathfinder-2e) | [`1.0.0`](https://www.npmjs.com/package/@lippelt/srd-pathfinder-2e) | Pathfinder 2e — PRD | ORC License (Paizo) |
| [`@lippelt/srd-starfinder-1e`](packages/starfinder-1e) | [`1.0.0`](https://www.npmjs.com/package/@lippelt/srd-starfinder-1e) | Starfinder 1e — SRD | OGL 1.0a (Paizo) |
| [`@lippelt/srd-starfinder-2e`](packages/starfinder-2e) | [`1.0.0`](https://www.npmjs.com/package/@lippelt/srd-starfinder-2e) | Starfinder 2e — SRD | ORC License (Paizo) |
| [`@lippelt/srd-lancer`](packages/lancer) | [`1.1.0`](https://www.npmjs.com/package/@lippelt/srd-lancer) | Lancer (Massif Press) | Lancer 3PP License |
| [`@lippelt/srd-gumshoe`](packages/gumshoe) | [`1.1.0`](https://www.npmjs.com/package/@lippelt/srd-gumshoe) | GUMSHOE (Pelgrane Press) | CC-BY 3.0 |
| [`@lippelt/srd-daggerheart`](packages/daggerheart) | [`1.1.0`](https://www.npmjs.com/package/@lippelt/srd-daggerheart) | Daggerheart (Darrington Press) | DPCGL |
| [`@lippelt/srd-candela-obscura`](packages/candela-obscura) | [`1.1.0`](https://www.npmjs.com/package/@lippelt/srd-candela-obscura) | Candela Obscura (Darrington Press) | DPCGL |

**11 sistemas implementados** + core. Cada um modela só mecânicas (dados, condições, modificadores derivados, campos de status) — **sem magias, classes, monstros ou itens específicos**, que devem vir do livro ou de uma camada superior.

Os rótulos em PT-BR seguem as **traduções oficiais** quando existem — ver README de cada pacote:

| Sistema(s) | Editora BR |
| --- | --- |
| D&D 5e (2014/2024) | Galápagos Jogos |
| D&D 3.5, Pathfinder 1e/2e, Starfinder 1e/2e | Devir |
| Lancer | Tria Editora |
| Daggerheart, Candela Obscura | Jambô Editora |
| GUMSHOE (via *Rastro de Cthulhu*) | Retropunk |

Só os **rótulos** (nomes de condições, campos etc.) usam os termos oficiais; os resumos são paráfrases próprias, sem redistribuir texto protegido.

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
// → { rolls: [18, 4], modifier: 5, total: 23, notation: '2d20kh1+5', notes: ['vantagem', 'acertou (CA 18)'] }
```

Cada pacote tem seu próprio README com a API completa — abra na npmjs.com pelo link da tabela acima.

## Contrato `System`

```ts
interface System {
  id: string
  name: string
  ruleVersion: string
  attribution: string
  dicePresets: DicePreset[]
  conditions: ConditionDef[]
  trackerFields: TrackerField[]
  rules?: SystemRules    // opcional — rolagens customizadas (vantagem, crítico etc)
}
```

Tudo em `@lippelt/srd-core`. Veja o [README do core](packages/core/README.md) pra detalhes.

## Desenvolvimento

```bash
npm install           # instala todos os workspaces
npm test              # vitest em todos os pacotes
npm run typecheck     # tsc em todos
npm run lint          # eslint root + packages
npm run build         # tsup em todos
```

Pra trabalhar em um pacote específico:

```bash
npm test  -w packages/dnd5e-2014
npm run dev -w packages/core
```

Stack: TypeScript 5.7, tsup (ESM + CJS + .d.ts), vitest, npm workspaces.

## Releases independentes

Cada pacote tem seu próprio `version` em `packages/*/package.json`. Releases são acionados por **tags** no formato `<pacote>@v<versão>`:

```
core@v0.1.2
dnd5e-2014@v0.1.2
lancer@v0.1.5
```

Quando uma tag desse formato é pushada para `main`, o workflow [`release.yml`](.github/workflows/release.yml) faz checkout, build, test do pacote alvo e roda `npm publish` com `--provenance` + `--access public`.

### Para publicar uma versão

```bash
# 1. bump no package.json correspondente (via npm version)
npm version patch -w packages/dnd5e-2014 --no-git-tag-version

# 2. commit + push (via PR como sempre)
git add packages/dnd5e-2014/package.json package-lock.json
git commit -m "chore(dnd5e-2014): bump 0.1.1 → 0.1.2"
git push origin <branch>
# (abre PR, merge no main)

# 3. tag + push da tag (do main, após merge)
git checkout main && git pull
git tag dnd5e-2014@v0.1.2
git push origin dnd5e-2014@v0.1.2
```

O workflow valida que a versão da tag bate com a do `package.json` antes de publicar.

### Setup inicial (uma vez — já feito)

1. **Scope `@lippelt` no npm** — usa a conta `lippelt`. Não precisa criar org pra scopes de usuário.
2. **Token de automação** em [npmjs.com/settings/lippelt/tokens](https://www.npmjs.com/settings/lippelt/tokens) (tipo "Automation").
3. **Adicionar como secret do repo**:
   ```bash
   gh secret set NPM_TOKEN --repo flippelt/gmcr-srd-systems
   ```
4. **Permissão `id-token: write`** já está no `release.yml` pra suportar `--provenance`.

## Adicionar um sistema novo

1. Crie `packages/<nome>/` baseado em [`packages/dnd5e-2014/`](packages/dnd5e-2014) (estrutura: `package.json`, `tsconfig.json`, `tsup.config.ts`, `src/index.ts`, `src/index.test.ts`, `README.md`).
2. Implemente o contrato `System` — exporte como named export (ex.: `export const meuSistema: System = { ... }`).
3. Testes determinísticos: exporte `setRoller(fn)` e `resetRoller()` pra permitir injeção de dados controlados.
4. README seguindo o padrão dos outros (o que inclui, o que NÃO inclui, exemplo de uso, licença).
5. PR. Após merge, tag `<nome>@v0.1.0` dispara a publicação automática.

## Licença

Código sob [MIT](LICENSE). Conteúdo derivado de SRDs em cada pacote mantém atribuição própria (vide README + `attribution` do `System`).
