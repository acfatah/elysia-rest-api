import { Elysia } from 'elysia'

interface HealthStatus {
  status: 'ok' | 'unhealthy'
  uptime: number
  timestamp: string
  error?: string
}

export const statusRoute = new Elysia()

statusRoute.get('/status', ({ set }) => {
  const healthCheck: HealthStatus = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }

  try {
    // Add any additional checks (e.g., database connection)
    return healthCheck
  }
  catch (error: unknown) {
    healthCheck.status = 'unhealthy'

    if (error instanceof Error)
      healthCheck.error = error.message

    set.status = 503

    return healthCheck
  }
})
