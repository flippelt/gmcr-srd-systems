#!/usr/bin/env node
/**
 * Prints the Keep-a-Changelog section for a version, or a one-line fallback.
 * Usage: node scripts/extract-changelog.mjs <CHANGELOG.md> <version>
 */
import { existsSync, readFileSync } from 'node:fs'

const [file, version] = process.argv.slice(2)
if (!file || !version) {
  console.error('Usage: node scripts/extract-changelog.mjs <CHANGELOG.md> <version>')
  process.exit(1)
}

if (!existsSync(file)) {
  process.stdout.write(`Release ${version}.\n`)
  process.exit(0)
}

const text = readFileSync(file, 'utf8')
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const heading = new RegExp(`^## \\[?${escaped}\\]?\\b.*$`, 'm')
const match = heading.exec(text)

if (!match) {
  process.stdout.write(`Release ${version}.\n`)
  process.exit(0)
}

const rest = text.slice(match.index)
const afterHeading = rest.slice(match[0].length)
const next = afterHeading.search(/^## /m)
const section = next === -1 ? rest : rest.slice(0, match[0].length + next)
process.stdout.write(section.trim() + '\n')
