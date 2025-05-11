import { Hono } from 'hono'
import { hc } from 'hono/client'
import { cors } from 'hono/cors'

import { addAccount, getAccount, getAccounts } from './handlers/accounts'

const app = new Hono()

app.use(cors())

const routes = app
  .get('/accounts', (c) => getAccounts(c))
  .get('/accounts/:address', (c) => getAccount(c))
  .post('/accounts', (c) => addAccount(c))

// Export the client with types during compilation for better performance
const client = hc<typeof routes>('')
export const hcWithType = (...args: Parameters<typeof hc>): typeof client =>
  hc<typeof routes>(...args)

export default app
