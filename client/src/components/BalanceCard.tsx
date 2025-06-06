import { VariantProps } from 'class-variance-authority'
import { Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { zfd } from 'zod-form-data'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  honoClient,
  useAccounts,
  useOffchainBalances,
  useTokens,
} from '@/hooks/useHono'

import { Button, buttonVariants } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
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

// Allow users to edit the balance of offchain accounts
export function BalanceCard() {
  const offchainBalances = useOffchainBalances()

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <div className="space-y-1.5">
          <CardTitle>Offchain Balances</CardTitle>
          <CardDescription>
            Manage the balances of your manual accounts.
          </CardDescription>
        </div>
        <div className="flex gap-2">{<BalanceDialog prompt="Add" />}</div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offchainBalances.data?.map((balance) => (
              <TableRow key={`${balance.owner.id}:${balance.token}`}>
                <TableCell>{balance.owner.name}</TableCell>
                <TableCell>{balance.token.name}</TableCell>
                <TableCell>{balance.balance}</TableCell>

                <TableCell className="flex justify-end gap-2">
                  <BalanceDialog
                    prompt="Edit"
                    data={offchainBalances.data?.find(
                      (b) =>
                        b.owner.id === balance.owner.id &&
                        b.token.id === balance.token.id
                    )}
                    variant="outline"
                    size="icon"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const promise = honoClient.balances.offchain.$delete({
                        json: {
                          account: balance.owner.id,
                          token: balance.token.id,
                        },
                      })

                      toast.promise(promise, {
                        loading: 'Deleting...',
                        success: () => {
                          offchainBalances.refetch()
                          return 'Balance deleted'
                        },
                        error: 'Failed to delete balance',
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

const balanceFormSchema = zfd.formData({
  account: zfd.numeric(),
  token: zfd.numeric(),
  amount: zfd.numeric(),
})

function BalanceDialog({
  data,
  prompt,
  ...buttonProps
}: {
  data?: NonNullable<ReturnType<typeof useOffchainBalances>['data']>[number]
  prompt: 'Add' | 'Edit'
} & VariantProps<typeof buttonVariants>) {
  const offchainBalances = useOffchainBalances()
  const accounts = useAccounts('offchain')
  const tokens = useTokens()

  const defaultAccount = data?.owner.id?.toString()
  const defaultToken = data?.token.id?.toString()
  const defaultAmount = data?.balance?.toString()

  console.log({ defaultAccount, defaultToken, defaultAmount })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const safeParse = balanceFormSchema.safeParse(formData)

    if (safeParse.error) {
      console.log(safeParse.error)
      toast.error('Invalid form data')
      return
    }

    const json = safeParse.data
    const promise = honoClient.balances.offchain.$post({ json })
    toast.promise(promise, {
      loading: 'Saving...',
      success: () => {
        tokens.refetch()
        offchainBalances.refetch()
        return 'Balance saved'
      },
      error: 'Failed to save balance',
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          {...buttonProps}
          disabled={!accounts.data || accounts.data.length === 0}
        >
          {buttonProps.size === 'icon' ? <Pencil /> : prompt}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{prompt} Balance</DialogTitle>
        </DialogHeader>

        {(() => {
          if (!accounts.data || !tokens.data) {
            return <div>Loading...</div>
          }

          return (
            <>
              <form
                id="balance"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name" className="gap-1">
                    Account
                  </Label>
                  <Select name="account" defaultValue={defaultAccount}>
                    <SelectTrigger
                      className="w-full"
                      disabled={!!defaultAccount}
                    >
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.data?.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.id.toString()}
                        >
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description">Token</Label>
                  <Select name="token" defaultValue={defaultToken}>
                    <SelectTrigger className="w-full" disabled={!!defaultToken}>
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.data?.map((token) => (
                        <SelectItem key={token.id} value={token.id.toString()}>
                          {token.symbol} on {token.chain!.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    name="amount"
                    type="number"
                    step="any"
                    required
                    defaultValue={defaultAmount}
                  />
                </div>
              </form>

              <DialogFooter>
                <Button type="submit" form="balance">
                  Save
                </Button>
              </DialogFooter>
            </>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}
