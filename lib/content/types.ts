export type GradingSpec =
  | { type: 'result_match'; expected: { columns?: string[]; row_count?: number; order_matters?: boolean; sample_hash?: string } }
  | { type: 'assertion_sql'; checks: string[] }

export interface LessonMeta {
  id: string
  title: string
  slug: string
  course: string
  order: number
  dataset_urls: string[]
  starter_sql?: string
  grading: GradingSpec
  hints?: string[]
}
