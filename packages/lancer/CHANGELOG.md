# Changelog

Todas as mudanças notáveis deste pacote são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).


## [1.1.1] — 2026-08-21

### Corrigiu
- Tarball npm inclui o `LICENSE` MIT (estava listado em `files` mas o arquivo não ia no pacote).
- `exports` com types separados para ESM e CJS; source maps deixam de ir no tarball.

## [1.1.0] — 2026-07-14

### Mudou

- **Localização oficial (Tria Editora).** Os rótulos (`label`) das 12 condições/
  estados passam a usar os termos oficiais da edição brasileira: Impaired→Impedido,
  Slowed→Lento, Immobilized→Imobilizado, Lock On→Travado, Engaged→Engajado,
  Stunned→Atordoado, Prone→Prostrado, Invisible→Invisível, Shutdown→Desligado,
  Hidden→Escondido, Danger Zone→Zona de Perigo, Burn→Queimadura. Os `id` (chaves
  de API) permanecem estáveis; os resumos seguem paráfrases próprias. README
  atualizado.

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
