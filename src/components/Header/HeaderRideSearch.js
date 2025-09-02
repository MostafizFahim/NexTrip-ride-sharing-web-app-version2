import React, { useState } from "react";
import { toast } from "react-toastify";
import AOS from "aos";
import places from "../../placesApi/places.js";
import "./HeaderRideSearch.css";

const PRICING = {
  Bus: { BASE_FARE: 20, PER_KM: 5 },
  CNG: { BASE_FARE: 40, PER_KM: 18 },
  "Auto Rickshaw": { BASE_FARE: 30, PER_KM: 15 },
  Car: { BASE_FARE: 60, PER_KM: 22 },
  Bike: { BASE_FARE: 25, PER_KM: 12 },
};

const toRadians = (deg) => (deg * Math.PI) / 180;
const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const HeaderRideSearch = () => {
  const [formData, setFormData] = useState({
    goingFrom: "",
    goingTo: "",
    vehicleType: "",
  });
  const [estimate, setEstimate] = useState(null);

  const handleEstimate = (e) => {
    e.preventDefault();

    if (!formData.goingFrom || !formData.goingTo || !formData.vehicleType) {
      toast.warn("Please select From, To, and Vehicle Type.");
      return;
    }
    if (formData.goingFrom === formData.goingTo) {
      toast.warn("Departure and destination cannot be the same.");
      return;
    }

    const from = places.find((p) => p.location === formData.goingFrom);
    const to = places.find((p) => p.location === formData.goingTo);
    if (!from?.lat || !to?.lat) {
      toast.error("Selected locations are missing coordinates.");
      return;
    }

    const distanceKm = Math.max(1, haversineKm(from, to));
    const { BASE_FARE, PER_KM } = PRICING[formData.vehicleType];
    const distanceFare = PER_KM * distanceKm;
    const total = Math.round(BASE_FARE + distanceFare);

    setEstimate({
      vehicleType: formData.vehicleType,
      distanceKm: Number(distanceKm.toFixed(2)),
      base: BASE_FARE,
      distanceFare: Math.round(distanceFare),
      total,
    });
  };

  return (
    <section
      className="header-ride-search"
      data-aos="fade-right"
      data-aos-duration="1200"
    >
      <h2 className="search-title">Fare Estimator</h2>

      <form onSubmit={handleEstimate} className="ride-search-form">
        {/* From */}
        <div className="form-group">
          <select
            className="form-control ride-select"
            name="goingFrom"
            onChange={(e) =>
              setFormData({ ...formData, goingFrom: e.target.value })
            }
            value={formData.goingFrom}
            required
          >
            <option value="">Select departure location</option>
            {places.map(({ id, location }) => (
              <option key={id} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* To */}
        <div className="form-group">
          <select
            className="form-control ride-select"
            name="goingTo"
            onChange={(e) =>
              setFormData({ ...formData, goingTo: e.target.value })
            }
            value={formData.goingTo}
            required
          >
            <option value="">Select destination</option>
            {places.map(({ id, location }) => (
              <option key={id} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Type */}
        <div className="form-group">
          <select
            className="form-control ride-select"
            name="vehicleType"
            onChange={(e) =>
              setFormData({ ...formData, vehicleType: e.target.value })
            }
            value={formData.vehicleType}
            required
          >
            <option value="">Select vehicle type</option>
            <option value="Bus">Bus</option>
            <option value="CNG">CNG</option>
            <option value="Auto Rickshaw">Auto Rickshaw</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
          </select>
        </div>

        <div className="search-btn-container">
          <button className="btn search-btn" type="submit">
            Estimate Fare
          </button>
        </div>
      </form>

      {estimate && (
        <div className="fare-result" data-aos="fade-up" data-aos-duration="800">
          <h3 className="fare-title">
            Estimated Fare ({estimate.vehicleType})
          </h3>
          <ul className="fare-breakdown">
            <li>
              Distance: <strong>{estimate.distanceKm} km</strong>
            </li>
            <li>
              Base: <strong>{estimate.base} BDT</strong>
            </li>
            <li>
              Distance fare: <strong>{estimate.distanceFare} BDT</strong>
            </li>
          </ul>
          <div className="fare-total">
            Total: <strong>{estimate.total} BDT</strong>
          </div>
          <p className="fare-note">
            This is an estimate. Actual fare may vary with route, traffic, and
            wait time.
          </p>
        </div>
      )}
    </section>
  );
};

export default HeaderRideSearch;
