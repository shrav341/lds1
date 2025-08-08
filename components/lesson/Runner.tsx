'use client'

import React from 'react'
import Editor from '@monaco-editor/react'
import type { AsyncDuckDB } from '@duckdb/duckdb-wasm'
import { gradeResult, type GradingSpec } from './grading'
import { loadDatasetsIntoDuckDB } from './datasets'

type Props = { starterSQL?: string; datasets: string[]; grading: GradingSpec; onPass?: () => void }

export default function Runner({ starterSQL, datasets, grading, onPass }: Props) {
  const [sql, setSql] = React.useState(starterSQL || 'SELECT 1;')
  const [output, setOutput] = React.useState('')
  const [passing, setPassing] = React.useState<boolean | null>(null)
  const [db, setDb] = React.useState<AsyncDuckDB | null>(null)
  const [initError, setInitError] = React.useState<string | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Import duckdb ONLY in the browser
        const duckdb = await import('@duckdb/duckdb-wasm')
        const bundles = duckdb.getJsDelivrBundles()
        const bundle = await duckdb.selectBundle(bundles)

        // Guard for Workers
        if (typeof window === 'undefined' || typeof Worker === 'undefined') {
          throw new Error('Web Workers not available in this environment.')
        }

        const worker = new Worker(bundle.mainWorker!)
        const _db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker)
        await _db.instantiate(bundle.mainModule, bundle.pthreadWorker)

        // Preload lesson datasets
        const conn = await _db.connect()
        await loadDatasetsIntoDuckDB(conn, datasets)
        await conn.close()

        if (!cancelled) {
          setDb(_db)
          setReady(true)
        }
      } catc
