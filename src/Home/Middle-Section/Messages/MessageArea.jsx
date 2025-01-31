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
    const [fileMsgState, setFileMsgState] = useState(null);
    const [reactions, setReactions] = useState({});

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
            console.log("Reactions 41:", response.data);
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
                if (data.reaction) {
                    setReactions((prev) => ({
                        ...prev,
                        [data.message_id]: { code: data.reaction, indx: data.index }
                    }));
                } else {

                    setMessageList((list) => [...list, data]);
                }
            });

            socket.current.on("connect_error", (err) => {
                console.error("Connection error:", err.message);
            });
        }
    }, [receiverUser, url]);


    const handleSendMessage = () => {
        const postData = {
            sender: loginUser?.username,
            receiver: receiverUser?.username,
            content: message,
            file_type: null, filename: null, file_url: null, file_size: null,
        }

        const newMessage = {
            content: message, sender_id: loginUser?.id, contentType: "text", createdAt: "now",
            reaction: null
        };

        if (replayMsg) {
            postData['reply_to_message_id'] = replayMsg.id;
            newMessage['reply_to_message_id'] = replayMsg.id;

            axios.post(`${url}/reply-chat`, postData)
                .then((response) => {
                    console.log("Replay response:", response);
                    newMessage['id'] = response.data.id;
                    socket.current.emit("send_message", newMessage);
                })
                .catch((err) => console.log("Error:", err));

            setMessage("");

            setReplayMsg(null);
        } else {
            axios.post(`${url}/add-chat`, postData)
                .then((response) => {
                    console.log("Response 98:", response.data);
                    newMessage['id'] = response.data.id;
                    socket.current.emit("send_message", newMessage);
                })
                .catch((err) => console.log("Error:", err));

            console.log("Send Message:", newMessage);
            setMessage("");
        }
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile([...e.target.files]);
    };

    const handleFileMsgChange = (e) => {
        setFileMsgState(e.target.value);
    };

    const handleSendFile = () => {
        if (selectedFile) {
            const formData = new FormData();
            selectedFile.forEach((file) => {
                formData.append("fileInput", file);  // 'files' is the field name
            });

            const filename = selectedFile.map((select) => select.name);
            const file_type = selectedFile.map((select) => select.type);
            const file_url = selectedFile.map((select) => select.name);
            const file_size = selectedFile.map((select) => select.size);

            const postData = {
                receiver: receiverUser?.username,
                content: fileMsgState,
                file_type: file_type, filename: filename, file_url: file_url,
                file_size: file_size
            }

            const fileMsg = {
                content: fileMsgState, sender_id: loginUser?.id, contentType: "file",
                file_type: file_type, filename: filename, file_url: file_url,
                file_size: file_size, createdAt: "now", reaction: null
            }

            if (replayMsg) {
                postData['reply_to_message_id'] = replayMsg.id;
                fileMsg['reply_to_message_id'] = replayMsg.id;

                axios.post(`${url}/reply-chat`, postData)
                    .then((response) => {
                        fileMsg['id'] = response.data.id;
                        formData.append("newFile_id", response.data.id);
                        axios.post(`${url}/file-input-message/${loginUser?.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                            .then((response) => {
                                console.log("Response::", selectedFile.name);
                                console.log("Response::", response);
                                socket.current.emit("file_message", fileMsg);
                            }).catch((err) => console.log("Error::", err));
                        socket.current.emit("file_message", fileMsg);
                    })
                    .catch((err) => console.log("Error:", err));
                setReplayMsg(null);
            } else {
                axios.post(`${url}/add-chat`, postData)
                    .then((response) => {
                        fileMsg['id'] = response.data.id;
                        formData.append("newFile_id", response.data.id);
                        axios.post(`${url}/file-input-message/${loginUser?.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                            .then((response) => {
                                console.log("Response::", selectedFile.name);
                                console.log("Response::", response);
                                socket.current.emit("file_message", fileMsg);
                            }).catch((err) => console.log("Error::", err));
                    })
                    .catch((err) => console.log("Error:", err));
            }


            setFilePopupVisible(false);
        }

        setSelectedFile("");
        setFileMsgState("");
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const selectedFile = [...e.target.files]
            const formData = new FormData();
            // formData.append("fileInput", selectedFile);
            selectedFile.forEach((file) => {
                formData.append("fileInput", file);  // 'files' is the field name
            });

            const filename = selectedFile.map((select) => select.name);
            const file_type = selectedFile.map((select) => select.type);
            const file_url = selectedFile.map((select) => select.name);
            const file_size = selectedFile.map((select) => select.size);

            const imgMsg = {
                content: e.target.files[0].name, sender_id: loginUser?.id, contentType: "img",
                file_type: file_type, filename: filename, file_url: file_url,
                file_size: file_size, createdAt: "now", reaction: null
            };

            const postData = {
                sender: loginUser?.username,
                receiver: receiverUser?.username,
                content: null,
                file_type: file_type, filename: filename, file_url: file_url,
                file_size: file_size
            }
            if (replayMsg) {
                postData["reply_to_message_id"] = replayMsg.id;
                imgMsg['reply_to_message_id'] = replayMsg.id;

                axios.post(`${url}/reply-chat`, postData)
                    .then((response) => {
                        console.log("Replay response:", response);
                        formData.append("newFile_id", response.data.id);
                        imgMsg['id'] = response.data.id;
                        axios.post(`${url}/file-input-message/${loginUser?.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                            .then((response) => {
                                console.log("Response from file 128::", response);
                                socket.current.emit("img_message", imgMsg);
                            }).catch((err) => console.log("Error::", err))

                    })
                    .catch((err) => console.log("Error:", err));

                setMessage("");

                setReplayMsg(null);
            } else {
                axios.post(`${url}/add-chat`, postData,)
                    .then((response) => {
                        imgMsg['id'] = response.data.id;
                        formData.append("newFile_id", response.data.id);
                        axios.post(`${url}/file-input-message/${loginUser?.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                            .then((response) => {
                                console.log("Response from file 128::", response);
                                socket.current.emit("img_message", imgMsg);
                            }).catch((err) => console.log("Error::", err))
                    })
                    .catch((err) => console.log("Error:", err));
            }


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

    const addReaction = (index, em, message) => {
        setReactions((prev) => ({
            ...prev,
            [message.id]: { code: em.code, indx: index }
        }))
        setEmojiView(null);

        const newReaction = {
            message_id: message.id,
            sender_id: loginUser?.id,
            reaction: em.code,
        };

        socket.current.emit("react_to_message", newReaction);

        axios.post(`${url}/add-reaction`, { message_id: message.id, reaction: JSON.stringify({ name: em.name, code: em.code }) }).then((response) => {
            console.log("emoji single response:", response.data);
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
                            if (msg?.reply_to_message_id) {
                                result = messageList.find((m) => m.id == msg.reply_to_message_id);
                            }

                            return <div key={index} className={`message ${msg?.sender_id === loginUser?.id ? "sent" : "received"}`}
                                onMouseEnter={() => handleOption(index)}
                                onMouseLeave={handleMouseLeave}>

                                {msg.reply_to_message_id && <div className={`replay_msg ${msg?.sender_id === loginUser?.id ? "send" : "receive"}`}>{result?.content || result?.filename} </div>}

                                <div className={`menu ${option != index ? "display" : ''} ${msg?.sender_id === loginUser?.id ? "senderReply" : "receiverReply"}`}>
                                    <div className="menu-item" onClick={() => handleReplay(msg)}>
                                        <i className="fa-regular fa-comment"></i> Reply
                                    </div>
                                    <div className="menu-item" onClick={() => handleReaction(index)}>
                                        <i className="fa-regular fa-smile"></i> React
                                    </div>
                                </div>

                                <div className={`menu ${emojiView != index ? "display" : ''} ${msg?.sender_id === loginUser?.id ? "senderReply" : "receiverReply"}`}>
                                    <div className="menu-item" onMouseEnter={invisible}>

                                        {
                                            emoji && emoji?.map((em, idx) => (
                                                <div key={idx} className="emoji-style" onClick={() => addReaction(index, em, msg)}>
                                                    {String.fromCodePoint(`0x${em.code}`)}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                {
                                    msg?.file_type == null && msg?.content ? <p className='text-msg'>{msg?.content}</p> : msg?.file_type?.every(file => file.startsWith("image")) == false ?
                                        <div>
                                            {
                                                msg?.filename.map((file, indx) => (
                                                    <div key={indx} className="received-file">
                                                        <div className="file-name">{file}</div>
                                                        <a href={`${url}/download-file/${msg.id}/${file}`} className="download-btn"><i className="fa-solid fa-download"></i></a>
                                                    </div>
                                                ))
                                            }
                                            <div className={`file-file-style ${msg?.sender_id === loginUser?.id ? "sendFileMsg" : "receiverFileMsg"}`}>{msg?.content}</div>
                                        </div>
                                        : msg?.file_type?.every(file => file.startsWith("image")) == true ?
                                            msg?.filename.map((img, inndx) => (
                                                <div key={inndx} className='img-div'>
                                                    <a href={`${url}/download-file/${msg.id}`}><i className="fa-solid fa-download img-download"></i>
                                                    </a>
                                                    {
                                                        msg?.sender_id === loginUser?.id ?
                                                            <a href={`${url}/public/uploads/fileSend/${loginUser?.id}/${msg.id}/${img}`} target='_blank'>
                                                                <img src={`${url}/public/uploads/fileSend/${loginUser?.id}/${msg.id}/${img}`} alt="img" /></a>
                                                            : <a href={`${url}/public/uploads/fileSend/${receiverUser?.id}/${msg.id}/${img}`} target='_blank'>
                                                                <img src={`${url}/public/uploads/fileSend/${receiverUser?.id}/${msg.id}/${img}`} alt="img" /></a>
                                                    }
                                                </div>
                                            ))

                                            : ""}
                                <div className="date-style">
                                    {
                                        msg?.createdAt == "now" ? new Intl.DateTimeFormat("en-IN", {
                                            timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit"
                                        }).format(Date.now()) :
                                            new Intl.DateTimeFormat("en-IN", {
                                                timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit"
                                            }).format(new Date(msg?.createdAt))
                                    }
                                </div>

                                {
                                    msg.id && reactions[msg.id] ? (
                                        <div className={`emoji-style-single`}>{String.fromCodePoint(`0x${reactions[msg.id].code || msg.reaction}`)}</div>
                                    ) : msg.MessageReaction ? (
                                        <div className={`emoji-style-single`}>{String.fromCodePoint(`0x${JSON.parse(msg.MessageReaction?.reaction)?.code}`)}</div>
                                    ) : ''
                                }
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
                    <input type="file" name="imageFile" id="imgfile" hidden accept="image/*" onChange={handleImageChange} multiple />
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
                                <input type="file" id="fileInput" className="file-input" name="fileInput" onChange={handleFileChange} multiple />
                                <input type="text" id="fileMsgInput" className="file-msg-input" name="fileMsgInput" onChange={(e) => handleFileMsgChange(e)} placeholder='write message..' />
                            </div>
                            <div id="fileDetails" className="file-details">
                                {selectedFile ? `${selectedFile?.length} Files` : "No file chosen"}
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
