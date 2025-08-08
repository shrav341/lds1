export type ResultRow = Record<string, unknown>

export function normalizeAndHash(rows: ResultRow[]) {
  const normalized = rows.map((r) =>
    Object.keys(r)
      .sort()
      .reduce((acc: Record<string, unknown>, k) => ((acc[k] = r[k]), acc), {})
  )
  const s = JSON.stringify(normalized)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return String(h)
}

type ResultMatchSpec = {
  type: 'result_match'
  expected: { columns?: string[]; row_count?: number; order_matters?: boolean; sample_hash?: string }
}
type AssertionSqlSpec = { type: 'assertion_sql'; checks: string[] }
export type GradingSpec = ResultMatchSpec | AssertionSqlSpec

export async function gradeResult(
  result: { rows: ResultRow[] },
  grading: GradingSpec,
  runAssertion: (sql: string) => Promise<unknown>
) {
  if (!grading) return { pass: false, hint: 'No grading spec.' }

  if (grading.type === 'result_match') {
    const { columns, row_count, sample_hash } = grading.expected || {}
    const rows = result.rows

    if (columns) {
      const first = rows[0] || {}
      const got = Object.keys(first)
      if (JSON.stringify(got) !== JSON.stringify(columns)) {
        return { pass: false, hint: 'Check the column names exactly.' }
      }
    }
    if (typeof row_count === 'number' && rows.length !== row_count) {
      return { pass: false, hint: 'Row count doesn’t match.' }
    }
    if (sample_hash) {
      const h = normalizeAndHash(rows)
      if (h !== sample_hash) return { pass: false, hint: 'Result rows are not correct yet.' }
    }
    return { pass: true }
  }

  if (grading.type === 'assertion_sql') {
    for (const check of grading.checks) {
      const ok = await runAssertion(check)
      const boolish = Array.isArray(ok) ? ok[0] : ok
      if (!boolish) return { pass: false, hint: 'One or more checks failed.' }
    }
    return { pass: true }
  }

  return { pass: false, hint: 'Unsupported grading type.' }
}
