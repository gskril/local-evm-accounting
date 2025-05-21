import { Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { isAddress } from 'viem/utils'
import { zfd } from 'zod-form-data'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { honoClient, useAccounts } from '../hooks/useHono'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

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
          <div
            key={account.address}
            className="flex items-center justify-between"
          >
            <div>
              <p>{account.name}</p>
              <p className="text-muted-foreground text-sm">{account.address}</p>
            </div>

            <div className="flex gap-2">
              <AccountDialog address={account.address} />

              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  const promise = honoClient.accounts[':address'].$delete({
                    param: { address: account.address },
                  })

                  toast.promise(promise, {
                    loading: 'Deleting account...',
                    success: () => {
                      accounts.refetch()
                      return 'Account deleted'
                    },
                    error: 'Failed to delete account',
                  })
                }}
              >
                <Trash />
              </Button>
            </div>
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

const addAccountSchema = zfd.formData({
  name: zfd.text(),
  address: zfd.text().refine(isAddress),
})

function AccountDialog({ address }: { address: string }) {
  const accounts = useAccounts()
  const selectedAccount = accounts.data?.find(
    (account) => account.address === address
  )

  async function handleEditAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const safeParse = addAccountSchema.safeParse(formData)

    if (safeParse.error) {
      toast.error('Invalid form data')
      return
    }

    const json = safeParse.data
    const promise = honoClient.accounts.$post({ json })

    toast.promise(promise, {
      loading: 'Updating account...',
      success: () => {
        accounts.refetch()
        return 'Account updated'
      },
      error: 'Failed to update account',
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>

        <form
          id="account"
          onSubmit={handleEditAccount}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Account name</Label>
            <Input
              name="name"
              placeholder="My Account"
              autoComplete="off"
              data-1p-ignore
              defaultValue={selectedAccount?.name}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              name="address"
              placeholder="0x1234567890123456789012345678901234567890"
              defaultValue={selectedAccount?.address}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="account">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
