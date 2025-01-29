import { Elysia } from 'elysia'

export const helloRoute = new Elysia()

helloRoute.get('/hello', () => 'Hello Elysia')
