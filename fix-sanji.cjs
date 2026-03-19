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

;(async () => {
  // MAL character ID 27 = Sanji (Black Leg)
  console.log('Fetching Sanji pictures from Jikan...')
  const r = await get('https://api.jikan.moe/v4/characters/27/pictures')
  console.log('Status:', r.status, r.ct)
  const json = JSON.parse(r.body.toString())
  console.log('Pictures:', JSON.stringify(json.data?.map(p => p.jpg?.image_url)))

  for (const pic of (json.data || [])) {
    const imgUrl = pic.jpg?.image_url || pic.jpg?.large_image_url
    if (!imgUrl) continue
    console.log('Trying:', imgUrl)
    try {
      const ir = await get(imgUrl)
      console.log('  ->', ir.status, ir.ct, ir.body.length, 'bytes')
      if (ir.status === 200 && ir.body.length > 10000 && (ir.ct.includes('image') || ir.ct.includes('jpeg') || ir.ct.includes('png'))) {
        fs.writeFileSync('src/assets/avatars/sanji.png', ir.body)
        console.log('✅ SAVED sanji.png', ir.body.length, 'bytes')
        break
      }
    } catch(e) { console.log('  ERR:', e.message) }
  }
})()
