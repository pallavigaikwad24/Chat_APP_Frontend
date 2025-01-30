
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../First-section/home.css';

function First() {

  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL_LOGIN;


  function logout() {

    axios.get(`${url}/logout`).then(() => {
      localStorage.removeItem('login');
      localStorage.removeItem('currLogin');
      navigate('/login');
    }).catch((err) => {
      console.log(err);
    })

  }

  return (
    <>
      <div id="side-section">
        <ul id='list'>
          <li className='list-item' id='logo'><i className="fa-brands fa-square-pied-piper"></i>&nbsp; Circlify</li>
          <Link to={`/messages`}><li className='list-item'><i className="fa-solid fa-message"></i>&nbsp; Messages</li></Link>
          <li className='list-item'><button onClick={logout} id='logout'>Logout</button></li>
        </ul>
      </div>
    </>
  )
}

export default First