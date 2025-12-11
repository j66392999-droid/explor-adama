// @ts-nocheck
import React from 'react'
import { waitFor } from '@testing-library/react-native'
import { renderWithProviders } from '@/__tests__/utils/renderWithProviders'
import { useAuth } from '../hooks/useAuth'
import { act } from 'react-test-renderer'

function TestComponent({ onReady }: { onReady: (value: any) => void }) {
  const auth = useAuth()
  React.useEffect(() => {
    onReady(auth)
  }, [auth, onReady])
  return null
}

describe('useAuth', () => {
  it('performs login and updates store', async () => {
    let authRef: any
    const onReady = (value: any) => (authRef = value)
    const { store } = renderWithProviders(<TestComponent onReady={onReady} />)

    // call login
    await act(async () => {
      await authRef.login({ email: 'mock.user@gmail.com', password: '123456' })
    })

    await waitFor(() => {
      const state = store.getState()
      expect(state.auth.isAuthenticated).toBeTruthy()
      expect(state.auth.user.email).toBe('mock.user@gmail.com')
    })
  })
})
