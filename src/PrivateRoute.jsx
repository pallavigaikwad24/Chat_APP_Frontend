import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom';


function PrivateRoute({Component}) {
  // const {username} = useParams();
  const [isAuthenticate, setIsAuthenticate] = useState(true);

  useEffect(()=>{
    let login = localStorage.getItem('login');
    if(!login){
      setIsAuthenticate(false);
    }
  });
  return (
    <>
    {
      isAuthenticate ? <Component/> : <Navigate to={'/login'}/>
    }
    </>
  )
}

export default PrivateRoute;