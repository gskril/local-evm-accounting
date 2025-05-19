import { toast } from 'sonner'
import { zfd } from 'zod-form-data'

import { honoClient, useChains } from '../hooks/useHono'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

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

  async function handleAddChain(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log('handling add chain')
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

    chains.refetch()
    toast.success('Chain added')
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>
          <span>Chains</span>
        </CardTitle>
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
          Add Default Chains
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {chains.data?.map((chain) => (
          <div key={chain.id}>
            <p>{chain.name}</p>
            <p className="text-muted-foreground text-sm">
              {chain.id} - {chain.rpcUrl}
            </p>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <form onSubmit={handleAddChain} className="flex w-full gap-2">
          <Input name="name" placeholder="Chain name" />
          <Input name="id" placeholder="Chain ID" />
          <Input name="rpcUrl" placeholder="RPC URL" />
          <Button type="submit">Add Chain</Button>
        </form>
      </CardFooter>
    </Card>
  )
}
