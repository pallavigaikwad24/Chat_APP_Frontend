import React from 'react'
import './homeLogin.css';
import { Link } from 'react-router-dom';

function Home() {
    
  return (
    <>
    <div className='body'>
        <nav>
            <button id='login'><Link to={'/login'}>Login</Link></button>
            <button id='signup'><Link to={'/signup'}>Sign Up</Link></button>
        </nav>

        <main>
            <h1>Welcome</h1>
        </main>
        </div>
    </>
  )
}

export default Home