import { toast } from 'sonner'

import { honoClient, useAccounts } from '../hooks/useHono'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

export function AccountCard() {
  const accounts = useAccounts()

  async function handleAddAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const address = formData.get('address') as string

    const res = await honoClient.accounts.$post({ json: { address } })
    if (!res.ok) {
      toast.error('Failed to add account')
      return
    }

    accounts.refetch()
    toast.success('Account added')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {accounts.data?.map((account) => (
          <div key={account.address}>
            <p>{account.name}</p>
            <p className="text-muted-foreground text-sm">{account.address}</p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleAddAccount} className="flex w-full gap-2">
          <Input
            name="address"
            placeholder="Enter an address or ENS name"
            autoComplete="off"
            data-1p-ignore
          />
          <Button type="submit">Add Account</Button>
        </form>
      </CardFooter>
    </Card>
  )
}
