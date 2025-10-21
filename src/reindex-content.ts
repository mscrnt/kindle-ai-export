import 'dotenv/config'

import fs from 'node:fs/promises'
import path from 'node:path'

import type { ContentChunk } from './types'
import { assert, getEnv } from './utils'

async function main() {
  const asin = getEnv('ASIN')
  assert(asin, 'ASIN is required')

  const outDir = path.join('out', asin)
  const contentPath = path.join(outDir, 'content.json')

  console.log('Reading content.json...')
  const contentJson = await fs.readFile(contentPath, 'utf-8')
  const content: ContentChunk[] = JSON.parse(contentJson)

  console.log(`Found ${content.length} pages`)

  // Reindex the content
  const reindexedContent = content.map((chunk, index) => ({
    ...chunk,
    index,
    page: index + 1 // Page numbers start at 1
  }))

  console.log('\nReindexing complete:')
  console.log(`  - First page: index ${reindexedContent[0]?.index}, page ${reindexedContent[0]?.page}`)
  console.log(`  - Last page: index ${reindexedContent[reindexedContent.length - 1]?.index}, page ${reindexedContent[reindexedContent.length - 1]?.page}`)
  console.log(`  - Total pages: ${reindexedContent.length}`)

  // Backup original
  const backupPath = path.join(outDir, 'content.backup.json')
  await fs.copyFile(contentPath, backupPath)
  console.log(`\nOriginal backed up to: ${backupPath}`)

  // Save reindexed content
  await fs.writeFile(contentPath, JSON.stringify(reindexedContent, null, 2))
  console.log(`Reindexed content saved to: ${contentPath}`)
}

await main()
