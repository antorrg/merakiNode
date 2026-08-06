import { RouterProvider } from 'react-router-dom'
import { router } from './routes.tsx'
import { NotificationListener } from './shared/components/NotificationListener'
import { ErrorBoundary } from './shared/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <NotificationListener />
      <RouterProvider router={router}/>
    </ErrorBoundary>
  )
}

export default App

