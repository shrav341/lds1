import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'

export async function loadDatasetsIntoDuckDB(conn: AsyncDuckDBConnection, urls: string[]) {
  for (const url of urls) {
    const table = tableFromUrl(url)
    await conn.query(
      `CREATE TABLE ${table} AS SELECT * FROM read_csv_auto('${url}', HEADER=TRUE);`
    )
  }
}

function tableFromUrl(url: string) {
  const file = (url.split('/').pop() || 'data.csv').toLowerCase()
  return file.replace(/\.csv$/i, '').replace(/[^a-z0-9_]/g, '_')
}
