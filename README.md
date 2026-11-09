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
- `TURSO_AUTH_TOKEN`\n- `GS_API_KEY` (cabeçalho `x-api-key` para operações de escrita)
- `GROQ_API_KEY`, `GEMINI_API_KEY` (quando os respectivos agentes estiverem configurados)
- `FREE_TIER_CONFIRMED` (sinalizador de configuração)

**Nunca adicione chaves reais ao GitHub.** Armazene-as exclusivamente nas configurações seguras da Vercel.

## Estado da recuperação e validação (09/11/2026)

O **frontend público completo** foi sincronizado a partir do site publicado. Os módulos privados `lib/db.js`, `lib/core.js`, `lib/common.js` e as rotas dos agentes foram **reconstruídos**, pois o conector não disponibilizou a íntegra dos arquivos originais. As rotas básicas do backend foram compiladas e executadas em um novo deployment de preview, sem modificar a produção. Os agentes de IA reconstruídos ainda exigem teste de regressão próprio.

O deployment de produção está `READY`. Testes HTTP reais em 09/11/2026 confirmaram `GET /api/health` (200, Turso conectado), listagem e estatísticas (200), e registro inexistente (404). POST/PATCH/DELETE sem credencial retornaram 401. **O CRUD autenticado foi aprovado em deployment de preview**: POST 201, GET 200, PATCH 200, GET atualizado 200, DELETE 200, GET final 404. O registro de teste foi removido. Detalhes em `docs/evidencias/teste-crud-autenticado-2026-11-09.md`. A produção não foi alterada. Os agentes de IA ainda requerem regressão e o painel administrativo Turso exige captura autenticada.

## Entrega acadêmica

- Relatório técnico: arquitetura, componentes de nuvem, API e banco SQL.
- Repositório GitHub com código recuperado (sincronização integral ainda pendente).
- Evidências pendentes: print da aplicação, requisições da API, painel Turso e deployment Vercel.
- A entrega completa exige sincronizar os arquivos faltantes, validar as rotas em produção e anexar capturas reais.

Consulte também `docs/roteiro-de-testes.md` e `docs/schema-referencia.sql`.


## Teste de CRUD autenticado (09/11/2026)

Resultado **APROVADO**, em preview Vercel utilizando as variáveis protegidas de ambiente e Turso/libSQL, sem publicar a chave `GS_API_KEY`. O fluxo completo foi POST → GET → PATCH → GET → DELETE → GET 404. Consulte as [evidências registradas](docs/evidencias/teste-crud-autenticado-2026-11-09.md).
