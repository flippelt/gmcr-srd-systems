#!/usr/bin/env node
/**
 * Dry-runs `npm pack` for every workspace package and asserts the tarball
 * contains the published surface (dist + README + LICENSE + CHANGELOG)
 * and does not ship source maps or tests.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const packagesDir = join(root, 'packages')

function parsePackJson(stdout) {
  const text = stdout.trim()
  const startArr = text.indexOf('[')
  const startObj = text.indexOf('{')
  const start = [startArr, startObj].filter((i) => i >= 0).sort((a, b) => a - b)[0]
  if (start === undefined) throw new Error(`npm pack produced no JSON:\n${text}`)
  const parsed = JSON.parse(text.slice(start))
  return Array.isArray(parsed) ? parsed[0] : parsed
}

let failed = 0
const names = readdirSync(packagesDir).sort()

for (const name of names) {
  const dir = join(packagesDir, name)
  const pkgPath = join(dir, 'package.json')
  if (!existsSync(pkgPath)) continue

  const distJs = join(dir, 'dist', 'index.js')
  if (!existsSync(distJs)) {
    console.error(`${name}: missing dist/index.js — run npm run build first`)
    failed++
    continue
  }

  const result = spawnSync(
    'npm',
    ['pack', '--dry-run', '--json', '-w', `packages/${name}`],
    { cwd: root, encoding: 'utf8' },
  )
  if (result.status !== 0) {
    console.error(`${name}: npm pack failed\n${result.stderr || result.stdout}`)
    failed++
    continue
  }

  let info
  try {
    info = parsePackJson(result.stdout)
  } catch (err) {
    console.error(`${name}: ${err.message}`)
    failed++
    continue
  }

  const files = new Set((info.files ?? []).map((f) => f.path ?? f))
  const required = [
    'package.json',
    'dist/index.js',
    'dist/index.cjs',
    'dist/index.d.ts',
    'dist/index.d.cts',
    'README.md',
    'LICENSE',
  ]
  if (existsSync(join(dir, 'CHANGELOG.md'))) required.push('CHANGELOG.md')

  const missing = required.filter((f) => !files.has(f))
  if (missing.length) {
    console.error(`${name}: tarball missing ${missing.join(', ')}`)
    failed++
  }

  const unexpected = [...files].filter(
    (p) =>
      p.endsWith('.map') ||
      p.startsWith('src/') ||
      p.includes('.test.') ||
      p.endsWith('tsup.config.ts') ||
      p.endsWith('tsconfig.json'),
  )
  if (unexpected.length) {
    console.error(`${name}: unexpected files in tarball: ${unexpected.join(', ')}`)
    failed++
  }

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const expectedName = `@lippelt/srd-${name}`
  if (pkg.name !== expectedName) {
    console.error(`${name}: package.json name ${pkg.name} !== ${expectedName}`)
    failed++
  }

  const size = info.size ?? info.unpackedSize ?? '?'
  console.log(`ok ${pkg.name}@${pkg.version} (${files.size} files, ${size} bytes unpacked)`)
}

if (failed) {
  console.error(`pack-check: ${failed} problem(s)`)
  process.exit(1)
}
