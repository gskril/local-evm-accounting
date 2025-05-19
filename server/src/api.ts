import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { addAccount, getAccount, getAccounts } from './handlers/accounts'
import { fetchBalances, getBalances } from './handlers/balances'
import { addChain, getChains } from './handlers/chains'
import { setupDefaultChains, setupDefaultTokens } from './handlers/setup'
import { addToken, getTokens } from './handlers/tokens'

export const api = new Hono()
api.use(cors())

// API Routes
export const routes = api
  .get('/accounts', (c) => getAccounts(c))
  .get('/accounts/:address', (c) => getAccount(c))
  .get('/chains', (c) => getChains(c))
  .get('/balances', (c) => getBalances(c))
  .get('/tokens', (c) => getTokens(c))
  .post('/accounts', (c) => addAccount(c))
  .post('/balances', (c) => fetchBalances(c))
  .post('/chains', (c) => addChain(c))
  .post('/tokens', (c) => addToken(c))
  .post('/setup/chains', (c) => setupDefaultChains(c))
  .post('/setup/tokens', (c) => setupDefaultTokens(c))
