/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEyeSlash, FaEye } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const [info, setInfo] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState("password");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("login")) {
      navigate(`/messages`);
    }
  }, []);


  const errorMsgFun = (type) => {
    if (error) {
      const fieldMsg = error.find((err) => err.path == type);
      return fieldMsg ? fieldMsg.msg : ''
    } else {
      return null;
    }
  }

  function inputValue(e) {
    const { name, value } = e.target;
    setInfo({ ...info, [name]: value });
  }

  async function validateInfo() {
    try {
      const url = import.meta.env.VITE_API_URL_LOGIN;
      axios.defaults.withCredentials = true;

      const response = await axios.post(`${url}/login`, info);
      console.log("Response from login::", response);

      return true;
    } catch (error) {
      setError(error.response.data);
      return;
    }
  }

  async function funSubmit(e) {
    e.preventDefault();

    const isValid = await validateInfo();
    if (isValid) {
      localStorage.setItem("login", info.username);
      navigate(`/messages`);
    }
  }

  return (
    <>
      <div className="body">
        <h3 className="heading">Login</h3>
        <form className="login-page" onSubmit={funSubmit}>
          <input
            type="username"
            name="username"
            id="username"
            value={info.username}
            placeholder="Enter Username or Email"
            onChange={(e) => inputValue(e)}
          />
          <p className='errMsg'>{errorMsgFun('username')}</p>

          <div className="input-div">
            <input
              type={showPass}
              name="password"
              id="password"
              value={info.password}
              placeholder="Enter Password"
              onChange={(e) => inputValue(e)}
            />
            <span>
              {showPass !== "password" ? (
                <FaEye onClick={() => setShowPass("password")} />
              ) : (
                <FaEyeSlash onClick={() => setShowPass("text")} />
              )}
            </span>
          </div>
          <p className='errMsg'>{errorMsgFun('password')}</p>
          <button type="submit" className="submit-btn">
            Login
          </button>
          <p className="msg">
            Don't have account?, <Link to={"/signup"}>Sign Up here</Link>
          </p>

          <p className="msg">
            Don't remember password?,{" "}
            <Link to={"/forgetpassword"}>Forget Password?*</Link>
          </p>

        </form>
      </div>
    </>
  );
}

export default Login;
