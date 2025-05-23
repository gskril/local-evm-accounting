import { RefreshBalancesButton } from '@/components/BalanceCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { useBalances, useEthValuesByAccount, useFiat } from '@/hooks/useHono'
import { formatCurrency } from '@/lib/utils'

export function Home() {
  const balances = useBalances()
  const { currency } = useCurrency()
  const { data: fiat } = useFiat()
  const ethValuesByAccount = useEthValuesByAccount()

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className="text-2xl font-semibold">EVM Portfolio</span>
        <RefreshBalancesButton />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2">
          {fiat && currency && (
            <h1 className="text-5xl font-semibold">
              {formatCurrency(
                (balances.data?.totalEthValue ?? 0) / fiat.getRate(currency),
                currency
              )}
            </h1>
          )}

          <span className="text-muted-foreground text-sm">Total value</span>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Chains</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {balances.data?.ethValueByChain.map((chain) => (
              <div
                key={chain.id}
                className="flex items-center justify-between gap-4"
              >
                <h2>{chain.name}</h2>
                {fiat && currency && (
                  <span>
                    {formatCurrency(
                      chain.totalEthValue / fiat.getRate(currency),
                      currency
                    )}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {ethValuesByAccount.data?.map((account) => (
              <div
                key={account.owner.address}
                className="flex items-center justify-between gap-4"
              >
                <span>{account.owner.name}</span>
                {fiat && currency && (
                  <span>
                    {formatCurrency(
                      account.ethValue / fiat.getRate(currency),
                      currency
                    )}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
