import { hc } from 'hono/client'

import { routes } from './app'

// Assign the client to a variable to calculate the type when compiling
export const honoClient = hc<typeof routes>('')
export type Client = typeof honoClient

export const hcWithType = (...args: Parameters<typeof hc>): typeof honoClient =>
  hc<typeof routes>(...args)
