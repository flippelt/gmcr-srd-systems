# Changelog

Todas as mudanças notáveis deste pacote são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] — 2026-07-14

### Mudou

- **Localização oficial (Rastro de Cthulhu, Retropunk).** Os rótulos (`label`)
  das condições passam a usar os termos oficiais da edição brasileira: Hurt →
  Machucado, Seriously Wounded → Seriamente Machucado, Unconscious →
  Inconsciente, Insane → Insano, etc. Descrições atualizadas (Sense Trouble →
  Sentir Perigo, Hit Threshold → Limiar de Acerto, Health → Vitalidade). Os
  `id`/`key` (API) permanecem estáveis; resumos seguem paráfrases próprias.

## [1.0.0] — 2026-07-13

### Mudou
- **Marco de estabilidade 1.0.0.** O contrato público do pacote é
  promovido a estável — sem mudanças de API em relação à série 0.1.x.
  A partir daqui, quebras de compatibilidade seguem SemVer (major).
- `peerDependencies`: `@lippelt/srd-core` de `^0.1.0` → `^1.0.0`.

## [0.1.1] — 2026-06-05
- Docs: README em PT-BR com termos oficiais.

## [0.1.0] — 2026-06-04
- Primeira publicação no npm.
