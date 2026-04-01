import 'dotenv/config'

import path from 'path'

import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts'

const SCHEMA_FILE = path.resolve(
  __dirname,
  process.env.SCHEMA_FILE ?? 'infra/curation-openapi-schema.json'
)

const apiBase = (process.env.VITE_APP_MAIN_API ?? '').replace(/\/$/, '')

// Use the live API schema when VITE_APP_MAIN_API is set, otherwise fall back
// to the committed schema file so builds don't depend on a running backend.
const inputPath = apiBase ? `${apiBase}/openapi.json` : SCHEMA_FILE

export default defineConfig({
  input: {
    filters: {
      deprecated: false
    },
    path: inputPath
  },
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: path.resolve(__dirname, './src/api')
  },
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-axios',
    {
      exportFromIndex: true,
      name: '@tanstack/react-query'
    },
    {
      enums: 'javascript',
      name: '@hey-api/typescript'
    }
  ]
})
