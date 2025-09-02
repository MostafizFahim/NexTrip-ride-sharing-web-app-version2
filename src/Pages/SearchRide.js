import React from "react";
import Header from "../components/Header/Header";
import Navbar from "../components/Header/Navbar";
import HeaderRideSearch from "../components/Header/HeaderRideSearch"; // Import the component
import Footer from "../components/footer/Footer";

const SearchRide = () => {
  return (
    <div>
      <Navbar />
      <HeaderRideSearch /> {/* Add the HeaderRideSearch component here */}
      <Footer />
    </div>
  );
};

export default SearchRide;
