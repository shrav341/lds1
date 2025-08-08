React.useEffect(() => {
  let cancelled = false

  async function init() {
    try {
      const duckdb = await import('@duckdb/duckdb-wasm')
      const VERSION = '1.29.0'

      // Prefer MVP (no pthreads) when not cross-origin isolated
      const useMvp = !('crossOriginIsolated' in window) || !window.crossOriginIsolated

      // Helper to create a same-origin worker via Blob
      const makeWorker = async (url: string) => {
        const resp = await fetch(url)
        if (!resp.ok) throw new Error(`Failed to fetch worker: ${resp.status}`)
        const src = await resp.text()
        const blob = new Blob([src], { type: 'text/javascript' })
        return new Worker(URL.createObjectURL(blob))
      }

      // Build the bundle we want (force MVP if needed)
      let bundle: { mainModule: string; mainWorker: string; pthreadWorker?: string | undefined }

      if (useMvp) {
        bundle = {
          mainModule: `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${VERSION}/dist/duckdb-mvp.wasm`,
          mainWorker: `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${VERSION}/dist/duckdb-browser-mvp.worker.js`,
        }
      } else {
        // Try auto-detect first; if it fails we'll fall back to MVP
        const bundles = duckdb.getJsDelivrBundles()
        bundle = await duckdb.selectBundle(bundles)
      }

      let worker = await makeWorker(bundle.mainWorker)

      let _db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker)
      await _db.instantiate(bundle.mainModule, bundle.pthreadWorker)

      // If instantiate fails (e.g., EH/pthread chosen), fall back to MVP
      if (!_db) throw new Error('Instantiate re_
