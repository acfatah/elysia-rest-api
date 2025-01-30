import type { Session, SessionValidationResult, User } from './session-storage'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { Elysia, t } from 'elysia'
import { sessionStorage, userStorage } from './session-storage'

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)

  return token
}

export async function createSession(token: string, userId: number): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  }

  return session
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  if (!token)
    throw new Error('Unauthorized')

  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session = sessionStorage.find(sessionId)
  const user = session && userStorage.find(session?.userId)

  if (!session || !user) {
    throw new Error('Invalid credentials')
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    sessionStorage.remove(sessionId)

    throw new Error('Session expired')
  }

  if (Date.now() >= session.expiresAt.getTime() - ONE_WEEK) {
    session.expiresAt = new Date(Date.now() + ONE_WEEK)

    sessionStorage.update(session)
  }

  return { session, user: user as User }
}

export async function invalidateSession(sessionId: string): Promise<void> {
  sessionStorage.remove(sessionId)
}

export async function authenticateUser(email: string, password: string) {
  const user = userStorage.findByEmail(email)

  if (user && user.password === password) {
    const token = generateSessionToken()
    const session = await createSession(token, user.id)

    sessionStorage.add(session)

    return token
  }

  return null
}

export const sessionAuthService = new Elysia({ name: 'Service.SessionAuth' })
  .state({
    sessions: [] as Session[],
  })
  .macro(({ onBeforeHandle }) => ({
    requireSessionAuth(value: boolean) {
      onBeforeHandle(async ({ error, cookie }) => {
        if (!value)
          return

        const token = cookie?.session.value || ''

        if (!token) {
          return error(401)
        }

        try {
          await validateSessionToken(token)
        }
        catch (err) {
          if (err instanceof Error) {
            return error(401, err.message)
          }
          else {
            console.error(err)

            return error(401, 'An unexpected error occurred')
          }
        }
      })
    },
  }))

sessionAuthService.post('/login', async ({ body, cookie, error }) => {
  const { email, password } = body
  const token = await authenticateUser(email, password)

  if (token) {
    cookie.session.value = token

    return { token }
  }
  else {
    return error(401, 'Invalid credentials')
  }
}, {
  body: t.Object({
    email: t.String(),
    password: t.String(),
  }),
})

sessionAuthService.post('/logout', ({ cookie }) => {
  const token = cookie?.session.value || ''

  if (token) {
    invalidateSession(token)
    cookie.session.remove()
  }
})
