const https = require('https')
const fs = require('fs')

// Jikan gave us real MAL image URLs (not cdn. — they use myanimelist.net directly)
const urls = [
  'https://myanimelist.net/images/characters/12/47931.jpg',
  'https://myanimelist.net/images/characters/3/100004.jpg',
  'https://myanimelist.net/images/characters/6/176263.jpg',
]

function tryUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        console.log('Redirect ->', res.headers.location)
        tryUrl(res.headers.location).then(resolve)
        return
      }
      let data = []
      res.on('data', c => data.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(data)
        console.log(url, '→', res.statusCode, (res.headers['content-type'] || ''), buf.length, 'bytes')
        if (res.statusCode === 200 && buf.length > 5000) {
          fs.writeFileSync('src/assets/avatars/sanji.png', buf)
          console.log('✅ SAVED sanji.png')
        }
        resolve()
      })
    }).on('error', e => { console.log('ERR', e.message); resolve() })
  })
}

;(async () => {
  for (const url of urls) {
    if (fs.existsSync('src/assets/avatars/sanji.png') && fs.statSync('src/assets/avatars/sanji.png').size > 5000) {
      console.log('Already have sanji.png')
      break
    }
    await tryUrl(url)
  }
})()
