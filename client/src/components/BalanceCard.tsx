import { toast } from 'sonner'

import { useQueues } from '@/hooks/useQueues'

import { useCurrency } from '../hooks/useCurrency'
import { honoClient, useBalances, useFiat } from '../hooks/useHono'
import { formatCurrency, toFixed } from '../lib/utils'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function BalanceCard() {
  const balances = useBalances()
  const queues = useQueues()
  const { currency } = useCurrency()
  const { data: fiat } = useFiat()

  async function handleRefresh(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const promise = honoClient.balances.$post()
    const msg = 'Starting to refetch balances in the background'

    toast.promise(promise, {
      loading: msg,
      success: () => {
        queues.refetch()
        return msg
      },
      error: 'Failed to refetch balances',
    })
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>
          Aggregated Balances{' '}
          {!!balances.data?.totalEthValue && fiat && currency && (
            <span className="text-muted-foreground text-sm">
              {formatCurrency(
                balances.data.totalEthValue / fiat.getRate(currency),
                currency
              )}
            </span>
          )}
        </CardTitle>
        <form onSubmit={handleRefresh}>
          <Button type="submit" isLoading={!!queues.data?.inProgress}>
            Refresh
          </Button>
        </form>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {balances.data?.tokens.map((balance) => (
          <div key={balance.token?.id}>
            <p>{balance.token?.name}</p>
            <p className="text-muted-foreground text-sm">
              {toFixed(balance.balance, 4)} tokens
            </p>
            {fiat && currency && (
              <p className="text-muted-foreground text-sm">
                worth{' '}
                {formatCurrency(
                  balance.ethValue / fiat.getRate(currency),
                  currency
                )}{' '}
                {currency}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
