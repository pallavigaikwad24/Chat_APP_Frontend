import { useEffect, useState } from 'react';
import './home.css';
import axios from 'axios';
import Middle from '../../React-App/reactDynamisch/src/Project-SocialMedia/Home/Middle-Section/Middle.jsx';
import First from '../../React-App/reactDynamisch/src/Project-SocialMedia/Home/First-section/First.jsx';

function Home() {

  const [post, setPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startLoading, setStartLoading] = useState(true);

  useEffect(() => {

    setTimeout(() => {
      setStartLoading(false);
    }, 1500);

    setTimeout(() => {
      setLoading(false);
    }, 3000);

    axios.get('http://localhost:3002/posts')
      .then((res) => setPost(res.data))
      .catch((err) => console.log("Something went wrong", err))

  }, [])

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

        {/* Second Section */}
        <Middle loading={loading} post={post} />

      </div>
    </>
  )
}

export default Home