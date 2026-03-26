import 'dotenv/config'

import path from 'path'

import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts'

const apiBase = (
  process.env.VITE_APP_MAIN_API ?? ''
).replace(/\/$/, '')

export default defineConfig({
  input: {
    filters: {
      deprecated: false
    },
    path: `${apiBase}/openapi.json`
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
