import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { HonoAdapter } from '@bull-board/hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { addAccount, getAccount, getAccounts } from './handlers/accounts'
import { fetchBalances } from './handlers/balances'
import { addChain, getChains } from './handlers/chains'
import { setupDefaultChainsAndTokens } from './handlers/setup'
import { addToken } from './handlers/tokens'
import { erc20Queue } from './queues/workers/erc20'
import { ethQueue } from './queues/workers/eth'

export const app = new Hono()
app.use(cors())

// API Routes
export const routes = app
  .get('/accounts', (c) => getAccounts(c))
  .get('/accounts/:address', (c) => getAccount(c))
  .get('/chains', (c) => getChains(c))
  .post('/accounts', (c) => addAccount(c))
  .post('/balances', (c) => fetchBalances(c))
  .post('/chains', (c) => addChain(c))
  .post('/tokens', (c) => addToken(c))
  .post('/setup', (c) => setupDefaultChainsAndTokens(c))

// BullMQ Dashboard
const serverAdapter = new HonoAdapter(serveStatic)
const basePath = '/dashboard'

createBullBoard({
  queues: [new BullMQAdapter(ethQueue), new BullMQAdapter(erc20Queue)],
  serverAdapter,
})

serverAdapter.setBasePath(basePath)
// @ts-ignore
app.route(basePath, serverAdapter.registerPlugin())
