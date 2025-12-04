// @ts-nocheck
import React from 'react'
import { fireEvent, waitFor } from '@testing-library/react-native'
import { renderWithProviders } from '@/__tests__/utils/renderWithProviders'
import { LoginForm } from '../components/LoginForm'

describe('LoginForm', () => {
  it('submits credentials and logs in', async () => {
    const { getByPlaceholderText, getByText, store } = renderWithProviders(<LoginForm />)

    const emailInput = getByPlaceholderText('Enter your email')
    const passwordInput = getByPlaceholderText('Enter your password')
    const submitButton = getByText('Sign In')

    fireEvent.changeText(emailInput, 'mock.user@example.com')
    fireEvent.changeText(passwordInput, '123456')
    fireEvent.press(submitButton)

    await waitFor(() => {
      const state = store.getState()
      expect(state.auth.isAuthenticated).toBeTruthy()
    })
  })
})