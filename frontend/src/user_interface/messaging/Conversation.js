import React, { useEffect, useState } from "react";
import { format } from "timeago.js";
import API from "../../API";

const Conversation = ({ conversation, currentUser }) => {
  const [connectRider, setConnectRider] = useState(null);

  useEffect(() => {
    const connectRiderId = conversation.members.find(
      (member) => String(member) !== String(currentUser?._id || currentUser?.id)
    );

    const getConnectRider = async () => {
      if (!connectRiderId) return;

      try {
        const { data } = await API.get("user/" + connectRiderId);
        setConnectRider(data);
      } catch (error) {
        console.log(error);
      }
    };

    getConnectRider();
  }, [currentUser, conversation]);

  return (
    <>
      <div className="singleRider row d-flex align-items-center">
        <div className="profilePic col-3">
          <div className="converUser">
            <img
              src={connectRider?.picture || "/images/user-icon.png"}
              className="user-icon img-fluid"
              alt="Rider Profile"
            />
          </div>
        </div>
        <div className="rider col-9 d-flex flex-row justify-content-between align-items-center">
          <h5>{connectRider?.fullName || "Rider"}</h5>
          <span>{format(conversation.date)}</span>
        </div>
      </div>
    </>
  );
};

export default Conversation;
