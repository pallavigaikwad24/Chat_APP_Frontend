import { useEffect, useState } from 'react';
import './home.css';
import axios from 'axios';
import First from './First-section/First.jsx';
import { useNavigate } from 'react-router-dom';

function Home() {

  axios.defaults.withCredentials = true;

  const [post, setPost] = useState([]);
  const [startLoading, setStartLoading] = useState(true);
  const url = import.meta.env.VITE_API_URL_LOGIN;
  const navigate = useNavigate();

  useEffect(() => {

    setTimeout(() => {
      setStartLoading(false);
    }, 1500);

    const isLogin = localStorage.getItem("login");

    if (isLogin) {
      axios.get(`${url}/home`)
        .then((res) => {
          setPost(res.data.postList2);
        })
        .catch((err) => { console.log("Something went wrong", err); navigate("/login") })
    }

  }, [url, navigate])

  return (
    <>
      <div className='container'>

        {/* Start Loading */}
        {
          startLoading ?
            <div id="body">
              <i className="fa-brands fa-square-pied-piper" id='start-loader'></i>
              <p id='title'>Circlify</p>
            </div> : ""
        }

        {/* First Section */}
        <First />
      </div>
    </>
  )
}

export default Home