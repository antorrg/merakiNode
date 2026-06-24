import fs from 'fs'
import path from 'path'
import type Database from 'better-sqlite3'

// Resolve relative to the project root so types land in the source directory instead of dist-electron
const dirname = path.join(process.cwd(), 'electron/server/dbTypes')

function toPascal(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase())
}

function mapType(declaredType: string): string {
  const dt = declaredType.toUpperCase()
  if (dt.includes('INT')) return 'number'
  if (dt.includes('CHAR') || dt.includes('TEXT') || dt.includes('CLOB') || dt.includes('UUID')) return 'string'
  if (dt.includes('REAL') || dt.includes('FLOA') || dt.includes('DOUB') || dt.includes('NUME') || dt.includes('DECI')) return 'number'
  if (dt.includes('BOOL')) return 'boolean'
  if (dt.includes('DATE') || dt.includes('TIME')) return 'string'
  if (dt.includes('BLOB')) return 'Buffer'
  return 'any'
}

export function generateTypes(db: Database.Database) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
  `).all() as { name: string }[];
  console.log('va a ser engorroso de leer: ',tables)

  let output = `// AUTO-GENERATED FILE — DO NOT EDIT\n\n`

  for (const row of tables) {
    const table = row.name

    const cols = db.pragma(`table_info('${table}')`) as any[]

    output += `export interface ${toPascal(table)} {\n`

    for (const col of cols) {
      const tsType = mapType(col.type || '')
      const optional = col.notnull === 0 ? '?' : ''
      output += `  ${col.name}${optional}: ${tsType}\n`
    }

    output += `}\n\n`
  }

  try {
    if (fs.existsSync(`${dirname}/db.types.ts`)) {
      fs.unlinkSync(`${dirname}/db.types.ts`)
    }
    fs.mkdirSync(dirname, { recursive: true })
    fs.writeFileSync(`${dirname}/db.types.ts`, output)
    console.log('✅ Types generated')

  } catch (error) {
    console.error('Error generating db types: ', error)
    throw error
  }
}
