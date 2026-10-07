// Runs as `preinstall`. Rejects any package manager other than pnpm.
const userAgent = process.env.npm_config_user_agent ?? ''

if (!userAgent.startsWith('pnpm/')) {
  const used = userAgent.split('/')[0] || 'an unknown package manager'
  console.error(
    `\n  This repository requires pnpm, but you ran ${used}.\n` +
      '  Install pnpm (https://pnpm.io/installation) and run `pnpm install`.\n',
  )
  process.exit(1)
}
