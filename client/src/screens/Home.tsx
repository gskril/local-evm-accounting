import { AccountCard } from '@/components/AccountCard'
import { BalanceCard } from '@/components/BalanceCard'
import { ChainCard } from '@/components/ChainCard'
import { TokenCard } from '@/components/TokenCard'

export function Home() {
  return (
    <div className="flex min-h-svh w-full flex-col gap-4 bg-neutral-50 p-4">
      <div className="grid w-full grid-cols-2 gap-4">
        <ChainCard />
        <AccountCard />
        <BalanceCard />
        <TokenCard />
      </div>
    </div>
  )
}
