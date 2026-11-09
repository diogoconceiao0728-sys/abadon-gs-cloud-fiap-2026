const buckets = new Map();

export function gate(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); res.status(405).json({error:'Use POST.'}); return false; }
  if (!String(req.headers['content-type']||'').includes('application/json')) { res.status(415).json({error:'Envie JSON.'}); return false; }
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && origin !== 'https://' + host && origin !== 'http://' + host) { res.status(403).json({error:'Origem não permitida.'}); return false; }
  if (Number(req.headers['content-length']||0) > 100000 || JSON.stringify(req.body||{}).length > 100000) { res.status(413).json({error:'Conteúdo muito grande.'}); return false; }
  const now = Date.now(), address = String(req.headers['x-forwarded-for']||'local').split(',')[0];
  if (buckets.size > 1000) for (const [k,v] of buckets) if (v.until < now) buckets.delete(k);
  const bucket = buckets.get(address);
  const hit = !bucket || bucket.until < now ? {count:1,until:now+60000} : {count:bucket.count+1,until:bucket.until};
  buckets.set(address,hit);
  if (hit.count > 8) { res.setHeader('Retry-After','60'); res.status(429).json({error:'Muitas solicitações. Aguarde um minuto.'}); return false; }
  return true;
}

export function validate(input) {
  if (!input || typeof input !== 'object' || typeof input.prompt !== 'string' || !input.prompt.trim() || input.prompt.length > 6000) throw Error('Escreva uma solicitação de até 6.000 caracteres.');
  if (!['research','report'].includes(input.agent)) throw Error('Selecione um agente válido.');
  const history = Array.isArray(input.history) ? input.history.slice(-4).filter(x=>x && ['assistant','user'].includes(x.role) && typeof x.content === 'string').map(x=>({role:x.role,content:x.content.slice(0,3000)})) : [];
  return {prompt:input.prompt.trim(),agent:input.agent,context:typeof input.context==='string'?input.context.slice(0,12000):'',history,web:input.web!==false};
}

export async function searchWeb(_prompt) {
  // No trusted search provider is configured. Never fabricate web sources.
  return { sources: [], provider: null, warning: 'Pesquisa web externa não configurada; resposta limitada ao conhecimento do modelo e materiais fornecidos.' };
}

export function publicError(error) {
  console.error('AI provider request failed',error?.message);
  return 'Provedor de IA temporariamente indisponível. Tente novamente.';
}

export async function generate({agent,prompt,context='',history=[],system=''}) {
  if (process.env.FREE_TIER_CONFIRMED !== 'true') throw Error('Plano gratuito não confirmado.');
  const messages = [{role:'system',content:system || (agent==='report'?'Escreva relatório técnico em português, com limitações explícitas.':'Responda em português do Brasil com precisão.') + '\nMATERIAIS FORNECIDOS:\n'+context.slice(0,12000)}];
  for (const item of history.slice(-4)) messages.push({role:item.role,content:item.content.slice(0,3000)});
  messages.push({role:'user',content:prompt});
  if (agent === 'report') {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw Error('Gemini não configurado.');
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    const contents = [...history.slice(-4).map(x=>({role:x.role==='assistant'?'model':'user',parts:[{text:x.content}]})),{role:'user',parts:[{text:prompt+'\n\n'+context}]}];
    const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:messages[0].content}]},contents,generationConfig:{maxOutputTokens:3500,temperature:0.3}}),signal:AbortSignal.timeout(45000)});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw Error('Gemini HTTP '+r.status);
    const answer=(data.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('');
    if(!answer)throw Error('Gemini returned empty response');
    return {answer,model:'Gemini 2.5 Flash',truncated:data.candidates?.[0]?.finishReason==='MAX_TOKENS'};
  }
  const key=process.env.GROQ_API_KEY;
  if(!key)throw Error('Groq não configurado.');
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({model:process.env.GROQ_MODEL||'qwen/qwen3-32b',messages,temperature:0.35,max_completion_tokens:3200}),signal:AbortSignal.timeout(45000)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error('Groq HTTP '+r.status);
  const answer=data.choices?.[0]?.message?.content||'';
  if(!answer)throw Error('Groq returned empty response');
  return {answer,model:data.model||'Qwen',truncated:data.choices?.[0]?.finish_reason==='length'};
}
