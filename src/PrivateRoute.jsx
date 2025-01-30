import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom';


function PrivateRoute({ Component }) {
  const [isAuthenticate, setIsAuthenticate] = useState(true);

  useEffect(() => {
    let login = localStorage.getItem('login');
    if (!login) {
      setIsAuthenticate(false);
    }
  }, [isAuthenticate]);
  return (
    <>
      {
        !isAuthenticate ? <Navigate to={'/login'} /> : <Component />
      }
    </>
  )
}

export default PrivateRoute;