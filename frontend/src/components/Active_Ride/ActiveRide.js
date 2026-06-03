import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ActiveRide.css"; // Changed to full page CSS

// Fix leaflet icons
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon1x from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x,
  iconUrl: icon1x,
  shadowUrl: iconShadow,
});

// Custom icons
const driverIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMlpNMTIgMjBDNy41OCAyMCA0IDE2LjQyIDQgMTJDNCA3LjU4IDcuNTggNCAxMiA0QzE2LjQyIDQgMjAgNy41OCAyMCAxMkMyMCAxNi40MiAxNi40MiAyMCAxMiAyMFpNMTIgNkM4LjY5IDYgNiA4LjY5IDYgMTJDNiAxNS4zMSA4LjY5IDE4IDEyIDE4QzE1LjMxIDE4IDE4IDE1LjMxIDE4IDEyQzE4IDguNjkgMTUuMzEgNiAxMiA2Wk0xMiAxNkM5Ljc5IDE2IDggMTQuMjEgOCAxMkM4IDkuNzkgOS43OSA4IDEyIDhDMTQuMjEgOCAxNiA5Ljc5IDE2IDEyQzE2IDE0LjIxIDE0LjIxIDE2IDEyIDE2WiIgZmlsbD0iIzZkMjhkOSIvPgo8L3N2Zz4K",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const userIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMlpNMTIgNUMxMy42NiA1IDE1IDYuMzQgMTUgOEMxNSA5LjY2IDEzLjY2IDExIDEyIDExQzEwLjM0IDExIDkgOS42NiA5IDhDOSA2LjM0IDEwLjM0IDUgMTIgNVpNMTIgMTkuMkM5LjUgMTkuMiA3LjA5IDE3LjkyIDYgMTZDNi4wOCAxMy45OSAxMCAxMi45IDEyIDEyLjlDMTQgMTIuOSAxNy45MiAxMy45OSAxOCAxNkMxNi45MSAxNy45MiAxNC41IDE5LjIgMTIgMTkuMloiIGZpbGw9IiM3YzNhZWQiLz4KPC9zdmc+Cg==",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Map auto-center component
function MapUpdater({ driverPosition }) {
  const map = useMap();

  useEffect(() => {
    if (driverPosition) {
      map.setView([driverPosition.lat, driverPosition.lng], 15, {
        animate: true,
        duration: 1,
      });
    }
  }, [driverPosition, map]);

  return null;
}

// Mock data for demonstration
const MOCK_RIDE_DATA = {
  id: "RIDE-2024-001",
  status: "driver_assigned",
  driver: {
    name: "Mohammad Hasan",
    rating: 4.9,
    trips: 1247,
    vehicle: {
      type: "Toyota Corolla",
      color: "White",
      plate: "DHA-GA-1234",
    },
    phone: "+8801712345678",
  },
  pickup: {
    address: "Gulshan 1, Dhaka",
    lat: 23.777176,
    lng: 90.399452,
  },
  dropoff: {
    address: "Banani, Dhaka",
    lat: 23.794,
    lng: 90.4152,
  },
  fare: 285,
  distance: "4.2 km",
  eta: 8,
  payment: {
    method: "cash",
    amount: 285,
  },
  timeline: [
    { step: "ordered", time: "14:30", completed: true },
    { step: "driver_assigned", time: "14:31", completed: true },
    { step: "arriving", time: "14:35", completed: false },
    { step: "in_progress", time: null, completed: false },
    { step: "completed", time: null, completed: false },
  ],
};

const STATUS_CONFIG = {
  searching: {
    badge: "🔍 Searching",
    title: "Looking for a driver",
    subtitle: "We're finding the best driver for you",
    progress: 25,
  },
  driver_assigned: {
    badge: "✅ Driver Assigned",
    title: "Driver is on the way",
    subtitle: "Your driver will arrive shortly",
    progress: 50,
  },
  arriving: {
    badge: "🚗 Arriving Soon",
    title: "Driver is arriving",
    subtitle: "Please be ready at pickup location",
    progress: 75,
  },
  in_progress: {
    badge: "🎯 Ride Started",
    title: "Enjoy your ride!",
    subtitle: "You're on your way to the destination",
    progress: 90,
  },
  completed: {
    badge: "🏁 Completed",
    title: "Ride Completed",
    subtitle: "Thank you for riding with us",
    progress: 100,
  },
};

