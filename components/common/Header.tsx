'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(()=> setMounted(true),[])
  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">LearnDataSkill</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/intro-sql/sql-select-basics">Start SQL</Link>
          {mounted && (
            <button className="px-2 py-1 border rounded" onClick={()=> setTheme(theme==='dark'?'light':'dark')}>
              {theme==='dark'?'Light':'Dark'}
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
