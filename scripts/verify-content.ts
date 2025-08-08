import fs from 'node:fs'
import path from 'node:path'

const idxPath = path.join(process.cwd(), 'content/courses/intro-sql/index.json')
const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'))

let ok = true
for (const l of idx) {
  if (!l.slug || !l.title || typeof l.order !== 'number') {
    console.error('Invalid lesson meta:', l)
    ok = false
  }
}

if (!ok) process.exit(1)
console.log('Content verified.')
