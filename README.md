# LearnDataSkill — Phase 0 (Vercel-first)

This is the minimal bootable app: Next.js (App Router) + Tailwind + dark mode + MDX lesson shell with sidebar.

## Run locally
```bash
npm i
cp .env.example .env.local
npm run dev
```

## Deploy (Vercel)
- Push to GitHub, import in Vercel, framework preset: **Next.js**.
- Add `NEXT_PUBLIC_SITE_URL=https://<your-domain>`.
- First deploy should show 10-lesson sidebar and lesson pages with placeholder content.

## Next
Phase 1 will add the DuckDB WASM runner + Monaco + auto-grading.
