# SITCON 2027 Call for Papers

The CFP website for SITCON 2027 (Students' Information Technology Conference / 學生計算機年會).
It introduces the conference and its session formats, helps prospective speakers
choose how to participate, and provides routes for submission information.

Submissions are sent to the submission API in [`worker/`](worker/), which
stores them in a Google Sheet and emails the submitter a verification link,
then a copy with an edit link. See [Submission API](#submission-api).

## Getting started

Requirements:

- Node.js **22.12 or newer**. [`.nvmrc`](.nvmrc) selects Node 22 for nvm users.
- pnpm **12 or newer**. [`package.json`](package.json) pins `pnpm@12.11.2`.
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
variables or backend service: without `VITE_SUBMISSION_API`, the submission
form is a labelled mock that sends nothing. To run it against the API, see
[Submission API](#submission-api).

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

## Production deployment

The site is served at <https://sitcon.org/2027/cfp/> as part of the
[`sitcon-tw/2027`](https://github.com/sitcon-tw/2027) GitHub Pages site, the
same way as the [sponsorship prospectus](https://github.com/sitcon-tw/2027-cfs):

1. A push to `main` (or a manual run) of **Build CFP site**
   ([`.github/workflows/build.yml`](.github/workflows/build.yml)) runs
   `pnpm check`, builds with `BASE_PATH=/2027/cfp/`, and publishes `dist/` to
   the `build` branch of this repository.
2. Once it succeeds, run **Deploy website** on `main` in `sitcon-tw/2027`. It
   copies the `build` branch into `/cfp/` of its output and deploys the whole
   site. Every deployment there also picks up the latest CFP build.

To check a production build locally:

```sh
BASE_PATH=/2027/cfp/ pnpm build
mkdir -p /tmp/site/2027 && rm -rf /tmp/site/2027/cfp && cp -r dist /tmp/site/2027/cfp
python3 -m http.server -d /tmp/site   # open http://localhost:8000/2027/cfp/
```

`BASE_PATH` sets Vite's `base` and the router's `basepath`; without it the site
builds for `/` (development, `pnpm preview` and preview deployments). GitHub
Pages has no single-page-app fallback, so the build also writes a copy of
`index.html` for every route (`about/`, `sessions/<type>/`, `submit/<type>/`;
see `routeShells` in [`vite.config.ts`](vite.config.ts)). That lets direct
links and page refreshes work.

Paths that match no route render the site's 404 page. The build writes
`404.html` as another copy of `index.html` for hosts that look for one, but
GitHub Pages only serves the `404.html` at the root of the `sitcon-tw/2027`
site, so on production a missing path under `/2027/cfp/` shows GitHub's own
404 until that site falls back to `cfp/404.html` for those paths.

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every pull
request to `dev` or `main` and every push to either branch. Its jobs
mirror `pnpm check` plus the build:

- **Lint** runs `pnpm lint`.
- **Format** runs `pnpm format:check`.
- **Build** runs `pnpm build` (which typechecks first) and fails if the build
  regenerated `src/routeTree.gen.ts`, meaning a route change was committed
  without the regenerated route tree.
- **Test** runs `pnpm test` (Vitest) and bundles the API Worker without
  deploying it.

## Preview deployments

The `dev` branch deploys to <https://2027-cfp-preview.sitcon.workers.dev>
through Cloudflare Workers Builds in the SITCON Cloudflare account, configured by
[`wrangler.jsonc`](wrangler.jsonc). Every other branch and pull request gets its
own preview URL, which Cloudflare posts as a comment on the pull request. Preview
deployments send `X-Robots-Tag: noindex, nofollow`, so search engines skip them.
They are not the production site.

## Submission API

The site is static, so submissions go to a separate, API-only Cloudflare
Worker in [`worker/`](worker/) (`2027-cfp-api`), which the site calls
cross-origin. It shares `src/forms.json`, `src/content.json` and
[`src/lib/submission.ts`](src/lib/submission.ts) with the form, so validation
and sheet columns can't drift. The request and response shapes are in
[`src/lib/submission-api.ts`](src/lib/submission-api.ts).

### Flow

1. **Submit.** The Worker validates the draft, appends it to the session
   type's tab as version 1, 狀態 `未驗證`, and emails a verification link
   (`/submit/verify?token=…`, valid for 48 hours). That email carries no
   submitted text, so the form can't be used to mail anyone else's words.
2. **Verify.** The verify page confirms the token. The row becomes `已驗證`
   and the submitter gets a copy of every answer and an edit link
   (`/submit/<type>?edit=…`).
3. **Edit.** The edit link opens the form with the current version. Each send
   **appends** the next version; nothing is overwritten. From the same address
   it is `已驗證` at once and older verified versions become `已取代`; a new
   address has to verify first. Edits close at the submission deadline
   (`content.speaker_section.schedule`, id `submission`), enforced by the
   Worker as well.

In the sheet, filter 狀態 = `已驗證` for the current version of every
submission (投稿編號). Links are HMAC-signed with `TOKEN_SECRET`, so the sheet
holds no secrets; changing that secret voids every link already sent.

### Abuse protection

The verification email goes to whatever address is typed in, so the API
keeps anyone from using it to flood someone else's inbox:

- **Turnstile.** New submissions and edits need a passed
  [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) check,
  shown above the submit button. Each token is single use.
- **Per address:** at most 3 verification emails a minute and
  `MAIL_DAILY_LIMIT` (3) per 24 hours, counted in the `MAIL_COUNTS` KV
  namespace under a hash of the address. The quota is checked before
  anything is written to the sheet.
- **Per IP:** 5 submissions or edits and 20 requests in all, a minute.

### Google setup

The Worker uses the SITCON Workspace service account (ask Denny Huang):

- **Mail** goes out through the Gmail API as `noreply@sitcon.org`, using
  domain-wide delegation, with replies going to `session@sitcon.org`. The
  service account's client ID must be granted
  `https://www.googleapis.com/auth/gmail.send` in the Admin console (Security
  → API controls → Domain-wide delegation). Google sends and DKIM-signs the
  mail, so SPF, DKIM and DMARC pass for sitcon.org.
- **Sheet:** share the Google Sheet with the service account's
  `…@….iam.gserviceaccount.com` address as an Editor. No delegation is used for
  it. The Worker creates a missing tab (`forms.<type>.sheet` in
  `src/forms.json`) and writes its header row. If a tab's header row no longer
  matches `forms.json`, writes stop with an error, so changing a question mid-CFP
  needs a new tab or a matching header edit.

### Configuration

Vars are in [`worker/wrangler.jsonc`](worker/wrangler.jsonc). Set the secrets
once per environment:

```sh
cd worker
pnpm exec wrangler secret put SHEET_ID --env=""
pnpm exec wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY --env=""  # the JSON key
pnpm exec wrangler secret put TOKEN_SECRET --env=""  # e.g. `openssl rand -base64 32`
pnpm exec wrangler secret put TURNSTILE_SECRET --env=""  # the widget's secret key
```

Create the Turnstile widget in the SITCON Cloudflare account (Turnstile → Add
widget, mode **Managed**, hostnames `sitcon.org` and `localhost`). Its secret
key is `TURNSTILE_SECRET`; its site key is public and goes in the repository
variable `TURNSTILE_SITE_KEY` (Settings → Secrets and variables → Actions →
Variables), which [`build.yml`](.github/workflows/build.yml) passes to the
site as `VITE_TURNSTILE_SITE_KEY`.

The Worker deploys through **Cloudflare Workers Builds** in the SITCON
Cloudflare account, like the preview site. It is configured in the dashboard,
not in this repository: open the `2027-cfp-api` Worker → Settings → Build →
Connect, pick `sitcon-tw/2027-cfp`, and set:

- **Production branch:** `main`.
- **Non-production branch builds:** off. Every deployment uses the real sheet
  and sends real email.
- **Root directory:** `worker`, so Workers Builds finds this Worker's
  `wrangler.jsonc` rather than the preview site's one at the root.
- **Build command:** `cd .. && pnpm install --frozen-lockfile`.
- **Deploy command:** `cd .. && pnpm api:deploy`.

Secrets survive deployments. Variables set in the dashboard do not: each
deployment resets them to `worker/wrangler.jsonc`, so change them there.

[`build.yml`](.github/workflows/build.yml) builds the site with
`VITE_SUBMISSION_API` set from the repository variable `SUBMISSION_API`
(`https://2027-cfp-api.sitcon.workers.dev`), next to `TURNSTILE_SITE_KEY`.

### Local development

Copy [`worker/.dev.vars.example`](worker/.dev.vars.example) to
`worker/.dev.vars` (git-ignored), pointing `SHEET_ID` at a **test** sheet
shared with the service account. Then:

```sh
pnpm api:dev                                       # API on http://localhost:8787
VITE_SUBMISSION_API=http://localhost:8787 \
  VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA pnpm dev  # site on :5173
```

`1x00000000000000000000AA` and the `TURNSTILE_SECRET` in the example file
are Cloudflare's always-pass test keys. The `staging` environment allows
`http://localhost:5173` and links its
emails there. Real emails are sent, so use your own address. `pnpm test` runs
the flow against an in-memory sheet, with no Google access.

## License

[MIT](LICENSE), copyright © 2026 SITCON.
