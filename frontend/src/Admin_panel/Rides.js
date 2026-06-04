import React, { useEffect, useState } from "react";
import API from "../API";
import backendAPI from "../API/backendAPI";

const tripStatuses = [
  "ALL",
  "REQUESTED",
  "ACCEPTED",
  "DRIVER_ARRIVED",
  "STARTED",
  "COMPLETED",
  "CANCELLED",
];

function normalizeBackendTrip(trip) {
  return {
    id: trip.id,
    pickupAddress: trip.pickupAddress,
    dropoffAddress: trip.dropoffAddress,
    passengerName: trip.passenger?.name || "Passenger",
    driverName: trip.driver?.user?.name || "No driver yet",
    status: trip.status,
    vehicleType: trip.vehicleType,
    fare: trip.finalFare || trip.estimatedFare,
    distanceKm: trip.distanceKm,
    createdAt: trip.createdAt,
    source: "backend",
  };
}

function normalizeLocalRide(ride) {
  return {
    id: ride._id || ride.id,
    pickupAddress: ride.goingfrom,
    dropoffAddress: ride.goingto,
    passengerName: `${ride.passenger || 0} seats`,
    driverName: ride.name,
    status: ride.status,
    vehicleType: "LOCAL",
    fare: "Preview",
    distanceKm: "-",
    createdAt: ride.date,
    source: "local",
  };
}

const Rides = () => {
  const [rides, setRides] = useState([]);
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [dataMode, setDataMode] = useState("backend");

  useEffect(() => {
    const getRides = async () => {
      try {
        const { data } = await backendAPI.get("/admin/trips");
        setRides((data.trips || []).map(normalizeBackendTrip));
        setDataMode("backend");
      } catch (err) {
        const { data } = await API.get("publishride");
        setRides(data.map(normalizeLocalRide));
        setDataMode("local");
      }
    };

    getRides();
  }, []);

  const visibleRides = rides.filter(
    (ride) => activeStatus === "ALL" || ride.status === activeStatus
  );

  return (
    <div className="col-md-9 userProfile-main">
      <div className="container">
        <div className="admin-title-row">
          <h2>Total Rides</h2>
          <span className="admin-data-mode">
            {dataMode === "backend" ? "Backend Connected" : "Local Preview"}
          </span>
        </div>

        <div className="admin-status-tabs">
          {tripStatuses.map((status) => (
            <button
              type="button"
              key={status}
              className={activeStatus === status ? "active" : ""}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="admin-trip-list">
          {visibleRides.map((ride) => (
            <div className="admin-trip-row" key={ride.id}>
              <div>
                <strong>{ride.pickupAddress}</strong>
                <span> to {ride.dropoffAddress}</span>
                <p>
                  Passenger: {ride.passengerName} | Driver: {ride.driverName}
                </p>
                <p>
                  {ride.vehicleType} | {ride.distanceKm} km
                </p>
              </div>
              <div className="admin-trip-meta">
                <span className={`admin-status ${ride.status}`}>
                  {ride.status}
                </span>
                <strong>
                  {typeof ride.fare === "number" ? `BDT ${ride.fare}` : ride.fare}
                </strong>
              </div>
            </div>
          ))}

          {visibleRides.length === 0 && (
            <div className="admin-empty-state">No rides found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rides;
