// Generate anime-style SVG avatars for Sanji and Usopp
// Run: node generate-avatars.js
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, 'src/assets/avatars')

// SANJI — black suit, blonde swept hair covering right eye, cigarette, curly eyebrow
const sanjiBg = `
<defs>
  <radialGradient id="bg" cx="50%" cy="40%" r="60%">
    <stop offset="0%" stop-color="#1A1830"/>
    <stop offset="100%" stop-color="#0A0A18"/>
  </radialGradient>
  <radialGradient id="skin" cx="50%" cy="40%" r="55%">
    <stop offset="0%" stop-color="#FFDCBB"/>
    <stop offset="100%" stop-color="#E8B88A"/>
  </radialGradient>
  <radialGradient id="hair" cx="40%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#F5D050"/>
    <stop offset="100%" stop-color="#C8A020"/>
  </radialGradient>
</defs>
<!-- Background -->
<rect width="100" height="100" fill="url(#bg)" rx="50"/>
<!-- Neck -->
<rect x="42" y="70" width="16" height="14" fill="url(#skin)" rx="2"/>
<!-- Suit jacket -->
<ellipse cx="50" cy="90" rx="34" ry="22" fill="#1A1828"/>
<!-- White shirt collar V -->
<polygon points="44,72 50,85 56,72 52,74 50,82 48,74" fill="#F0EDE8"/>
<!-- Dark tie -->
<rect x="48" y="75" width="4" height="16" fill="#141432" rx="1"/>
<!-- Face -->
<ellipse cx="50" cy="52" rx="22" ry="24" fill="url(#skin)"/>
<!-- Hair swept over right eye — large golden sweep -->
<ellipse cx="50" cy="38" rx="23" ry="16" fill="url(#hair)"/>
<!-- Hair sweep covering right side -->
<ellipse cx="62" cy="44" rx="14" ry="18" fill="url(#hair)"/>
<!-- Hair covering right eye completely -->
<ellipse cx="64" cy="52" rx="10" ry="12" fill="url(#hair)"/>
<!-- Hair highlight -->
<ellipse cx="42" cy="35" rx="8" ry="5" fill="#FFE87A" opacity="0.5"/>
<!-- Left eye visible -->
<ellipse cx="40" cy="52" rx="5" ry="5.5" fill="#1A1A1A"/>
<ellipse cx="40" cy="52" rx="3" ry="3.5" fill="#2A3A6A"/>
<ellipse cx="38.5" cy="50.5" rx="1" ry="1" fill="white"/>
<!-- Curly eyebrow LEFT (the curly one) -->
<path d="M34,46 Q38,42 43,45" stroke="#C8A020" stroke-width="2" fill="none" stroke-linecap="round"/>
<!-- Curl at end -->
<circle cx="43" cy="45" r="1.5" fill="none" stroke="#C8A020" stroke-width="1.5"/>
<!-- Right eyebrow (hidden under hair) -->
<!-- Nose -->
<ellipse cx="48" cy="58" rx="2" ry="1.5" fill="#C8956A"/>
<!-- Mouth slight smile -->
<path d="M44,64 Q50,68 56,64" stroke="#9A6A4A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Cigarette from right side of mouth -->
<rect x="52" y="63" width="18" height="3" fill="#F5F5DC" rx="1.5"/>
<!-- Cigarette filter -->
<rect x="52" y="63" width="4" height="3" fill="#E8B090" rx="1"/>
<!-- Ember tip glow -->
<circle cx="70" cy="64.5" r="2" fill="#FF5500"/>
<circle cx="70" cy="64.5" r="1" fill="#FFAA00"/>
<!-- Smoke wisps -->
<path d="M70,62 Q72,58 70,54 Q72,50 70,46" stroke="#AAAAAA" stroke-width="1" fill="none" opacity="0.4" stroke-linecap="round"/>
`

const sanjiSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">${sanjiBg}</svg>`

