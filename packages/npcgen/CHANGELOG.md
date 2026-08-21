# Changelog

Todas as mudanças notáveis deste pacote são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).


## [0.8.1] — 2026-08-21

### Corrigiu
- Tarball npm inclui o `LICENSE` MIT (estava listado em `files` mas o arquivo não ia no pacote).
- `exports` com types separados para ESM e CJS; source maps deixam de ir no tarball.

## [0.8.0] — 2026-07-14

### Adicionou
- `System.npc.defaults` (`NpcGenDefaults`): o sistema declara presets de
  geração (ex.: `nameStyle`) que o gerador aplica quando o caller não passa
  o campo.

## [0.7.0] — 2026-07-14

### Adicionou
- `NpcOptions.casterTradition: 'arcane' | 'divine'` (default `arcane`,
  compatível). Tradição divina usa papel próprio (prioridade WIS, armadura
  de clérigo, truques/magias divinas) e expõe `NpcMagic.tradition`.

## [0.6.0] — 2026-06-09

### Adicionou
- Gerador de encontros (`generateEncounter`) com orçamento de XP 5e / contagem
  por dificuldade nos sistemas de pool, adapters para tracker e Codex.
- Loot / recompensa (`generateLoot`, `encounter.loot`).
- Flavor de roleplay (`attachFlavor`, `generateFlavor`).
- Catálogo de armas ampliado e listas de truques/magias por banda de nível.

## [0.2.1] — 2026-06-08

- Adapters de pool cobrem sistemas externos via hook.

## [0.2.0] — 2026-06-06

### Adicionou
- Sistemas de pool: Daggerheart, Candela Obscura e GUMSHOE (`PoolGeneratedNpc`,
  type guards `isD20Npc` / `isPoolNpc`).

## [0.1.4] — 2026-06-06

- Ajustes de geração d20 (tuning, criaturas, armas, nomes).

## [0.1.1] — 2026-06-06

- Primeira publicação no npm: gerador d20 com multiataque, escala de dano e
  benchmarks de CR.
