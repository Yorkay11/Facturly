import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { facturlyApi } from '@/services/facturlyApi'

// Créer un store de test
const createTestStore = () => {
  return configureStore({
    reducer: {
      [facturlyApi.reducerPath]: facturlyApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(facturlyApi.middleware),
  })
}

// Wrapper personnalisé avec les providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const store = createTestStore()
  return <Provider store={store}>{children}</Provider>
}

// Fonction de render personnalisée
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Réexporter tout
export * from '@testing-library/react'
export { customRender as render }

