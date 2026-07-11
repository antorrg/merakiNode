import { createHashRouter } from 'react-router-dom'
import { privateRoutes } from './private/private.route'
import NotAuthorized from './shared/components/NotAuthorized'
import NotFound from './shared/components/NotFound'
import WelcomePage from './pages/WelcomePage'
import ProtectedPrivateRouter from './shared/components/ProtectPrivateRouter'
import Sidebar from './shared/components/Sidebar'


export const router = createHashRouter([
       {
    path: '/',
    element: <WelcomePage/>
   },
   {
    path:'/dashboard',
    element:( 
        <ProtectedPrivateRouter>
            <Sidebar/>
        </ProtectedPrivateRouter>
    ),
    children: privateRoutes
   },
       {
        path: '/not-authorized',
        element: <NotAuthorized/>
    },
   {
    path: '*',
    element: <NotFound/>
   }
])