# @lippelt/srd-core

Contrato + registro para sistemas de RPG plugáveis. Cada sistema (D&D 5e, Pathfinder, Lancer etc) é distribuído como seu próprio pacote (`@lippelt/srd-*`), implementando o contrato `System` definido aqui.

Pensado para ser consumido por painéis de mesa, ferramentas de jogo e VTTs leves — **agnóstico de UI**.

## Instalação

```bash
npm install @lippelt/srd-core @lippelt/srd-dnd5e-2014   # exemplo: + D&D 5e
```

## Uso

```ts
import { register, getSystem } from '@lippelt/srd-core'
import { dnd5e2014 } from '@lippelt/srd-dnd5e-2014'

register(dnd5e2014)

const sys = getSystem('dnd5e-2014')
const result = sys?.rules?.roll?.('attack', { modifier: 5, targetAC: 18, advantage: true })
// → { rolls: [18, 4], modifier: 5, total: 23, notation: '2d20kh1+5', notes: ['vantagem', 'acertou (CA 18)'] }
```

## API

- `register(system: System): void` — registra um sistema. Idempotente (mesma referência); colisão de id com instância diferente lança erro.
- `getSystem(id: SystemId): System | null` — resolve síncrono; retorna `null` se não registrado.
- `listRegisteredSystems(): SystemId[]` — todos os ids atualmente registrados.
- `clearRegistry(): void` — limpa o registro (útil em testes).

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
  rules?: SystemRules    // opcional — rolagens customizadas (vantagem, crítico, dano)
}
```

> Os nomes dos campos no contrato permanecem em inglês por serem identificadores de código (consumidos por TypeScript em qualquer idioma de projeto).

### `DicePreset`

Botões de rolagem rápida por categoria (`check`, `attack`, `damage`, `save`, `special`):

```ts
{ id: 'd20-adv', label: 'd20 com vantagem', notation: '2d20kh1', category: 'check' }
```

### `ConditionDef`

Condições/estados do sistema:

```ts
{ id: 'poisoned', label: 'Envenenado', summary: 'Desvantagem em ataques e testes de habilidade.' }
```

### `TrackerField`

Campos numéricos/booleanos extras por combatente:

```ts
{ key: 'ac', label: 'CA', kind: 'integer', min: 0, max: 30, default: 10 }
{ key: 'inspiration', label: 'Insp', kind: 'boolean', default: false }
```

### `SystemRules` (opcional)

Funções puras de rolagem/dano que vão além da notação `NdM±K`:

```ts
rules?: {
  roll?: (kind: string, params: unknown) => RollResult | null
  applyDamage?: (incoming: number, target?: unknown) => { final: number; notes: string[] }
}
```

`kind` é convenção do sistema (ex.: `'attack'`, `'save'`, `'damage'`).

### `SystemNpcHooks` (opcional, v0.1.3+)

Hooks consumidos pelo [`@lippelt/srd-npcgen`](https://www.npmjs.com/package/@lippelt/srd-npcgen) pra refinar a geração de NPCs por sistema. Cada um é independente:

```ts
npc?: {
  /** Override da progressão de ataque (PF2: level + rank bonus). */
  attackProgression?: (level: number, role: string) => number
  /** Override do nº de dados de cantrip (PF2 heightening). */
  cantripDamageDice?: (level: number) => number
  /** Lista canônica de perícias do sistema. */
  skills?: readonly string[]
  /** Idiomas default pra um tipo de criatura no setting. */
  defaultLanguages?: (creatureType: string) => string[]
}
```

Sem hook, o npcgen usa defaults d20 genéricos.

## Sistemas implementados

Veja o monorepo [gmcr-srd-systems](https://github.com/flippelt/gmcr-srd-systems): D&D 3.5, D&D 5e (2014/2024), Pathfinder 1e/2e, Starfinder 1e/2e, Lancer, GUMSHOE, Daggerheart, Candela Obscura.

## Adicionar um sistema novo

1. Crie `packages/<seu-sistema>/` no monorepo (ou em projeto separado).
2. Implemente o contrato `System`.
3. Exporte como named export (ex.: `export const meuSistema: System = { ... }`).
4. `register(meuSistema)` no bootstrap do consumidor.

Veja [`packages/dnd5e-2014/`](https://github.com/flippelt/gmcr-srd-systems/tree/main/packages/dnd5e-2014) como referência.

## Licença

[MIT](LICENSE).
