import { Elysia } from 'elysia'
import { helloRoute } from './hello'
import { statusRoute } from './status'
import { usersRoute } from './users'

export const router = new Elysia()

router.use(statusRoute)
router.use(helloRoute)
router.use(usersRoute)
