import { useState } from "react";
import "./userList.css";

function UserList({ loginUser, users, url, setIsDisplay, setUserSelected, setIsNameDisplay }) {

    const [isSelect, setIsSelected] = useState({});
    const [userList, setUserList] = useState();

    const handleSelectUsers = (index, user_id) => {
        setIsSelected((prevState) => ({
            ...prevState,
            [index]: !prevState[index], // Toggle the state for the specific user
        }));

        setUserList((prevState) => ({
            ...prevState,
            [index]: user_id
        }))

    }

    const handleAddFriends = () => {
        const selectedValue = Object.entries(isSelect).filter(([key, value]) => value === true);

        const result = selectedValue.map((item) => {
            const userSelected = Object.entries(userList).find((user) => user[0] == item[0]);
            return userSelected[1];
        })
        setUserSelected(result);
        result.length > 0 ? setIsDisplay(false) : setIsDisplay(true);

        result.length > 0 && setIsNameDisplay(true);
    }


    return (
        <>
            <div className="user-list-group">
                <h3 className="heading">Users</h3>
                <i className="fa-solid fa-xmark" onClick={() => setIsDisplay(false)}></i>
                {
                    users?.map((user, index) => (user?.id != loginUser?.id &&
                        <div key={index} className="user-card">
                            <div className="user-info">
                                <img src={`${url}/public/profile/${user.profile_img}`} alt="Users Avatar" className="user-avatar" />
                                <div className="user-name">{user?.username}</div>
                            </div>
                            <button className="add-button" onClick={() => handleSelectUsers(index, user?.id)}>{isSelect[index] ? (
                                <i className="fa-solid fa-check"></i>
                            ) : (
                                "Select"
                            )}</button>
                        </div>
                    ))
                }
                <button className="add-button add-friends" onClick={() => handleAddFriends()}>Add Friends</button>
            </div>

        </>
    )
}

export default UserList;
