const CACHE='edc2026-v4';
const PRECACHE=['/','/index.html','/manifest.json','/data.js','/app-part1.js','/app-part2.js','assets/webp/icon-192.webp','assets/webp/icon-512.webp','assets/webp/edc-logo.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE.map(u=>new Request(u,{cache:'reload'}))).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(cached=>{if(cached)return cached;return fetch(e.request).then(resp=>{if(resp&&resp.status===200&&resp.type==='basic'){const clone=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return resp;}).catch(()=>caches.match('/index.html'));}));});
