
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import Login from './LoginPage/Login.jsx';
import Signup from './SignUp/Signup.jsx';
import ForgetPassword from './ForgetPasswprd/ForgetPassword.jsx';
import PasswordField from './ForgetPasswprd/PasswordField.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import MessageMain from './Home/Middle-Section/Messages/MessageMain.jsx';
import NotFound from './NotFound.jsx';
function RoutingWay() {

    const router = createBrowserRouter([
        {
            path: '/',
            element: <Navigate to="/login" replace />
        },
        {
            path: '/login',
            element: <Login />
        },
        {
            path: '/signup',
            element: <Signup />
        },
        {
            path: '/messages',
            element: <PrivateRoute Component={MessageMain} />
        },
        {
            path: '/forgetpassword',
            element: <ForgetPassword />
        },
        {
            path: '/forgetpassword/:username?',
            element: <PasswordField />
        },
        {
            path: '*',
            element: <NotFound />
        }

    ])

    return (
        <>
            <RouterProvider router={router} />
        </>
    )
}

export default RoutingWay;