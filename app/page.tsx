import Link from 'next/link'
import { COURSES } from '@/lib/content'

export default function Page() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Learn SQL, fast</h1>
        <p className="text-sm mt-2">Concise lessons with tiny datasets. Runner arrives next in Phase 1.</p>
        <Link href="/intro-sql/sql-select-basics" className="inline-block mt-4 px-3 py-2 rounded bg-black text-white dark:bg-white dark:text-black">Start Intro SQL</Link>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Courses</h2>
        <ul className="list-disc pl-6">
          {COURSES.map(c => (
            <li key={c.slug}><Link href={`/intro-sql/sql-select-basics`}>{c.title}</Link></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
