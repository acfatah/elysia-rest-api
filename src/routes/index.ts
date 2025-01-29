import { Elysia } from 'elysia'
import { helloRoute } from './hello'
import { statusRoute } from './status'

export const router = new Elysia()

router.use(statusRoute)
router.use(helloRoute)
