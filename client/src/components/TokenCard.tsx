import { Trash } from 'lucide-react'
import { toast } from 'sonner'
import { zfd } from 'zod-form-data'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { honoClient, useBalances, useChains, useTokens } from '../hooks/useHono'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

const schema = zfd.formData({
  addressOrName: zfd.text(),
  chainId: zfd.text().refine(Number),
})

export function TokenCard() {
  const tokens = useTokens()
  const { refetch: refetchBalances } = useBalances()
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
    const promise = honoClient.tokens.$post({ json })

    toast.promise(promise, {
      loading: 'Adding token...',
      success: () => {
        tokens.refetch()
        return 'Token added'
      },
      error: 'Failed to add token',
    })
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
          Add Default Tokens
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {tokens.data?.map((token) => (
          <div
            key={`${token.chain?.id}:${token.address}`}
            className="flex items-center justify-between"
          >
            <div>
              <p>{token.name}</p>
              <p className="text-muted-foreground text-sm">
                {token.chain?.name} - {token.address}
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                const promise = honoClient.tokens.$delete({
                  json: { address: token.address, chainId: token.chain!.id },
                })

                toast.promise(promise, {
                  loading: 'Deleting token...',
                  success: () => {
                    refetchBalances()
                    tokens.refetch()
                    return 'Token deleted'
                  },
                  error: 'Failed to delete token',
                })
              }}
            >
              <Trash />
            </Button>
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
            name="addressOrName"
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
