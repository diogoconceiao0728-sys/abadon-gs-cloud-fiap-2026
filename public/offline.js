(function(){
  const btn=document.getElementById('downloadLibrary');
  const msg=document.getElementById('offlineStatus');
  if(!btn||!msg)return;
  function set(text,mode){msg.textContent=text;msg.className='offline-status '+(mode||'');}
  if(!('serviceWorker' in navigator)||!('caches' in window)){
    btn.disabled=true;set('Navegador sem suporte ao armazenamento offline. Abra no Safari ou Chrome.','failed');return;
  }
  let registration;
  async function controller(){
    registration=registration||await navigator.serviceWorker.register('/sw.js',{scope:'/'});
    await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller) {
      await new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(new Error('Reabra esta página para ativar o modo offline.')),8500);
        navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timeout);resolve()},{once:true});
      });
    }
    return navigator.serviceWorker.controller||registration.active;
  }
  let serial=0;
  function ask(sw,type){
    return new Promise((resolve,reject)=>{
      const requestId=++serial;
      const timeout=setTimeout(()=>{navigator.serviceWorker.removeEventListener('message',onMessage);reject(new Error('O download demorou demais. Tente novamente.'))},35000);
      function onMessage(event){const d=event.data||{};if(d.requestId!==requestId||d.type!==type+'_DONE')return;clearTimeout(timeout);navigator.serviceWorker.removeEventListener('message',onMessage);resolve(d)}
      navigator.serviceWorker.addEventListener('message',onMessage);
      sw.postMessage({type,requestId});
    });
  }
  btn.addEventListener('click',async()=>{
    btn.disabled=true;set('Salvando aulas e arquivos do site neste dispositivo…');
    try{
      const sw=await controller();
      const result=await ask(sw,'CACHE_LIBRARY');
      if(!result.ok)throw new Error(result.error||'Erro ao salvar arquivos.');
      set('Biblioteca salva! Você pode abrir e pesquisar as 22 anotações sem internet.','ready');
      btn.textContent='↻ ATUALIZAR BIBLIOTECA OFFLINE';
    }catch(error){set(error.message||'Falha no armazenamento offline.','failed')}
    finally{btn.disabled=false}
  });
  if(navigator.serviceWorker.controller){
    ask(navigator.serviceWorker.controller,'CHECK_LIBRARY').then(d=>{
      if(d.ready){set('Biblioteca offline disponível neste dispositivo.','ready');btn.textContent='↻ ATUALIZAR BIBLIOTECA OFFLINE'}
    }).catch(()=>{});
  }
})();