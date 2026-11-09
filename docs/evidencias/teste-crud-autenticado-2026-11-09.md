# Teste CRUD autenticado — FIAP Cloud — 09/11/2026

## Ambiente verificado

- Aplicação: **Abadon AI / Vercel**, código de API recuperado do repositório.
- Deployment de **preview** testado: `dpl_38JEs1rxc2fnheMzKWXRPSWmTfWX` (READY).
- Banco: **Turso/libSQL** (variáveis de preview já configuradas).
- Segredo: `GS_API_KEY` utilizado pelo backend; o valor **não foi exposto** nos resultados nem enviado ao GitHub.
- Registro temporário identificado como `FIAP QA TEST`, com `id=2`.

## Resultados de execução reais

| Sequência | Método | Endpoint | Resposta | Verificação |
|---|---|---|---|---|
| 1 | POST | /api/incidents | **201** | Registro id=2 com status open |
| 2 | GET | /api/incidents/2 | **200** | Registro id=2 recuperado |
| 3 | PATCH | /api/incidents/2 | **200** | Atualizado para status resolved |
| 4 | GET | /api/incidents/2 | **200** | Persistência de resolved confirmada |
| 5 | DELETE | /api/incidents/2 | **200** | Registro excluído |
| 6 | GET | /api/incidents/2 | **404** | Registro não encontrado após exclusão |
| 7 | GET | /api/stats | **200** | Estatísticas retornadas com sucesso |

**Resposta observada do verificador temporário:** `{"success":true,"cleanup":"deleted"}`.

## Segurança e escopo

- O ciclo foi executado via endpoint temporário **somente em preview**, usando a chave da própria variável de ambiente no servidor para autenticar cada chamada HTTP.
- O endpoint de teste não foi adicionado ao repositório GitHub nem à aplicação de produção.
- O registro foi removido. As entradas em `audit_logs` podem permanecer como trilha de auditoria, conforme o comportamento do sistema.
- Os endpoints de escrita sem `x-api-key` foram anteriormente testados e retornaram HTTP 401; ver `testes-http-2026-11-09.md`.

## Limites da conclusão

O CRUD foi confirmado **no deployment de preview construído com os módulos de API e lib/db.js, lib/common.js recuperados/reconstruídos do GitHub, com o banco Turso configurado**. Não constitui teste de regressão de todos os agentes de IA nem garantia de uma instalação limpa de todo o frontend; essas são verificações adicionais.
