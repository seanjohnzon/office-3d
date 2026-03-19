// Fetch real anime portrait images for Sanji and Usopp
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, 'src/assets/avatars')

function fetchImage(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://onepiece.fandom.com/',
        'Accept': 'image/png,image/webp,image/*'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        console.log(`Redirect to: ${res.headers.location}`)
        return fetchImage(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        if (buf.length < 5000) {
          reject(new Error(`Too small (${buf.length} bytes) — likely error page`))
          return
        }
        fs.writeFileSync(dest, buf)
        console.log(`✅ Saved ${dest} (${buf.length} bytes)`)
        resolve(buf.length)
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')) })
  })
}

const candidates = [
  // Sanji candidates
  {
    name: 'sanji',
    urls: [
      'https://static.wikia.nocookie.net/onepiece/images/thumb/b/ba/Sanji_Anime_Post_Timeskip_Infobox.png/200px-Sanji_Anime_Post_Timeskip_Infobox.png',
      'https://static.wikia.nocookie.net/onepiece/images/b/ba/Sanji_Anime_Post_Timeskip_Infobox.png',
      'https://cdn.myanimelist.net/images/characters/12/287883.jpg',
      'https://i.pinimg.com/236x/sanji-one-piece-face.jpg',
    ]
  },
  // Usopp candidates
  {
    name: 'usopp',
    urls: [
      'https://static.wikia.nocookie.net/onepiece/images/thumb/3/3d/Usopp_Anime_Post_Timeskip_Infobox.png/200px-Usopp_Anime_Post_Timeskip_Infobox.png',
      'https://static.wikia.nocookie.net/onepiece/images/3/3d/Usopp_Anime_Post_Timeskip_Infobox.png',
      'https://cdn.myanimelist.net/images/characters/9/310307.jpg',
    ]
  }
]

async function run() {
  for (const { name, urls } of candidates) {
    const ext = urls[0].includes('.jpg') ? 'jpg' : 'png'
    const dest = path.join(OUT, `${name}.${ext}`)
    let success = false
    for (const url of urls) {
      try {
        console.log(`Trying ${name}: ${url}`)
        await fetchImage(url, dest)
        success = true
        break
      } catch (e) {
        console.log(`  ❌ Failed: ${e.message}`)
      }
    }
    if (!success) {
      console.log(`⚠️  Could not fetch ${name} — SVG fallback stays`)
    }
  }
}

run().catch(console.error)
