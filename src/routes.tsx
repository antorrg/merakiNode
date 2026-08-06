import { createHashRouter } from 'react-router-dom'
import { privateRoutes } from './private/private.route'
import NotAuthorized from './shared/components/NotAuthorized'
import NotFound from './shared/components/NotFound'
import WelcomePage from './pages/WelcomePage'
import ProtectedPrivateRouter from './shared/components/ProtectPrivateRouter'
import Sidebar from './shared/components/Sidebar'
import RouteErrorBoundary from './shared/components/RouteErrorBoundary'


export const router = createHashRouter([
  {
    path: '/',
    element: <WelcomePage/>,
    errorElement: <RouteErrorBoundary />
  },
  {
    path:'/dashboard',
    element:( 
        <ProtectedPrivateRouter>
            <Sidebar/>
        </ProtectedPrivateRouter>
    ),
    errorElement: <RouteErrorBoundary />,
    children: privateRoutes
  },
  {
    path: '/not-authorized',
    element: <NotAuthorized/>,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: '*',
    element: <NotFound/>,
    errorElement: <RouteErrorBoundary />
  }
])