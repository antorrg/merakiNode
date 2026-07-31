import type { RouteObject } from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import Patient from "./features/patient/Patients";
import Users from "./features/user/Users"
import PatientWorkspace from "./features/workspace/PatientWorkspace";
import GeneralCalendar from "./features/calendar/GeneralCalendar";




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
        path:'patient-workspace',
        element: <PatientWorkspace/>
    },
    {
        path:'users',
        element: <Users/>
    },
    {
        path:'calendar',
        element: <GeneralCalendar/>
    }
  
]