import { useState, useEffect } from 'react'
import '../LoginPage/login.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaEyeSlash,FaEye } from "react-icons/fa";
import { toast } from 'react-toastify';

function PasswordField() {

    const navigate = useNavigate();

    const {username} = useParams();
    const [data, setData] = useState();
    const [info, setInfo] = useState({password:'', confirmPass:''});
    const [showPass, setShowPass] = useState("password"); 
    const [showPassConfirm, setShowPassConfirm] = useState("password"); 

    function inputValue(e){
        let {name, value} = e.target;
        setInfo({...info, [name]:value});
    }

    useEffect(()=>{
        axios.get('http://localhost:3001/users')
        .then(res=> setData(res.data)).catch(err => console.warn("Error while fetching data", err));
    },[]);

    const isValidPassword = (password) => {
        const validation = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return validation.test(password);
    };

    function validation(){

        let flag = true;

        if (!info.password) {
            flag = false;
            toast.error("Password is required");
        } else if (!isValidPassword(info.password)) {
            flag = false;
            toast.error("password at least 8 characters, one capital, one digit and one small character");
        }else{
            if (!info.confirmPass) {
                flag = false;
              toast.error("Confirm password is required");
            } else if (info.password !== info.confirmPass) {
                flag=false;
              toast.error("Password should match");
            }
        }

        if(flag){
            updatePassword();
            return true;
        }else{
            return false;
        }
    }

    const updatePassword = async()=>{
        const validEmail = data.find(obj=> obj.email === username);

        axios.put(`http://localhost:3001/users/${validEmail.id}`, {
            id: validEmail.id,
            email: validEmail.email,
            password: info.password
        }).then((res)=>console.log(res.data))
        .catch(err => console.warn("Error while updatin gdata", err))
        
    }

    function submitPassword(e){
        e.preventDefault();
        const isValid = validation();
        if(isValid){
            navigate(`/login/${username}/product`);
        }
    }

  return (
    <>
    <div className="body">
     <h3 className="heading">Set Password</h3>
        <form className="login-page" onSubmit={(e)=>submitPassword(e)}>
        <div className='input-div'><input type={showPass} name='password' id='password' value={info.password} placeholder='Enter Password' onChange={(e)=>inputValue(e)}/> <span>{showPass!=="password" ? <FaEye onClick={()=>setShowPass('password')}/> : <FaEyeSlash onClick={()=> setShowPass('text')}/>}</span></div>
          <div className='input-div'><input type={showPassConfirm} name='confirmPass' id='confirmPass' value={info.confirmPass} placeholder='Confirm Password' onChange={(e)=>inputValue(e)}/> <span>{showPassConfirm!=="password" ? <FaEye onClick={()=>setShowPassConfirm('password')}/> : <FaEyeSlash onClick={()=> setShowPassConfirm('text')}/>}</span></div>

            <button type='submit' className='submit-btn'>Submit</button>
        </form>
    </div>
    </>
  )
}

export default PasswordField;