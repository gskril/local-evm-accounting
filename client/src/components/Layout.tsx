import { ArrowUpRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { SERVER_URL } from '@/hooks/useHono'
import { useQueues } from '@/hooks/useQueues'
import { cn } from '@/lib/utils'

import { CurrencySelector } from './CurrencySelector'

const links = [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'Portfolio',
    to: '/portfolio',
  },
  {
    label: 'Accounts',
    to: '/accounts',
  },
  {
    label: 'Chains',
    to: '/chains',
  },
  {
    label: 'Tokens',
    to: '/tokens',
  },
]
export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const queues = useQueues()

  return (
    <div className="grid grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 flex h-svh flex-col justify-between border-r p-6">
        <nav>
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={cn(
                    'block rounded px-2 py-1',
                    pathname === link.to && 'bg-gray-100 font-medium'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2">
          <CurrencySelector />

          <span className="text-muted-foreground text-sm">
            {queues.data?.inProgress} jobs in progress
          </span>

          {!!queues.data?.failed && (
            <a
              href={`${SERVER_URL}/dashboard`}
              target="_blank"
              className="border-destructive bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border p-2 text-sm"
            >
              {queues.data.failed} jobs failed{' '}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </aside>

      <main className="flex min-h-svh w-full flex-col gap-6 bg-neutral-50 p-6">
        {children}
      </main>
    </div>
  )
}
