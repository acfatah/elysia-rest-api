import { Elysia } from 'elysia'
import { helloRoute } from './hello'

export const router = new Elysia()

router.use(helloRoute)
