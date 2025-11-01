# Repository Guidelines

## Project Structure & Module Organization
NestJS code sits in `src/`: feature modules under `src/app`, shared helpers in `src/common`, `src/guards`, `src/pipes`, and `src/utils`. Configuration bootstrappers live in `src/configs`, while database tasks belong in `src/migrations`. Tests reside in `test/` with reusable fixtures in `test/test-utils.ts`. The `dist/` directory is build output—never edit it. Housekeeping scripts are stored in `scripts/`.

## Build, Test, and Development Commands
Run commands from the repository root with pnpm: `pnpm dev` starts the watched Nest server, `pnpm build` compiles TypeScript and uploads Sentry sourcemaps, and `pnpm start:prod` runs the compiled app. Use `pnpm lint`, `pnpm format`, or `pnpm format:fix` to enforce style. `pnpm test`, `pnpm test:e2e`, and `pnpm test:cov` cover unit, e2e, and coverage scenarios; `pnpm typecheck` surfaces type regressions.

## Coding Style & Naming Conventions
Prettier enforces 2-space indentation, single quotes, and trailing commas where valid. ESLint (with the `unused-imports` plugin) keeps modules tidy, so resolve lint warnings before pushing. Classes, DTOs, and providers use PascalCase (e.g., `CreateExpenseDto`), while functions, variables, and file names stay camelCase or kebab-case (`database-backup.service.ts`). Follow NestJS naming (`*.module.ts`, `*.service.ts`) and colocate DTOs and validators with their feature module.

## Testing Guidelines
All tests use Jest. Place new specs in `test/` or alongside the feature they cover, ending files with `.spec.ts`. Favor behavior-focused `describe` blocks, and reuse helpers from `test/test-utils.ts` for environment setup. Ensure `pnpm test` passes before committing; run `pnpm test:cov` on larger changes to watch coverage.

## Commit & Pull Request Guidelines
Use `<type>: <imperative summary>` commit subjects (`fix: correct CLIENT_URLS JSON format`) and keep each commit scoped to one concern. Pull requests should include a concise summary, linked issues, test evidence (`pnpm test` output or API screenshots), and note any configuration or migration changes. Flag security-sensitive updates so reviewers can verify `.env` expectations.

## Security & Configuration Tips
Settings load through `@nestjs/config`; keep secrets in a non-committed `.env`. Document new environment keys in `README.md` and provide safe defaults in configuration factories so local and CI runs stay predictable.
