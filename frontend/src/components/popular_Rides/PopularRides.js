import React, { useState, useEffect } from "react";
import SinglePopularRide from "./SinglePopularRide";
import "./popularRides.css";
import AOS from "aos";

const PopularRides = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  return (
    <section className="popularRides">
      <div className="container">
        <h2 data-aos="zoom-in" data-aos-duration="1000">
          Popular Rides Around Dhaka
        </h2>

        <div className="row popularRidesRow">
          <SinglePopularRide GoingFrom="Uttara" GoingTo="Motijheel" />
          <SinglePopularRide GoingFrom="Dhanmondi" GoingTo="Gulshan" />
          <SinglePopularRide GoingFrom="Mirpur" GoingTo="Banani" />
          <SinglePopularRide GoingFrom="Mohakhali" GoingTo="Farmgate" />
        </div>

        {show ? (
          <div className="row popularRidesRow">
            <SinglePopularRide GoingFrom="Shyamoli" GoingTo="Bashundhara R/A" />
            <SinglePopularRide GoingFrom="Rampura" GoingTo="Khilgaon" />
            <SinglePopularRide GoingFrom="Jatrabari" GoingTo="Kamalapur" />
            <SinglePopularRide GoingFrom="Paltan" GoingTo="New Market" />
          </div>
        ) : null}

        <div className="see-more">
          <button
            className="btn btn-primary"
            onClick={() => setShow((prev) => !prev)}
          >
            {show ? "See Less" : "See More"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularRides;
