import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { addAccount, getAccount, getAccounts } from './handlers/accounts'

export const app = new Hono()

app.use(cors())

export const routes = app
  .get('/accounts', (c) => getAccounts(c))
  .get('/accounts/:address', (c) => getAccount(c))
  .post('/accounts', (c) => addAccount(c))
