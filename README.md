# Cathouse

Cathouse is a platform for a group of animal-rescue volunteers (not a shelter). The volunteers look for stray animals, sterilize them and release them back to where they were found, or try to find them a new home through adoption.

It combines a public website (animals available for adoption, volunteer information, payments and legal information, contacts) with an admin back office for the volunteer team (registry of rescued animals, finance, inventory, acts, e-mail, users and roles).

The UI is available in **Ukrainian (default)** and **English**.

## Domain overview

- **Stray animals** are found on the street and entered into the registry (with photos and map location; see `registry`, `registry-light` and `api/registry/zones`).
- **Sterilization and release:** animals are sterilized and returned to the street (TNR-style), or
- **Adoption:** the team tries to find a family for the animal (`adoption` page).
- **Volunteers** are the people running all of this; the platform also stores volunteer profiles and info.
- **Donations and finance:** the group is funded by donations, so the app has public payment details and internal finance reports, bank accounts and categories.
- **Inventory and acts** support day-to-day work and documentation.

## Tech stack

| Area           | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Framework      | Next.js (App Router, Turbopack in dev), React 19, TypeScript     |
| Styling        | Tailwind CSS 4, Sass                                             |
| Database       | MongoDB (official `mongodb` driver)                              |
| Migrations     | [`migrate-mongo`](https://github.com/seppevs/migrate-mongo)      |
| i18n           | `next-intl` (`uk`, `en`), no locale prefix in URLs               |
| Forms / schema | `react-hook-form`, `zod`                                         |
| Media storage  | Cloudflare R2 (S3 API via `@aws-sdk/client-s3`)                  |
| E-mail         | Mailgun (`mailgun.js`), HTML templates in `email-templates`      |
| Rich text      | Tiptap                                                           |
| Maps / QR      | Leaflet, `qrcode.react`                                          |
| Dates          | Luxon                                                            |
| Tests / lint   | Playwright (e2e), Jest, ESLint 9, Prettier, Husky                |
| Deploy         | Vercel                                                           |

## Prerequisites

- Node.js **>= 20** and npm
- A running MongoDB instance (local or hosted)
- Optional, for full functionality: a Cloudflare R2 bucket (media) and a Mailgun account (e-mail)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file and fill in values (see "Environment variables")
cp .env.example .env.local

# 3. Apply database migrations
npm run migrate:up

# 4. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

> `next.config.ts` throws on startup if `CLOUDFLARE_R2_ANIMAL_IMAGE_URL` is not set, so define it even for local work.

## Environment variables

Secrets live in `.env.local` (git-ignored) or in the deployment settings. **Never commit them.** `.env.example` is the template.

| Variable                         | Required | Description                                                                       |
| -------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `MONGO_DB_URI`                   | yes      | MongoDB connection string, e.g. `mongodb://localhost:27017/cathouse`              |
| `MONGO_DB_NAME`                  | yes      | Database name                                                                     |
| `FORCE_MIGRATIONS`               | no       | `true` makes the server-side migration runner execute outside production          |
| `NODE_ENV`                       | no       | Set automatically by Next.js                                                      |
| `CLOUDFLARE_R2_ANIMAL_IMAGE_URL` | yes      | Hostname of animal images; used by `next.config.ts` for allowed remote images     |
| `CLOUDFLARE_S3_ENDPOINT`         | media    | R2 S3-compatible endpoint                                                         |
| `CLOUDFLARE_R2_BUCKET`           | media    | R2 bucket name                                                                    |
| `CLOUDFLARE_R2_PUBLIC_BASE_URL`  | media    | Public base URL of the bucket                                                     |
| `CLOUDFLARE_R2_MAX_FILE_BYTES`   | media    | Maximum upload size in bytes                                                      |
| `R2_MEDIA_BASE_URL`              | media    | Server-side media base URL                                                        |
| `NEXT_PUBLIC_R2_MEDIA_BASE_URL`  | media    | Public media base URL used by the browser for thumbnails and the media API        |
| `MAILGUN_API_KEY`                | e-mail   | Mailgun API key for sending and receiving e-mail                                  |

R2/Mailgun credentials may also require additional keys (for example S3 access keys); check `src/app/services/r2.service.ts` and `src/app/services/email*` when configuring a new environment.

## npm scripts

| Script                                  | Purpose                                              |
| --------------------------------------- | ---------------------------------------------------- |
| `npm run dev`                           | Dev server with Turbopack                            |
| `npm run build` / `npm start`           | Production build / run                               |
| `npm run lint`                          | ESLint                                               |
| `npm run tsc`                           | Type-check without emitting                          |
| `npm run test`                          | Jest                                                 |
| `npm run test:e2e`                      | Playwright (starts `npm run dev` on port 3000)       |
| `npm run migrate:up` / `migrate:down`   | Apply / roll back the latest migration               |
| `npm run migrate:status`                | Show applied and pending migrations                  |
| `npm run migrate:create <name>`         | Scaffold a new migration                             |
| `npm run vercel`                        | Vercel CLI                                           |
| `npm run preview:deploy` / `preview:migrate` | Helpers for preview environments (`_temp/preview.env`) |
| `npm run proxy`                         | Windows-only tunnel helper (`_temp/tunnel.bat`)      |

## Project structure

```
.
├── src/
│   ├── proxy.ts                # Request proxy (ex-middleware): seeds the locale cookie
│   ├── i18n/                   # next-intl routing, request config, navigation helpers
│   └── app/
│       ├── (guest)/            # signin, signup, reset-password
│       ├── (general)/          # public site: adoption, registry, volunteers, reports, payments, contacts, legal pages...
│       ├── (admin)/admin/      # back office: acts, email, finance, inventory, media, migrations, roles, users
│       ├── api/                # route handlers: auth, admin, registry, reports, email, profile, crypto-keys, migrations
│       ├── actions/            # server actions
│       ├── accessors/          # permission "granted" checks
│       ├── components/         # reusable components (one folder per component, barrel `index.ts`)
│       │   └── icons/          # one SVG icon component per file
│       ├── enum/               # enums (e.g. DB table names)
│       ├── helpers/            # small single-purpose functions (crypto, formatting, parsing...)
│       ├── hooks/              # React hooks
│       ├── ins/                # MongoDB instance/connection
│       ├── models/             # interfaces and types
│       ├── providers/          # React context providers (user, modal)
│       └── services/           # business logic (RBAC, permissions, email, media/R2, migrations...)
├── messages/                   # translations: en.json, uk.json
├── migrations/                 # migrate-mongo migrations (CommonJS, `.js`)
├── migrations-reserve/         # migrations parked outside the active chain
├── email-templates/            # HTML e-mail templates and assets
├── public/                     # static assets
├── tests/playwright/           # e2e specs
└── _temp/                      # local helper scripts (preview env, tunnel)
```

Route groups `(guest)`, `(general)` and `(admin)` do not affect URLs; they only select a layout.

## Key concepts

### Internationalization
- Locales: `uk` (default) and `en`; `localePrefix: 'never'`, so URLs are identical for both.
- The active locale is stored in a cookie (see `src/i18n/routing.ts` and `src/proxy.ts`).
- Add every user-visible string to **both** `messages/uk.json` and `messages/en.json`.

### Authentication and RBAC
- Users, sessions, roles and permissions are stored in MongoDB.
- Sign-in lives in `src/app/api/auth/signin`; password reset flow is under `(guest)/reset-password`.
- Authorization logic: `src/app/services/rbac.service.ts`, `permission-resolver.service.ts`, `access-verification.service.ts`. UI/route protection: `components/permission-guard`, `helpers/with-permission.tsx`, and `accessors/*-granted.ts`.
- Roles and permissions are managed in the admin area (`/admin/roles`, `/admin/users`). New permissions are normally introduced through a migration.

### Data encryption
Sensitive data is encrypted with keys managed through `src/app/api/crypto-keys` and the helpers in `src/app/helpers` (`encrypt-browser`, `decrypt`, `load-keys-from-db`, `pem-to-crypto-key`, ...).

### Database migrations
- Migrations are plain `migrate-mongo` files in `migrations/`, named `<timestamp>-<name>.js`.
- Run them manually with `npm run migrate:up`. `ServerMigrationRunner` (`src/app/services/migration-runner.server.ts`) can also run them from the server; it only does so in production or when `FORCE_MIGRATIONS=true`.
- The admin section has a migrations page (`/admin/migrations`) backed by `api/migrations`.
- Applied migrations are tracked in the `migration-changelog` collection.

### Media
Images and files are stored in Cloudflare R2 (`src/app/services/r2.service.ts`, `services/media`) and served from the configured public base URL.

### E-mail
Outgoing mail uses Mailgun via `services/email.service.ts` with templates from `email-templates/`. Incoming mail is received at `api/email/receive` and surfaced in the admin e-mail section.

## Development conventions

These rules are also stated in `AGENTS.md`.

- TypeScript and React function components; avoid `any`.
- **kebab-case** filenames, except Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`).
- Every reusable exported component, function, interface or type goes in **its own file** in the proper folder: components in `components`, interfaces/types in `models`, services in `services`.
- `src/app/components/**/index.ts` files only re-export components via relative paths; import models directly from `src/app/models`.
- Document every exported component, service, function, interface and type with JSDoc, including parameters and properties.
- Reusable SVG icons go in `src/app/components/icons`, one component per file (feature-only icons may live in that feature's `components/icons`).
- Follow the existing ESLint and import-order rules; do not add new rules.
- Prefer server components; validate input on both server and client; never expose secrets to the client.
- Keep RBAC logic in `rbac.service.ts` and models under `src/app/models`.
- Do not create unit/e2e tests, migrations, commits or pull requests unless explicitly requested.

## Testing

```bash
npm run test       # Jest
npm run test:e2e   # Playwright; requires a reachable MongoDB and a seeded environment
```

Playwright runs against `http://localhost:3000` and starts the dev server automatically.

## Deployment

The app is deployed on Vercel. Configure all environment variables in the Vercel project, run migrations (`npm run migrate:up`, or via the server-side runner in production) against the target database, then build with `npm run build`.

## Contributing workflow

1. Create a feature branch from `master`.
2. Implement the change following the conventions above.
3. Run `npm run lint` and `npm run tsc` before opening a pull request.
4. Open a pull request into `master`.
