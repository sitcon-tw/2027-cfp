# SITCON 2027 Call for Papers

The Call for Papers website for SITCON 2027
(Students' Information Technology Conference / 學生計算機年會).

The site introduces SITCON and its session formats, helps prospective speakers
find a suitable format, and lets them submit proposals, verify their email, and
edit submissions.

[Visit the website](https://sitcon.org/2027/cfp/) ·
[Preview](https://2027-cfp-preview.sitcon.workers.dev)

## Getting started

Use Node.js 22 ([`.nvmrc`](.nvmrc), minimum 22.12) and pnpm
([`package.json`](package.json) pins `pnpm@12.11.2`).

```sh
# Optional, if you use nvm:
nvm install
nvm use

pnpm install
pnpm dev
```

Open the local URL printed by Vite. The site runs without environment variables
or a backend; the submission form is a labelled mock and sends nothing by default.

Useful commands:

- `pnpm check` — run typecheck, lint, and formatting checks.
- `pnpm test` — run automated tests.
- `pnpm build` — build the site into `dist/`, including complete HTML for the five public content pages.
- `pnpm preview` — preview the built site locally.

## Working on the site

Built with React, TypeScript, Vite, Tailwind CSS, Base UI, and TanStack Router.
Website copy lives in [`src/content.json`](src/content.json), and submission
questions live in [`src/forms.json`](src/forms.json).

See [AGENTS.md](AGENTS.md) for project structure, coding and design conventions,
submission API setup, and deployment details.

Design reference:
[Figma — SITCON 2027 CFP 網站](https://www.figma.com/design/QJqFwmJCiOPYwdj9eEpEbU/SITCON-2027-CFP-%E7%B6%B2%E7%AB%99).

## License

[MIT](LICENSE), copyright © 2026 SITCON.
