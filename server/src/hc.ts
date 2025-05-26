import { hc } from 'hono/client'

import { routes } from './api'

// Assign the client to a variable to calculate the type when compiling
export const honoClient = hc<typeof routes>('')
export type Client = typeof honoClient
