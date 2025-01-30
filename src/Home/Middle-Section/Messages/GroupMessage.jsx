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
    const [option, setOption] = useState(null);
    const [replayMsg, setReplayMsg] = useState(null);
    const [emojiView, setEmojiView] = useState(null);
    const [emoji, setEmoji] = useState([]);
    const [singleEmoji, setSingleEmoji] = useState(null);
    const [emojiMsg, setEmojiMsg] = useState(null);
    const [fileMsgState, setFileMsgState] = useState(null);
    const socket = React.useRef();

    useEffect(() => {
        const updatedMessages = currGroup?.Messages?.map((message) => ({
            ...message,
            sender_name: currGroup?.User?.username,
        }));
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
        axios.get(`${url}/all-reactions`).then((response) => {
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

        const postData = {
            group_id: currGroup?.id,
            content: message,
            file_type: null, filename: null, file_url: null, file_size: null
        }

        const newMessage = {
            content: message, sender_id: loginUser?.id,
            group_id: currGroup?.id, sender_name: loginUser?.username, contentType: "text",
            createdAt: Date.now()
        };

        if (replayMsg) {
            postData['reply_to_message_id'] = replayMsg.id;

            axios.post(`${url}/reply-chat`, postData)
                .then((response) => console.log("Replay response:", response))
                .catch((err) => console.log("Error:", err));

            newMessage['reply_to_message_id'] = replayMsg.id;
            socket.current.emit("send_message", newMessage);
            setMessage("");

            setReplayMsg(null);
        } else {
            axios.post(`${url}/add-group-chat`, postData)
                .then((response) => {
                    console.log("add Group chat:", response);
                    socket.current.emit("send_message", newMessage);
                    setMessage("");
                })
                .catch((err) => console.log("Error:", err));
        }
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    };

    const handleFileChange = (e) => {
        // setSelectedFile(e.target.files[0]);
        setSelectedFile([...e.target.files]);
    };
    const handleFileMsgChange = (e) => {
        setFileMsgState(e.target.value);
    };

    const handleSendFile = () => {
        if (selectedFile) {
            const formData = new FormData();
            // formData.append("fileInput", selectedFile);

            selectedFile.forEach((file) => {
                formData.append("fileInput", file);  // 'files' is the field name
            });

            console.log("Count::", selectedFile.length);

            const filename = selectedFile.map((select) => select.name);
            const file_type = selectedFile.map((select) => select.type);
            const file_url = selectedFile.map((select) => select.name);
            const file_size = selectedFile.map((select) => select.size);

            const postData = {
                group_id: currGroup?.id,
                content: fileMsgState,
                file_type: file_type, filename: filename, file_url: file_url,
                file_size: file_size
            }

            const fileMsg = {
                content: fileMsgState, sender_id: loginUser?.id, group_id: currGroup?.id,
                sender_name: loginUser?.username, contentType: "file",
                file_type: file_type, filename: filename, file_url: file_url,
                file_size: file_size,
                createdAt: Date.now()
            }

            if (replayMsg) {
                postData['reply_to_message_id'] = replayMsg.id;
                fileMsg['reply_to_message_id'] = replayMsg.id;

                axios.post(`${url}/reply-chat`, postData)
                    .then((response) => {
                        fileMsg['id'] = response.data.id;
                        formData.append("newFile_id", response.data.id);
                        axios.post(`${url}/file-input-message/${currGroup?.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } },)
                            .then((response) => {
                                console.log("Response::", response);
                            }).catch((err) => console.log("Error::", err));
                        socket.current.emit("file_message", fileMsg);
                    })
                    .catch((err) => console.log("Error:", err));
                setReplayMsg(null);
            } else {
                axios.post(`${url}/add-group-chat`, postData)
                    .then((response) => {
                        fileMsg['id'] = response.data.id;
                        formData.append("newFile_id", response.data.id);
                        axios.post(`${url}/file-input-message/${currGroup?.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } },)
                            .then((response) => {
                                console.log("Response::", response);
                            }).catch((err) => console.log("Error::", err));
                        socket.current.emit("file_message", fileMsg);
                    })
                    .catch((err) => console.log("Error:", err));
            }


            setFilePopupVisible(false);
        }

        setSelectedFile("");
    };

    const handleImageChange = (e) => {

        if (e.target.files) {
            const selectedFile = [...e.target.files]
            const formData = new FormData();

            selectedFile.forEach((file) => {
                formData.append("fileInput", file);  // 'files' is the field name
            });

            const filename = selectedFile.map((select) => select.name);
            const file_type = selectedFile.map((select) => select.type);
            const file_url = selectedFile.map((select) => select.name);
            const file_size = selectedFile.map((select) => select.size);

            const imgMsg = {
                content: e.target.files[0].name, sender_id: loginUser?.id, group_id: currGroup?.id,
                sender_name: loginUser?.username, contentType: "img",
                file_type: file_type, filename: filename, file_url: file_url,
                file_size: file_size,
                createdAt: Date.now()
            };

            const postData = {
                group_id: currGroup?.id,
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
                        axios.post(`${url}/file-input-message/${currGroup?.id}`, formData)
                            .then((response) => {
                                console.log("Response from file 128::", response);
                                socket.current.emit("img_message", imgMsg);
                            }).catch((err) => console.log("Error::", err))
                    })
                    .catch((err) => console.log("Error:", err));

                socket.current.emit("send_message", imgMsg);
                setMessage("");

                setReplayMsg(null);
            } else {

                axios.post(`${url}/add-group-chat`, postData)
                    .then((response) => {
                        imgMsg['id'] = response.data.id;
                        formData.append("newFile_id", response.data.id);
                        axios.post(`${url}/file-input-message/${currGroup?.id}`, formData)
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
        setSelectGroup(undefined);
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
        setEmojiMsg(index);
        setEmojiView(null);

        axios.post(`${url}/add-reaction`, { message_id: message.id, reaction: JSON.stringify({ name: em.name, code: em.code }) }).then((response) => {
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
                    <img src={`${url}/public/profile/${currGroup?.profile_image}`} alt="DP" className="dp" />
                    <h2 className="msg-chat-username">{currGroup?.group_name}</h2>
                </div>

                <div className="message__area" id="messageArea" ref={messageAreaRef}>
                    {
                        messageList?.map((msg, index) => {
                            let result = null;
                            if (msg.reply_to_message_id) {
                                result = messageList.find((m) => m.id == msg.reply_to_message_id);
                            }

                            return currGroup?.id == msg.group_id &&
                                <div key={index} className={`message ${msg?.sender_id === loginUser?.id ? "sent" : "received"}`}
                                    onMouseEnter={() => handleOption(index)}
                                    onMouseLeave={handleMouseLeave}>

                                    {msg.reply_to_message_id && <div className={`replay_msg ${msg?.sender_id === loginUser?.id ? "send" : "receive"}`}>
                                        <div className="sender_info">{users.find((user) => user.id == result?.sender_id).username}</div>{result.content || result.filename} </div>}

                                    <div className={`menu ${option != index ? "display" : ''} ${msg?.sender_id === loginUser?.id ? "senderReply" : "receiverReply"} `}>
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

                                    <div className='sender_name'>
                                        {msg?.sender_id !== loginUser?.id &&
                                            users.find((user) => user.id == msg?.sender_id)?.username}
                                    </div>

                                    {
                                        msg?.file_type == null ? <p className='text-msg'>{msg?.content}</p> : msg?.file_type?.every(file => file.startsWith("image")) == false ?
                                            <div>
                                                {
                                                    msg?.filename.map((file, indx) => (
                                                        <div key={indx} className="received-file">
                                                            <div className="file-name">{file}</div>
                                                            <a href={`${url}/download-file/${msg.id}/${file}`} className="download-btn"><i className="fa-solid fa-download"></i></a>
                                                        </div>
                                                    ))
                                                }
                                                <div className="file-file-style">{msg.content}</div>
                                            </div>
                                            : msg?.file_type?.every(file => file.startsWith("image")) == true ? <div className='img-div'> <a href={`${url}/download-file/${msg.id}`}><i className="fa-solid fa-download img-download"></i></a>
                                                {

                                                    <a href={`${url}/public/uploads/fileSend/${currGroup?.id}/${msg?.filename}`} target='_blank'>
                                                        <img src={`${url}/public/uploads/fileSend/${currGroup?.id}/${msg?.filename}`} alt="img" /></a>
                                                }
                                            </div> : ""}

                                    <div className="date-style">
                                        {
                                            msg?.createdAt == Date.now() ? new Intl.DateTimeFormat("en-IN", {
                                                timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit"
                                            }).format(msg?.createdAt) :
                                                new Intl.DateTimeFormat("en-IN", {
                                                    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit"
                                                }).format(new Date(msg?.createdAt))
                                        }
                                    </div>
                                    {
                                        singleEmoji && emojiMsg == index ?
                                            <div className={`emoji-style-single`}>{String.fromCodePoint(`0x${JSON.parse(singleEmoji?.reaction)?.code}`)}</div> :
                                            msg.MessageReaction ? <div className={`emoji-style-single`}>{String.fromCodePoint(`0x${JSON.parse(msg.MessageReaction?.reaction)?.code}`)}</div> : ''
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
                    <input type="file" name="imageFile" id="imgfile" hidden accept="image/*" onChange={handleImageChange} />
                    <i className="fa-solid fa-paperclip" style={{ cursor: "pointer" }} onClick={() => setFilePopupVisible(true)}></i>
                    <button className="btn btn-primary" id="send-btn" type="button" onClick={handleSendMessage}>Send</button>
                </div>

                {/* File Send Popup */}
                {filePopupVisible && (
                    <div id="filePopup" className="popup">
                        <div className="popup-content">
                            <div className="close" onClick={() => setFilePopupVisible(false)}>
                                &times;
                            </div>
                            <h3>📁 Send a File</h3>
                            <div className="file-input-area">
                                <label htmlFor="fileInput" className="custom-file-label">
                                    <i className="fas fa-upload"></i> Select File
                                </label>
                                <input type="file" id="fileInput" className="file-input" name="fileInput" onChange={handleFileChange} multiple />
                                <input type="text" id="fileMsgInput" className="file-msg-input" name="fileMsgInput" onChange={handleFileMsgChange} placeholder='write message..' />
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
