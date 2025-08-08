import Link from 'next/link'
import { listLessons, loadLesson } from '@/lib/content'
import Runner from '@/components/lesson/Runner'

export default async function LessonPage({ params }: { params: { course: string; lesson: string } }) {
  const { meta, html } = await loadLesson(params.course, params.lesson)
  const lessons = listLessons(params.course)
  const currentIndex = lessons.findIndex((l) => l.slug === meta.slug)
  const prev = lessons[currentIndex - 1]
  const next = lessons[currentIndex + 1]

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3 border-r pr-4">
        <h3 className="font-semibold">Lessons</h3>
        <ol className="mt-2 space-y-1 text-sm">
          {lessons.map((l) => (
            <li key={l.id}>
              <Link className={l.slug === meta.slug ? 'underline' : ''} href={`/${l.course}/${l.slug}`}>
                {l.order}. {l.title}
              </Link>
            </li>
          ))}
        </ol>
      </aside>

      <article className="col-span-12 md:col-span-9 space-y-4">
        <h1 className="text-xl font-semibold">{meta.title}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        <section className="mt-4">
          <h2 className="font-semibold mb-2">Try it</h2>
          <Runner starterSQL={meta.starter_sql} datasets={meta.dataset_urls} grading={meta.grading as any} />
          <p className="text-xs text-gray-500 mt-2">Datasets run locally in your browser via DuckDB WASM.</p>
        </section>
        <nav className="flex justify-between pt-6">
          {prev ? <Link href={`/${prev.course}/${prev.slug}`}>&larr; {prev.title}</Link> : <span />}
          {next ? <Link href={`/${next.course}/${next.slug}`}>{next.title} &rarr;</Link> : <span />}
        </nav>
      </article>
    </div>
  )
}
