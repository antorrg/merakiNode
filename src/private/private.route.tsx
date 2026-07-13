import type { RouteObject } from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import Patient from "./features/patient/Patient";
import Users from "./features/user/Users"




export const privateRoutes:RouteObject[]=[
    {
        index:true,
        element: <WelcomePage/>
    },
    {
        path:'patients',
        element: <Patient/>
    },
    {
        path:'users',
        element: <Users/>
    }
  
]