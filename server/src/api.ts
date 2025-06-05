import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { addAccount, deleteAccount, getAccounts } from './handlers/accounts'
import {
  fetchBalances,
  getBalances,
  getEthValueByAccount,
  getNetworthTimeSeries,
} from './handlers/balances'
import { addChain, deleteChain, getChains } from './handlers/chains'
import { getFiat } from './handlers/fiat'
import { setupDefaultChains, setupDefaultTokens } from './handlers/setup'
import { addToken, deleteToken, getTokens } from './handlers/tokens'

export const api = new Hono()
api.use(cors())

// API Routes
export const routes = api
  .get('/accounts', (c) => getAccounts(c))
  .get('/chains', (c) => getChains(c))
  .get('/balances', (c) => getBalances(c))
  .get('/balances/accounts', (c) => getEthValueByAccount(c))
  .get('/balances/networth', (c) => getNetworthTimeSeries(c))
  .get('/tokens', (c) => getTokens(c))
  .get('/fiat', (c) => getFiat(c))
  .post('/accounts', (c) => addAccount(c))
  .post('/balances', (c) => fetchBalances(c))
  .post('/chains', (c) => addChain(c))
  .post('/tokens', (c) => addToken(c))
  .post('/setup/chains', (c) => setupDefaultChains(c))
  .post('/setup/tokens', (c) => setupDefaultTokens(c))
  .delete('/chains/:id', (c) => deleteChain(c))
  .delete('/accounts/:id', (c) => deleteAccount(c))
  .delete('/tokens', (c) => deleteToken(c))
