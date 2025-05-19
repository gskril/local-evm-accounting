import { toast } from 'sonner'

import { honoClient, useBalances } from '../hooks/useHono'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'

export function BalanceCard() {
  const balances = useBalances()

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
        <CardTitle>Aggregated Balances</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {balances.data?.map((balance) => (
          <div key={`${balance.chain}:${balance.token}:${balance.owner}`}>
            <p>{balance.token?.name}</p>
            <p className="text-muted-foreground text-sm">{balance.balance}</p>
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
