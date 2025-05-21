import { Link, useLocation } from 'react-router-dom'

import { cn } from '@/lib/utils'

import { CurrencySelector } from './CurrencySelector'

const links = [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'Accounts',
    to: '/accounts',
  },
  {
    label: 'Chains',
    to: '/chains',
  },
]
export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

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

        <CurrencySelector />
      </aside>

      <main className="flex min-h-svh w-full flex-col gap-6 bg-neutral-50 p-6">
        {children}
      </main>
    </div>
  )
}
