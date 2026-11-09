# Auditoria pré-entrega — 09/11/2026

## Requisitos confirmados
- [x] Aplicação pública e HTTPS: https://abadonsayhello-ai.vercel.app
- [x] Página GS Cloud e documentação acessíveis
- [x] API REST de leitura em produção: GET /api/health, GET /api/incidents, GET /api/stats
- [x] Banco Turso/libSQL conectado: GET /api/health retornou status=ok, database=turso e incident_count=0
- [x] Controle de acesso: POST/PATCH/DELETE sem x-api-key retornam HTTP 401
- [x] OpenAPI 3.0.3 publicado e sincronizado
- [x] Frontend público HTML/CSS/JS sincronizado no GitHub
- [x] Documentação de arquitetura, SQL, rotas e limitações
- [x] Respostas reais documentadas em docs/evidencias/testes-http-2026-11-09.md

## Pendências obrigatórias
- [ ] Recuperar/reconstruir lib/db.js, lib/common.js, lib/core.js e as rotas de IA ausentes.
- [ ] Fazer instalação limpa e deploy a partir do GitHub, antes de mudar a produção.
- [ ] Testar POST → GET → PATCH → GET → DELETE → GET 404 usando a chave GS_API_KEY de forma segura, sem expor segredos.
- [ ] Capturar prints reais do site, Vercel READY, API, CRUD autenticado e Turso.
- [ ] Inserir os prints reais no PDF com datas/legendas.

## Melhorias opcionais
- [ ] Expandir OpenAPI para rotas auxiliares /api/status e /api/report.
- [ ] Adicionar CI/testes automatizados após recuperar backend.
- [ ] Explicar limites e modelo de custo do serverless (sem inventar VM/SKU).
- [ ] Verificar se listagens GET públicas não expõem dados pessoais.

## Notas de rigor
- HTTP 200 de health comprova consulta SQL, não escrita.
- HTTP 401 comprova bloqueio de acesso, não CRUD funcional.
- Logs JSON textuais não substituem os prints exigidos no enunciado.