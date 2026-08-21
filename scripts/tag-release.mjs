#!/usr/bin/env node
/**
 * Creates `<dir>@v<version>` tags from each package.json.
 *
 *   node scripts/tag-release.mjs dnd5e-2014
 *   node scripts/tag-release.mjs --push lancer gumshoe
 *   node scripts/tag-release.mjs --dry-run core npcgen
 *
 * `--push` requires a clean working tree on `main` and pushes tags one at a
 * time (GitHub collapses a multi-tag push into a single event, so only one
 * release workflow would run).
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const push = args.includes('--push')
const dryRun = args.includes('--dry-run')
const pkgs = args.filter((a) => !a.startsWith('--'))

if (pkgs.length === 0) {
  console.error('Usage: node scripts/tag-release.mjs [--push] [--dry-run] <pkg> [<pkg> ...]')
  process.exit(1)
}

function git(gitArgs, { allowFail = false } = {}) {
  const result = spawnSync('git', gitArgs, { encoding: 'utf8', cwd: root })
  if (result.status !== 0 && !allowFail) {
    const err = (result.stderr || result.stdout || '').trim()
    throw new Error(err || `git ${gitArgs.join(' ')} failed`)
  }
  return result
}

if (push && !dryRun) {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim()
  if (branch !== 'main') {
    console.error(`--push requires branch main (currently ${branch})`)
    process.exit(1)
  }
  const dirty = git(['status', '--porcelain']).stdout.trim()
  if (dirty) {
    console.error('working tree is not clean; commit or stash before --push')
    process.exit(1)
  }
}

const tags = []
for (const name of pkgs) {
  if (!/^[a-z0-9][a-z0-9.-]*$/.test(name)) {
    console.error(`invalid package directory: ${name}`)
    process.exit(1)
  }
  const pkgPath = join(root, 'packages', name, 'package.json')
  if (!existsSync(pkgPath)) {
    console.error(`no such package: packages/${name}`)
    process.exit(1)
  }
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const expected = `@lippelt/srd-${name}`
  if (pkg.name !== expected) {
    console.error(`packages/${name}: name ${pkg.name} !== ${expected}`)
    process.exit(1)
  }
  const tag = `${name}@v${pkg.version}`
  const exists = git(['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { allowFail: true })
  tags.push({ tag, exists: exists.status === 0 })
}

if (dryRun) {
  for (const { tag, exists } of tags) {
    console.log(exists ? `${tag}  (already exists)` : tag)
  }
  process.exit(0)
}

const taken = tags.filter((t) => t.exists).map((t) => t.tag)
if (taken.length) {
  console.error(`tag already exists: ${taken.join(', ')}`)
  process.exit(1)
}

for (const { tag } of tags) {
  git(['tag', tag])
  console.log(`created ${tag}`)
}

if (!push) process.exit(0)

for (const [i, { tag }] of tags.entries()) {
  git(['push', 'origin', tag])
  console.log(`pushed ${tag}`)
  if (i < tags.length - 1) {
    spawnSync('sleep', ['3'], { cwd: root })
  }
}
