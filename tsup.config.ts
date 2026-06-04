import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/systems/dnd5e-2014.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
})
