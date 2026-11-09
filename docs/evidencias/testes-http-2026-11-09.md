# Evidências de execução HTTP — 09/11/2026

**Aplicação:** https://abadonsayhello-ai.vercel.app  
**Origem:** respostas reais obtidas diretamente do deploy Vercel, em 09/11/2026 (horários em UTC).  
**Observação:** testes exclusivamente GET; não houve inserção nem exclusão de registros de produção.

## GET /api/health
- Horário: 18:57:44 GMT
- HTTP: **200 OK**
```json
{"status":"ok","database":"turso","tables":"initialized","incident_count":0}
```
A implementação de `api/health.js` executa `SELECT COUNT(*) AS count FROM incidents`. A resposta demonstra consulta SQL bem-sucedida à tabela de incidentes, mas não comprova gravação.

## GET /api/status
- Horário: 18:57:47 GMT
- HTTP: **200 OK**
```json
{"backend":"online","agents":{"research":{"name":"Qwen","configured":true},"report":{"name":"Gemini","configured":true}},"freeTierConfirmed":true,"policy":"no-paid-fallback"}
```
As flags indicam configuração declarada, **não teste real de inferência de IA**.

## GET /api/incidents?limit=1
- Horário: 18:57:52 GMT
- HTTP: **200 OK**
```json
{"data":[],"total":0,"page":1,"limit":1}
```
Consulta SQL funcional; banco sem incidentes cadastrados naquele instante.

## GET /api/stats
- Horário: 18:58:09 GMT
- HTTP: **200 OK**
```json
{"total":0,"by_status":[],"by_severity":[]}
```

## GET /api/incidents/999999
- Horário: 18:58:13 GMT
- HTTP: **404 Not Found**
```json
{"error":"Not found"}
```
Confirma tratamento de registro inexistente.

## Conclusão
- **Confirmado:** Vercel acessível, APIs GET respondendo, consulta SQL e leitura do Turso.
- **Ainda não validado:** POST, PUT/PATCH e DELETE (métodos de escrita protegidos); inferência real dos provedores de IA.
- Para evidências gráficas, capturar esses endpoints no navegador/cliente HTTP sem expor credenciais.


## Testes adicionais de métodos de escrita — 09/11/2026

Execução real em ambiente isolado de teste, enviando requisições HTTP ao domínio de produção:

| Método | Rota | HTTP observado | Resposta |
|---|---|---|---|
| POST | `/api/incidents` | **401** | `{"error":"Unauthorized"}` |
| PATCH | `/api/incidents/999999` | **401** | `{"error":"Unauthorized"}` |
| DELETE | `/api/incidents/999999` | **401** | `{"error":"Unauthorized"}` |
| GET | `/api/health` | **200** | `{"status":"ok","database":"turso","tables":"initialized","incident_count":0}` |

**Conclusão:** os métodos de escrita rejeitam corretamente requisições sem a chave `x-api-key`. O método `write()` do backend exige `GS_API_KEY`. A variável de produção está cadastrada como segredo na Vercel e não foi revelada pelo conector; portanto, o teste autorizado de criação, atualização e exclusão ainda não pôde ser executado. Nenhum registro foi modificado. Não apresentar os códigos 401 como sucesso do CRUD; eles validam somente o controle de acesso.
