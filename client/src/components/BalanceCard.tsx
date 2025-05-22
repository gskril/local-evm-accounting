import { toast } from 'sonner'

import { useCurrency } from '../hooks/useCurrency'
import { honoClient, useBalances, useFiat } from '../hooks/useHono'
import { toFixed } from '../lib/utils'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function BalanceCard() {
  const balances = useBalances()
  const { currency } = useCurrency()
  const { data: fiat } = useFiat()

  function round(num: number) {
    return toFixed(num, currency === 'ETH' ? 4 : 2)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const promise = honoClient.balances.$post()
    const msg = 'Starting to refetch balances in the background'

    toast.promise(promise, {
      loading: msg,
      success: msg,
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
              ({round(balances.data.totalEthValue / fiat.getRate(currency))}{' '}
              {currency})
            </span>
          )}
        </CardTitle>
        <form onSubmit={handleSubmit}>
          <Button type="submit">Refresh</Button>
        </form>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {balances.data?.tokens.map((balance) => (
          <div key={balance.token?.id}>
            <p>{balance.token?.name}</p>
            <p className="text-muted-foreground text-sm">
              {round(balance.balance)} tokens
            </p>
            {fiat && currency && (
              <p className="text-muted-foreground text-sm">
                worth {round(balance.ethValue / fiat.getRate(currency))}{' '}
                {currency}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
