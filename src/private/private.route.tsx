import type { RouteObject } from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import Patient from "./features/patient/Patient";



export const privateRoutes:RouteObject[]=[
    {
        index:true,
        element: <WelcomePage/>
    },
    {
        path:'patients',
        element: <Patient/>
    }
]