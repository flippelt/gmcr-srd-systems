#!/usr/bin/env node
/**
 * Copies the repo-root MIT LICENSE into a package directory so `npm pack`
 * includes it. Invoked as `prepack` (cwd = package) or with an explicit dir.
 */
import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'LICENSE')
const destDir = process.argv[2] ? resolve(process.argv[2]) : process.cwd()

if (!existsSync(src)) {
  console.error(`copy-license: missing ${src}`)
  process.exit(1)
}
if (!existsSync(join(destDir, 'package.json'))) {
  console.error(`copy-license: ${destDir} is not a package (no package.json)`)
  process.exit(1)
}

copyFileSync(src, join(destDir, 'LICENSE'))
