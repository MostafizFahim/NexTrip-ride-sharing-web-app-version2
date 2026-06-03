import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { BsSearch } from "react-icons/bs";
import "./search.css";
import { useHistory } from "react-router-dom";
import SearchedCard from "./SearchedCard";
import API from "../../API";

const Search = () => {
  const history = useHistory();
  const state = history.location.state || {};
  const [publishRides, setPublishRides] = useState([]);
  const formData = {
    goingFrom: state.goingFrom || "",
    goingTo: state.goingTo || "",
    date: state.date || "",
    passengerNeeded: state.passengerNeeded || 1,
  };

  useEffect(() => {
    const getRides = async () => {
      try {
        if (Array.isArray(state.data)) {
          setPublishRides(state.data);
          return;
        }

        const { data } = await API.get("publishride");
        setPublishRides(data);
      } catch (error) {
        console.log(error);
      }
    };

    getRides();
  }, [state.data]);

  const filteredRides = useMemo(() => {
    return publishRides.filter((ride) => {
      const fromMatches =
        !formData.goingFrom || ride.goingfrom === formData.goingFrom;
      const toMatches = !formData.goingTo || ride.goingto === formData.goingTo;
      return fromMatches && toMatches && Number(ride.passenger) > 0;
    });
  }, [publishRides, formData.goingFrom, formData.goingTo]);

  return (
    <section className="search">
      <div className="container">
        <div className="searchContent">
          <div className="searchedCities d-flex flex-row justify-content-start align-items-center">
            <div>
              <BsSearch className="searchIcon" />
            </div>
            <div>
              <h5>
                {formData.goingFrom || "All origins"}{" "}
                <AiOutlineArrowRight className="arrow" />{" "}
                {formData.goingTo || "All destinations"}
              </h5>
              <span>
                {formData.date || "Any date"}, {formData.passengerNeeded} passenger
              </span>
            </div>
          </div>

          <div className="availableRides">
            <h4>{formData.date || "Available rides"}</h4>
            <p>
              {formData.goingFrom || "All origins"}{" "}
              <AiOutlineArrowRight className="arrow" />
              {formData.goingTo || "All destinations"}
            </p>
            <span>{filteredRides.length} rides available</span>
          </div>

          {filteredRides.length === 0 && (
            <div className="searchCard text-center">
              <h5>No rides found yet</h5>
              <p className="mb-0">
                Publish a demo ride or clear filters to see localStorage data.
              </p>
            </div>
          )}

          {filteredRides.map((publishRide, index) => {
            const {
              goingfrom,
              goingto,
              date,
              name,
              email,
              status,
              _id,
              passenger,
            } = publishRide;

            return (
              <SearchedCard
                key={_id || index}
                index={index}
                goingfrom={goingfrom}
                goingto={goingto}
                name={name}
                email={email}
                date={date}
                status={status}
                publishRideId={_id}
                passenger={passenger}
                formData={formData}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Search;
