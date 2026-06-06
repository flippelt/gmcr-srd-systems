# `@lippelt/srd-npcgen` — Roadmap v2

> TODO persistente e versionado (acessível de qualquer máquina/instância).
> Marque os itens com `[x]` conforme forem concluídos e abra um PR por bloco.

## Contexto / estado atual (v0.1.0)

O pacote gera NPCs para a **família d20** (`D20_MODEL`: 5e 2024/2014, D&D 3.5,
Pathfinder 1e/2e, Starfinder 1e/2e) e **lança erro** para sistemas de pool.

Já faz: atributos por arquétipo (8 papéis), HP (dado de vida + CON), CA
(`10 + armadura + Dex limitada`), saves (proficiência ou bom/fraco), **um**
ataque assinatura, algumas perícias, nome por sílabas. RNG injetável +
`seededRoller` (determinístico). Adapters: `toTrackerCombatant` (GMCR) e
`toCodexMarkdown` (codex).

Arquivos: `src/{types,rng,data,d20,names,generate,adapters,index}.ts` +
testes `*.test.ts`. Build tsup (esm+cjs+dts).

**Como retomar:** começar pelo Bloco A (mais isolado e testável). Cada item
deve vir com teste determinístico (use `seed`/`setRng`). Manter `typecheck`,
`lint` e `test` verdes (CI builda o core antes dos testes).

---

## Bloco A — Aprofundar o d20

- [x] **Multiataque por nível**: papéis marciais ganham ataques extras (ex.: 5/11/20 no estilo 5e; iterativos no modelo BAB). Expor `attacks: NpcAttack[]`. *(v0.1.1)*
- [x] **Escala de dano**: número de dados/bônus do ataque cresce com nível/CR (caster como cantrip 1/2/3/4; brute ganha dado extra no lvl 11). *(v0.1.1)*
- [x] **Benchmarks por CR/nível**: tabela alvo de HP/CA/ataque/DC por CR para *calibrar* a saída (não só derivar dos atributos), evitando NPCs fracos/fortes demais. *(v0.1.1 — função `getBenchmark`, anexado em `npc.benchmark`)*
- [ ] **Bloco de magia para `caster`**: `spellSaveDC`/`spellAttackBonus` (usar os helpers do pacote de sistema quando existirem), cantrips/slots sugeridos.
- [ ] **Tuning por sistema** (em vez de só os 2 modelos genéricos):
  - [ ] PF2e: proficiência = nível + bônus; graus de sucesso no ataque.
  - [ ] Starfinder: Stamina + HP, KAC/EAC no lugar de CA única.
  - [ ] D&D 3.5/PF1: saves Fort/Ref/Will explícitos; iterativos de BAB.
- [ ] **Tipo/tamanho de criatura**, sentidos (visão no escuro), deslocamentos (voo/natação), idiomas.
- [ ] **Resistências/imunidades/imunidade a condições** por tipo/papel, ligadas ao `applyDamage` do sistema.
- [ ] **Perícias completas** por sistema + seleção de proficiências por papel.
- [ ] **Tabela de armas/equipamento** → derivar nome/dano do ataque a partir de uma arma.
- [ ] **Nomes melhores**: listas com sabor por sistema/cultura + títulos/epítetos.
- [ ] **Hook opcional `System.npc?`** no `@lippelt/srd-core`: cada pacote de sistema pode refinar a geração (padrão de plugin já usado); `npcgen` usa o hook se existir, senão cai no genérico d20. *(Pré-requisito p/ o tuning fino por sistema.)*

## Bloco B — Sistemas de pool (começar)

- [ ] **Generalizar `generateNpc`**: despachar por *família* do sistema (d20 vs pool) em vez de lançar erro. Criar `SYSTEM_FAMILY` em `data.ts`.
- [ ] **Forma de NPC de pool** em `types.ts` (sem CA/mods d20; com pools, defesas, faixas/limiares).
- [ ] **Daggerheart**: dificuldade, limiares (major/severe), HP/Stress/Armor, experiências, ataque.
- [ ] **Candela Obscura**: drives/resistances, papel (role), marcas (gilded/marked).
- [ ] **GUMSHOE**: pools de perícias gerais/investigativas, Health/Stability, Hit Threshold.
- [ ] **Adapters de pool** → `toTrackerCombatant` (mapear pools para os `trackerFields` de cada sistema) e `toCodexMarkdown`.
- [ ] **Testes por sistema de pool**: geração determinística + integridade (a saída casa com os `trackerFields` reais do pacote, via `validateSystem`/o tracker).

## Bloco C — Integração com o GM Control Room

- [ ] **Publicar `@lippelt/srd-npcgen` no npm** (como `rpgterm-engine`/`srd-core`) para o GMCR consumir como dependência versionada. *(Pré-requisito da integração.)*
- [ ] **Ação "Gerar NPC" no GMCR**: usar `generateNpc` com o sistema da campanha ativa (mapear `campaign` → `systemId`).
- [ ] **Jogar no tracker**: ao gerar, enviar `toTrackerCombatant(npc)` pelo evento de socket existente (`addCombatant`) — fechar o ciclo de uso.
- [ ] **UI**: controles de papel/nível/método + *preview* do stat block (`toCodexMarkdown`).
- [ ] **Mapeamento de `trackerFields`**: `fields.ac` → o `trackerField` 'ac' do sistema (genérico, sem acoplar a um sistema específico).
- [ ] **(Opcional) "Copiar pro codex"**: botão que gera o markdown (`toCodexMarkdown`) para colar no Campaign Codex.

---

## Notas de design

- **Determinismo é regra**: toda nova lógica deve ser testável com `seed`/`setRng`.
- **Desacoplamento**: `npcgen` não importa GMCR nem codex — só produz dados/markdown; os adapters espelham os formatos sem dependência.
- **Família d20 vs pool**: manter os dois caminhos isolados; o genérico cobre o grosso, o hook `System.npc?` refina.
- **Atribuição/licenças**: ao adicionar dados de sistema, respeitar a `attribution` de cada pacote (SRD/CC-BY/ORC etc.).
