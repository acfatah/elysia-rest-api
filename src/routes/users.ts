import { Elysia } from 'elysia'
import { sessionAuthService } from '~/services/session-auth'
import { userStorage } from '~/services/session-storage'

export const usersRoute = new Elysia().use(sessionAuthService)

usersRoute.get('/users', () => userStorage.all(), {
  requireSessionAuth: true,
})
