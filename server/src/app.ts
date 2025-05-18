import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { HonoAdapter } from '@bull-board/hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { addAccount, getAccount, getAccounts } from './handlers/accounts'
import { fetchBalances } from './handlers/balances'
import { addChain } from './handlers/chains'
import { addToken } from './handlers/tokens'
import { ethQueue } from './queues/workers/eth'

export const app = new Hono()
app.use(cors())

// API Routes
export const routes = app
  .get('/accounts', (c) => getAccounts(c))
  .get('/accounts/:address', (c) => getAccount(c))
  .post('/accounts', (c) => addAccount(c))
  .post('/balances', (c) => fetchBalances(c))
  .post('/chains', (c) => addChain(c))
  .post('/tokens', (c) => addToken(c))

// BullMQ Dashboard
const serverAdapter = new HonoAdapter(serveStatic)
const basePath = '/dashboard'

createBullBoard({
  queues: [new BullMQAdapter(ethQueue)],
  serverAdapter,
})

serverAdapter.setBasePath(basePath)
// @ts-ignore
app.route(basePath, serverAdapter.registerPlugin())
