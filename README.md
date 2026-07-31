# CosturaConecta

## 1. Visão geral do projeto

O CosturaConecta é uma plataforma web que aproxima empresas de confecção,
ateliês e lojas de moda de costureiras e outros profissionais da costura de
Picos-PI e cidades próximas.

O repositório contém dois pacotes:

- o frontend React/Vite na raiz;
- a API REST Node.js/Express em [`server/`](server/).

Ambos estão publicados na Vercel em implantações separadas:

- frontend: <https://costura-conecta.vercel.app>;
- API REST: <https://costura-conecta-api.vercel.app>.

A especificação completa da API está em
[`server/docs/openapi.yaml`](server/docs/openapi.yaml).

## 2. Contexto acadêmico

O projeto evolui incrementalmente como trabalho acadêmico e projeto de
portfólio. A arquitetura demonstra separação entre rotas, controllers,
services, models, schemas e middlewares, além de autenticação, banco
relacional, CRUD, validação de entrada, erros HTTP padronizados e documentação
OpenAPI.

## 3. Problema e solução proposta

Empresas da cadeia de moda regional podem ter dificuldade para encontrar
profissionais com habilidades específicas, enquanto costureiras e profissionais
locais nem sempre têm um canal organizado para divulgar experiência,
disponibilidade e formas de contato.

O CosturaConecta propõe centralizar:

- perfis de empresas;
- perfis profissionais;
- busca por cidade, habilidade e disponibilidade;
- publicação e consulta de vagas persistentes;
- contato entre empresas e profissionais;
- autenticação e regras de propriedade.

## 4. Usuários-alvo

- Confecções, ateliês e lojas de moda que procuram mão de obra especializada.
- Costureiras e profissionais que desejam divulgar habilidades e disponibilidade.
- Pessoas da região de Picos-PI interessadas em oportunidades no setor de moda.

## 5. Arquitetura atual

O frontend e a API Express coexistem no mesmo repositório, mas são pacotes npm
independentes e possuem implantações separadas na Vercel.

```text
Frontend React/Vite
├── Supabase Auth e Google OAuth
├── acesso atual ao Supabase por services do frontend
└── https://costura-conecta.vercel.app

API Express/TypeScript (server/)
├── routes
├── middlewares
├── controllers
├── schemas Zod
├── services
├── Supabase Auth/Data API com chave publicável e bearer do usuário
└── https://costura-conecta-api.vercel.app

Supabase
├── Auth
├── PostgreSQL
├── Data API
├── views públicas
└── Row Level Security
```

O frontend ainda não consome a API Express: autenticação, perfis e vagas usam
diretamente o cliente Supabase e os services em `src/services/`. A integração
frontend-API é uma melhoria futura e será feita posteriormente, de forma
incremental; a publicação da API não altera esse fluxo atual.

## 6. Tecnologias

Frontend:

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- Supabase JS
- Lucide React

Backend:

- Node.js
- Express 5
- TypeScript
- Zod
- Supabase JS
- dotenv
- CORS

Qualidade e testes:

- ESLint
- Vitest
- Supertest
- OpenAPI 3.0.3

Infraestrutura:

- Supabase Auth
- PostgreSQL
- Supabase Data API
- Row Level Security
- Vercel para as implantações separadas do frontend e da API

## 7. Funcionalidades implementadas

- Frontend React/Vite/TypeScript responsivo.
- Autenticação Supabase com Google OAuth no frontend.
- Cadastro e login REST com e-mail e senha.
- Perfis de empresa persistidos no PostgreSQL.
- Perfis profissionais persistidos no PostgreSQL.
- Vagas persistidas, com criação, leitura, atualização e exclusão.
- Busca e apresentação de profissionais.
- Leitura pública de vagas por meio da view `public_job_board`.
- Políticas RLS de propriedade para mutações de vagas.
- API Express isolada em `server/`.
- Validação de bodies e parâmetros com Zod.
- Erros HTTP padronizados e middleware global de erros.
- Testes automatizados do backend com Supabase mockado.
- Documentação OpenAPI de todas as rotas implementadas.
- Frontend implantado na Vercel.
- API Express implantada separadamente na Vercel.

