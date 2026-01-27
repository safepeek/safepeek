# CLAUDE.md

This file provides guidance for Claude when working with the SafePeek codebase.

## Project Overview

SafePeek is a Discord bot that analyzes URLs for safety threats. It expands shortened links, extracts metadata, and checks URLs against Google Safe Browsing API. Built as a serverless Cloudflare Worker using the slash-create framework.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Language**: TypeScript 5.9
- **Discord Framework**: slash-create
- **Package Manager**: pnpm
- **Deployment**: Cloudflare Workers via wrangler

## Commands

```bash
pnpm dev          # Start local development server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix lint issues
pnpm sync         # Sync Discord commands globally
pnpm sync:dev     # Sync commands to dev guild only
pnpm deploy       # Deploy to Cloudflare Workers
```

## Project Structure

```
src/
├── commands/           # Discord command handlers
│   ├── slash/         # Slash commands (analyze, ping, help, etc.)
│   └── message/       # Context menu commands
├── lib/               # Core utilities and business logic
│   ├── urls.ts       # URL analysis helpers
│   ├── google.ts     # Google Safe Browsing integration
│   ├── fetch.ts      # Backend API requests
│   └── utils.ts      # User profile management
├── types/             # TypeScript type definitions
├── ui/                # Discord embed and component builders
├── commands.ts        # Command registry
└── index.ts           # Worker entry point
```

## Code Patterns

### Command Structure
Commands extend `SlashCommand` from slash-create:
```typescript
export default class ExampleCommand extends SlashCommand {
  constructor(creator: SlashCreator) { ... }
  async run(ctx: CommandContext) { ... }
  async onError(err: Error, ctx: CommandContext) { ... }
}
```

### Response Types
Use discriminated unions for API responses:
```typescript
type Response = { ok: true; data: Data } | { ok: false; data: Error };
```

### Component Registration
Register interactive components inline:
```typescript
ctx.registerComponent('component_id', async (btnCtx) => { ... });
```

## Coding Conventions

- **Formatting**: Prettier with semicolons, single quotes, 2-space tabs, 120 char width
- **Files**: kebab-case
- **Classes**: PascalCase
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring without feature/fix
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependency updates

**Common scopes:** `ci`, `api`, `commands`, `ui`, `lib`

**Examples:**
```
feat(commands): add new /report command
fix(ci): display correct deployment ID in GitHub Action
chore: bump version to v1.3.2
```

## Environment Variables

Required in `.env`:
- `DISCORD_APP_ID` - Bot application ID
- `DISCORD_PUBLIC_KEY` - Request verification key
- `DISCORD_BOT_TOKEN` - Bot token
- `GOOGLE_API_KEY` - Google Safe Browsing API key
- `API_KEY` / `API_BASE_ROUTE` - Backend API credentials

## Key Files

- `wrangler.toml` - Cloudflare Workers config
- `slash-up.config.js` - Discord command sync config
- `src/lib/urls.ts` - Core URL analysis logic
- `src/lib/google.ts` - Safe Browsing API integration
- `src/ui/embeds.ts` - Discord embed builders