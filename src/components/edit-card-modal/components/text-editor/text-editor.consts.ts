import type { TableSize } from './text-editor.types'

export const tables = new Map<TableSize, string>([
  [
    '2x5',
    `
| 1 | 2 |
|---|---|
| а | б |
| а | б |
| а | б |
| а | б |
| а | б |
`
  ],
  [
    '3x5',
    `
| 1 | 2 | 3 |
|---|---|---|
| а | б | в |
| а | б | в |
| а | б | в |
| а | б | в |
| а | б | в |
`
  ]
])
