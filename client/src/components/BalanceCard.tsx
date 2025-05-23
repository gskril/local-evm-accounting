import { RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useQueues } from '@/hooks/useQueues'

import { useCurrency } from '../hooks/useCurrency'
import { honoClient, useBalances, useFiat } from '../hooks/useHono'
import { formatCurrency, toFixed } from '../lib/utils'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

export function BalanceCard() {
  const balances = useBalances()
  const { currency } = useCurrency()
  const { data: fiat } = useFiat()

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>Multichain Portfolio </CardTitle>
        <RefreshBalancesButton />
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground w-1/6">
                Chain
              </TableHead>
              <TableHead className="w-1/2">Token</TableHead>
              <TableHead className="w-1/6">Amount</TableHead>
              <TableHead className="w-1/6 text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.data?.tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell className="text-muted-foreground text-xs">
                  {token.chain.name}
                </TableCell>
                <TableCell title={token.symbol}>{token.name} </TableCell>
                <TableCell>{toFixed(token.balance, 4)}</TableCell>
                <TableCell className="text-right">
                  {!!token.ethValue &&
                    fiat &&
                    currency &&
                    formatCurrency(
                      token.ethValue / fiat.getRate(currency),
                      currency
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">
                {fiat &&
                  currency &&
                  formatCurrency(
                    (balances.data?.totalEthValue ?? 0) /
                      fiat.getRate(currency),
                    currency
                  )}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}

export function RefreshBalancesButton() {
  const queues = useQueues()
  const isLoading = !!queues.data?.inProgress

  async function handleRefresh() {
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
    <Button onClick={handleRefresh} isLoading={isLoading}>
      {!isLoading && <RefreshCcwIcon className="h-4 w-4" />}
      Refresh
    </Button>
  )
}
