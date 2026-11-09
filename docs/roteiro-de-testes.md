# Roteiro de validação — Abadon AI GS Cloud

Use o domínio **https://abadonsayhello-ai.vercel.app**. Salve capturas reais com a URL e as respostas visíveis.

## 1. Disponibilidade

- Abrir o site em navegador.
- GET `/api/status`: confirmar HTTP 200 e examinar a configuração declarada.
- GET `/api/health`: confirmar HTTP 200, `status: ok`, `database: turso` e `incident_count`. Se HTTP 503, verificar a conexão ao banco.

## 2. Persistência SQLite/Turso

- No painel Turso, consultar a lista de tabelas e executar `SELECT COUNT(*) FROM incidents;`.
- Registrar um incidente de teste usando POST `/api/incidents`, incluindo credenciais de escrita **apenas no cliente autorizado, quando exigidas pelo backend**.
- Verificar HTTP 201 e o ID retornado. Consultar com GET `/api/incidents/{id}` e no painel Turso.
- Atualizar com PATCH/PUT; verificar alteração em nova consulta.
- Excluir com DELETE e confirmar GET 404 (se a API autorizar).
- **Não usar tokens ou valores sigilosos nos prints.**

## 3. Evidências propostas

1. Site renderizado com URL pública.
2. Vercel com deployment READY.
3. GET /api/health com JSON de resposta.
4. POST /api/incidents com 201 (ocultar token).
5. GET /api/incidents/{id} e mesmo registro no SQL.
6. Painel Turso com estrutura SQL.
7. Arquitetura e README no GitHub.

## 4. Itens não comprovados nesta revisão

Os testes HTTP de produção, a conexão efetiva com o banco e a sincronização de todos os arquivos de origem ainda não foram executados/confirmados. Este roteiro não constitui evidência de sucesso.
