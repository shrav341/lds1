'use client'

import React from 'react'
import Editor from '@monaco-editor/react'
import * as duckdb from '@duckdb/duckdb-wasm'
import { AsyncDuckDB } from '@duckdb/duckdb-wasm'
import { gradeResult, type GradingSpec } from './grading'
import { loadDatasetsIntoDuckDB } from './datasets'

const bundles = duckdb.getJsDelivrBundles()
const bundle = await duckdb.selectBundle(bundles)

type Props = { starterSQL?: string; datasets: string[]; grading: GradingSpec; onPass?: () => void }

export default function Runner({ starterSQL, datasets, grading, onPass }: Props) {
  const [sql, setSql] = React.useState(starterSQL || 'SELECT 1;')
  const [output, setOutput] = React.useState('')
  const [passing, setPassing] = React.useState<boolean | null>(null)
  const [db, setDb] = React.useState<AsyncDuckDB | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const worker = new Worker(bundle.mainWorker!)
      const db = new AsyncDuckDB(new duckdb.ConsoleLogger(), worker)
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
      const conn = await db.connect()
      await loadDatasetsIntoDuckDB(conn, datasets)
      await conn.close()
      if (!cancelled) setDb(db)
    })()
    return () => {
      cancelled = true
    }
  }, [datasets])

  async function run() {
    if (!db) return
    const conn = await db.connect()
    try {
      const result = await conn.query(sql)
      const rows = result
        .toArray()
        .map((r) => Object.fromEntries(result.schema.fields.map((f, i) => [f.name, r.get(i)])))

      const graded = await gradeResult({ rows }, grading, async (assertionSql: string) => {
        const rs = await conn.query(assertionSql)
        return rs.get(0)?.get(0)
      })

      setOutput(JSON.stringify(rows.slice(0, 20), null, 2))
      setPassing(graded.pass)
      if (graded.pass && onPass) onPass()
      if (!graded.pass && graded.hint) setOutput((p) => p + `\n\nHint: ${graded.hint}`)
    } catch (e: any) {
      setOutput(String(e?.message || e))
      setPassing(false)
    } finally {
      await conn.close()
    }
  }

  return (
    <div className="space-y-3">
      <Editor height="300px" defaultLanguage="sql" value={sql} onChange={(v) => setSql(v || '')} options={{ minimap: { enabled: false } }} />
      <button onClick={run} className="px-3 py-2 rounded bg-black text-white dark:bg-white dark:text-black" aria-label="Run SQL">Run</button>
      <div className="text-sm">
        {passing === true && <span className="text-green-600">Passed</span>}
        {passing === false && <span className="text-red-600">Try again</span>}
      </div>
      <pre className="p-3 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-xs" aria-live="polite">{output}</pre>
    </div>
  )
}
