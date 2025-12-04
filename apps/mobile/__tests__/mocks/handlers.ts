// @ts-nocheck
import { rest } from 'msw'
import { AppConfig } from '@/config/app.config'
import { authResponse } from './data'

// Handlers for authentication endpoints
export const handlers = [
  rest.post(`${AppConfig.api.baseURL}/auth/login`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(authResponse))
  }),

  rest.post(`${AppConfig.api.baseURL}/auth/refresh`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(authResponse))
  }),
]
