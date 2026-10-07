# 2027-cfp

React + Vite + Tailwind CSS v4.

## Requirements

- Node.js >= 22.12 (see `.nvmrc`)
- pnpm >= 10 — **npm, yarn, and bun are blocked**

## Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `pnpm dev`      | Start the dev server                  |
| `pnpm build`    | Type-check and build for production   |
| `pnpm preview`  | Preview the production build          |
| `pnpm check`    | Run typecheck, lint, and format check |
| `pnpm lint:fix` | Auto-fix lint issues (oxlint)         |
| `pnpm format`   | Format all files (Prettier)           |

## Editing website content

All website text and outbound links are in [src/content.json](src/content.json),
including accessibility labels and the browser title. Find the matching section
(e.g. `hero`, `site_footer`, `sessions`), and edit its values while keeping the
keys, quotes, and commas intact. Keep named placeholders such as `{title}` and
`{year}` intact; the website fills those in automatically. `dateTime` uses
`YYYY-MM-DD`, while `date` is the displayed date. SVG logos are artwork assets.

Run `pnpm check` after editing, then `pnpm dev` to review the result.
