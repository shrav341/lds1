// inside the useEffect's try { ... }
const duckdb = await import('@duckdb/duckdb-wasm')
const bundles = duckdb.getJsDelivrBundles()
const bundle = await duckdb.selectBundle(bundles)

if (typeof window === 'undefined' || typeof Worker === 'undefined') {
  throw new Error('Web Workers not available in this environment.')
}

// 🔧 NEW: create the worker from a same-origin Blob to avoid cross-origin worker restrictions
const workerSrc = await fetch(bundle.mainWorker!).then((r) => {
  if (!r.ok) throw new Error(`Failed to fetch worker: ${r.status}`)
  return r.text()
})
const workerBlob = new Blob([workerSrc], { type: 'text/javascript' })
const workerUrl = URL.createObjectURL(workerBlob)
const worker = new Worker(workerUrl)

// rest unchanged
const _db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker)
await _db.instantiate(bundle.mainModule, bundle.pthreadWorker)

const conn = await _db.connect()
await loadDatasetsIntoDuckDB(conn, datasets)
await conn.close()

setDb(_db)
setReady(true)
