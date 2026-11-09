/* Abadon AI Offline Library v1 — only public study summaries and static assets */
const CACHE='abadon-offline-library-v2';
const FILES=['/','/index.html','/app.js','/style.css','/favicon.svg','/library.json','/offline.js','/offline.css','/manifest.webmanifest'];
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
async function downloadLibrary(){
 const fresh=await caches.open(CACHE);
 for(const path of FILES){
   const url=new URL(path,self.location.origin);
   const response=await fetch(url.toString(),{cache:'reload',credentials:'same-origin'});
   if(!response.ok||response.type==='opaque')throw new Error('Arquivo indisponível: '+path);
   await fresh.put(url, response.clone());
 }
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith('abadon-offline-library-')&&k!==CACHE).map(k=>caches.delete(k)));
 return {ok:true,count:FILES.length};
}
self.addEventListener('message',event=>{
 const data=event.data||{};
 if(data.type==='CACHE_LIBRARY'){
   event.waitUntil(downloadLibrary().then(result=>event.source?.postMessage({type:'CACHE_LIBRARY_DONE',requestId:data.requestId,...result})).catch(error=>event.source?.postMessage({type:'CACHE_LIBRARY_DONE',requestId:data.requestId,ok:false,error:error.message})));
 }
 if(data.type==='CHECK_LIBRARY'){
   event.waitUntil(caches.open(CACHE).then(async c=>{
     const hits=await Promise.all(FILES.map(f=>c.match(new URL(f,self.location.origin))));
     event.source?.postMessage({type:'CHECK_LIBRARY_DONE',requestId:data.requestId,ready:hits.every(Boolean),count:hits.filter(Boolean).length,total:FILES.length});
   }));
 }
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 const isNavigation=request.mode==='navigate';
 const path=isNavigation?'/':url.pathname;
 if(!FILES.includes(path))return;
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const cached=await cache.match(new URL(path,self.location.origin));
   if(isNavigation){
     try{const live=await fetch(request);return live.ok?live:(cached||live)}
     catch{return cached||new Response('<h1>Sem conexão</h1><p>Abra o Abadon quando estiver online e baixe a biblioteca.</p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}})}
   }
   if(cached)return cached;
   return fetch(request);
 })());
});