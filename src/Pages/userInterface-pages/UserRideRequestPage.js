import React from "react";
import UserInterfaceNavbar from "../../user_interface/UserInterfaceNavbar";
import Sidebar from "../../user_interface/Sidebar";
import UserRideRequest from "../../user_interface/UserRideRequest.js";
import "../../user_interface/userInterface.css";

const UserRideRequestPage = () => {
  return (
    <section className="user-dashboard ride-request-mode">
      <UserInterfaceNavbar />
      <div className="container">
        <div className="row userDashboard-row">
          <Sidebar />
          <UserRideRequest layout="embedded" />
        </div>
      </div>
    </section>
  );
};

export default UserRideRequestPage;