export default function ActiveRideFullPage({ embedded = false }) {
  const history = useHistory();
  const [rideData, setRideData] = useState(MOCK_RIDE_DATA);
  const [driverPosition, setDriverPosition] = useState({
    lat: 23.782,
    lng: 90.405,
  });

  // Simulate driver movement
  useEffect(() => {
    if (rideData.status !== "completed") {
      const interval = setInterval(() => {
        setDriverPosition((prev) => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001,
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [rideData.status]);

  // Simulate status progression
  useEffect(() => {
    const statusFlow = [
      "searching",
      "driver_assigned",
      "arriving",
      "in_progress",
      "completed",
    ];
    const currentIndex = statusFlow.indexOf(rideData.status);

    if (currentIndex < statusFlow.length - 1) {
      const timer = setTimeout(() => {
        setRideData((prev) => ({
          ...prev,
          status: statusFlow[currentIndex + 1],
        }));
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [rideData.status]);

  const statusConfig = STATUS_CONFIG[rideData.status];
  const routePolyline = [rideData.pickup, driverPosition, rideData.dropoff];

  const handleCallDriver = () => {
    window.open(`tel:${rideData.driver.phone}`, "_self");
  };

  const handleMessageDriver = () => {
    window.open(`sms:${rideData.driver.phone}`, "_self");
  };

  const handleCancelRide = () => {
    if (window.confirm("Are you sure you want to cancel this ride?")) {
      history.push("/user-dashboard");
    }
  };

  const handleEmergency = () => {
    window.open("tel:999", "_self");
  };

  const getStepStatus = (step) => {
    const currentStepIndex = [
      "ordered",
      "driver_assigned",
      "arriving",
      "in_progress",
      "completed",
    ].indexOf(rideData.status);
    const stepIndex = [
      "ordered",
      "driver_assigned",
      "arriving",
      "in_progress",
      "completed",
    ].indexOf(step);

    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "active";
    return "pending";
  };

  return (
    <div
      className={
        embedded
          ? "active-ride-fullpage active-ride-embedded"
          : "active-ride-fullpage"
      }
    >
      {/* Header */}
      <div className="active-ride-header">
        <div className="header-content">
          <button
            className="back-button"
            onClick={() => history.push("/user-dashboard")}
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="header-title">Active Ride</h1>
            <div className="ride-id">{rideData.id}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="active-ride-content">
        {/* Left Panel - Ride Information */}
        <div className="ride-info-panel">
          {/* Status Card */}
          <div className="status-card">
            <div className="status-badge">{statusConfig.badge}</div>
            <h2 className="status-title">{statusConfig.title}</h2>
            <p className="status-subtitle">{statusConfig.subtitle}</p>
          </div>

          {/* Driver Information */}
          <div className="driver-info">
            <div className="driver-avatar">
              {rideData.driver.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="driver-details">
              <h3 className="driver-name">{rideData.driver.name}</h3>
              <div className="driver-rating">
                <span>⭐ {rideData.driver.rating}</span>
                <span>•</span>
                <span>{rideData.driver.trips} trips</span>
              </div>
              <p className="vehicle-info">
                {rideData.driver.vehicle.color} {rideData.driver.vehicle.type} •{" "}
                {rideData.driver.vehicle.plate}
              </p>
            </div>
            <div className="contact-buttons">
              <button className="contact-btn" onClick={handleCallDriver}>
                📞
              </button>
              <button className="contact-btn" onClick={handleMessageDriver}>
                💬
              </button>
            </div>
          </div>

          {/* Ride Details */}
          <div className="ride-details">
            <div className="detail-item">
              <span className="detail-label">Pickup</span>
              <span className="detail-value">{rideData.pickup.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Dropoff</span>
              <span className="detail-value">{rideData.dropoff.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Distance</span>
              <span className="detail-value">{rideData.distance}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Payment</span>
              <span className="detail-value">
                {rideData.payment.method === "cash"
                  ? "💵 Cash"
                  : rideData.payment.method === "card"
                  ? "💳 Card"
                  : "📱 Mobile"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Fare</span>
              <span className="detail-value fare-amount">৳{rideData.fare}</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            {rideData.timeline.map((item, index) => (
              <div
                key={item.step}
                className={`step ${getStepStatus(item.step)}`}
              >
                <div className={`step-icon ${getStepStatus(item.step)}`}>
                  {getStepStatus(item.step) === "completed" ? "✓" : index + 1}
                </div>
                <div className="step-content">
                  <h4 className="step-title">
                    {item.step.replace("_", " ").toUpperCase()}
                  </h4>
                  <p className="step-description">
                    {item.step === "ordered" && "Ride requested"}
                    {item.step === "driver_assigned" &&
                      "Driver assigned to your ride"}
                    {item.step === "arriving" && "Driver is arriving at pickup"}
                    {item.step === "in_progress" && "Ride in progress"}
                    {item.step === "completed" && "Ride completed successfully"}
                  </p>
                </div>
                {item.time && <div className="step-time">{item.time}</div>}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="action-btn secondary-btn"
              onClick={handleCancelRide}
              disabled={rideData.status === "completed"}
            >
              Cancel Ride
            </button>
            <button
              className="action-btn primary-btn"
              onClick={handleCallDriver}
            >
              Call Driver
            </button>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="ride-map-panel">
          <MapContainer
            center={[rideData.pickup.lat, rideData.pickup.lng]}
            zoom={13}
            className="ride-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <Marker
              position={[rideData.pickup.lat, rideData.pickup.lng]}
              icon={userIcon}
            />
            <Marker
              position={[driverPosition.lat, driverPosition.lng]}
              icon={driverIcon}
            />
            <Marker
              position={[rideData.dropoff.lat, rideData.dropoff.lng]}
              icon={userIcon}
            />

            <Polyline
              positions={routePolyline}
              color="#7c3aed"
              weight={4}
              opacity={0.7}
            />

            <MapUpdater driverPosition={driverPosition} />
          </MapContainer>

          {/* ETA Display */}
          <div className="eta-display">
            <p className="eta-title">ESTIMATED ARRIVAL</p>
            <h3 className="eta-value">{rideData.eta} min</h3>
          </div>

          {/* Emergency Button */}
          <button className="emergency-button" onClick={handleEmergency}>
            🚨 Emergency
          </button>
        </div>
      </div>
    </div>
  );
}
