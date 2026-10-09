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

## Preview deployments

The `dev` branch deploys to <https://2027-cfp-preview.sitcon.workers.dev>
through Cloudflare Workers Builds in the SITCON Cloudflare account, configured by
[`wrangler.jsonc`](wrangler.jsonc). Every other branch and pull request gets its
own preview URL, which Cloudflare posts as a comment on the pull request. Preview
deployments send `X-Robots-Tag: noindex, nofollow`, so search engines skip them.
They are not the production site.

## License

[MIT](LICENSE), copyright © 2026 SITCON.