## 8. Rotas da API REST

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/api/health` | Público | Estado da API |
| POST | `/api/auth/register` | Público | Cadastro com e-mail e senha |
| POST | `/api/auth/login` | Público | Login e emissão de sessão |
| GET | `/api/jobs` | Público | Lista vagas |
| GET | `/api/jobs/{id}` | Público | Consulta uma vaga |
| POST | `/api/jobs` | Bearer | Publica uma vaga |
| PUT | `/api/jobs/{id}` | Bearer | Atualiza integralmente uma vaga própria |
| DELETE | `/api/jobs/{id}` | Bearer | Exclui uma vaga própria |

Não existem endpoints REST de refresh token, administração ou perfis nesta
versão.

## 9. Relacionamentos do banco de dados

| Origem | Relacionamento | Destino | Regra principal |
| --- | --- | --- | --- |
| `auth.users.id` | 1 para 0..1 | `company_profiles.user_id` | `user_id` único e exclusão em cascata |
| `auth.users.id` | 1 para 0..1 | `professional_profiles.user_id` | `user_id` único e exclusão em cascata |
| `company_profiles.id` | 1 para N | `jobs.company_id` | exclusão em cascata |

A view `public.public_job_board` projeta somente os dados públicos necessários
para leitura de vagas. As migrations existentes são a fonte de verdade do
schema e das políticas.

## 10. Autenticação e autorização

O sistema possui dois fluxos atualmente implementados:

- Google OAuth no frontend, gerenciado pelo Supabase Auth;
- cadastro e login por e-mail/senha na API REST.

Nas mutações de vagas, o cliente envia:

```http
Authorization: Bearer <token-de-acesso>
```

O middleware valida o token com `supabase.auth.getUser(token)`. Depois, cria um
cliente Supabase específico para a requisição com o mesmo bearer. O serviço
resolve o perfil empresarial por `user_id`, aplica filtros explícitos de
propriedade e mantém RLS como barreira final.

O projeto não usa `service_role`, não aceita `companyId` do cliente para
definir propriedade e não utiliza `user_metadata` em decisões de autorização.

## 11. Variáveis de ambiente

Nenhum valor real deve ser versionado. Use os arquivos `.env.example` apenas
como modelo.

Frontend:

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Sim | URL pública do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sim | Chave publicável usada pelo frontend |

Não há variável de URL da API no frontend atual, pois essa integração ainda não
foi implementada. Quando o frontend passar a consumir a API, a variável
correspondente deverá ser adicionada ao código, ao `.env.example` e a esta
documentação no mesmo incremento.

Backend:

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| `NODE_ENV` | Não | `development`, `test` ou `production`; padrão `development` |
| `PORT` | Não | Porta HTTP; padrão `3001` |
| `SUPABASE_URL` | Sim | URL do projeto Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | Sim | Chave publicável do backend |
| `CORS_ALLOWED_ORIGINS` | Sim | Lista de origens permitidas, separadas por vírgula |
| `AUTH_REDIRECT_URL` | Não | URL de redirecionamento após confirmação de e-mail |

`SUPABASE_SERVICE_ROLE_KEY` não é utilizada e não deve ser adicionada ao
frontend ou ao backend.

## 12. Instalação

Pré-requisitos:

- Node.js 20 ou superior para o backend;
- npm;
- um projeto Supabase já configurado.

Instale as dependências do frontend na raiz:

```bash
npm install
```

Instale separadamente as dependências do backend:

```bash
cd server
npm install
```

Copie os respectivos `.env.example` para arquivos locais de ambiente e
preencha apenas no seu ambiente. Não versione credenciais.

## 13. Executando o frontend

Na raiz do repositório:

```bash
npm run dev
```

O Vite informará a URL local, normalmente `http://localhost:5173`.

## 14. Executando o backend

Em outro terminal:

```bash
cd server
npm run dev
```

Por padrão, a API fica disponível em `http://localhost:3001`.

Teste rápido:

```bash
curl http://localhost:3001/api/health
```

## 15. Executando os testes do backend

```bash
cd server
npm run typecheck
npm run lint
npm test
npm run build
```

