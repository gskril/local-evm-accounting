import { VariantProps } from 'class-variance-authority'
import { Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import {
  honoClient,
  useAccounts,
  useBalances,
  useEthValuesByAccount,
} from '../hooks/useHono'
import { Button, buttonVariants } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

export function AccountCard() {
  const accounts = useAccounts()
  const { refetch: refetchBalances } = useBalances()
  const { refetch: refetchBalancesByAccount } = useEthValuesByAccount()

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>Accounts</CardTitle>
        <div className="flex gap-2">
          <AccountDialog prompt="Add" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.data?.map((account) => (
              <TableRow key={account.address}>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.description}</TableCell>
                <TableCell>{account.address}</TableCell>

                <TableCell className="flex justify-end gap-2">
                  <AccountDialog
                    address={account.address}
                    prompt="Edit"
                    size="icon"
                    variant="outline"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      const promise = honoClient.accounts[':id'].$delete({
                        param: { id: account.id.toString() },
                      })

                      toast.promise(promise, {
                        loading: 'Deleting account...',
                        success: () => {
                          accounts.refetch()
                          refetchBalances()
                          refetchBalancesByAccount()
                          return 'Account deleted'
                        },
                        error: 'Failed to delete account',
                      })
                    }}
                  >
                    <Trash />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

const addAccountSchema = zfd.formData({
  id: zfd.text(z.coerce.number().optional()),
  name: zfd.text(z.string().optional()),
  description: zfd.text(z.string().optional()),
  addressOrName: zfd.text(z.string().optional()),
})

function AccountDialog({
  address,
  prompt,
  ...buttonProps
}: {
  address?: string | null
  prompt: 'Add' | 'Edit'
} & VariantProps<typeof buttonVariants>) {
  const accounts = useAccounts()
  const { refetch: refetchOffchainAccounts } = useAccounts('offchain')
  const selectedAccount = accounts.data?.find(
    (account) => account.address === address
  )

  async function handleAddAccount(e: React.FormEvent<HTMLFormElement>) {
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
      loading: `${prompt}ing account...`,
      success: () => {
        accounts.refetch()
        refetchOffchainAccounts()
        return `${prompt}ed account`
      },
      error: {
        message: `Failed to ${prompt.toLowerCase()} account`,
      },
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button {...buttonProps}>
          {buttonProps.size === 'icon' ? <Pencil /> : prompt}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{prompt} Account</DialogTitle>
        </DialogHeader>

        <form
          id="account"
          onSubmit={handleAddAccount}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={selectedAccount?.id} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="gap-1">
              Name{' '}
              <span className="text-muted-foreground text-xs leading-none">
                (leave blank if using ENS below)
              </span>
            </Label>
            <Input
              name="name"
              autoComplete="off"
              data-1p-ignore
              defaultValue={selectedAccount?.name}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">
              Description{' '}
              <span className="text-muted-foreground text-xs leading-none">
                (optional)
              </span>
            </Label>
            <Input name="description" autoComplete="off" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addressOrName">Address or ENS name</Label>
            <Input
              name="addressOrName"
              defaultValue={selectedAccount?.address ?? ''}
              disabled={!!selectedAccount?.id}
              autoComplete="off"
              data-1p-ignore
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
