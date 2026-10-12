# AGENTS.md

Guidance for AI coding agents working in this repository.

## Stack

React 19, Vite, Tailwind CSS v4, TypeScript, pnpm (npm, yarn and bun are blocked).
Base UI (`@base-ui/react`), TanStack Router (file-based), `clsx` + `tailwind-merge`
(via `cn()`), `lucide-react`.
Run `pnpm check` (typecheck, lint, format check) before finishing a task.

- Import from `src` with the `@/` alias (`@/components/ui/button`, `@/lib/utils`).
- Design source: [Figma — SITCON 2027 CFP 網站](https://www.figma.com/design/QJqFwmJCiOPYwdj9eEpEbU/SITCON-2027-CFP-%E7%B6%B2%E7%AB%99)
  (homepage: node `122-336`).

## User-facing content

- **All user-facing literals must live in `src/content.json`.** This is the single
  file organizers audit and edit: visible copy, button/link labels, image alt
  text, accessibility labels, placeholders, dates, units, calendar event titles,
  browser metadata, and example text. Outbound URLs also live there.
- Import it with `import content from '@/content.json'`; reference descriptive
  keys grouped by section. Reuse existing entries for shared copy.
- Keep complete sentences in JSON. For dynamic content, use named placeholders
  such as `{title}` and substitute values in code; do not concatenate hardcoded
  words or punctuation. Keep markup and layout in React.
- Body copy rendered by `LinkedText` (session pages, form descriptions) may
  use `[label](https://…)` links and `**bold**`, the only inline markup.
  Keep the bold of the source document; headings and titles stay plain.
- Technical identifiers (route paths, anchors, CSS classes, state values),
  calculated numbers, date-format separators, and empty decorative `alt=""`
  attributes may stay in code. Display labels for technical values belong in JSON.
- Do not create another copy file or hardcode new copy in TS/TSX/HTML. The HTML
  title is injected from this JSON by Vite for both development and builds.
  The one exception is the submission form's questions (below).

The submission form's questions live in `src/forms.json`, transcribed from
the [表單文案](https://docs.google.com/document/d/16AHAPm7jvjMdqDR4sVJiNp4whCUNKsihHCZMWFoR4u4/edit).
`fields` defines every question once: `label`, `description`, `kind`
(`text`, `email`, `tel`, `url` for a single link, `textarea`, `radio`,
`checkboxes`, `select`, `consent`), `required`, `options`, `public` (adds 【公開】),
`showIf` and the Google Sheet `column` it is written to. `forms.<type>.sections`
lists each session type's questions in order, as keys or as
`{ "key": …, …overrides }` for a per-type difference. A section marked
`"shared": true` (基本資料) is answered once: the store keeps its answers in
step across the types' drafts, so its fields must be identical in every form
(checked on load). Option labels are also
the values stored in the sheet, as in Google Forms; a `consent` question is
a single-option confirmation. Field and section descriptions support only
`**strong**` emphasis, `[label](https://…)` links and
`[label](mailto:…)` email links, rendered by `LinkedText`.
Transcribe bold spans from the source document; background-color annotations
are editorial notes, not emphasis. Keep spans flat: nested markup, general
Markdown, and HTML are not supported. Keep labels and option labels plain,
since option labels sit inside the control and are written to the sheet.
`toSheetRow()` in `src/lib/submission.ts` maps
a draft to those columns, and its `validateField()` checks each answer
(required, email, tel, url, length) for both the form (on blur and submit)
and the API. `forms.<type>.sheet` names the sheet tab, and the
top-level `sheet` holds the metadata columns written before the answers
(投稿編號, 版本, 狀態, …) and the status labels. Form chrome (button labels, validation messages)
stays in `content.json`. The form has no file uploads: photos, documents
and attachments are collected as links in `url` or `textarea` fields, and
their descriptions ask submitters to grant the 議程組 access.

Submissions go to the API Worker in `worker/` (README, "Submission API"):
a standalone Cloudflare Worker that writes to the Google Sheet and sends
mail through the Gmail API. It imports `src/lib/submission.ts`,
`src/lib/deadlines.ts`, `src/lib/session-type-ids.ts` and the JSON files, so
keep those free of React, the DOM and `import.meta.env`; browser-only code
goes in `src/lib/submission-client.ts`. The API contract is in
`src/lib/submission-api.ts`. Email copy lives in `content.submission_email`,
the verify page's in `content.submit_verify`. `/submit/verify` confirms an
address, and `/submit/$type?edit=…` opens an edit link. Without
`VITE_SUBMISSION_API`, the form stays a labelled mock; with it, sends also
need the Turnstile widget (`VITE_TURNSTILE_SITE_KEY`, `turnstile.tsx`), a
Cloudflare iframe that is the one control not built on Base UI. New submissions
save their drafts to `localStorage` (`localDraftStorage` in
`submission-client.ts`: shared answers once, each type's others separately;
a sent type keeps only the shared ones). They are restored on load, dropping
answers that no longer fit; edits save nothing. The notice above the form
(`content.submit_page.draft`) says so and can clear them. Run `pnpm test`
after changing the flow.

Homepage schedules live in `content.attend_section.tickets` and
`content.speaker_section.schedule`. Each item's `start` / `end` is an ISO
timestamp with an explicit timezone (e.g. `2027-01-05T23:59:00+08:00`), or
`null` until announced; a single moment sets only one of them. The status
badges (即將開始 / 進行中 / 已結束) are computed from the dates; an
unannounced item shows no badge and no date. The
speaker items with ids `early` and `submission` also supply the countdowns
(homepage card and session pages), so keep those ids stable: they show the
nearest one not yet passed, ticking every second, and stay on `submission`
once both have. Only `submission`'s `end` closes submissions:
`useSubmissionClosed()` (`src/lib/countdown.ts`) turns every `/submit/…`
CTA into a disabled 投稿已截止 `Button` (footer links into dimmed text) and
replaces the form with the `content.submit_closed` message, live when the
deadline passes; a `null` end keeps submissions open.

The session-type quiz lives in `content.session_quiz.questions`. Each answer
carries `scores` for the four results (`espresso`, `presentation`, `open`,
`demo`; see `content.session_quiz.results`), and the highest total wins. On a
tie, the result picked most recently as an answer's top score wins (Q3, then
Q2, then Q1). Espresso and Presentation both link to the 一般議程 page; the
mapping is in `src/lib/session-quiz.ts`.

## Where components go

- `src/components/ui/` — reusable UI primitives (button, tabs, dialog, tooltip, …).
  One file per primitive, named in kebab-case (`button.tsx`, `tabs.tsx`).
- `src/components/` — site-level components composed from the primitives
  (header, footer, session card, …).
- `src/routes/` — one file per route, picked up by TanStack Router's Vite
  plugin (`index.tsx` → `/`, `about.tsx` → `/about`). Each exports
  `Route = createFileRoute('<path>')({ component })`; `__root.tsx` is the
  layout. Use `<Link to="…">` for internal links (type-checked paths).
- Production lives under `/2027/cfp/` (see README, "Production
  deployment"). Never write a root-relative `href="/…"` or `src="/…"`:
  route through `<Link>` (or a primitive's `render={<Link … />}`) and import
  assets, so the base path is applied. A new route must also be added to
  `routeShells` in `vite.config.ts`, or direct visits to it 404 in production.
- In-page jumps to a section use `<Link to="/" hash="attend">`, never a raw
  `<a href="#attend">`. The router smooth-scrolls hash links
  (`defaultHashScrollIntoView` in `src/main.tsx`, instant under
  `prefers-reduced-motion`), and `scroll-pt-header` on `html` keeps the
  target clear of the header. Do not add `scroll-behavior: smooth` in CSS
  (it would also animate the router's scroll to top on page changes) or a
  smooth-scroll library.
- `src/routeTree.gen.ts` is generated by the Vite plugin whenever `pnpm dev` or
  `pnpm build` runs. Never edit it by hand, but do commit it: `tsc` needs it.
- Routes compose components from the places above; do not put primitives
  inline in routes.

## Base UI is a hard requirement

- Any interactive element that affects user experience (buttons, tabs, menus,
  dialogs, popovers, tooltips, selects, checkboxes, switches, inputs, …) **must**
  be built on [Base UI](https://base-ui.com) (`@base-ui/react`).
- Do not hand-roll these behaviors with raw `<div>`/`<button>` plus custom
  keyboard, focus or ARIA handling. Base UI provides accessibility and
  interaction logic; we provide the look.
- Check the Base UI docs for the component's anatomy and props before writing it.
  Version-matched docs ship in the package: `node_modules/@base-ui/react/docs/react/components/<name>.md`.
  They override anything you remember about Base UI.
- Never render a link (`<a>`) through `Button`'s `render` prop — Base UI forbids it.
  Style the `<a>` with `buttonVariants()` from `@/components/ui/button` instead.
- Do not add other headless or pre-styled UI libraries (Radix, shadcn/ui,
  Headless UI, MUI, …).

## Styling

- Primitives live in `src/components/ui/` in the shadcn style: a thin wrapper
  around a Base UI part that owns its own Tailwind classes. The code lives in
  our repo and is meant to be edited.
- We do **not** use shadcn/ui or any pre-styled component library. The site's
  design is heavily customized, so write styles for our design instead of
  adopting a library's defaults.
- Style with Tailwind utility classes. Style Base UI states through its data
  attributes: Tabs `data-active:`, Radio `data-checked:`, popup triggers
  `data-popup-open:`, everything `data-disabled:`, orientation
  `data-[orientation=vertical]:`. Check the docs for the exact attribute names.
- Primitives accept a string `className` and merge it with `cn()` from
  `@/lib/utils`. Wrappers type it as `WithClassName<X.Props>` from `@/lib/utils`.
- Focus ring for every interactive element:
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue`.
  The exception is `Input` and `Textarea`, which follow Figma's 表單 Page:
  focus lightens the border instead of showing the blue ring.

## Design tokens (mandatory)

All tokens live in the `@theme` block of `src/index.css`. Tailwind's default
colors, type scale and radii are **reset**, so `bg-white`, `text-sm`,
`rounded-lg` (the default one) and friends do not exist.

- **Every size is a token.** Colors, font sizes, line heights, font
  families, radii, spacing and component dimensions all come from `@theme`,
  so the whole design can be retuned from `src/index.css` alone. Arbitrary
  values — `bg-[#…]`, `text-[24px]`, `rounded-[30px]`, `h-[59px]`, `p-[13px]`,
  `font-['…']`, `leading-[…]` — are **forbidden**, with no exceptions for
  "one-off" sizes. (Selectors like `data-[orientation=vertical]:` and Base UI
  runtime variables like `h-(--popup-height)` are not sizes and are fine.)
- **Spacing** comes from the `--spacing` base. Write spacing classes from
  the **Figma px ÷ 4**, as if it were Tailwind's 4px scale. The design is on
  a 5/10px grid: Figma 10px = `2.5`, 20px = `5`, 30px = `7.5`, 50px =
  `12.5`. The base is actually 3px, so these render at ×0.75 (see below).
  Changing `--spacing` rescales all padding, gaps and spacing-based sizes at
  once.
- **All size tokens are in `rem`** (px ÷ 16; the px value is in a comment
  next to each one), so the site follows the browser's font-size setting.
  Write new size tokens in rem too.
- **Reuse before adding.** If a value is already a token, use it, even if
  the name doesn't mention your component (tabs use `h-control` and
  `text-paragraph`, just like buttons). Snap values within a few px of an
  existing token to that token instead of minting a new one.
- **New tokens only when necessary.** Add one only when a Figma value can't be
  expressed by an existing token or by the spacing scale, and name it
  **semantically** after its role (`control`, `content`), never after its
  value (`59`, `big-2`). Never add a token that has no source in Figma — ask
  instead.
- **Adding a token** requires all of: (1) add it to `@theme` in
  `src/index.css`, scaled from Figma (see "Figma sizes vs. token sizes"),
  in rem, plus a mobile override if it should shrink on small screens,
  (2) if it is a new `text-*` size or named `--spacing-*` size, register it in the
  tailwind-merge config in `src/lib/utils.ts` (otherwise `cn()` drops it when
  combined with a text color), (3) add it to the tables here with its Figma,
  desktop and mobile values.

### Colors

| Token                    | Value                             | Figma variable     | Use                                                |
| ------------------------ | --------------------------------- | ------------------ | -------------------------------------------------- |
| `background`             | `#101312`                         | Background         | Page background, dark text on cream, dark button   |
| `foreground`             | `#F9F5EF`                         | Foreground         | Cream surfaces and light text                      |
| `gray`                   | `#2B2B2B`                         | Gray               | Dark card, secondary text on cream, rules          |
| `light`                  | `#E3E0DC`                         | Light              | Muted button, quiz wells                           |
| `red` / `blue` / `green` | `#FF625B` / `#6A74E3` / `#8DF280` | Red / Blue / Green | Hero accent buttons; `blue` is also the focus ring |
| `yellow`                 | `#FCBF30`                         | Yellow             | Early Bird marquee band                            |
| `black`                  | `#000000`                         | Grays/Black        | Overlays only (navbar glass `bg-black/35`)         |

The Figma names are kept as-is, so on cream sections the text color is
`text-background`. That is intended.

### Figma sizes vs. token sizes

Figma is drawn on a 1280px frame with print-scale type (24px body copy,
80px display), which looks oversized in a browser. The tokens are therefore
**not** the Figma values: they are scaled to about **×0.75** on desktop,
with small text (≤ 16px) kept as-is for legibility, and shrink again on
mobile (below `md`, 48rem) through the overrides at the bottom of
`src/index.css`.

When implementing from Figma:

- **Map by role, not by number.** A 24px Figma text is `text-paragraph`, a
  59px control is `h-control`, a 50px corner is `rounded-*-xl`, even though
  the rendered sizes differ. Use the "Figma" column below to find the token.
- **Spacing:** keep writing Figma px ÷ 4 (`p-5` for 20px); the 3px base does
  the scaling.
- **Do not "fix" a token back to its Figma value**, and do not add a token
  just because a rendered size doesn't match Figma. Retune the scale in
  `src/index.css` instead.
- Responsive sizes live in the tokens. Components don't need `md:text-*`
  just to resize text for mobile; use breakpoints only for layout.
- Images rendered at their intrinsic size (SVG logos, backdrop icons, the
  quiz mascot) don't follow the scale.

### Typography

Sizes in px (tokens are rem). Line heights are the same at every size
unless a mobile value is given.

| Token             | Figma                | Desktop              | Mobile    | Use                                 |
| ----------------- | -------------------- | -------------------- | --------- | ----------------------------------- |
| `font-sans`       | —                    | LINE Seed TW → Inter |           | Everything (default)                |
| `font-numeric`    | Inter Medium         | Inter                |           | Dates and countdown digits          |
| `text-mega`       | — (not in Figma)     | 136 / 1.05           | 52        | Homepage "Call For Papers"          |
| `text-headline`   | — (not in Figma)     | 96 / 1.1             | 40        | 甚麼是 SITCON ? headline            |
| `text-stat`       | — (not in Figma)     | 96 / 1               | 56        | 甚麼是 SITCON ? numbers             |
| `text-display`    | 80 / 1.25            | 60                   | 40        | Section titles (`SectionHeading`)   |
| `text-h1`         | 48 / 1 (`h2`)        | 36                   | 28        | Sub-headings (到現在，我們累積了……) |
| `text-eyebrow`    | 40 / 1               | 30                   | 22        | "SITCON 2027"                       |
| `text-h2`         | 36 / 40px            | 28 / 1.1             | 22        | Centered titles                     |
| `text-h3`         | 32 / 1.5 (`h3`)      | 24                   | 20        | Card titles                         |
| `text-lead`       | 28 / normal          | 20                   | 18        | Large button                        |
| `text-paragraph`  | 24 / 2 (`paragraph`) | 18                   | 16 / 1.75 | Body copy, buttons, quiz            |
| `text-subheading` | 20 / 1.5             | 18                   | 16        | Footer column titles                |
| `text-body`       | 16 / 1.5             | 16                   | 14        | Navbar, footer links                |
| `text-caption`    | 12 / 1.5             | 12                   | 12        | Footer fine print                   |

Weights: `font-normal` (400), `font-bold` (700), `font-extrabold` (800).
`font-medium` is for Inter only.

LINE Seed TW is self-hosted. The official TTFs (from
[seed.line.me](https://seed.line.me), OFL, `fonts/line-seed-tw/`) are
imported with `?subsets` in `src/main.tsx`, and `vite-plugin-font`
(`vite.config.ts`) subsets them at build time to the characters in `src/`
plus ASCII and common full-width punctuation (`whiteList`), split into
unicode-range chunks. New copy in `content.json` is picked up
automatically. A character typed into the form that the subset lacks falls
back to Inter or the system font. Do not load fonts from a CDN.

The plugin's native binary is downloaded by the root `postinstall`, pinned
to a version; `cn-font-split`'s own install script (which fetches the
latest release) is disabled in `pnpm-workspace.yaml`. The binary also keeps
Node from exiting, so the `exit-after-build` plugin ends `vite build`.

### Radii and layout

| Token           | Figma | Desktop | Mobile | Use                                            |
| --------------- | ----- | ------- | ------ | ---------------------------------------------- |
| `rounded-*-xs`  | 5     | 4       | 4      | The sharp corner of buttons                    |
| `rounded-*-sm`  | 14    | 10      | 8      | Inner corners of grouped tiles; default `Card` |
| `rounded-*-md`  | 30    | 22      | 18     | Button corners                                 |
| `rounded-*-lg`  | 40    | 30      | 24     | Quiz wells and answer pills                    |
| `rounded-*-xl`  | 50    | 36      | 28     | Outer corners of cards                         |
| `rounded-full`  | —     | —       | —      | Navbar, icon buttons                           |
| `max-w-content` | 970   | 970     | 970    | Content column (`mx-auto max-w-content`)       |

### Sizes

| Token               | Figma | Desktop | Mobile | Use                                                                                                   |
| ------------------- | ----- | ------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `--spacing`         | 4     | 3       | 3      | Base of the spacing scale (`p-5`, `gap-2.5`, `size-6`, …)                                             |
| `h-control`         | 59    | 44      | 40     | Default control height: `Button` md, tab tiles (`min-h-control`)                                      |
| `h-control-lg`      | 86    | 64      | 52     | Large control height: `Button` lg, navbar                                                             |
| `size-control-icon` | 45    | 36      | 36     | Icon-only buttons                                                                                     |
| `pt-header`         | 126   | 94      | 82     | Height of the overlaid site header; pages pad their top with it. Derived: `spacing × 10 + control-lg` |

**Corner rule.** Tiles that sit next to each other (side by side or stacked)
read as one shape: their **outer** corners are `xl` and their **inner**
corners are `sm`. Examples: deadline + countdown (`rounded-l-xl` /
`rounded-r-xl`), about image + text, session-type stack + detail panel
(`rounded-tl-xl` on the first tile, `rounded-bl-xl` on the last,
`rounded-r-xl` on the panel). Set these per tile at the call site, e.g.
`<Card className="rounded-l-xl">`. `TabsList` applies the rule to its tabs
automatically.

**Section layout.** Sections are built so their edges line up down the
page and spacing reads as one rhythm. Copy the shell from an existing
section of the same kind instead of picking new numbers.

- **One gutter, one column.** Every section has the same screen-edge
  gutter and the same centered `max-w-content` column with the same inner
  padding, so the text starts at the same x on every section, every page.
  Never pad one section's column differently to nudge its content.
- **Each kind of spacing has one owner.** The section owns its background,
  full-bleed width and the space above and below it. The column owns the
  rhythm between its children (one `gap`). A child that needs a larger
  break adds padding on itself. Don't mix in margins or change the gap
  per child.
- **Same kind, same spacing.** Sections that play the same role (homepage
  sections, sub-page sections, a page's first section under the header)
  share the same vertical padding. Deviate only where Figma does, and say
  why in a comment.
- **Full-bleed pieces rejoin the column.** Elements that break out to the
  screen edge (the photo wall, slanted edges) put any text or controls they
  carry back inside the shared column.
- **Stay on the grid.** All spacing comes from the 5/10px Figma grid (see
  "Spacing" above). Snap off-grid Figma values to the nearest step.

### Icons and images

- Icons: use `lucide-react` whenever an equivalent exists (the design is
  drawn with Lucide).
- Brand logos (Facebook, Instagram, Telegram, Flickr, YouTube, the SITCON
  logo) are not in Lucide: export them from Figma as SVG into
  `src/assets/` and import them. Never hand-draw or paste approximate paths.
- Photos are optimized at build time by `vite-imagetools` (presets in
  `vite.config.ts`, types in `src/images.d.ts`). Commit the photo as a
  JPG, PNG or WebP, at least as wide as it renders on a 2× screen (up to
  1600px); don't make your own sizes, formats or thumbnails. Import it with
  `?responsive` (also as `query: '?responsive'` in `import.meta.glob`) and
  render it with `ResponsiveImage` from `@/components/responsive-image`,
  passing `sizes` for its rendered width. It makes a `<picture>` of AVIF
  and WebP at several widths, lazy by default; the photo at the top of a
  page takes `loading="eager"` and `fetchPriority="high"`. `?placeholder`
  gives a tiny inlined preview (`PageHero`'s `placeholder`), and
  `preloadImage` in `@/lib/preload-image` fetches a photo ahead of time.
  SVGs are imported plainly and rendered with `<img>`.

### Photo wall

The homepage 甚麼是 SITCON ? section scrolls a wall of past-conference
photos (`src/components/home/photo-wall.tsx`). Its photos are every image in
`src/assets/photo-wall/`, in filename order. To show some large, list
their file names in `about_section.photoWallLarge` in `content.json`; they
take the large tiles in that order. Export photos at about 1600px on the
long side. With the
folder empty, the session photo stands in at different crops.

With a mouse, hovering pauses the wall and makes the photo under the cursor
glow: the rest dims, with light spilling past the photo's edges
(`spotlight-shade` in `src/index.css`). The glow glides
between photos and fades with `ease-smooth`. Touch
devices get the plain wall.

### Session examples

The 投稿主題範例 section on `/sessions/$type` reads its cards from
`content.session_page.examples.<type>`: either `items` (one carousel) or
`groups`, each a `title` with its own `items` (一般議程's Presentation and
Espresso). Each card has `title`, `href` and `image`, a file name in
`src/assets/session-examples/`. An empty `items` list shows the 範例整理中
message. The carousel is a scroll-snap row (wheel, trackpad and touch
scroll it a page at a time), and it turns the page every few seconds until
someone scrolls or clicks it; it waits while hovered, focused or off screen,
and never moves under `prefers-reduced-motion`.

### Placeholders

Regions that are not designed yet, or are marked WIP in Figma, render
`<Placeholder label="…" />` from `@/components/placeholder`. Do not invent a
design for them. There are none at the moment.

### Demo posters

The 歷年海報展示 strip on `/sessions/demo` shows every image in
`src/assets/demo-posters/`, newest file name first (`2026-1.webp` before
`2025-1.webp`). They are past posters from the 2026 and 2025 sites
(`sitcon-tw/2026` `public/img/poster/`, `sitcon-tw/2025` `public/poster/`),
exported at 1000px tall. Clicking a poster opens it in a lightbox
(`Dialog`) that steps through the others; its alt text is
`demoPosters.poster`, filled with the year and number from the file name,
so keep the `<year>-<n>` naming.