Os testes usam mocks do Supabase e não acessam o projeto hospedado.
No estado verificado desta documentação, a suíte do backend concluiu com
**46/46 testes aprovados**.

## 16. Contrato de erros HTTP

Formato padrão:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem pública segura."
  }
}
```

Erros de validação também incluem `details`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados da requisição inválidos.",
    "details": []
  }
}
```

| Status | Uso atual |
| --- | --- |
| 400 | validação, cadastro rejeitado ou perfil empresarial ausente |
| 401 | autenticação ausente, token inválido ou credenciais inválidas |
| 404 | rota ou vaga não encontrada |
| 409 | conflito identificável no cadastro |
| 429 | limite de tentativas de autenticação |
| 500 | falha interna sanitizada |

Erros 500 não retornam mensagens do Supabase, SQL, chaves ou stack traces.

## 17. Estrutura do projeto

```text
CosturaConecta/
├── src/
│   ├── components/
│   ├── services/
│   ├── App.tsx
│   ├── supabaseClient.ts
│   └── types.ts
├── server/
│   ├── docs/
│   │   └── openapi.yaml
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── errors/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   └── tests/
├── supabase/
│   └── migrations/
├── package.json
└── README.md
```

## 18. Limitações atuais

- O frontend ainda não consome a API Express e continua acessando o Supabase
  diretamente.
- A API REST ainda não oferece endpoints de perfis, refresh token,
  administração, paginação ou filtros adicionais.
- Moderação, papéis administrativos, avaliações e fluxos de
  interesse/contratação ainda não foram implementados.
- A Fase 1 de fortalecimento de segurança (`hardening`) introduziu as views
  públicas `public_professional_directory` e `public_job_board`, mas preservou
  o acesso direto existente às tabelas base para manter compatibilidade com o frontend.
  Portanto, a revisão e a redução dessa exposição continuam no backlog; a
  existência das views não significa que todo acesso público direto às tabelas
  base já foi removido.
- Swagger UI ainda não está disponível.

## 19. Implantação e validações de produção

Os componentes publicados são independentes:

| Componente | URL de produção | Situação |
| --- | --- | --- |
| Frontend React/Vite | <https://costura-conecta.vercel.app> | Implantado na Vercel; ainda acessa o Supabase diretamente |
| API Express | <https://costura-conecta-api.vercel.app> | Implantada separadamente na Vercel e conectada ao Supabase hospedado |
| Supabase | Configuração externa, sem URL publicada neste documento | Auth, PostgreSQL, Data API, views públicas e RLS |

A API usa a chave publicável do Supabase e, nas operações protegidas, o bearer
token do usuário. Ela não usa `service_role`.

As seguintes verificações foram concluídas no ambiente de produção para o
estado registrado nesta documentação:

- `GET /api/health`: HTTP `200`;
- `GET /api/jobs`: HTTP `200`, com dados reais persistidos;
- login por e-mail e senha pela API de produção: validado;
- CRUD protegido de vagas: `POST /api/jobs` com `201`,
  `PUT /api/jobs/{id}` com `200` e `DELETE /api/jobs/{id}` com `204`;
- consulta da vaga após a exclusão: HTTP `404` com código `JOB_NOT_FOUND`;
- preflight CORS originado de <https://costura-conecta.vercel.app>: HTTP `204`,
  permitindo os métodos `GET`, `POST`, `PUT`, `PATCH`, `DELETE` e `OPTIONS`, e
  os cabeçalhos `Authorization` e `Content-Type`;
- suíte automatizada do backend: **46/46 testes aprovados**.

Essas verificações validam a API diretamente. Elas não significam que o
frontend já esteja integrado à API Express.

## 20. Roadmap

1. Integrar gradualmente o frontend com a API Express.
2. Reduzir a exposição pública direta das tabelas base após eliminar as
   dependências correspondentes do frontend.
3. Ampliar os testes de integração e automatizar verificações do ambiente
   implantado de forma controlada.
4. Adicionar paginação e filtros REST.
5. Adicionar endpoints REST de perfis conforme o modelo de permissões.
6. Adicionar fluxos de interesse/contratação.
7. Implementar moderação, avaliações e papéis administrativos.
8. Disponibilizar Swagger UI a partir da especificação OpenAPI.
