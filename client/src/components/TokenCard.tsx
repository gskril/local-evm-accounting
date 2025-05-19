import { toast } from 'sonner'
import { isAddress } from 'viem/utils'
import { zfd } from 'zod-form-data'

import { honoClient, useTokens } from '../hooks/useHono'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

const schema = zfd.formData({
  address: zfd.text().refine(isAddress),
  chain: zfd.numeric(),
  name: zfd.text(),
  symbol: zfd.text(),
  decimals: zfd.numeric(),
})

export function TokenCard() {
  const tokens = useTokens()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const safeParse = schema.safeParse(formData)

    if (!safeParse.success) {
      toast.error('Invalid form data')
      return
    }

    const json = safeParse.data

    try {
      await honoClient.tokens.$post({ json })
      tokens.refetch()
      toast.success('Token added')
    } catch {
      toast.error('Failed to add token')
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>
          <span>Tokens</span>
        </CardTitle>
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await honoClient.setup.tokens.$post()
              toast.success('Added default tokens')
              tokens.refetch()
            } catch {
              toast.error('Error adding tokens')
            }
          }}
        >
          Add Default Tokens
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {tokens.data?.map((token) => (
          <div key={`${token.chain}:${token.address}`}>
            <p>{token.name}</p>
            <p className="text-muted-foreground text-sm">
              {token.chain?.name} - {token.address}
            </p>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input name="address" placeholder="Enter an address or ENS name" />
          <Input name="chain" placeholder="Enter an address or ENS name" />
          <Input name="name" placeholder="Enter an address or ENS name" />
          <Input name="symbol" placeholder="Enter an address or ENS name" />
          <Input name="decimals" placeholder="Enter an address or ENS name" />
          <Button type="submit">Add Token</Button>
        </form>
      </CardFooter>
    </Card>
  )
}
