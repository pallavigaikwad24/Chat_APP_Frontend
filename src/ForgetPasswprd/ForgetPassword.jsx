import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../LoginPage/login.css';
import { toast } from 'react-toastify';



function ForgetPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [data, setData] = useState();

    useEffect(()=>{
        axios.get('http://localhost:3001/users')
        .then(res=> setData(res.data)).catch(err => console.warn("Error while fetching data", err))
    },[]);

    function inputEmail(e){
        setEmail(e.target.value);
    }
    
    function validation(){
        const isEmail = data.find(obj => obj.email === email);
        console.log(isEmail);

        let flag = true;

        if(!email){
           flag = false;
           toast.error("Email is required");
        }

        else if(!isEmail){
            flag = false;
            toast.error("Email does not exist");
        }
        return flag;
    }

    function submitFun(e){
        e.preventDefault();
        const isValid = validation();

        if(isValid){
            navigate(`/forgetpassword/${email}`);
        }
    }
  return (
    <>
    <div className="body">
     <h3 className="heading">Email Verification</h3>
        <form className="login-page" onSubmit={(e)=>submitFun(e)}>
            <input type="email" name="email" id="email-input" placeholder='Enter your Email ID' value={email} onChange={(e)=> inputEmail(e)}/>
           
            <button type='submit' className='submit-btn'>Confirm</button>

            <p>Remember password?, <Link to={'/login'}>Login here</Link></p>
        </form>
    </div>
    </>
  )
}

export default ForgetPassword;