import { createFileRoute, Link } from '@tanstack/react-router'

import { buttonVariants } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5">
      <h1 className="text-display font-extrabold">2027 CFP</h1>
      <Link to="/playground" className={buttonVariants({ variant: 'cream' })}>
        Playground
      </Link>
    </main>
  )
}
