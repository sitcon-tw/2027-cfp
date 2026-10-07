# SITCON 2027 Call for Papers

The CFP website for SITCON 2027 (Students' Information Technology Conference / 學生計算機年會).
It introduces the conference and its session formats, helps prospective speakers
choose how to participate, and provides routes for submission information.

**Work in progress:** the homepage is partially implemented. Session details,
submission forms, and About sections are scaffolded with placeholders; submissions
cannot be sent yet. Some destinations are still undecided, and the submission
deadline is not configured.

## Getting started

Requirements:

- Node.js **22.12 or newer**. [`.nvmrc`](.nvmrc) selects Node 22 for nvm users.
- pnpm **10 or newer**. [`package.json`](package.json) pins `pnpm@10.20.0`.
  Installation with npm, yarn, or bun is blocked.

From the repository root:

```sh
# If you use nvm:
nvm install
nvm use

pnpm install
pnpm dev
```

Open the local URL printed by Vite. Local development requires no environment
variables or backend service.

## Commands

| Command             | Description                                |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Start Vite with hot module replacement     |
| `pnpm build`        | Type-check and build into `dist/`          |
| `pnpm preview`      | Serve the production build locally         |
| `pnpm check`        | Run typecheck, lint, and formatting checks |
| `pnpm typecheck`    | Run TypeScript checks                      |
| `pnpm lint`         | Check code with Oxlint                     |
| `pnpm lint:fix`     | Apply automatic lint fixes                 |
| `pnpm format:check` | Check formatting with Prettier             |
| `pnpm format`       | Format the repository with Prettier        |

Run **`pnpm check` before submitting a change**. Review affected pages in the
browser at desktop and mobile widths, including keyboard navigation when changing
interactive components. `pnpm build` checks the production build; `pnpm preview`
requires a build first.

## Editing website content

[`src/content.json`](src/content.json) is the single source for all website copy
and outbound URLs. It includes button and link labels, image alt text,
accessibility labels, placeholders, dates, calendar event titles, and browser
metadata. The HTML title is injected from `metadata.title` by Vite during both
development and builds.

To update content:

1. Find the relevant section, such as `hero`, `site_footer`, or `sessions`.
2. Edit values while preserving the JSON structure. Keep named placeholders such
   as `{title}` and `{year}` intact; components substitute their values.
3. Run `pnpm check`, then review the result with `pnpm dev`.

Keep complete sentences in JSON and markup in React. Do not introduce a second
copy file or hardcode website text in TS, TSX, or HTML. Technical route paths,
anchors, and state identifiers may remain in code.

For the event date, `hero.dateTime` uses `YYYY-MM-DD`; `hero.date` is the displayed
label. The submission countdown currently has a separate, unset `DEADLINE` in
[`submission-deadline.tsx`](src/components/home/submission-deadline.tsx), so changing
the displayed copy alone does not enable the countdown or calendar link.

## Project structure

The site uses React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Router, and
Base UI. Oxlint checks code and Prettier formats it, including Tailwind classes.

```text
src/
├── assets/              SVG artwork, brand logos, and photos
├── components/
│   ├── ui/              Reusable Base UI primitives
│   ├── home/            Homepage sections
│   ├── sessions/        Session information sections
│   ├── submit/          Submission sections
│   └── about/           About sections
├── routes/              File-based routes and the shared root layout
├── lib/                 Shared helpers, destinations, and session types
├── content.json         Website copy and outbound URLs
├── index.css            Design tokens, fonts, and global styles
├── main.tsx             Application entry point
└── routeTree.gen.ts     Generated route tree (committed)
```

Import from `src` with the `@/` alias. Routes compose site components; reusable
primitives belong in `src/components/ui/`, one kebab-case file per primitive.

### Routes

| Path              | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `/`               | Homepage, session format chooser, and sponsorship |
| `/sessions/$type` | Session information                               |
| `/submit/$type`   | Submission page scaffold                          |
| `/about`          | About SITCON page scaffold                        |
| `/playground`     | Temporary page for manually reviewing primitives  |

`$type` accepts `general`, `open`, or `demo`. Invalid types redirect to the
corresponding `general` page. The header and footer live in `routes/__root.tsx`.

TanStack Router generates `src/routeTree.gen.ts` when Vite runs through `pnpm dev`
or `pnpm build`. **Commit this file, but never edit it by hand**: TypeScript needs
it. After adding or renaming a route, run `pnpm dev` to regenerate it before
running `pnpm check`. Use TanStack Router's typed `<Link>` for internal navigation.

## Design and UI conventions

The design source is
[Figma — SITCON 2027 CFP 網站](https://www.figma.com/design/QJqFwmJCiOPYwdj9eEpEbU/SITCON-2027-CFP-%E7%B6%B2%E7%AB%99)
(homepage node `122-336`). Detailed implementation rules and token tables are in
[`AGENTS.md`](AGENTS.md).

- **Use Base UI for interactive controls.** Our primitives wrap `@base-ui/react`
  with custom Tailwind styles. Version-matched component docs are available at
  `node_modules/@base-ui/react/docs/react/components/<name>.md`. Style links with
  `buttonVariants()` rather than rendering an anchor through Base UI's Button.
- **Use design tokens.** Colors, typography, radii, and dimensions come from the
  `@theme` block in `src/index.css`; Tailwind's default colors, type scale, and
  radii are reset. Arbitrary size and color values are forbidden.
- **Map Figma values by role.** Desktop tokens render at roughly 75% of the Figma
  scale, with mobile overrides. For spacing, write Figma pixels divided by four
  (`20px` → `p-5`); the 3px spacing base applies the scaling.
- **Reuse tokens before adding them.** New tokens need a Figma source, rem values,
  any appropriate mobile override, and documentation in `AGENTS.md`. Register new
  text sizes and named spacing sizes in the Tailwind merge configuration in
  `src/lib/utils.ts`.
- **Preserve accessibility.** Merge primitive classes with `cn()` and use the
  shared focus ring:
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue`.
- **Use the supplied artwork.** Use `lucide-react` for matching icons and export
  brand logos from Figma as SVGs into `src/assets/`.
- **Keep unfinished sections explicit.** Use the shared `Placeholder` component
  for undesigned or WIP regions, with its label in `content.json`.

## Production build

```sh
pnpm check
pnpm build
pnpm preview
```

Publish the contents of `dist/` to a static host. The site uses client-side
routing, so configure the host to serve `index.html` for application paths such
as `/sessions/general`, `/submit/demo`, and `/about` when no static file matches.
This allows direct links and page refreshes to work. `pnpm preview` is for local
verification, not production hosting.

## License

[MIT](LICENSE), copyright © 2026 SITCON.
