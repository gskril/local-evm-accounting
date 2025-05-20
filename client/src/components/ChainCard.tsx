import { VariantProps } from 'class-variance-authority'
import { Pencil, Trash } from 'lucide-react'
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

import { honoClient, useBalances, useChains, useTokens } from '../hooks/useHono'
import { Button, buttonVariants } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

const addChainSchema = zfd.formData({
  name: zfd.text(),
  id: zfd.numeric(),
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
              try {
                await honoClient.setup.chains.$post()
                toast.success('Added default chains')
                chains.refetch()
              } catch {
                toast.error('Error adding tokens')
              }
            }}
          >
            Add Defaults
          </Button>

          <ChainDialog prompt="Add" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {chains.data?.map((chain) => (
          <div key={chain.id} className="flex items-center justify-between">
            <div>
              <p>{chain.name}</p>
              <p className="text-muted-foreground text-sm">
                {chain.id} - {chain.rpcUrl}
              </p>
            </div>

            <div className="flex gap-2">
              <ChainDialog
                prompt="Edit"
                chainId={chain.id}
                variant="outline"
                size="icon"
              />

              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  const promise = honoClient.chains[':id'].$delete({
                    param: { id: chain.id.toString() },
                  })

                  toast.promise(promise, {
                    loading: 'Deleting chain...',
                    success: () => {
                      chains.refetch()
                      refetchTokens()
                      refetchBalances()
                      return 'Chain deleted'
                    },
                    error: 'Failed to delete chain',
                  })
                }}
              >
                <Trash />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      {/* <CardFooter>
        <form onSubmit={handleAddChain} className="flex w-full gap-2">
          <Input name="name" placeholder="Chain name" />
          <Input name="id" placeholder="Chain ID" />
          <Input name="rpcUrl" placeholder="RPC URL" />
          <Button type="submit">Add Chain</Button>
        </form>
      </CardFooter> */}
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

    const res = await honoClient.chains.$post({ json })
    if (!res.ok) {
      toast.error('Failed to add chain')
      return
    }

    toast.success('Chain added')
    chains.refetch()
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
        </DialogHeader>

        <form
          id="chain"
          onSubmit={handleAddChain}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Chain name</Label>
            <Input
              name="name"
              placeholder="Ethereum"
              autoComplete="off"
              data-1p-ignore
              defaultValue={selectedChain?.name}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="id">Chain ID</Label>
            <Input name="id" placeholder="1" defaultValue={selectedChain?.id} />
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
