import React from "react";
import RideRequest from "../components/Request_Ride/RideRequest";

const UserRideRequest = () => {
  return (
    <div className="col-md-9 userProfile-main map-workspace">
      <RideRequest embedded />
    </div>
  );
};

export default UserRideRequest;
