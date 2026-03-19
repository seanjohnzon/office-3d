const https = require('https')
const fs = require('fs')

// MAL character IDs for Sanji - try several
const urls = [
  'https://cdn.myanimelist.net/images/characters/4/422795.jpg',
  'https://cdn.myanimelist.net/images/characters/5/422797.jpg',
  'https://cdn.myanimelist.net/images/characters/2/98027.jpg',
  'https://cdn.myanimelist.net/images/characters/12/287883.jpg',
  'https://cdn.myanimelist.net/images/characters/6/287881.jpg',
  'https://api.jikan.moe/v4/characters/27/pictures',
]

function tryUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' } }, (res) => {
      let data = []
      res.on('data', c => data.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(data)
        console.log(url, '→', res.statusCode, res.headers['content-type'], buf.length, 'bytes')
        if (res.statusCode === 200 && buf.length > 5000 && (res.headers['content-type'] || '').includes('image')) {
          fs.writeFileSync('src/assets/avatars/sanji.png', buf)
          console.log('✅ SAVED sanji.png')
        }
        resolve()
      })
    }).on('error', e => { console.log(url, 'ERR', e.message); resolve() })
  })
}

// Also try jikan API to get correct URL
https.get('https://api.jikan.moe/v4/characters/27/pictures', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let d = []
  res.on('data', c => d.push(c))
  res.on('end', () => {
    try {
      const json = JSON.parse(Buffer.concat(d).toString())
      console.log('Jikan Sanji pics:', JSON.stringify(json?.data?.slice(0,3)))
    } catch(e) { console.log('Jikan parse error') }
  })
})

;(async () => {
  for (const url of urls) await tryUrl(url)
})()
