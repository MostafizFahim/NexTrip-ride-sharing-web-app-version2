import React, { useEffect, useRef, useState } from "react";
import { GoSearch } from "react-icons/go";
import Conversation from "./Conversation";
import Message from "./Message";
import "./messaging.css";
import API from "../../API";

const Messaging = () => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedRider, setConnectedRider] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    if (userData) setUser(userData);
  }, []);

  useEffect(() => {
    const getConversations = async () => {
      if (!user?._id && !user?.id) return;

      try {
        const { data } = await API.get(`conversations/${user._id || user.id}`);
        setConversations(data);
      } catch (error) {
        console.log(error);
      }
    };

    getConversations();
  }, [user]);

  useEffect(() => {
    const getCurrentChatData = async () => {
      if (!currentChat?._id) {
        setMessages([]);
        setConnectedRider(null);
        return;
      }

      try {
        const [{ data: messageData }, { data: users }] = await Promise.all([
          API.get(`messages/${currentChat._id}`),
          API.get("user/register"),
        ]);
        const currentUserId = user?._id || user?.id;
        const connectedId = currentChat.members.find(
          (member) => String(member) !== String(currentUserId)
        );
        const connectedUser = users.find(
          (candidate) =>
            String(candidate._id || candidate.id) === String(connectedId)
        );

        setMessages(messageData);
        setConnectedRider(connectedUser || null);
      } catch (error) {
        console.log(error);
      }
    };

    getCurrentChatData();
  }, [currentChat, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim() === "") {
      alert("Empty message cannot be sent!");
      return;
    }

    const message = {
      sender: user._id || user.id,
      text: newMessage,
      conversationId: currentChat?._id,
    };

    try {
      const { data } = await API.post("messages", message);
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="col-md-9 userProfile-main messaging">
        <div className="row messagingRow">
          <div className="connectRiders-section col-12 col-md-5">
            <div className="topBar">
              <span className="topBar-heading">Connected Riders</span>
            </div>
            <div className="SearchBox">
              <GoSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search messages"
                className="search-riders-input"
              />
            </div>
            <div className="connectedRiders">
              {conversations.length === 0 && (
                <p className="text-muted px-3">
                  Book a ride to create a local conversation.
                </p>
              )}

              {conversations.map((conversation, index) => {
                return (
                  <div
                    onClick={() => setCurrentChat(conversation)}
                    key={conversation._id || index}
                  >
                    <Conversation conversation={conversation} currentUser={user} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="messagesBody-section col-12 col-md-7">
            {currentChat ? (
              <>
                <div className="topBar">
                  <span className="topBar-heading">
                    <img
                      src="/images/user-icon.png"
                      alt="Rider profile"
                      className="user-icon img-fluid"
                    />
                    {connectedRider?.fullName || "Conversation"}
                  </span>
                </div>
                <div className="messagesContainer">
                  {messages.map((message) => {
                    return (
                      <div ref={scrollRef} key={message._id || message.id}>
                        <Message
                          message={message}
                          ownMessage={message.sender === (user?._id || user?.id)}
                          OwnUser={user || {}}
                          ConnectedRider={connectedRider || {}}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="newMessage">
                  <textarea
                    className="form-control"
                    placeholder="Write a message... "
                    rows="3"
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <button
                    type="submit"
                    className="btn primmaryBtn sendMessageBtn my-2"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="EmptyConversation">
                Open connected Riders conversation to start <br /> a chat
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messaging;
