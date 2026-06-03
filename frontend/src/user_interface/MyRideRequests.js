import React, { useEffect, useMemo, useState } from "react";
import { BsArrowDown } from "react-icons/bs";
import { GrLocation } from "react-icons/gr";
import AOS from "aos";
import API from "../API";

const MyRideRequests = () => {
  const [requestedRides, setRequestedRides] = useState([]);
  const [users, setUsers] = useState([]);
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  useEffect(() => {
    const getRequestRides = async () => {
      try {
        const [{ data: requests }, { data: allUsers }] = await Promise.all([
          API.get("requestride"),
          API.get("user/register"),
        ]);
        setRequestedRides(requests);
        setUsers(allUsers);
      } catch (error) {
        console.log(error);
      }
    };

    getRequestRides();
  }, []);

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  const myRequests = requestedRides.filter(
    (ride) => user?.email && ride.bookerEmail === user.email
  );

  return (
    <div className="col-md-9 userProfile-main">
      <div className="container">
        <h2 className="text-center mb-4">My Trips</h2>

        {myRequests.length === 0 && (
          <div className="searchCard text-center">
            <h5>You have not booked any ride yet</h5>
            <p className="mb-0">Book a local ride to see it here.</p>
          </div>
        )}

        {myRequests.map((ride, index) => {
          const {
            goingfrom,
            goingto,
            rideStatus,
            requestStatus,
            bookingDate,
            passenger,
            publisherId,
            rejectionReason,
          } = ride;
          const publisher = users.find(
            (candidate) =>
              String(candidate._id || candidate.id) === String(publisherId)
          );

          return (
            <div
              className="searchCard"
              key={ride._id || index}
              data-aos="zoom-in"
              data-aos-duration="1200"
            >
              <div className="searchCard-content row">
                <div className="searchCard-content-col col-sm-2 col-md-2">
                  <h5>18:00</h5>
                  <p>2hr40</p>
                  <h5>20:40</h5>
                </div>
                <div className="searchCard-content-col col-sm-8 col-md-8">
                  <h5>
                    <GrLocation />
                    {goingfrom}
                  </h5>
                  <BsArrowDown className="my-2" />
                  <h5>
                    <GrLocation />
                    {goingto}
                  </h5>
                </div>
                <p className="price col-sm-2 col-md-2">800 BDT</p>
              </div>

              <div className="d-flex justify-content-between align-items-end">
                <div className="cardUser">
                  <p>
                    You booked a ride with{" "}
                    <b>{publisher?.fullName || "Unknown publisher"}</b>
                    {publisher?.email ? (
                      <>
                        {" "}
                        email <b>{publisher.email}</b>
                      </>
                    ) : null}{" "}
                    with <strong>{passenger}</strong> passenger
                    {passenger > 1 ? "s" : ""} on {bookingDate}
                  </p>
                </div>
              </div>

              {requestStatus === "Rejected" && (
                <div>
                  <span>Ride publisher rejection message:</span>
                  <br />
                  <h6>{rejectionReason || "No reason provided."}</h6>
                </div>
              )}

              <div className="my-2 mt-3 d-flex justify-content-between">
                <button className="btn primaryBtn" disabled>
                  {rideStatus}
                </button>
                <button className="btn primaryBtn" disabled>
                  {requestStatus}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyRideRequests;
