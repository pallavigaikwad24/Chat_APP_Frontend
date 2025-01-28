import { useState } from 'react';
import '../LoginPage/login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEyeSlash, FaEye } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

function Signup() {

  const navigate = useNavigate();
  const [info, setInfo] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState("password");
  const [showPassConfirm, setShowPassConfirm] = useState("password");

  function inputValue(e) {
    const { name, value } = e.target;
    setInfo({ ...info, [name]: value });
  }

  async function validateInfo() {
    try {

      let flag = true;
      if (info) {

        const url = import.meta.env.VITE_API_URL_LOGIN;

        const response = await axios.post(`${url}/register`, info);

        if (response.data.error) {
          console.log(response.data.error[0].msg);
          flag = false;
          toast.error(response.data.error[0].msg);
        }
      } else {
        flag = false
        toast.error("Fields are required");
      }

      return flag;
    } catch (error) {
      console.log(error);
      return error;
    }

  }

  async function funSubmit(e) {
    e.preventDefault();

    const isValid = await validateInfo();
    if (isValid) {
      console.log("Registration success");
      localStorage.setItem('login', info.username);
      navigate(`/login`);
    } else {
      console.log("Registration rejected");
    }

  }

  return (
    <>
      <div className="body">
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <h3 className='heading'>Sign Up</h3>
        <form className="login-page" onSubmit={(e) => funSubmit(e)}>
          <input type="text" name="username" id="username" value={info.username} placeholder='Enter your Username' onChange={(e) => inputValue(e)} />
          <input type="text" name="email" id="email" value={info.email} placeholder='Enter your Email ID' onChange={(e) => inputValue(e)} />

          <div className='input-div'><input type={showPass} name='password' id='password' value={info.password} placeholder='Enter Password' onChange={(e) => inputValue(e)} /> <span>{showPass !== "password" ? <FaEye onClick={() => setShowPass('password')} /> : <FaEyeSlash onClick={() => setShowPass('text')} />}</span></div>

          <div className='input-div'><input type={showPassConfirm} name='confirmPassword' id='confirmPassword' value={info.confirmPassword} placeholder='Confirm Password' onChange={(e) => inputValue(e)} /> <span>{showPassConfirm !== "password" ? <FaEye onClick={() => setShowPassConfirm('password')} /> : <FaEyeSlash onClick={() => setShowPassConfirm('text')} />}</span></div>

          <button type='submit' className='submit-btn'>Sign Up</button>

          <p>Already have an account?, <Link to={'/login'}>Login here</Link></p>
        </form>
      </div>
      {/* <p>Go to <Link to={'/'}>Home</Link></p> */}
    </>
  )
}

export default Signup;