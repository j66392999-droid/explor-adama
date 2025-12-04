import React from 'react'
import renderWithProviders from './renderWithProviders'
import { user, tokens } from '../mocks/data'
import type { RootState } from '@/store'

export const defaultPreloadedState: Partial<RootState> = {
  auth: {
    isAuthenticated: true,
    isLoading: false,
    error: null,
    user,
    tokens, 
  } as any,
  app: {
    isLoading: false,
    error: null,
    theme: 'auto',
    language: 'en',
    isDarkMode: false,
  } as any,
}

export { renderWithProviders }
