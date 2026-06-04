import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import "./Admin_panel.css";
import RideStatisticsApi from "./RideStatisticsApi";
import RequestRides from "./RequestRides";
import API from "../API";
import backendAPI from "../API/backendAPI";

const defaultStats = {
  totalPassengers: 0,
  totalDrivers: 0,
  revenue: 0,
  totalTrips: 0,
  cancelledTrips: 0,
  completedTrips: 0,
  startedTrips: 0,
  pendingDrivers: 0,
  onlineDrivers: 0,
};

const dhakaCenter = [23.7806, 90.4193];

const AdminDashboard = () => {
  const [stats, setStats] = useState(defaultStats);
  const [recentTrips, setRecentTrips] = useState([]);
  const [inactiveRides, setInactiveRides] = useState([]);
  const [liveDrivers, setLiveDrivers] = useState([]);
  const [dataMode, setDataMode] = useState("backend");

  useEffect(() => {
    const loadBackendDashboard = async () => {
      const [{ data: dashboardData }, { data: liveDriverData }] =
        await Promise.all([
          backendAPI.get("/admin/dashboard"),
          backendAPI.get("/admin/live-drivers"),
        ]);

      setStats({ ...defaultStats, ...dashboardData.stats });
      setRecentTrips(dashboardData.recentTrips || []);
      setLiveDrivers(liveDriverData.drivers || []);
      setDataMode("backend");
    };

    const loadLocalDashboard = async () => {
      const { data } = await API.get("/publishride");

      const completedRides = data.filter((ride) => ride.status === "Completed");
      const runningRides = data.filter((ride) => ride.status === "Active");
      const cancelledRides = data.filter((ride) => ride.status === "Cancelled");
      const filterInactiveRides = data.filter(
        (ride) => ride.status === "Inactive"
      );

      setStats({
        ...defaultStats,
        totalPassengers: 30,
        totalDrivers: data.length,
        revenue: 46,
        totalTrips: data.length,
        cancelledTrips: cancelledRides.length,
        completedTrips: completedRides.length,
        startedTrips: runningRides.length,
      });
      setInactiveRides(filterInactiveRides);
      setDataMode("local");
    };

    const getStatistics = async () => {
      try {
        await loadBackendDashboard();
      } catch (error) {
        await loadLocalDashboard();
      }
    };

    getStatistics();
  }, []);

  const mapCenter =
    liveDrivers.length > 0
      ? [Number(liveDrivers[0].lat), Number(liveDrivers[0].lng)]
      : dhakaCenter;

  const StatisticsApi = [
    {
      id: "1",
      title: "Total Riders",
      value: stats.totalPassengers,
      cardIconbg: "#342d7e",
      statisticColbg: "#4f56ff",
      icon: "fas fa-user",
    },
    {
      id: "2",
      title: "Total Drivers",
      value: stats.totalDrivers,
      cardIconbg: "#C63535",
      statisticColbg: "#E74E52",
      icon: "fas fa-user-tie",
    },
    {
      id: "3",
      title: "Total Revenue",
      value: `BDT ${stats.revenue}`,
      cardIconbg: "#342d7e",
      statisticColbg: "#6d72ff",
      icon: "fas fa-dollar-sign",
    },
    {
      id: "4",
      title: "Total Rides",
      value: stats.totalTrips,
      cardIconbg: "#342d7e",
      statisticColbg: "#4f56ff",
      icon: "fas fa-car",
    },
    {
      id: "5",
      title: "Cancelled Ride",
      value: stats.cancelledTrips,
      cardIconbg: "#C63535",
      statisticColbg: "#E74E52",
      icon: "fas fa-times",
    },
    {
      id: "6",
      title: "Completed Rides",
      value: stats.completedTrips,
      cardIconbg: "#342d7e",
      statisticColbg: "#6d72ff",
      icon: "fas fa-check",
    },
    {
      id: "7",
      title: "Running Rides",
      value: stats.startedTrips,
      cardIconbg: "#342d7e",
      statisticColbg: "#4f56ff",
      icon: "fas fa-car-side",
    },
    {
      id: "8",
      title: "Pending Drivers",
      value: stats.pendingDrivers,
      cardIconbg: "#342d7e",
      statisticColbg: "#6d72ff",
      icon: "fas fa-id-card",
    },
    {
      id: "9",
      title: "Online Drivers",
      value: stats.onlineDrivers,
      cardIconbg: "#342d7e",
      statisticColbg: "#4f56ff",
      icon: "fas fa-location-arrow",
    },
  ];

  return (
    <div className="col-md-9 adminProfile-main">
      <div>
        <div className="admin-title-row">
          <h2>Rides Statistics</h2>
          <span className="admin-data-mode">
            {dataMode === "backend" ? "Backend Connected" : "Local Preview"}
          </span>
        </div>

        <div className="row">
          {StatisticsApi.map((statistic) => {
            const { id, title, value, statisticColbg, cardIconbg, icon } =
              statistic;
            return (
              <div className="col-md-4" key={id}>
                <RideStatisticsApi
                  title={title}
                  value={value}
                  cardIconbg={cardIconbg}
                  statisticColbg={statisticColbg}
                  icon={icon}
                />
              </div>
            );
          })}
        </div>

        <div className="admin-section">
          <h3>Live Drivers</h3>
          <div className="admin-live-map">
            <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {liveDrivers.map((driver) => (
                <CircleMarker
                  key={driver.driverId}
                  center={[Number(driver.lat), Number(driver.lng)]}
                  radius={9}
                  pathOptions={{
                    color: "#342d7e",
                    fillColor: "#4f56ff",
                    fillOpacity: 0.85,
                  }}
                >
                  <Popup>
                    <strong>{driver.name || "Driver"}</strong>
                    <br />
                    {driver.vehicleType || "Vehicle"} {driver.plateNumber || ""}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {recentTrips.length > 0 && (
          <div className="admin-section">
            <h3>Recent Trips</h3>
            <div className="admin-trip-list">
              {recentTrips.map((trip) => (
                <div className="admin-trip-row" key={trip.id}>
                  <div>
                    <strong>{trip.pickupAddress}</strong>
                    <span> to {trip.dropoffAddress}</span>
                    <p>
                      {trip.passenger?.name || "Passenger"} ·{" "}
                      {trip.driver?.user?.name || "No driver yet"}
                    </p>
                  </div>
                  <div className="admin-trip-meta">
                    <span>{trip.status}</span>
                    <strong>BDT {trip.finalFare || trip.estimatedFare}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {inactiveRides.map((ride) => {
          const { _id, goingfrom, goingto, name, passenger, date, email } = ride;
          return (
            <RequestRides
              key={_id}
              id={_id}
              goingfrom={goingfrom}
              goingto={goingto}
              name={name}
              passenger={passenger}
              date={date}
              email={email}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
