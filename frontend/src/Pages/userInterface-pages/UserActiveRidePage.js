import React from "react";
import UserInterfaceNavbar from "../../user_interface/UserInterfaceNavbar";
import Sidebar from "../../user_interface/Sidebar";
import "../../user_interface/userInterface.css";
import UserActiveRide from "../../user_interface/UserActiveRide";

const UserActiveRidePage = () => {
  return (
    <section className="user-dashboard">
      <UserInterfaceNavbar />
      <div className="container">
        <div className="row userDashboard-row">
          <Sidebar />
          <UserActiveRide />
        </div>
      </div>
    </section>
  );
};

export default UserActiveRidePage;
