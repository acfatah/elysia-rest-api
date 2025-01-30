/**
 * Simple session storage service implemented using a JSON file and memory.
 *
 * This service is only for demonstration purposes and should not be used in a
 * production environment. In a real application, you should use a secure and
 * robust storage solution such as a database or a secure token storage service.
 */
import { Elysia } from 'elysia'
import usersData from '../../data/users.json'

export interface User {
  id: number
  email: string
  password: string
}

export interface Session {
  id: string
  userId: number
  expiresAt: Date
}

export type SessionValidationResult =
  | { session: Session, user: User }
  | { session: null, user: null }

export interface UserStorage {
  find: (userId: number) => User | null
}

export const users: User[] = usersData
const elysia = new Elysia().state<{ sessions: Session[] }>({ sessions: [] })

export const userStorage = {
  all: () => users,
  find: (userId: number) => users.find((u: User) => u.id === userId) || null,
  findByEmail: (email: string) => users.find((u: User) => u.email === email) || null,
}

export const sessionStorage = {
  all: () => elysia.store.sessions,
  find: (sessionId: string) => elysia.store.sessions.find((s: Session) => s.id === sessionId) || null,
  add: (session: Session) => elysia.store.sessions.push(session),

  update: (session: Session) => {
    const index = elysia.store.sessions.findIndex((s: Session) => s.id === session.id)

    if (index !== -1) {
      elysia.store.sessions[index] = session
    }
  },

  remove: (sessionId: string) => {
    const index = elysia.store.sessions.findIndex((s: Session) => s.id === sessionId)

    if (index !== -1) {
      elysia.store.sessions.splice(index, 1)
    }
  },
}
