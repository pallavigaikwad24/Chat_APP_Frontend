import { useEffect, useState } from "react"
import First from "../../First-section/First"
import Messages from "./Messages"
import axios from "axios"
import { useNavigate } from "react-router-dom"


function MessageMain() {
    const url = import.meta.env.VITE_API_URL_LOGIN;
    const navigate = useNavigate();
    const [users, setUsers] = useState();
    const [selectedUser, setSelectedUser] = useState();
    const [currChatUser, setCurrChatUser] = useState();

    axios.defaults.withCredentials = true;

    const handleSelectUser = (user) => {
        setSelectedUser(user);

        axios.get(`${url}/message/${user.username}`).then((response) => {
            console.log("Response Axios::", response.data);
            setCurrChatUser(response.data);
        }).catch((err) => {
            console.log(err);
            if (err.request.status == 401) {
                navigate("/login")
            }
        })
    }

    useEffect(() => {
        axios.get(`${url}/message/allUser`).then((response) => {
            setUsers(response.data);
        }).catch((err) => {
            console.log(err);
            navigate("/login");
        });
    }, [url, navigate])

    return (
        <>
            <div className='container'>
                <First />
                <div className="middle-section">
                    <div className="msg-container">
                        <Messages users={users} url={url} onSelectUser={handleSelectUser}
                            loginUser={currChatUser?.loginUser} receiverUser={currChatUser?.receiverUser} setCurrChatUser={setCurrChatUser} selectedUser={selectedUser} />
                    </div>
                </div>

            </div>
        </>
    )
}

export default MessageMain;
