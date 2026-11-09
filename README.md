# ABADON AI — Global Solution Cloud FIAP 2026

**Aluno:** Diogo Carvalho Conceição · **RM:** 567792  
**Professor:** Eduardo Popovici · **Disciplina:** Cloud Computing

## Aplicação

- **Deploy existente:** https://abadonsayhello-ai.vercel.app
- **Frontend:** HTML, CSS e JavaScript.
- **Backend:** Node.js 22, funções serverless da Vercel.
- **Banco SQL:** Turso/libSQL (compatível com SQLite), acessado via `@libsql/client`.
- **API REST:** CRUD de incidentes, verificações de saúde, estatísticas e geração de relatórios DOCX.

## Rotas verificadas no código

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/health` | Verifica conexão com banco de dados |
| GET | `/api/status` | Exibe configuração resumida dos agentes |
| GET | `/api/incidents` | Lista incidentes com paginação |
| POST | `/api/incidents` | Cadastra incidente |
| GET | `/api/incidents/{id}` | Consulta incidente |
| PUT/PATCH | `/api/incidents/{id}` | Atualiza incidente |
| DELETE | `/api/incidents/{id}` | Exclui incidente |
| GET | `/api/stats` | Estatísticas agregadas |
| POST | `/api/report` | Geração de documento DOCX |

## Arquitetura

```mermaid
flowchart TD
  A["Navegador (HTML/CSS/JS)"] -->|HTTPS| B["Vercel - Node.js serverless"]
  B -->|SQL parametrizado| C[("Turso / SQLite")]
  B -->|API de inferência| D["Provedores de IA"]
  B -->|JSON| A
```

O projeto **não utiliza VM própria**; por isso, SKU de máquina virtual não se aplica. A execução ocorre em funções gerenciadas (serverless).

## Variáveis de ambiente

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `GROQ_API_KEY`, `GEMINI_API_KEY` (quando os respectivos agentes estiverem configurados)
- `FREE_TIER_CONFIRMED` (sinalizador de configuração)

**Nunca adicione chaves reais ao GitHub.** Armazene-as exclusivamente nas configurações seguras da Vercel.

## Estado da recuperação e validação (09/11/2026)

Este repositório possui **cópia parcial** de arquivos verificados no deployment da Vercel. O conector limitou a leitura de alguns arquivos maiores (`lib/db.js`, `lib/core.js`, `lib/common.js`, páginas e scripts do frontend). Esses arquivos **não devem ser tratados como recuperados**. A aplicação publicada na Vercel foi preservada, sem alterações.

O deployment foi identificado como `READY`, mas **não foi possível executar/confirmar os testes HTTP de produção** nesta revisão. Portanto, banco, agentes e operações CRUD ainda requerem teste integrado e prints reais.

## Entrega acadêmica

- Relatório técnico: arquitetura, componentes de nuvem, API e banco SQL.
- Repositório GitHub com código recuperado (sincronização integral ainda pendente).
- Evidências pendentes: print da aplicação, requisições da API, painel Turso e deployment Vercel.
- A entrega completa exige sincronizar os arquivos faltantes, validar as rotas em produção e anexar capturas reais.

Consulte também `docs/roteiro-de-testes.md` e `docs/schema-referencia.sql`.
