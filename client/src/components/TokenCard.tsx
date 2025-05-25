import { Trash } from 'lucide-react'
import { toast } from 'sonner'
import { zfd } from 'zod-form-data'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  honoClient,
  useBalances,
  useChains,
  useEthValuesByAccount,
  useTokens,
} from '../hooks/useHono'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

const addTokenSchema = zfd.formData({
  addressOrName: zfd.text(),
  chainId: zfd.text().refine(Number),
})

export function TokenCard() {
  const tokens = useTokens()
  const { refetch: refetchBalances } = useBalances()
  const { refetch: refetchBalancesByAccount } = useEthValuesByAccount()

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>
          <span>Tokens</span>
        </CardTitle>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const promise = honoClient.setup.tokens.$post()

              toast.promise(promise, {
                loading: 'Adding default tokens...',
                success: () => {
                  tokens.refetch()
                  return 'Added default tokens'
                },
                error: 'Failed to add default tokens',
              })
            }}
          >
            Add Defaults
          </Button>
          <TokenDialog />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40 min-w-34">Chain</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.data?.map((token) => (
              <TableRow key={`${token.chain?.id}:${token.address}`}>
                <TableCell>{token.chain?.name}</TableCell>
                <TableCell>
                  {token.name} ({token.symbol})
                </TableCell>
                <TableCell>{token.address}</TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      const promise = honoClient.tokens.$delete({
                        json: {
                          address: token.address,
                          chainId: token.chain!.id,
                        },
                      })

                      toast.promise(promise, {
                        loading: 'Deleting token...',
                        success: () => {
                          tokens.refetch()
                          refetchBalances()
                          refetchBalancesByAccount()
                          return 'Token deleted'
                        },
                        error: 'Failed to delete token',
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

function TokenDialog() {
  const { data: chains } = useChains()
  const { refetch: refetchTokens } = useTokens()

  async function handleAddToken(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const safeParse = addTokenSchema.safeParse(formData)

    if (safeParse.error) {
      toast.error('Invalid form data')
      return
    }

    const json = safeParse.data
    const promise = honoClient.tokens.$post({ json })

    toast.promise(promise, {
      loading: 'Adding token...',
      success: () => {
        refetchTokens()
        return 'Token added'
      },
      error: 'Failed to add token',
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Token</DialogTitle>
        </DialogHeader>

        <form
          id="token"
          onSubmit={handleAddToken}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="chainId">Chain</Label>
            <Select name="chainId">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chain" />
              </SelectTrigger>
              <SelectContent>
                {chains?.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id.toString()}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addressOrName">Address or ENS name</Label>
            <Input
              name="addressOrName"
              placeholder="usdc.tkn.eth"
              autoComplete="off"
              data-1p-ignore
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="token">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
