import { toast } from 'sonner'

import { useCurrency } from '@/hooks/useCurrency'
import { toFixed } from '@/lib/utils'

import { honoClient, useBalances, useFiat } from '../hooks/useHono'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'

export function BalanceCard() {
  const balances = useBalances()
  const { currency } = useCurrency()
  const { data: fiat } = useFiat()

  function round(num: number) {
    return toFixed(num, currency === 'ETH' ? 4 : 2)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const res = await honoClient.balances.$post()
    if (!res.ok) {
      toast.error('Failed to refetch balances')
      return
    }

    balances.refetch()
    toast.success('Starting to refetch balances in the background')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Aggregated Balances{' '}
          {balances.data?.totalEthValue && fiat && currency && (
            <span className="text-muted-foreground text-sm">
              ({round(balances.data.totalEthValue / fiat.getRate(currency))}{' '}
              {currency})
            </span>
          )}
        </CardTitle>
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
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Button type="submit">Refetch Balances</Button>
        </form>
      </CardFooter>
    </Card>
  )
}
