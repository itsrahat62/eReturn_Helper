/* বাংলা eReturn টিউটোরিয়াল ভিডিওর ট্রান্সক্রিপ্ট নামানোর টুল
   চালান:  node tools/fetch-transcripts.js
   ফলাফল:  tools/transcripts/*.txt  এবং  tools/transcripts/_index.json
*/
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'transcripts');
fs.mkdirSync(OUT, { recursive: true });

const QUERIES = [
  'e return submit 2025-26 চাকরিজীবী আয়কর রিটার্ন',
  'e return 2026-27 আয়কর রিটার্ন দাখিল',
  'আয়কর রিটার্ন বেসরকারি চাকরিজীবী ই-রিটার্ন',
  'কর রেয়াত বিনিয়োগ rebate আয়কর বাংলাদেশ',
  'zero return জিরো রিটার্ন দাখিল নিয়ম',
  'সম্পদ বিবরণী IT-10B ই রিটার্ন পূরণ',
  'আয়কর রিটার্নে কি কি ভুল হয় eReturn mistake',
  'ই রিটার্ন সঞ্চয়পত্র ব্যাংক সুদ কিভাবে দেখাবেন'
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const COOKIE = 'CONSENT=YES+cb; SOCS=CAI';

async function get(url, opts) {
  opts = opts || {};
  opts.headers = Object.assign({
    'user-agent': UA,
    'accept-language': 'bn,en-US;q=0.9,en;q=0.8',
    'cookie': COOKIE
  }, opts.headers || {});
  return fetch(url, opts);
}

function parseViews(s) {
  if (!s) return 0;
  const m = String(s).replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return 0;
  let n = parseFloat(m[1]);
  const u = (m[2] || '').toUpperCase();
  if (u === 'K') n *= 1e3; else if (u === 'M') n *= 1e6; else if (u === 'B') n *= 1e9;
  return Math.round(n);
}

function walk(obj, fn) {
  if (!obj || typeof obj !== 'object') return;
  fn(obj);
  for (const k of Object.keys(obj)) walk(obj[k], fn);
}

async function search(q) {
  const res = await get('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=CAMSAhAB');
  const html = await res.text();
  const m = html.match(/ytInitialData\s*=\s*(\{[\s\S]*?\});<\/script>/);
  if (!m) return [];
  let data;
  try { data = JSON.parse(m[1]); } catch (e) { return []; }
  const out = [];
  walk(data, o => {
    if (o.videoRenderer && o.videoRenderer.videoId) {
      const v = o.videoRenderer;
      const title = ((v.title || {}).runs || [{}])[0].text || '';
      const views = parseViews(((v.viewCountText || {}).simpleText) ||
        (((v.shortViewCountText || {}).simpleText) || ''));
      const channel = (((v.ownerText || {}).runs || [{}])[0] || {}).text || '';
      out.push({ id: v.videoId, title, views, channel });
    }
  });
  return out;
}

const WEB_CTX = {
  client: {
    clientName: 'WEB', clientVersion: '2.20241201.00.00',
    hl: 'bn', gl: 'BD', userAgent: UA,
    originalUrl: 'https://www.youtube.com/', platform: 'DESKTOP'
  }
};

async function transcript(id) {
  // watch পাতা থেকে get_transcript-এর params বের করে innertube-এ চাওয়া
  const res = await get('https://www.youtube.com/watch?v=' + id + '&hl=bn');
  const html = await res.text();

  let title = '';
  const tm = html.match(/"videoDetails":\{[^]*?"title":"(.*?)"/);
  if (tm) { try { title = JSON.parse('"' + tm[1] + '"'); } catch (e) { title = tm[1]; } }
  let views = 0;
  const vm = html.match(/"viewCount":"(\d+)"/);
  if (vm) views = +vm[1];

  const pm = html.match(/"getTranscriptEndpoint":\{"params":"(.*?)"/);
  if (!pm) return null;
  let params = pm[1];
  try { params = JSON.parse('"' + pm[1] + '"'); } catch (e) { /* keep raw */ }

  const cv = (html.match(/"INNERTUBE_CLIENT_VERSION":"(.*?)"/) || [])[1] || '2.20241201.00.00';
  const ctx = JSON.parse(JSON.stringify(WEB_CTX));
  ctx.client.clientVersion = cv;

  const tres = await get('https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-youtube-client-name': '1', 'x-youtube-client-version': cv,
      'origin': 'https://www.youtube.com', 'referer': 'https://www.youtube.com/watch?v=' + id
    },
    body: JSON.stringify({ context: ctx, params })
  });
  const j = await tres.json().catch(() => null);
  if (!j) return null;

  const parts = [];
  walk(j, o => {
    if (o.transcriptSegmentRenderer && o.transcriptSegmentRenderer.snippet) {
      const runs = o.transcriptSegmentRenderer.snippet.runs || [];
      const t = runs.map(r => r.text || '').join('');
      if (t) parts.push(t);
    }
  });
  if (!parts.length) return null;
  const text = parts.join(' ').replace(/\s+/g, ' ').trim();
  return { text, title, views };
}

(async () => {
  const found = new Map();
  for (const q of QUERIES) {
    process.stdout.write('খুঁজছি: ' + q + ' … ');
    try {
      const list = await search(q);
      list.forEach(v => { if (!found.has(v.id) || found.get(v.id).views < v.views) found.set(v.id, v); });
      console.log(list.length + ' টি');
    } catch (e) { console.log('ব্যর্থ (' + e.message + ')'); }
    await new Promise(r => setTimeout(r, 900));
  }

  const ranked = [...found.values()].sort((a, b) => b.views - a.views);
  fs.writeFileSync(path.join(OUT, '_candidates.json'), JSON.stringify(ranked, null, 2), 'utf8');
  console.log('\nমোট ' + ranked.length + ' টি ভিডিও পাওয়া গেছে (_candidates.json)। ট্রান্সক্রিপ্ট নামাচ্ছি…\n');
  if (process.argv.includes('--search-only')) return;

  const index = [];
  let ok = 0;
  for (const v of ranked) {
    if (ok >= 30) break;
    try {
      const t = await transcript(v.id);
      if (!t || t.text.length < 1500) { console.log('  ✗ ' + v.id + ' (ক্যাপশন নেই) ' + v.title.slice(0, 50)); continue; }
      const file = path.join(OUT, v.id + '.txt');
      fs.writeFileSync(file, '# ' + (t.title || v.title) + '\n# channel: ' + v.channel +
        '\n# views: ' + (t.views || v.views) + '\n# https://youtu.be/' + v.id + '\n\n' + t.text, 'utf8');
      index.push({ id: v.id, title: t.title || v.title, channel: v.channel, views: t.views || v.views, chars: t.text.length });
      ok++;
      console.log('  ✓ ' + String(ok).padStart(2) + '. ' + (t.views || v.views).toLocaleString() + ' views — ' + (t.title || v.title).slice(0, 60));
    } catch (e) {
      console.log('  ✗ ' + v.id + ' ' + e.message);
    }
    await new Promise(r => setTimeout(r, 700));
  }

  index.sort((a, b) => b.views - a.views);
  fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(index, null, 2), 'utf8');
  console.log('\nমোট ' + index.length + ' টি ট্রান্সক্রিপ্ট সেভ হয়েছে → tools/transcripts/');
})();
