import React from "react";
import { useEffect, useState } from "react";
import SearchedCard from "../components/Search/SearchedCard";
import API from "../API";

const Rides = () => {
  const [rides, setRides] = useState([]);
  useEffect(() => {
    const getPublishRides = async () => {
      try {
        const { data } = await API.get("publishride");
        setRides(data);
      } catch (err) {
        console.log(err);
      }
    };
    getPublishRides();
  }, []);
  return (
    <div className="col-md-9 userProfile-main">
      <div className="container">
        <h2>Total Rides</h2>
        {rides.map((ride, index) => {
          const { goingfrom, goingto, date, name, status, passenger, email, _id } =
            ride;
          return (
            <SearchedCard
              key={_id || index}
              goingfrom={goingfrom}
              goingto={goingto}
              date={date}
              name={name}
              status={status}
              passenger={passenger}
              email={email}
              publishRideId={_id}
              formData={{ passengerNeeded: 1 }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Rides;
