import React from "react";
import Sidebar from "../../user_interface/Sidebar";
import UserInterfaceNavbar from "../../user_interface/UserInterfaceNavbar";
import UserPlaceholder from "../../user_interface/UserPlaceholder";
import "../../user_interface/userInterface.css";

const UserPlaceholderPage = ({ title, message }) => {
  return (
    <section className="user-dashboard">
      <UserInterfaceNavbar />
      <div className="container">
        <div className="row userDashboard-row">
          <Sidebar />
          <UserPlaceholder title={title} message={message} />
        </div>
      </div>
    </section>
  );
};

export default UserPlaceholderPage;
