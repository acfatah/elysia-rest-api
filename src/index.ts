import { Elysia } from 'elysia'
import { router } from './routes'

const PORT = process.env.PORT || 3000

const app = new Elysia()
  .use(router)
  .listen(PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
