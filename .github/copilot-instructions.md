Cathouse - Charity platform for animal shelters

Tech: Next.js 15, TypeScript, Tailwind, MongoDB, next-intl (uk/en).

Key rules:
- Prefer TypeScript + server components.
- Follow App Router and route groups: `(guest)`, `(general)`, `(admin)`.
- Keep RBAC in `src/app/services/rbac.service.ts` and models under `src/app/models/`.
- Never leak secrets to the client; validate inputs server & client.

Main paths:
- Components: `src/app/components/`
- Helpers and utilities: `src/app/helpers/`
- Services: `src/app/services/`
- Models/hooks/providers: `src/app/models/`, `src/app/hooks/`, `src/app/providers/`
- Translations: `messages/`
- MongoDB instance: `src/app/ins`

- components should be in dedicated files. For complex components, use subfolders.
- interfaces, type, enums should be in separate dedicated relative folders.
- helpers should be in separate dedicated files relative to their usage.
- do not use `any` type, prefer specific types or generics.
- do not create unit tests.
- fix all eslint errors for changed and created files, but do not add new eslint rules.
