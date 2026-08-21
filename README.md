# gmcr-srd-systems

[![CI](https://img.shields.io/github/actions/workflow/status/flippelt/gmcr-srd-systems/ci.yml?label=CI)](https://github.com/flippelt/gmcr-srd-systems/actions) [![npm](https://img.shields.io/npm/v/@lippelt/srd-core?label=%40lippelt%2Fsrd-core)](https://www.npmjs.com/package/@lippelt/srd-core) [![Last commit](https://img.shields.io/github/last-commit/flippelt/gmcr-srd-systems)](https://github.com/flippelt/gmcr-srd-systems/commits) [![License](https://img.shields.io/github/license/flippelt/gmcr-srd-systems)](https://github.com/flippelt/gmcr-srd-systems/blob/main/LICENSE) ![Top language](https://img.shields.io/github/languages/top/flippelt/gmcr-srd-systems) ![Repo size](https://img.shields.io/github/repo-size/flippelt/gmcr-srd-systems) ![Issues](https://img.shields.io/github/issues/flippelt/gmcr-srd-systems)

Monorepo de regras, presets e condições para sistemas de RPG de mesa. Pensado pra ser consumido por painéis de mesa e VTTs leves — **agnóstico de UI**. Usado em produção pelo [GM Control Room](https://github.com/flippelt/gm-control-room).

Cada sistema é um pacote npm publicado independentemente — você instala só os que sua mesa usa.

[![CI](https://github.com/flippelt/gmcr-srd-systems/actions/workflows/ci.yml/badge.svg)](https://github.com/flippelt/gmcr-srd-systems/actions/workflows/ci.yml)

## Pacotes públicos

| Pacote | Versão | Sistema | Licença do conteúdo |
| --- | --- | --- | --- |
| [`@lippelt/srd-core`](packages/core) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-core?label=)](https://www.npmjs.com/package/@lippelt/srd-core) | Contrato + registro | MIT |
| [`@lippelt/srd-dnd-3.5`](packages/dnd-3.5) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-dnd-3.5?label=)](https://www.npmjs.com/package/@lippelt/srd-dnd-3.5) | D&D 3.5 — SRD 3.5 | OGL 1.0a (WotC) |
| [`@lippelt/srd-dnd5e-2014`](packages/dnd5e-2014) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-dnd5e-2014?label=)](https://www.npmjs.com/package/@lippelt/srd-dnd5e-2014) | D&D 5e (2014) — SRD 5.1 | CC-BY 4.0 (WotC) |
| [`@lippelt/srd-dnd5e-2024`](packages/dnd5e-2024) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-dnd5e-2024?label=)](https://www.npmjs.com/package/@lippelt/srd-dnd5e-2024) | D&D 5e (2024) — SRD 5.2 | CC-BY 4.0 (WotC) |
| [`@lippelt/srd-pathfinder-1e`](packages/pathfinder-1e) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-pathfinder-1e?label=)](https://www.npmjs.com/package/@lippelt/srd-pathfinder-1e) | Pathfinder 1e — PRD | OGL 1.0a (Paizo) |
| [`@lippelt/srd-pathfinder-2e`](packages/pathfinder-2e) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-pathfinder-2e?label=)](https://www.npmjs.com/package/@lippelt/srd-pathfinder-2e) | Pathfinder 2e — PRD | ORC License (Paizo) |
| [`@lippelt/srd-starfinder-1e`](packages/starfinder-1e) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-starfinder-1e?label=)](https://www.npmjs.com/package/@lippelt/srd-starfinder-1e) | Starfinder 1e — SRD | OGL 1.0a (Paizo) |
| [`@lippelt/srd-starfinder-2e`](packages/starfinder-2e) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-starfinder-2e?label=)](https://www.npmjs.com/package/@lippelt/srd-starfinder-2e) | Starfinder 2e — SRD | ORC License (Paizo) |
| [`@lippelt/srd-lancer`](packages/lancer) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-lancer?label=)](https://www.npmjs.com/package/@lippelt/srd-lancer) | Lancer (Massif Press) | Lancer 3PP License |
| [`@lippelt/srd-gumshoe`](packages/gumshoe) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-gumshoe?label=)](https://www.npmjs.com/package/@lippelt/srd-gumshoe) | GUMSHOE (Pelgrane Press) | CC-BY 3.0 |
| [`@lippelt/srd-daggerheart`](packages/daggerheart) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-daggerheart?label=)](https://www.npmjs.com/package/@lippelt/srd-daggerheart) | Daggerheart (Darrington Press) | DPCGL |
| [`@lippelt/srd-candela-obscura`](packages/candela-obscura) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-candela-obscura?label=)](https://www.npmjs.com/package/@lippelt/srd-candela-obscura) | Candela Obscura (Darrington Press) | DPCGL |

### Ferramentas

| Pacote | Versão | O que é |
| --- | --- | --- |
| [`@lippelt/srd-npcgen`](packages/npcgen) | [![npm](https://img.shields.io/npm/v/@lippelt/srd-npcgen?label=)](https://www.npmjs.com/package/@lippelt/srd-npcgen) | Gerador de NPCs / encontros (d20 + pool + Lancer) |

**11 sistemas implementados** + core + npcgen. Cada sistema modela só mecânicas (dados, condições, modificadores derivados, campos de status) — **sem magias, classes, monstros ou itens específicos**, que devem vir do livro ou de uma camada superior.

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
npm install
npm test
npm run typecheck
npm run lint
npm run build
npm run pack:check
```

Pra trabalhar em um pacote específico:

```bash
npm test -w packages/dnd5e-2014
npm run dev -w packages/core
```

Stack: TypeScript 5.7, tsup (ESM + CJS + .d.ts), vitest, npm workspaces. Node ≥ 22.14 (trusted publishing).

## Releases independentes

Cada pacote tem seu próprio `version` em `packages/*/package.json`. Releases são acionados por **tags** no formato `<dir>@v<versão>`:

```
core@v1.0.0
dnd5e-2014@v1.0.0
lancer@v1.1.0
```

Quando uma tag desse formato é pushada, o workflow [`release.yml`](.github/workflows/release.yml) faz checkout, build, test do pacote alvo e publica no npm via **OIDC trusted publisher** (sem `NPM_TOKEN`, sem OTP). Provenance é gerado automaticamente. Depois cria um GitHub Release com o trecho do CHANGELOG.

Republicar a versão que já está no `package.json` da `main` (retry): Actions → Release → Run workflow.

### Para publicar uma versão

Bump no package.json (via PR, como sempre):

```bash
npm version patch -w packages/dnd5e-2014 --no-git-tag-version
```

```bash
git add packages/dnd5e-2014/package.json packages/dnd5e-2014/CHANGELOG.md package-lock.json
git commit -m "chore(dnd5e-2014): bump 0.1.1 → 0.1.2"
git push origin HEAD
```

Depois do merge na `main`, tag e push (um pacote):

```bash
git checkout main && git pull
node scripts/tag-release.mjs --push dnd5e-2014
```

Vários pacotes de uma vez — o script empurra **uma tag por vez** com pausa, senão o GitHub aglutina o push e só um workflow dispara:

```bash
node scripts/tag-release.mjs --push lancer gumshoe daggerheart
```

O workflow valida que a versão da tag bate com a do `package.json` (e que o nome npm é `@lippelt/srd-<dir>`) antes de publicar.

### Setup do trusted publisher (uma vez por pacote)

Já logado como `lippelt` no npm (`npm login`). Uma vez para todos os pacotes já publicados (2 s entre um e outro, senão o npm rate-limit):

```bash
for pkg in core dnd-3.5 dnd5e-2014 dnd5e-2024 pathfinder-1e pathfinder-2e starfinder-1e starfinder-2e lancer gumshoe daggerheart candela-obscura npcgen; do
  npm trust github "@lippelt/srd-$pkg" --file release.yml --repo flippelt/gmcr-srd-systems --allow-publish -y
  sleep 2
done
```

Campos equivalentes na UI: Package → Settings → Trusted Publisher → GitHub Actions (`flippelt` / `gmcr-srd-systems` / `release.yml` / `npm publish`).

O secret `NPM_TOKEN` do repo ficou obsoleto — apagar depois do primeiro publish OIDC bem-sucedido. Não recolocar `NODE_AUTH_TOKEN` no workflow.

## Adicionar um sistema novo

1. Crie `packages/<nome>/` baseado em [`packages/dnd5e-2014/`](packages/dnd5e-2014) (estrutura: `package.json`, `tsconfig.json`, `tsup.config.ts`, `src/index.ts`, `src/index.test.ts`, `README.md`).
2. Implemente o contrato `System` — exporte como named export (ex.: `export const meuSistema: System = { ... }`).
3. Testes determinísticos: exporte `setRoller(fn)` e `resetRoller()` pra permitir injeção de dados controlados.
4. README seguindo o padrão dos outros (o que inclui, o que NÃO inclui, exemplo de uso, licença).
5. PR. Após merge, o **primeiro** publish de um pacote novo é local (`npm publish -w packages/<nome> --access public`, com OTP) — o npm só aceita trusted publisher depois da primeira versão. Aí `npm trust github @lippelt/srd-<nome> --file release.yml --repo flippelt/gmcr-srd-systems --allow-publish -y` e as próximas saem por tag.

## Licença

Código sob [MIT](LICENSE). Conteúdo derivado de SRDs em cada pacote mantém atribuição própria (vide README + `attribution` do `System`).
