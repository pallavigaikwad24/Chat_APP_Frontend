import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { json } from 'react-router-dom';
import { io } from "socket.io-client";

function MessageArea({ loginUser, receiverUser, url, setCurrChatUser }) {
    const [filePopupVisible, setFilePopupVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const messageAreaRef = React.useRef(null);
    const [messageList, setMessageList] = useState([]);
    const [option, setOption] = useState(null);
    const [replayMsg, setReplayMsg] = useState(null);
    const [emojiView, setEmojiView] = useState(null);
    const [emoji, setEmoji] = useState([]);
    const [singleEmoji, setSingleEmoji] = useState(null);
    const socket = React.useRef();

    useEffect(() => {
        axios.get(`${url}/message/${receiverUser?.username}`)
            .then((response) => {
                console.log("Response of get chat", response);
                console.log("data:", response.data);

                setMessageList(response.data.allChats);
            })
            .catch((err) => console.log("Error:", err));
    }, [receiverUser, url]);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messageList]);

    useEffect(() => {
        axios.get(`${url}/all-reactions`).then((response) => {
            console.log("emoji response:", response.data);
            setEmoji(response.data);
        }).catch((err) => console.log(err));
    }, [url]);

    useEffect(() => {
        if (!socket.current) {
            socket.current = io(url, { withCredentials: true, transports: ["websocket"] });

            socket.current.on("connect", () => {

                axios.post(`${url}/save-socket-id`, { socketId: socket.current.id })
                    .then((response) => console.log("Response from post:", response))
                    .catch((err) => console.log("Error:", err));

                console.log("Connected to server:", socket.current.id);
            });

            socket.current.on("receive_message", (data) => {
                console.log("Receive msg 34::", data);
                setMessageList((list) => [...list, data]);
            });

            socket.current.on("connect_error", (err) => {
                console.error("Connection error:", err.message);
            });
        }
    }, [receiverUser]);


    const handleSendMessage = () => {
        const postData = {
            sender: loginUser?.username,
            receiver: receiverUser?.username,
            content: message,
            file_type: null, filename: null, file_url: null, file_size: null,
        }

        if (replayMsg) {
            const postData = {
                reply_to_message_id: replayMsg.id,
                receiver: receiverUser?.username,
                content: message,
                file_type: null, filename: null, file_url: null, file_size: null,
            }
            axios.post(`${url}/reply-chat`, postData)
                .then((response) => console.log("Replay response:", response))
                .catch((err) => console.log("Error:", err));

            const newMessage = {
                content: message, sender_id: loginUser?.id, contentType: "text",
                reply_to_message_id: replayMsg.id
            };
            socket.current.emit("send_message", newMessage);
            setMessage("");

            setReplayMsg(null);
        } else {
            axios.post(`${url}/add-chat`, postData)
                .then((response) => console.log("Response:", response))
                .catch((err) => console.log("Error:", err));

            const newMessage = {
                content: message, sender_id: loginUser?.id, contentType: "text",
            };
            socket.current.emit("send_message", newMessage);
            setMessage("");
        }
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
                receiver: receiverUser?.username,
                content: null,
                file_type: selectedFile.type, filename: selectedFile.name,
                file_url: selectedFile.name, file_size: selectedFile.size
            }

            const fileMsg = {
                content: selectedFile.name, sender_id: loginUser?.id, contentType: "file",
                file_type: selectedFile.type, filename: selectedFile.name, file_url: selectedFile.name, file_size: selectedFile.size
            }

            if (replayMsg) {
                postData['reply_to_message_id'] = replayMsg.id;

                axios.post(`${url}/reply-chat`, postData)
                    .then((response) => {
                        fileMsg['id'] = response.data.id;
                        socket.current.emit("file_message", fileMsg);
                    })
                    .catch((err) => console.log("Error:", err));
                setReplayMsg(null);
            } else {
                const postData = {
                    sender: loginUser?.username,
                    receiver: receiverUser?.username,
                    content: null,
                    file_type: selectedFile.type, filename: selectedFile.name, file_url: selectedFile.name, file_size: selectedFile.size
                }

                axios.post(`${url}/add-chat`, postData)
                    .then((response) => {
                        fileMsg['id'] = response.data.id;
                        socket.current.emit("file_message", fileMsg);
                    })
                    .catch((err) => console.log("Error:", err));
            }

            axios.post(`${url}/file-input-message/${loginUser?.id}`, formData)
                .then((response) => {
                    console.log("Response::", selectedFile.name);
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
                content: e.target.files[0].name, sender_id: loginUser?.id, contentType: "img",
                file_type: e.target.files[0].type, filename: e.target.files[0].name, file_url: e.target.files[0].name,
                file_size: e.target.files[0].size
            };

            const postData = {
                sender: loginUser?.username,
                receiver: receiverUser?.username,
                content: null,
                file_type: e.target.files[0].type, filename: imgMsg.content, file_url: imgMsg.content,
                file_size: e.target.files[0].size
            }
            if (replayMsg) {
                postData["reply_to_message_id"] = replayMsg.id;
                axios.post(`${url}/reply-chat`, postData)
                    .then((response) => console.log("Replay response:", response))
                    .catch((err) => console.log("Error:", err));

                imgMsg['reply_to_message_id'] = replayMsg.id;

                socket.current.emit("send_message", imgMsg);
                setMessage("");

                setReplayMsg(null);
            } else {
                axios.post(`${url}/add-chat`, postData)
                    .then((response) => {
                        imgMsg['id'] = response.data.id;
                        socket.current.emit("img_message", imgMsg);
                    })
                    .catch((err) => console.log("Error:", err));
            }

            axios.post(`${url}/file-input-message/${loginUser?.id}`, formData)
                .then((response) => {
                    console.log("Response from file 128::", response);
                }).catch((err) => console.log("Error::", err))
        }
    }

    const handleBack = () => {
        setCurrChatUser(undefined);
    }

    const handleOption = (index) => {
        setOption(index);
    }

    const handleMouseLeave = () => {
        setOption(null);
    }

    const handleReplay = (message) => {
        setReplayMsg(message);
    }

    const handleReaction = (index) => {
        setOption(null);
        setEmojiView(index);
    }

    const addReaction = (index, e, message) => {
        console.log("Emojies:", emoji);
        console.log("235:", index, e, message)
        setSingleEmoji(index);

        axios.post(`${url}/add-reaction`, { message_id: message.id, reaction: e.name }).then((response) => {
            console.log("emoji single response:", response.data);
            setSingleEmoji(response.data);
        }).catch((err) => console.log(err));
    }

    const invisible = () => {
        setOption(null);
    }

    return (
        <>
            <section className="section chat__section">
                <div className="brand">
                    <i className="fa-solid fa-arrow-left" onClick={handleBack}></i>
                    <img src={`${url}/public/profile/${receiverUser?.profile_img}`} alt="DP" className="dp" />
                    <h2 className="msg-chat-username">{receiverUser?.username}</h2>
                </div>

                <div className="message__area" id="messageArea" ref={messageAreaRef}>
                    {receiverUser?.username &&
                        messageList?.map((msg, index) => {
                            let result = null;
                            if (msg.reply_to_message_id) {
                                result = messageList.find((m) => m.id == msg.reply_to_message_id);
                            }

                            return <div key={index} className={`message ${msg?.sender_id === loginUser?.id ? "sent" : "received"}`}
                                onMouseEnter={() => handleOption(index)}
                                onMouseLeave={handleMouseLeave}>
                                {msg.reply_to_message_id && <div className={`replay_msg ${msg?.sender_id === loginUser?.id ? "send" : "receive"}`}>{result.content || result.filename} </div>}

                                <div className={`menu ${option != index ? "display" : ''}`}>
                                    <div className="menu-item" onClick={() => handleReplay(msg)}>
                                        <i className="fa-regular fa-comment"></i> Reply
                                    </div>
                                    <div className="menu-item" onClick={() => handleReaction(index)}>
                                        <i className="fa-regular fa-smile"></i> React
                                    </div>
                                </div>

                                <div className={`menu ${emojiView != index ? "display" : ''}`}>
                                    <div className="menu-item" onMouseEnter={invisible}>
                                        {
                                            // <p>{JSON.stringify(emoji)}</p>
                                            emoji && emoji?.map((e, index) => (
                                                <div key={index} className="emoji-style" onClick={() => addReaction(index, e, msg)}>
                                                    {String.fromCodePoint(`0x${e.code}`)}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                {
                                    msg?.file_type == null ? <p className='text-msg'>{msg?.content}</p> : msg?.file_type.startsWith("image", 0) == false ? <div className="received-file">
                                        <div className="file-name">{msg.filename}</div>
                                        <a href={`${url}/download-file/${msg.id}`} className="download-btn"><i className="fa-solid fa-download"></i></a>
                                    </div>
                                        : msg?.file_type.startsWith("image", 0) == true ? <div className='img-div'> <a href={`${url}/download-file/${msg.id}`}><i className="fa-solid fa-download img-download"></i></a>
                                            {
                                                msg?.sender_id === loginUser?.id ?
                                                    <a href={`${url}/public/uploads/fileSend/${loginUser?.id}/${msg?.filename}`} target='_blank'>
                                                        <img src={`${url}/public/uploads/fileSend/${loginUser?.id}/${msg?.filename}`} alt="img" /></a>
                                                    : <a href={`${url}/public/uploads/fileSend/${receiverUser?.id}/${msg?.filename}`} target='_blank'>
                                                        <img src={`${url}/public/uploads/fileSend/${receiverUser?.id}/${msg?.filename}`} alt="img" /></a>
                                            }
                                        </div> : ""}

                                {msg.reply_to_message_id && <div className={`replay_msg ${msg?.sender_id === loginUser?.id ? "send" : "receive"}`}>{result.content || result.filename} </div>}
                            </div>

                        })
                    }

                </div>
                {replayMsg && (
                    <div className="reply-preview">
                        <div>Replying to: {replayMsg.content || replayMsg.filename}</div>
                        <button className="close-reply" onClick={() => setReplayMsg(null)}>✖</button>
                    </div>
                )}
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
            </section >
        </>
    )
}

export default MessageArea
