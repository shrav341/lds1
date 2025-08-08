'use client'

import React from 'react'
import Editor from '@monaco-editor/react'
import type { AsyncDuckDB } from '@duckdb/duckdb-wasm'
import { gradeResult, type GradingSpec } from './grading'
import { loadDatasetsIntoDuckDB } from './datasets'

type Props = {
  starterSQL?: string
  datasets: string[]
  grading: GradingSpec
  onPass?: () => void
}

export default function Runner({ starterSQL, datasets, grading, onPass }: Props) {
  const [sql, setSql] = React.useState(starterSQL || 'SELECT 1;')
  const [output, setOutput] = React.useState('')
  const [passing, setPassing] = React.useState<boolean | null>(null)
  const [db, setDb] = React.useState<AsyncDuckDB | null>(null)
  const [initError, setInitError] = React.useState<string | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const duckdb = await import('@duckdb/duckdb-wasm')
        const VERSION = '1.29.0'
        const wasmUrl = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${VERSION}/dist/duckdb-mvp.wasm`
        const workerUrlCdn = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${VERSION}/dist/duckdb-browser-mvp.worker.js`

        if (typeof window === 'undefined' || typeof Worker === 'undefined') {
          throw new Error('Web Workers not available')
        }

        // Same-origin worker via Blob to avoid cross-origin restrictions
        const workerSrcResp = await fetch(workerUrlCdn)
        if (!workerSrcResp.ok) throw new Error('Failed to fetch worker')
        const workerSrc = await workerSrcResp.text()
        const blob = new Blob([workerSrc], { type: 'text/javascript' })
        const worker = new Worker(URL.createObjectURL(blob))

        const _db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker)
        const wasmResp = await fetch(wasmUrl)
        if (!wasmResp.ok) throw new Error(`Failed to fetch wasm: ${wasmResp.status}`)
        await _db.instantiate(wasmResp)

        const conn = await _db.connect()
        await loadDatasetsIntoDuckDB(conn, datasets)
        await conn.close()

        if (!cancelled) {
          setDb(_db)
          setReady(true)
        }
      } catch (e: any) {
        if (!cancelled) setInitError(String(e?.message || e))
      }
    }

    init()
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
      if (!graded.pass && graded.hint) setOutput((p) => p + '\n\nHint: ' + graded.hint)
    } catch (e: any) {
      setOutput(String(e?.message || e))
      setPassing(false)
    } finally {
      await conn.close()
    }
  }

  if (initError) {
    return (
      <div className="p-3 rounded bg-red-50 dark:bg-red-900/30 text-sm">
        Runner failed to initialize: {initError}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Editor
        height="300px"
        defaultLanguage="sql"
        value={sql}
        onChange={(v) => setSql(v || '')}
        options={{ minimap: { enabled: false } }}
      />
      <button
        disabled={!ready}
        onClick={run}
        className="px-3 py-2 rounded bg-black text-white disabled:opacity-60 dark:bg-white dark:text-black"
        aria-label="Run SQL"
      >
        {ready ? 'Run' : 'Loading runner…'}
      </button>
      <div className="text-sm">
        {passing === true && <span className="text-green-600">Passed</span>}
        {passing === false && <span className="text-red-600">Try again</span>}
      </div>
      <pre className="p-3 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-xs" aria-live="polite">
        {output}
      </pre>
    </div>
  )
}
