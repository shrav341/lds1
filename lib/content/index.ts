import type { LessonMeta } from './types'
import lessonsIndex from '@/content/courses/intro-sql/index.json'

export const COURSES = [{ slug: 'intro-sql', title: 'Intro to SQL' }]

export function listLessons(course: string): LessonMeta[] {
  if (course !== 'intro-sql') return []
  return (lessonsIndex as LessonMeta[]).sort((a,b)=> a.order - b.order)
}

export async function loadLessonHtml(course: string, slug: string) {
  if (course !== 'intro-sql') throw new Error('Unknown course')
  const meta = (lessonsIndex as LessonMeta[]).find(l => l.slug === slug)
  if (!meta) throw new Error('Not found')
  const raw = await import(`@/content/courses/intro-sql/lessons/${slug}.mdx?raw`)
  return { meta, html: raw.default || raw }
}
