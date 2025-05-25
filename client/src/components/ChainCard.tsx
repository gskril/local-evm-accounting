import { VariantProps } from 'class-variance-authority'
import { Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { zfd } from 'zod-form-data'

import {
  honoClient,
  useBalances,
  useChains,
  useEthValuesByAccount,
  useTokens,
} from '../hooks/useHono'
import { Button, buttonVariants } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const addChainSchema = zfd.formData({
  name: zfd.text(),
  rpcUrl: zfd.text().refine((value) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }),
})

export function ChainCard() {
  const chains = useChains()
  const { refetch: refetchTokens } = useTokens()
  const { refetch: refetchBalances } = useBalances()
  const { refetch: refetchBalancesByAccount } = useEthValuesByAccount()

  function handleDeleteChain(chainId: number) {
    const promise = honoClient.chains[':id'].$delete({
      param: { id: chainId.toString() },
    })

    toast.promise(promise, {
      loading: 'Deleting chain...',
      success: () => {
        chains.refetch()
        refetchTokens()
        refetchBalances()
        refetchBalancesByAccount()
        return 'Chain deleted'
      },
      error: 'Failed to delete chain',
    })
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>
          <span>Chains</span>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const promise = honoClient.setup.chains.$post()

              toast.promise(promise, {
                loading: 'Adding default chains...',
                success: () => {
                  chains.refetch()
                  return 'Added default chains'
                },
              })
            }}
          >
            Add Defaults
          </Button>

          <ChainDialog prompt="Add" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>RPC URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chains.data?.map((chain) => (
              <TableRow key={chain.id}>
                <TableCell>{chain.id}</TableCell>
                <TableCell>{chain.name}</TableCell>
                <TableCell>{chain.rpcUrl}</TableCell>

                <TableCell>
                  <div className="flex justify-end gap-2">
                    <ChainDialog
                      prompt="Edit"
                      chainId={chain.id}
                      variant="outline"
                      size="icon"
                    />

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteChain(chain.id)}
                    >
                      <Trash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {/* <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell> */}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ChainDialog({
  prompt,
  chainId,
  ...buttonProps
}: {
  prompt: 'Add' | 'Edit'
  chainId?: number
} & VariantProps<typeof buttonVariants>) {
  const chains = useChains()
  const selectedChain = chains.data?.find((chain) => chain.id === chainId)

  async function handleAddChain(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const safeParse = addChainSchema.safeParse(formData)

    if (safeParse.error) {
      toast.error('Invalid form data')
      return
    }

    const json = safeParse.data
    const promise = honoClient.chains.$post({ json })

    toast.promise(promise, {
      loading: 'Adding chain...',
      success: () => {
        chains.refetch()
        return 'Chain added'
      },
      error: {
        message: 'Failed to add chain',
        description: 'Make sure the RPC URL is working',
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
          <DialogTitle>{prompt} Chain</DialogTitle>
          <DialogDescription>
            Only chains that use ETH as the native gas token are supported.
            Chains that are supported by the{' '}
            <a
              href="https://portal.1inch.dev/documentation/contracts/spot-price-aggregator/introduction"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              1inch spot price aggregator
            </a>{' '}
            work best.
          </DialogDescription>
        </DialogHeader>

        <form
          id="chain"
          onSubmit={handleAddChain}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              name="name"
              placeholder="Ethereum"
              autoComplete="off"
              data-1p-ignore
              defaultValue={selectedChain?.name}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rpcUrl">RPC URL</Label>
            <Input
              name="rpcUrl"
              placeholder="https://eth.drpc.org"
              defaultValue={selectedChain?.rpcUrl}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="chain">
            {prompt} Chain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
