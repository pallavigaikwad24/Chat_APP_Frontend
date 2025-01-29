import "./message.css";
import Sidebar from "./Sidebar";
import MessageArea from "./MessageArea";
import GroupMessage from "./GroupMessage";
import { useState } from "react";
import axios from "axios";
const url = import.meta.env.VITE_API_URL_LOGIN;

const Messages = ({ loginUser, receiverUser, users, onSelectUser, setCurrChatUser }) => {
    const [selectGroup, setSelectGroup] = useState(false);

    const [currGroup, setCurrGroup] = useState();

    const handleGroupSelect = (group_id) => {
        console.log("15:", group_id);
        setSelectGroup(true);
        axios.get(`${url}/group-chat/${group_id}`).then((response) => {
            console.log("Response 27::", response.data);
            setCurrGroup(response.data);
        }).catch((err) => console.log(err))
    }
    return (
        <main className="body">
            {
                receiverUser?.username ? <MessageArea url={url} loginUser={loginUser} receiverUser={receiverUser} setCurrChatUser={setCurrChatUser} /> :
                    selectGroup ? <GroupMessage url={url} receiverUser={receiverUser} setSelectGroup={setSelectGroup} currGroup={currGroup} users={users} /> :
                        <Sidebar users={users} url={url} onSelectUser={onSelectUser} handleGroupSelect={handleGroupSelect} />

            }
        </main >
    );
};

export default Messages;