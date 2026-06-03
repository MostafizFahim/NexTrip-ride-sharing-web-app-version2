import React from "react";
import ActiveRide from "../components/Active_Ride/ActiveRide";

const UserActiveRide = () => {
  return (
    <div className="col-md-9 userProfile-main map-workspace">
      <ActiveRide embedded />
    </div>
  );
};

export default UserActiveRide;
