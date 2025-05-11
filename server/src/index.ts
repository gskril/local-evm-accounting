import { Hono } from 'hono'
import { hc } from 'hono/client'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(cors())

const routes = app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Export the client with types during compilation for better performance
const client = hc<typeof routes>('')
export const hcWithType = (...args: Parameters<typeof hc>): typeof client =>
  hc<typeof routes>(...args)

export default app
