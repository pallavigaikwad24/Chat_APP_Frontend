import axios from "axios";
import "./groupName.css";

function GroupName({ setGroupName, groupName, userSelected, url, setIsNameDisplay, setGroup }) {
    const handleSubmit = () => {

        const payload = {
            groupName,
            members: JSON.stringify(userSelected)
        }
        axios.defaults.withCredentials = true;

        axios.post(`${url}/create-group`, payload).then((response) => {
            console.log("Response from 14::", response.data);
            setGroup((prev) => [...prev, response.data]);
            setIsNameDisplay(false);
        }).catch((err) => console.log(err))
    }

    return (
        <>
            <div className="group-name-container">
                <h3 className="heading">Enter Group Name</h3>
                <input type="text" id="group-name" className="input-field" placeholder="Group Name" onChange={(e) => setGroupName(e.target.value)} />
                <button type="submit" className="submit-button" onClick={() => handleSubmit()}>Create Group</button>
            </div>

        </>
    )
}

export default GroupName;
