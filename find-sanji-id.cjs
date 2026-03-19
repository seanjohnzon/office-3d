const https = require('https')

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return get(res.headers.location).then(resolve).catch(reject)
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({ status: res.status, body: Buffer.concat(chunks).toString() }))
    }).on('error', reject)
  })
}

;(async () => {
  // Search for Sanji specifically in One Piece
  const r = await get('https://api.jikan.moe/v4/characters?q=Sanji&limit=10')
  const json = JSON.parse(r.body)
  for (const c of (json.data || [])) {
    const anime = c.anime?.map(a => a.anime?.title).join(', ') || ''
    console.log(`ID:${c.mal_id} | ${c.name} | Anime: ${anime.substring(0,60)} | img: ${c.images?.jpg?.image_url}`)
  }
  console.log('---')
  // Also search Usopp to verify
  const r2 = await get('https://api.jikan.moe/v4/characters?q=Usopp&limit=5')
  const json2 = JSON.parse(r2.body)
  for (const c of (json2.data || [])) {
    const anime = c.anime?.map(a => a.anime?.title).join(', ') || ''
    console.log(`ID:${c.mal_id} | ${c.name} | Anime: ${anime.substring(0,60)} | img: ${c.images?.jpg?.image_url}`)
  }
})()
