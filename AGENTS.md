# AGENTS.md

Guidance for AI coding agents working in this repository.

## Stack

React 19, Vite, Tailwind CSS v4, TypeScript, pnpm (npm, yarn and bun are blocked).
Run `pnpm check` (typecheck, lint, format check) before finishing a task.

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
  attributes (e.g. `data-[selected]:`, `data-[disabled]:`).
- Primitives accept and merge a `className` prop so callers can adjust them.
