// Test setup for mobile app
// @ts-nocheck
// This file sets up MSW server and other test utilities
import 'react-native-gesture-handler/jestSetup'
import { server } from './mocks/server'

// Start MSW before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Provide a global mock console error to make failing tests clearer
const originalError = console.error
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    originalError(...args)
  })
})

export {}
