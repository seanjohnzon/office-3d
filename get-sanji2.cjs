const https = require('https')
const fs = require('fs')

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return get(res.headers.location).then(resolve).catch(reject)
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({ status: res.statusCode, ct: res.headers['content-type'] || '', body: Buffer.concat(chunks) }))
    }).on('error', reject)
  })
}

// Candidate URLs — MAL ID 131962 (post-timeskip Sanji), 305 (classic)
// Also try pictures endpoint for each
const candidates = [
  'https://myanimelist.net/images/characters/13/288199.jpg',  // ID 131962 direct
  'https://myanimelist.net/images/characters/5/136769.jpg',   // ID 305 direct
]

;(async () => {
  // First try pictures endpoint for ID 131962
  const pics = await get('https://api.jikan.moe/v4/characters/131962/pictures')
  try {
    const json = JSON.parse(pics.body.toString())
    for (const p of (json.data || [])) {
      const u = p.jpg?.image_url
      if (u) candidates.unshift(u)
    }
    console.log('Found', json.data?.length, 'pictures for ID 131962')
  } catch(e) {}

  for (const url of candidates) {
    console.log('Trying:', url)
    try {
      const r = await get(url)
      console.log(' ->', r.status, r.ct, r.body.length, 'bytes')
      if (r.status === 200 && r.body.length > 8000 && (r.ct.includes('image') || r.ct.includes('jpeg'))) {
        fs.writeFileSync('src/assets/avatars/sanji.png', r.body)
        console.log('✅ SAVED sanji.png', r.body.length, 'bytes')
        process.exit(0)
      }
    } catch(e) { console.log(' ERR:', e.message) }
  }
  console.log('❌ All failed')
})()
