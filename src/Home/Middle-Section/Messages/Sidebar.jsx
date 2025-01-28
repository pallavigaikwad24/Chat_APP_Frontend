import { useEffect, useState } from 'react';
import './sidebar.css';
import UserList from './UserList';
import GroupName from './GroupName';
import axios from 'axios';

function Sidebar({ users, url, onSelectUser, handleGroupSelect }) {
    const [isSelect, setIsSelect] = useState("chats");
    const [isDisplay, setIsDisplay] = useState(false);
    const [userSelected, setUserSelected] = useState([]);
    const [groupName, setGroupName] = useState();
    const [isNameDisplay, setIsNameDisplay] = useState(false);
    const [loginUser, setLoginUser] = useState();

    useEffect(() => {
        axios.get(`${url}/get-login-user`).then((response) => {
            console.log("Response from login Users:", response.data);
            setLoginUser(response.data);
        }).catch((err) => console.log(err))
    }, [url]);

    const [group, setGroup] = useState();

    useEffect(() => {
        axios.defaults.withCredentials = true;
        axios.get(`${url}/get-groups`).then((response) => {
            console.log("Response from group 18:", response);
            setGroup(response.data);
        }).catch((err) => {
            console.log(err)
        });
    }, [url]);

    return (
        <>
            <aside className="user-sidebar">
                <div className='chat-heading'>
                    <h2 className="sidebar-header" onClick={() => setIsSelect("chats")} style={{ backgroundColor: isSelect == "chats" ? "#edc6ae" : "" }}>Chats</h2>
                    <h2 className="sidebar-header" onClick={() => setIsSelect("group")} style={{ backgroundColor: isSelect == "group" ? "#edc6ae" : "" }}>Group Chat</h2>
                </div>
                <ul className="user-list">
                    {
                        isSelect == "chats" ? users?.map((user) => (
                            <li key={user.id} onClick={() => onSelectUser(user)} className='chat-user'>
                                <img src={`${url}/public/profile/${user.profile_img}`} alt={user.username} className="user-dp" />
                                <div className='user-name'>{user.username}</div>
                            </li>
                        )) :
                            <div className='group-chat'>
                                <button className='create-group' onClick={() => setIsDisplay(true)}>Create group</button>
                                {
                                    group &&
                                    group?.map((item) => (
                                        (item?.user_ids && JSON.parse(item?.user_ids).includes(loginUser?.id.toString()) || item?.admin_id == loginUser?.id) ?
                                            <li key={item?.id} onClick={() => handleGroupSelect(item?.group_name)} className='chat-user'>
                                                <img src={`${url}/public/profile/${item?.profile_image}`} alt={item?.group_name} className="user-dp" />
                                                <div className='user-name'>{item?.group_name}</div>
                                            </li> : ""
                                    ))
                                }

                            </div>
                    }
                </ul>
            </aside>
            {
                isDisplay && <UserList loginUser={loginUser} users={users} url={url} setIsDisplay={setIsDisplay} setUserSelected={setUserSelected} setIsNameDisplay={setIsNameDisplay} />
            }
            {
                !isDisplay && isNameDisplay ? <GroupName setGroupName={setGroupName} groupName={groupName} userSelected={userSelected} url={url} setIsNameDisplay={setIsNameDisplay} setGroup={setGroup} /> : ""
            }
        </>
    )
}

export default Sidebar
