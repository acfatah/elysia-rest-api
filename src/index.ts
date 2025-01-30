import { Elysia } from 'elysia'
import { helmet } from 'elysia-helmet'
import { Logestic } from 'logestic'
import { router } from './routes'

const PORT = process.env.PORT || 3000

const app = new Elysia()
  .use(Logestic.preset('common'))
  .use(helmet())
  .use(router)
  .listen(PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
