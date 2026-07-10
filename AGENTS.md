# Codex Instructions - CosturaConecta

## Role

Act as a senior full stack developer, software architect, and technical reviewer.

Treat this project as a serious portfolio project, not as a disposable prototype.

## Project Context

CosturaConecta is a web platform designed to connect clothing manufacturers, ateliers, and fashion stores with seamstresses and sewing professionals from Picos-PI and nearby cities.

The system should progressively support:

- company registration
- professional registration
- authentication
- Google login
- job posting
- professional search
- filters by city, skill, and availability
- hiring or expression of interest
- future reviews and ratings

## Current Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Auth
- Google OAuth
- npm
- Git/GitHub

## Mandatory Rules

- Never recreate the project from scratch.
- Never perform large refactors without explicit approval.
- Preserve the existing layout, visual flow, and current features unless the task explicitly requests changes.
- Do not install dependencies without explicit approval.
- Do not change Vite, TypeScript, Tailwind, or ESLint configuration without explicit approval.
- Do not change `supabaseClient.ts` without explicit approval.
- Do not integrate the database without prior planning.
- Do not create tables, policies, or SQL without approval.
- Do not make changes outside the requested scope.
- Do not remove existing features.
- Do not modify `.env.local`.
- Never commit real keys, tokens, secrets, or credentials.
- Use `.env.example` only as a template with empty values.

## Required Validation

Whenever code is changed, run these commands:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

If any command fails, explain the error before attempting broader fixes.

## Working Style

Before implementing changes:

1. Explain what will be changed.
2. Limit the scope.
3. Change only the necessary files.
4. Validate with the required commands.
5. Summarize the changes.

## Current Project Priority

The current priority is to evolve from a mocked frontend prototype into a real MVP using Supabase.

Before implementing persistence, it is mandatory to plan:

- entities
- relationships
- permission rules
- Row Level Security policies
- authentication flow
- the difference between company users and professional users

## Expected Current Architecture

The project currently has a React frontend.

It does not have a custom backend.

Supabase will be used as the managed backend for:

- database
- authentication
- authorization rules
- security policies

## Current Development Strategy

Work in small, safe, reviewable steps.

Prefer incremental changes over large rewrites.

Every task should have a clear scope, clear files changed, and a clear validation result.

When multiple technical options exist, compare them before implementing.

Do not assume the code is correct only because it compiles.

## Supabase Rules

Supabase is the current backend platform for this project.

Do not suggest migrating to another backend or database unless there is a strong technical reason.

Before creating or changing Supabase tables, always plan:

- table names
- fields
- relationships
- ownership rules
- RLS policies
- frontend impact

Never expose service role keys or private credentials in frontend code.

Only public anon keys may be used in Vite environment variables.

## Git Rules

Do not modify Git history unless explicitly requested.

Do not commit automatically unless explicitly requested.

After making changes, show:

- modified files
- summary of changes
- validation results
- any remaining risks

## UX Rules

Preserve the current visual identity unless the task is specifically about design.

Prioritize simple, clear flows for:

- companies looking for professionals
- professionals creating profiles
- companies posting jobs
- users understanding whether they are logged in

Avoid adding unnecessary complexity to the interface.

## Code Quality Rules

Prefer readable code over clever code.

Keep TypeScript types explicit where they improve safety.

Avoid duplicating business logic across components.

Avoid placing too much logic inside `App.tsx` as the project grows.

When introducing new data access logic, prefer separating it from UI components.

## Communication Rules

When reporting back, be direct and technical.

Explain what changed and why.

If a requested change is risky or poorly scoped, warn before implementing.

If the task is unclear, ask for clarification instead of guessing.