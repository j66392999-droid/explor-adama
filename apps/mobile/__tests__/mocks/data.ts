// Basic mock data for tests
export const user = {
  id: 'user-1',
  firstName: 'Mock',
  lastName: 'User',
  email: 'mock.user@gmail.com',
}

export const tokens = {
  accessToken: 'mocked-access-token',
  refreshToken: 'mocked-refresh-token',
}

export const authResponse = {
  success: true,
  data: {
    user,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 60 * 60 * 24,
    },
  },
}
