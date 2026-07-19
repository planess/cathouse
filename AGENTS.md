# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 15 application using the App Router. Application code lives in `src/app`. Shared app utilities are organized under `src/app/components`, `src/app/helpers`, `src/app/hooks`, `src/app/models`, `src/app/services`, and `src/app/actions`. Internationalization support is in `src/i18n`, and middleware is in `src/middleware.ts`.

Static files are in `public`, including `public/assets`, `public/fonts`, and `public/images`. Database migrations are stored in `migrations`. End-to-end tests live in `tests/playwright`.

## Build, Test, and Development Commands

- `npm run dev` starts the local Next.js dev server with Turbopack at `http://localhost:3000`.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run tsc` runs TypeScript checks without emitting files.
- `npm run lint` runs the Next/ESLint configuration.
- `npm test` runs Jest unit/component tests in `jest-environment-jsdom`.
- `npm run test:e2e` runs Playwright tests; the config starts/reuses the dev server.
- `npm run migrate:up`, `npm run migrate:down`, and `npm run migrate:status` manage migrate-mongo migrations.

## Coding Style & Naming Conventions

Use TypeScript and React function components. ESLint enforces 2-space indentation, single quotes, semicolons, `const` over `let` where possible, no `var`, strict equality, and accessibility checks. Imports should be grouped and alphabetized according to `import/order`, with aliases such as `@app/**`, `@helpers/**`, `@i18n/**`, `@email/**`, and `@public/**`.

File names should be kebab-case unless an existing framework convention applies, such as `page.tsx`, `layout.tsx`, `route.ts`, or dynamic route folders like `[id]`.

Prefer functions over classes. Independent functions and methods should be persisted in separate files within specific folders. Each file should contain only one type of code — either an interface, component, type, or constant. Keep files minimal; if code can be divided, it should be split into separate files. Independent helpers used inside components or other methods should be moved into separate files to keep file sizes as minimal as possible.

## Testing Guidelines

The project does not need tests—do not create any tests without explicit request. While Playwright specs can be placed in `tests/playwright` and Jest tests exist for reference, test creation is not required unless specifically asked.

## Commit & Pull Request Guidelines

Do not make commits or pull requests. Code changes are handled separately from the development workflow.

## Security & Configuration Tips

Keep secrets in `.env.local` or deployment settings, not in committed files. Use `.env.example` for documented placeholders. Review migrations carefully before applying them against shared databases.
