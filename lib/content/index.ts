// lib/content/index.ts
import type { LessonMeta } from './types'
import lessonsIndex from '@/content/courses/intro-sql/index.json'
import path from 'node:path'
import { promises as fs } from 'node:fs'

export const COURSES = [{ slug: 'intro-sql', title: 'Intro to SQL' }]

export function listLessons(course: string): LessonMeta[] {
  if (course !== 'intro-sql') return []
  return (lessonsIndex as LessonMeta[]).sort((a, b) => a.order - b.order)
}

export async function loadLessonHtml(course: string, slug: string) {
  if (course !== 'intro-sql') throw new Error('Unknown course')
  const meta = (lessonsIndex as LessonMeta[]).find((l) => l.slug === slug)
  if (!meta) throw new Error('Not found')

  // Read the file from the repo at runtime on the server
  const filePath = path.join(process.cwd(), 'content', 'courses', 'intro-sql', 'lessons', `${slug}.mdx`)
  const html = await fs.readFile(filePath, 'utf8')

  return { meta, html }
}
