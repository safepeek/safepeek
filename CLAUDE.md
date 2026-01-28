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

## GitHub Issues & Pull Requests

### Creating Issues

When creating issues with `gh issue create`, always apply the appropriate label using the `--label` flag:

| Label           | When to use                                      |
|-----------------|--------------------------------------------------|
| `bug`           | Something isn't working                          |
| `enhancement`   | New feature or request                           |
| `documentation` | Improvements or additions to documentation       |
| `question`      | Further information is requested                 |

```bash
# Bug report
gh issue create --title "Fix: ..." --label "bug" --body "..."

# Feature request
gh issue create --title "Add: ..." --label "enhancement" --body "..."
```

Multiple labels can be combined when applicable (e.g., `--label "bug" --label "documentation"`).

### Creating Pull Requests

When creating PRs with `gh pr create`, apply labels that match the type of change:

| PR type                | Label(s)        |
|------------------------|-----------------|
| Bug fix                | `bug`           |
| New feature            | `enhancement`   |
| Documentation update   | `documentation` |
| Bug fix + docs update  | `bug`, `documentation` |

```bash
gh pr create --title "fix(commands): ..." --label "bug" --body "..."
gh pr create --title "feat(ui): ..." --label "enhancement" --body "..."
```

Always include at least one label. Derive the label from the commit type (`fix` -> `bug`, `feat` -> `enhancement`, `docs` -> `documentation`).

## Release Process

Follow [Semantic Versioning](https://semver.org/) for releases:

- **MAJOR** (`x.0.0`) - Breaking changes
- **MINOR** (`0.x.0`) - New features (backwards compatible)
- **PATCH** (`0.0.x`) - Bug fixes

**Steps to prepare a release:**

1. Update version in `package.json`
2. Commit with `chore: bump version to vX.X.X`
3. Create git tag: `git tag vX.X.X`
4. Push with tags: `git push && git push --tags`
5. Ask if user wants to add any specific notes to the release
6. Create draft release with auto-generated notes from commits:
   ```bash
   gh release create vX.X.X --draft --generate-notes
   # Or with additional notes:
   gh release create vX.X.X --draft --generate-notes --notes "Additional notes here"
   ```

Draft release is pending final review on GitHub. Publishing is done manually via GitHub UI, which triggers the Cloudflare deployment workflow.

## Discord Changelog

The Discord changelog channel posts are separate from GitHub releases. They are curated, user-facing summaries — not a 1:1 mirror of release notes.

### Principles

- **Only post for meaningful changes.** Skip purely internal releases (CI fixes, dependency bumps, refactoring). Batch patch releases together.
- **Write for users, not developers.** Describe what changed in terms of user-visible behavior, not implementation details.
- **Cover all repos.** Each changelog post can span `safepeek/safepeek` (Bot), `safepeek/web` (Website & API). Omit a section if it has no user-facing changes for that period.
- **Keep it short.** A few bullets per section. Link to full changelogs for anyone who wants technical details.

### Embed Structure

```json
{
  "timestamp": "<ISO 8601 timestamp>",
  "title": "Changelog | #<number>",
  "description": "### Bot\n- ...\n\n### Website\n- ...\n\n### API\n- ...\n\n**Full Changelog**: [Bot](<compare URL>) · [Web](<compare URL>)",
  "image": {
    "url": "https://cdn.safepeek.org/assets/changelogs/<number>.png"
  },
  "color": 7649791,
  "footer": {
    "text": "Bot <version range> · Web <version range> · Release Date"
  }
}
```

### Guidelines

- **Title** uses the changelog number (e.g., `#008`), not a version number.
- **Sections** (`Bot`, `Website`, `API`) are only included when there are relevant changes. Drop empty sections.
- **Bullets** use `**New:**`, `**Fixed:**`, or `**Improved:**` prefixes for user-facing items. Internal-only changes get a single "Internal stability improvements" line or are omitted entirely.
- **Footer** shows the version ranges covered per repo (e.g., `Bot v1.3.3–v1.3.4 · Web v0.5.0–v0.5.6`).
- **Image URL** is based on the changelog number: `https://cdn.safepeek.org/assets/changelogs/<number>.png`
- **Full Changelog links** point to GitHub compare views spanning the entire range since the last changelog post, one per repo.
- The last changelog posted was **#008**.

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