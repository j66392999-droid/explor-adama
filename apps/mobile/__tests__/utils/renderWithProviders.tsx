import React, { ReactNode } from 'react'
import { render, RenderAPI } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { store as appStore } from '@/store'
import { ThemeProvider } from '@/shared/hooks/ui/useTheme'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppDispatch, RootState } from '@/store'
import appReducer from '@/store/slices/app/app.slice'
import authReducer from '@/store/slices/auth/auth.slice'
import userReducer from '@/store/slices/user/user.slice'
import apiReducer from '@/store/slices/api/api.slice'

interface RenderOptions {
  preloadedState?: Partial<RootState>
}

export function createStore(preloadedState?: Partial<RootState>) {
  const rootReducer = combineReducers({
    app: appReducer,
    auth: authReducer,
    user: userReducer,
    api: apiReducer,
  })

  return configureStore({
    reducer: rootReducer,
    preloadedState,
  })
}

export function renderWithProviders(ui: React.ReactElement, options: RenderOptions = {}): RenderAPI & { store: any } {
  const store = options.preloadedState ? createStore(options.preloadedState as any) : appStore

  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  )

  const renderResult = render(ui, { wrapper: Wrapper })
  return { ...renderResult, store }
}

export default renderWithProviders
