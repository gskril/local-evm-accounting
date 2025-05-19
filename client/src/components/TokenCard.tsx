import { toast } from 'sonner'
import { isAddress } from 'viem/utils'
import { zfd } from 'zod-form-data'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { honoClient, useChains, useTokens } from '../hooks/useHono'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

const schema = zfd.formData({
  address: zfd.text().refine(isAddress),
  chainId: zfd.text().refine(Number),
})

export function TokenCard() {
  const tokens = useTokens()
  const { data: chains } = useChains()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const safeParse = schema.safeParse(formData)

    if (!safeParse.success) {
      toast.error('Invalid form data')
      return
    }

    const json = safeParse.data

    const res = await honoClient.tokens.$post({ json })
    if (!res.ok) {
      toast.error('Failed to add token')
      return
    }

    tokens.refetch()
    toast.success('Token added')
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
            const res = await honoClient.setup.tokens.$post()
            if (!res.ok) {
              toast.error('Error adding tokens')
              return
            }

            toast.success('Added default tokens')
            tokens.refetch()
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
          <Select name="chainId">
            <SelectTrigger className="w-[180px]">
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

          <Input
            name="address"
            placeholder="Token address"
            autoComplete="off"
            data-1p-ignore
          />
          <Button type="submit" disabled={!chains}>
            Add Token
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
