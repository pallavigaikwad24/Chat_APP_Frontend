import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { io } from "socket.io-client";

function GroupMessage({ url, setSelectGroup, currGroup, users }) {
    const [filePopupVisible, setFilePopupVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const messageAreaRef = React.useRef(null);
    const [messageList, setMessageList] = useState([]);
    const [loginUser, setLoginUser] = useState();
    const socket = React.useRef();

    useEffect(() => {
        console.log("Curr Group:", currGroup);
        const updatedMessages = currGroup?.Messages?.map((message) => ({
            ...message,
            sender_name: currGroup?.User?.username,
        }));
        console.log("Updated Messages:", updatedMessages);
        setMessageList(updatedMessages);

        axios.get(`${url}/get-login-user`).then((response) => {
            console.log("Response from login Users:", response.data);
            setLoginUser(response.data);
        }).catch((err) => console.log(err))
    }, [currGroup, currGroup?.Messages, url, currGroup?.Users?.username]);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messageList]);

    useEffect(() => {
        if (!socket.current) {
            socket.current = io(url, { withCredentials: true, transports: ["websocket"] });

            socket.current.on("connect", () => {

                axios.post(`${url}/save-socket-id`, { socketId: socket.current.id })
                    .then((response) => console.log("Response from post:", response))
                    .catch((err) => console.log("Error:", err));

                console.log("Connected to server:", socket.current.id);

                socket.current.emit('join_group', { groupId: currGroup?.id });
            });

            socket.current.on("receive_message", (data) => {
                console.log("Receive msg 34::", data);
                setMessageList((list) => [...(list || []), data]);
            });

            socket.current.on("connect_error", (err) => {
                console.error("Connection error:", err.message);
            });
        }
    }, [url, currGroup?.id]);


    const handleSendMessage = () => {
        console.log("Group ID:", typeof currGroup?.id);
        const postData = {
            group_id: currGroup?.id,
            content: message,
            file_type: null, filename: null, file_url: null, file_size: null
        }
        const newMessage = { content: message, sender_id: loginUser?.id, group_id: currGroup?.id, sender_name: loginUser?.username, contentType: "text" };

        axios.post(`${url}/add-group-chat`, postData)
            .then((response) => {
                console.log("72 add GC:", response);
                socket.current.emit("send_message", newMessage);
                setMessage("");
            })
            .catch((err) => console.log("Error:", err));

        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSendFile = () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append("fileInput", selectedFile);

            const postData = {
                group_id: currGroup?.id,
                content: null,
                file_type: selectedFile.type, filename: selectedFile.name, file_url: selectedFile.name, file_size: selectedFile.size
            }
            const fileMsg = {
                content: selectedFile.name, sender_id: loginUser?.id, group_id: currGroup?.id,
                sender_name: loginUser?.username, contentType: "file",
                file_type: selectedFile.type, filename: selectedFile.name,
                file_url: selectedFile.name, file_size: selectedFile.size
            }

            axios.post(`${url}/add-group-chat`, postData)
                .then((response) => {
                    fileMsg['id'] = response.data.id;
                    socket.current.emit("file_message", fileMsg);
                })
                .catch((err) => console.log("Error:", err));

            axios.post(`${url}/file-input-message/${currGroup?.id}`, formData)
                .then((response) => {
                    console.log("Response::", response);
                }).catch((err) => console.log("Error::", err));
            setFilePopupVisible(false);
        }

        setSelectedFile("");
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const formData = new FormData();
            formData.append("fileInput", e.target.files[0]);
            const imgMsg = {
                content: e.target.files[0].name, sender_id: loginUser?.id, group_id: currGroup?.id,
                sender_name: loginUser?.username, contentType: "img",
                file_type: e.target.files[0].type, filename: e.target.files[0].name,
                file_url: e.target.files[0].name, file_size: e.target.files[0].size
            };

            const postData = {
                group_id: currGroup?.id,
                content: null,
                file_type: e.target.files[0].type, filename: imgMsg.content, file_url: imgMsg.content,
                file_size: e.target.files[0].size
            }

            axios.post(`${url}/add-group-chat`, postData)
                .then((response) => { imgMsg['id'] = response.data.id; })
                .catch((err) => console.log("Error:", err));

            axios.post(`${url}/file-input-message/${currGroup?.id}`, formData)
                .then((response) => {
                    console.log("Response from file 128::", response);
                    socket.current.emit("img_message", imgMsg);
                }).catch((err) => console.log("Error::", err))
        }
    }

    const handleBack = () => {
        setSelectGroup(undefined);
    }

    return (
        <>
            <section className="section chat__section">
                <div className="brand">
                    <i className="fa-solid fa-arrow-left" onClick={handleBack}></i>
                    <img src={`${url}/public/profile/${currGroup?.profile_image}`} alt="DP" className="dp" />
                    <h2 className="msg-chat-username">{currGroup?.group_name}</h2>
                </div>

                <div className="message__area" id="messageArea" ref={messageAreaRef}>
                    {
                        messageList?.map((msg, index) => (
                            currGroup?.id == msg.group_id &&
                            <div key={index} className={`message ${msg?.sender_id === loginUser?.id ? "sent" : "received"}`}>
                                <div className='sender_name'>{users.find((user) => user.id == msg?.sender_id).username}</div>
                                {
                                    msg?.file_type == null ? <p className='text-msg'>{msg?.content}</p> : msg?.file_type.startsWith("image", 0) == false ? <div className="received-file">
                                        <div className="file-name">{msg.filename}</div>
                                        <a href={`${url}/download-file/${msg.id}`} className="download-btn"><i className="fa-solid fa-download"></i></a>
                                    </div>
                                        : msg?.file_type.startsWith("image", 0) ? <div className='img-div'> <a href={`${url}/download-file/${msg.id}`}><i className="fa-solid fa-download img-download"></i></a>
                                            {

                                                <a href={`${url}/public/uploads/fileSend/${currGroup?.id}/${msg?.filename}`} target='_blank'>
                                                    <img src={`${url}/public/uploads/fileSend/${currGroup?.id}/${msg?.filename}`} alt="img" /></a>
                                            }
                                        </div> : ""}
                            </div>
                        ))
                    }

                </div>
                <div className="input">
                    <textarea
                        id="textarea"
                        cols="30"
                        rows="1"
                        placeholder="Write a message..."
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                    <i className="fa-solid fa-image imgfile" onClick={() => document.querySelector("#imgfile").click()}></i>
                    <input type="file" name="imageFile" id="imgfile" hidden accept="image/*" onChange={handleImageChange} />
                    <i className="fa-solid fa-paperclip" style={{ cursor: "pointer" }} onClick={() => setFilePopupVisible(true)}></i>
                    <button className="btn btn-primary" id="send-btn" type="button" onClick={handleSendMessage}>Send</button>
                </div>

                {/* File Send Popup */}
                {filePopupVisible && (
                    <div id="filePopup" className="popup">
                        <div className="popup-content">
                            <span className="close" onClick={() => setFilePopupVisible(false)}>
                                &times;
                            </span>
                            <h3>📁 Send a File</h3>
                            <div className="file-input-area">
                                <label htmlFor="fileInput" className="custom-file-label">
                                    <i className="fas fa-upload"></i> Select File
                                </label>
                                <input type="file" id="fileInput" className="file-input" name="fileInput" onChange={handleFileChange} />
                            </div>
                            <div id="fileDetails" className="file-details">
                                {selectedFile ? selectedFile.name : "No file chosen"}
                            </div>
                            <button id="sendFileBtn" className="send-btn" onClick={handleSendFile}>Send</button>
                        </div>
                    </div>
                )}
            </section>
        </>
    )
}

export default GroupMessage
