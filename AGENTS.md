# AGENTS.md

Guidance for AI coding agents working in this repository.

## Stack

React 19, Vite, Tailwind CSS v4, TypeScript, pnpm (npm, yarn and bun are blocked).
Base UI (`@base-ui/react`), `clsx` + `tailwind-merge` (via `cn()`), `lucide-react`.
Run `pnpm check` (typecheck, lint, format check) before finishing a task.

- Import from `src` with the `@/` alias (`@/components/ui/button`, `@/lib/utils`).
- Design source: [Figma — SITCON 2027 CFP 網站](https://www.figma.com/design/QJqFwmJCiOPYwdj9eEpEbU/SITCON-2027-CFP-%E7%B6%B2%E7%AB%99)
  (homepage: node `122-336`).

## Where components go

- `src/components/ui/` — reusable UI primitives (button, tabs, dialog, tooltip, …).
  One file per primitive, named in kebab-case (`button.tsx`, `tabs.tsx`).
- `src/components/` — site-level components composed from the primitives
  (header, footer, session card, …).
- Pages and routes compose components from the two places above; do not put
  primitives inline in pages.

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
  `@/lib/utils`. Wrappers type it as `Omit<X.Props, 'className'> & { className?: string }`.
- Focus ring for every interactive element:
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue`.

## Design tokens (mandatory)

All tokens live in the `@theme` block of `src/index.css`. Tailwind's default
colors, type scale and radii are **reset**, so `bg-white`, `text-sm`,
`rounded-lg` (the default one) and friends do not exist.

- **Use tokens only.** Colors, font sizes, font families and radii must come
  from the tables below. Arbitrary values — `bg-[#…]`, `text-[24px]`,
  `rounded-[30px]`, `font-['…']`, `leading-[…]` for text styles — are
  **forbidden**. The only allowed arbitrary values are one-off `w-`/`h-`/`size-`
  dimensions that don't land on the spacing scale (e.g. `h-[59px]`).
- **Spacing** uses Tailwind's default 4px scale. The design is on a 5/10px
  grid: 10px = `2.5`, 20px = `5`, 30px = `7.5`, 50px = `12.5`.
- **Adding a token** requires all three: (1) add it to `@theme` in
  `src/index.css`, (2) if it is a new `text-*` size, register it in the
  tailwind-merge config in `src/lib/utils.ts` (otherwise `cn()` drops it when
  combined with a text color), (3) add it to the tables here. Never add a token
  that has no source in Figma — ask instead.

### Colors

| Token                    | Value                             | Figma variable     | Use                                                |
| ------------------------ | --------------------------------- | ------------------ | -------------------------------------------------- |
| `background`             | `#101312`                         | Background         | Page background, dark text on cream, dark button   |
| `foreground`             | `#F9F5EF`                         | Foreground         | Cream surfaces and light text                      |
| `gray`                   | `#2B2B2B`                         | Gray               | Dark card, secondary text on cream, rules          |
| `light`                  | `#E3E0DC`                         | Light              | Muted button, quiz wells                           |
| `red` / `blue` / `green` | `#FF625B` / `#6A74E3` / `#8DF280` | Red / Blue / Green | Hero accent buttons; `blue` is also the focus ring |
| `black`                  | `#000000`                         | Grays/Black        | Overlays only (navbar glass `bg-black/35`)         |

The Figma names are kept as-is, so on cream sections the text color is
`text-background`. That is intended.

### Typography

| Token             | Size / line height   | Figma             | Use                                        |
| ----------------- | -------------------- | ----------------- | ------------------------------------------ |
| `font-sans`       | LINE Seed TW → Inter | —                 | Everything (default)                       |
| `font-numeric`    | Inter                | Inter Medium      | Dates and countdown digits                 |
| `text-display`    | 80 / 1.25            | —                 | "Call For Papers"                          |
| `text-h1`         | 48 / 1               | style `h2`        | Page section headings (重要時程, 我要贊助) |
| `text-eyebrow`    | 40 / 1               | —                 | "SITCON 2027"                              |
| `text-h2`         | 36 / 40px            | —                 | Centered section titles (甚麼是 SITCON ?)  |
| `text-h3`         | 32 / 1.5             | style `h3`        | Card titles                                |
| `text-lead`       | 28 / normal          | —                 | Large button                               |
| `text-paragraph`  | 24 / 2               | style `paragraph` | Body copy, buttons, quiz                   |
| `text-subheading` | 20 / 1.5             | —                 | Footer column titles                       |
| `text-body`       | 16 / 1.5             | —                 | Navbar, footer links                       |
| `text-caption`    | 12 / 1.5             | —                 | Footer fine print                          |

Weights: `font-normal` (400), `font-bold` (700), `font-extrabold` (800).
`font-medium` is for Inter only.

LINE Seed TW is loaded from emfont with the CSS `@import`s at the top of
`src/index.css` (unicode-range chunked, so only the glyphs a page uses get
downloaded). Do **not** use `emfont.js` or `emfont-*` classes.

### Radii and layout

| Token           | Value | Use                                            |
| --------------- | ----- | ---------------------------------------------- |
| `rounded-*-xs`  | 5px   | The sharp corner of buttons                    |
| `rounded-*-sm`  | 14px  | Inner corners of grouped tiles; default `Card` |
| `rounded-*-md`  | 30px  | Button corners                                 |
| `rounded-*-lg`  | 40px  | Quiz wells and answer pills                    |
| `rounded-*-xl`  | 50px  | Outer corners of cards                         |
| `rounded-full`  | —     | Navbar, icon buttons                           |
| `max-w-content` | 970px | Content column (`mx-auto max-w-content`)       |

**Corner rule.** Tiles that sit next to each other (side by side or stacked)
read as one shape: their **outer** corners are `xl` and their **inner**
corners are `sm`. Examples: deadline + countdown (`rounded-l-xl` /
`rounded-r-xl`), about image + text, session-type stack + detail panel
(`rounded-tl-xl` on the first tile, `rounded-bl-xl` on the last,
`rounded-r-xl` on the panel). Set these per tile at the call site.

### Icons and images

- Icons: use `lucide-react` whenever an equivalent exists (the design is
  drawn with Lucide).
- Brand logos (Facebook, Instagram, Telegram, Flickr, YouTube, the SITCON
  logo) are not in Lucide: export them from Figma as SVG into
  `src/assets/` and import them. Never hand-draw or paste approximate paths.

### Placeholders

Regions that are not designed yet, or are marked WIP in Figma, render
`<Placeholder label="…" />` from `@/components/placeholder`. Do not invent a
design for them. Current placeholders:

- "Nathan 詠唱" — the layer over 甚麼是 SITCON / 重要時程 on the homepage.
- `佔位` — the footer row of the session-type quiz.

### Undesigned states

Figma has no hover, focus, selected, checked or popup designs yet. The
primitives use proposals (dimmed inactive tabs, ink checked radios, navbar-
glass dropdown, `brightness-95` hover). Keep them consistent and replace them
when the designs arrive.
