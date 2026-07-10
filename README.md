# CosturaConecta

Plataforma web para conectar empresas de confecção, ateliês e lojas de moda a costureiras e outros profissionais da costura de Picos-PI e região.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase

## Funcionalidades atuais

- Autenticação com Google por meio do Supabase.
- Busca de profissionais por cidade, habilidade e disponibilidade.
- Cadastro local de profissionais.
- Visualização e publicação local de vagas.
- Contato com profissionais pelo WhatsApp.

## Status do projeto

Projeto em desenvolvimento. Os dados de profissionais e vagas ainda são mantidos localmente em memória, sem integração com banco de dados nesta etapa.

## Instalação

Com Node.js e npm instalados, instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz a partir do `.env.example` e preencha as credenciais do seu projeto Supabase:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## Comandos

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera a versão de produção.
- `npm run typecheck`: verifica os tipos TypeScript.
- `npm run lint`: executa a análise estática do código.
