import React, { useEffect, useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import RideRequestCard from "./RideRequestCard";
import AOS from "aos";
import API from "../API/localStorageAPI"; // <-- use LS API

const UserDashboard = () => {
  const [authUser, setAuthUser] = useState(null);
  const [userPublishride, setUserPublishRide] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // optional "ping" your old code did
        await API.get("user/user-dashboard");

        // get current signed-in user from LS
        const { data: me } = await API.get("user/me");
        setAuthUser(me);

        // fetch rides from LS and filter by email
        const { data: allPublished } = await API.get("publishride");
        const mine = allPublished.filter(
          (ride) =>
            (ride?.email || "").toLowerCase() ===
            (me?.email || "").toLowerCase()
        );
        setUserPublishRide(mine);

        const { data: requests } = await API.get("requestride");
        setRequestedRides(requests);
      } catch (e) {
        setErr(e?.response?.data || "Failed to load dashboard");
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  if (err) {
    return (
      <div className="col-md-9 userProfile-main">
        <div className="container">
          <h2 className="text-center mb-4">Your Rides</h2>
          <div className="alert alert-danger" role="alert">
            {err}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-md-9 userProfile-main">
      <div className="container">
        <h2 className="text-center mb-5">Your Rides</h2>

        <div className="row mb-5">
          {userPublishride.length === 0 && (
            <p className="text-muted">No published rides yet.</p>
          )}

          {userPublishride.map((ride, index) => {
            const { goingfrom, goingto, date } = ride;
            return (
              <div
                className="card border-success mb-3 me-3 col-5"
                style={{ maxWidth: "18rem" }}
                key={ride.id || index}
                data-aos="fade-up"
                data-aos-duration="1200"
              >
                <div className="card-header bg-transparent border-success">
                  {goingfrom} <BsArrowRight /> {goingto}
                </div>
                <div className="card-body text-success">
                  <p className="card-text">
                    You went {goingto} from {goingfrom} on {date}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-success">
                  Date: {date}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {requestedRides
        .filter((r) => (authUser?.id ?? authUser?._id) === r.publisherId)
        .map((ride, index) => {
          const {
            _id,
            rideId,
            goingfrom,
            goingto,
            rideStatus,
            requestStatus,
            date,
            passenger,
            publisherId,
            bookerEmail,
          } = ride;

          return (
            <RideRequestCard
              key={_id || index}
              id={_id}
              rideId={rideId}
              goingfrom={goingfrom}
              goingto={goingto}
              rideStatus={rideStatus}
              requestStatus={requestStatus}
              date={date}
              passenger={passenger}
              bookerEmail={bookerEmail}
            />
          );
        })}
    </div>
  );
};

export default UserDashboard;