// USOPP — dark curly hair, long nose, goggles on forehead, tan skin, overalls
const usoppBg = `
<defs>
  <radialGradient id="bg2" cx="50%" cy="40%" r="60%">
    <stop offset="0%" stop-color="#2A1F10"/>
    <stop offset="100%" stop-color="#150E05"/>
  </radialGradient>
  <radialGradient id="skin2" cx="50%" cy="40%" r="55%">
    <stop offset="0%" stop-color="#E8C890"/>
    <stop offset="100%" stop-color="#C89A60"/>
  </radialGradient>
  <radialGradient id="hair2" cx="50%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#2A2018"/>
    <stop offset="100%" stop-color="#0A0805"/>
  </radialGradient>
</defs>
<!-- Background -->
<rect width="100" height="100" fill="url(#bg2)" rx="50"/>
<!-- Neck -->
<rect x="42" y="70" width="16" height="14" fill="url(#skin2)" rx="2"/>
<!-- Overalls -->
<ellipse cx="50" cy="90" rx="34" ry="22" fill="#7A5025"/>
<!-- Khaki shirt showing -->
<ellipse cx="50" cy="90" rx="20" ry="18" fill="#A8803C"/>
<!-- Overalls straps -->
<rect x="40" y="72" width="6" height="18" fill="#6A4018" rx="2"/>
<rect x="54" y="72" width="6" height="18" fill="#6A4018" rx="2"/>
<!-- Face -->
<ellipse cx="50" cy="54" rx="20" ry="22" fill="url(#skin2)"/>
<!-- Big curly afro hair -->
<ellipse cx="50" cy="36" rx="26" ry="20" fill="url(#hair2)"/>
<!-- Curly bumps on hair -->
<circle cx="30" cy="38" r="8" fill="#1E1510"/>
<circle cx="38" cy="28" r="9" fill="#1E1510"/>
<circle cx="50" cy="25" r="10" fill="#1E1510"/>
<circle cx="62" cy="28" r="9" fill="#1E1510"/>
<circle cx="70" cy="38" r="8" fill="#1E1510"/>
<!-- Hair highlight -->
<ellipse cx="44" cy="30" rx="6" ry="4" fill="#3A2A18" opacity="0.6"/>
<!-- Bandana on forehead -->
<rect x="30" y="43" width="40" height="7" fill="#9A8040" rx="2"/>
<!-- Goggles frame on forehead above bandana -->
<rect x="32" y="37" width="36" height="8" fill="#7A5020" rx="3"/>
<!-- Goggle left lens -->
<ellipse cx="41" cy="41" rx="7" ry="4" fill="#9ACCE0" opacity="0.8"/>
<ellipse cx="41" cy="41" rx="7" ry="4" fill="none" stroke="#5A3818" stroke-width="1.5"/>
<!-- Goggle right lens -->
<ellipse cx="59" cy="41" rx="7" ry="4" fill="#9ACCE0" opacity="0.8"/>
<ellipse cx="59" cy="41" rx="7" ry="4" fill="none" stroke="#5A3818" stroke-width="1.5"/>
<!-- Goggle bridge -->
<rect x="48" y="39" width="4" height="4" fill="#5A3818"/>
<!-- Left eye -->
<ellipse cx="42" cy="56" rx="5" ry="5" fill="white"/>
<ellipse cx="42" cy="56" rx="3.5" ry="3.5" fill="#3A2A10"/>
<ellipse cx="42" cy="56" rx="2" ry="2" fill="#1A0A00"/>
<ellipse cx="41" cy="55" rx="0.8" ry="0.8" fill="white"/>
<!-- Right eye -->
<ellipse cx="58" cy="56" rx="5" ry="5" fill="white"/>
<ellipse cx="58" cy="56" rx="3.5" ry="3.5" fill="#3A2A10"/>
<ellipse cx="58" cy="56" rx="2" ry="2" fill="#1A0A00"/>
<ellipse cx="57" cy="55" rx="0.8" ry="0.8" fill="white"/>
<!-- Eyebrows -->
<path d="M37,50 Q42,47 47,50" stroke="#1A1008" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M53,50 Q58,47 63,50" stroke="#1A1008" stroke-width="2" fill="none" stroke-linecap="round"/>
<!-- LONG NOSE — key Usopp feature -->
<ellipse cx="50" cy="64" rx="3" ry="3" fill="#C89060"/>
<rect x="47" y="64" width="6" height="18" fill="url(#skin2)" rx="3"/>
<ellipse cx="50" cy="82" rx="4" ry="3.5" fill="#B87A50"/>
<!-- Mouth big grin -->
<path d="M40,72 Q50,80 60,72" stroke="#7A4A28" stroke-width="2" fill="none" stroke-linecap="round"/>
<!-- Teeth -->
<rect x="44" y="72" width="12" height="5" fill="white" rx="2"/>
`

const usoppSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">${usoppBg}</svg>`

fs.writeFileSync(path.join(OUT, 'sanji.png'), Buffer.from(sanjiSVG), 'utf8')
fs.writeFileSync(path.join(OUT, 'usopp.png'), Buffer.from(usoppSVG), 'utf8')
console.log('Avatars written as SVG data')
