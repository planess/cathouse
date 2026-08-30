# Cathouse

Next.js 15 application with the App Router. Application code is in `src/app`; i18n is in `src/i18n`, middleware in `src/middleware.ts`, migrations in `migrations`, and static assets in `public`.

## Code

- Use TypeScript and React function components.
- Use kebab-case filenames, except Next.js conventions such as `page.tsx`, `layout.tsx`, and `route.ts`.
- Put every reusable exported component, function, interface, or type in its own file and the appropriate folder: components in `components`, interfaces and types in `models`, and services in `services`.
- Keep `src/app/components/**/index.ts` files limited to relative component exports; import models directly from `src/app/models` rather than re-exporting them through component barrels.
- Document every exported component, service, independent function, interface, and type with JSDoc. document public properties of class, parameters of functions, properties of interfaces/types.
- Store reusable React SVG icons in `src/app/components/icons`, one icon component per kebab-case file. Do not keep SVG markup in unrelated components or combine icons in `icons.tsx`; feature-only icons may instead live in that feature's `components/icons` folder.
- Follow the existing ESLint and import-order rules.

## Safety and delivery

- Do not create unit, end-to-end, or any other tests unless explicitly requested.
- Do not create migrations in `migrations` unless explicitly requested.
- An explicit request means the user clearly asks to perform that action. Create commits or pull requests only on an explicit request; never create them automatically.
- Keep secrets in `.env.local` or deployment settings; never commit them.
