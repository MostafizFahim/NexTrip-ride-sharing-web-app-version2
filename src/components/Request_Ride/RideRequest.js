import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { useHistory } from "react-router-dom"; // v5 navigation
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./RideRequest.css";

// Fix default marker icons
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon1x from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x,
  iconUrl: icon1x,
  shadowUrl: iconShadow,
});

// ------------------- Config -------------------
const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const OSRM_URL = "https://router.project-osrm.org";
const DEFAULT_CENTER = { lat: 23.777176, lng: 90.399452 };

// Vehicle catalog
const VEHICLES = [
  {
    key: "bike",
    label: "Bike",
    base: 20,
    perKm: 18,
    perMin: 0.8,
    maxPax: 1,
    icon: "🚲",
  },
  {
    key: "car",
    label: "Car",
    base: 40,
    perKm: 25,
    perMin: 1.2,
    maxPax: 4,
    icon: "🚗",
  },
  {
    key: "xl",
    label: "XL",
    base: 70,
    perKm: 32,
    perMin: 1.5,
    maxPax: 6,
    icon: "🚙",
  },
  {
    key: "premium",
    label: "Premium",
    base: 120,
    perKm: 45,
    perMin: 2.0,
    maxPax: 4,
    icon: "⭐",
  },
];

// Payment options
const PAYMENTS = [
  { key: "cash", label: "Cash", icon: "💵" },
  { key: "card", label: "Card", icon: "💳" },
  { key: "bkash", label: "bKash", icon: "📱" },
  { key: "nagad", label: "Nagad", icon: "📱" },
];

// Utilities
const bdt = (n) => `৳ ${n.toFixed(0)}`;
const toQuery = (s) => encodeURIComponent(s.trim());

function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

// ------------------- Geocoding helpers -------------------
async function searchPlaces(q) {
  if (!q || q.trim().length < 2) return [];
  const url = `${NOMINATIM_URL}/search?format=jsonv2&limit=8&q=${toQuery(
    q
  )}&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "RideApp/1.0 (educational demo)",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((d) => ({
      id: d.place_id,
      label: d.display_name,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }));
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
}

async function reverseGeocode({ lat, lng }) {
  const url = `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "RideApp/1.0 (educational demo)",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name || null;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}

async function routeOSRM(pick, drop) {
  const coords = `${pick.lng},${pick.lat};${drop.lng},${drop.lat}`;
  const url = `${OSRM_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Routing failed");
    const data = await res.json();
    const r = data?.routes?.[0];
    if (!r) throw new Error("No route found");
    return {
      distanceMeters: r.distance,
      durationSec: r.duration,
      polyline: r.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    };
  } catch (error) {
    console.error("Error calculating route:", error);
    // Fallback: straight line estimate
    const distanceMeters = L.latLng(pick.lat, pick.lng).distanceTo(
      L.latLng(drop.lat, drop.lng)
    );
    const durationSec = distanceMeters / 10; // ~36 km/h
    return { distanceMeters, durationSec, polyline: [pick, drop] };
  }
}

function estimateFare(vehicleKey, distanceKm, durationMin) {
  const v = VEHICLES.find((x) => x.key === vehicleKey);
  if (!v) return null;
  const fare = v.base + v.perKm * distanceKm + v.perMin * durationMin;
  return Math.max(fare, v.base);
}

// ------------------- Map click helper -------------------
function ClickToSetMarker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// ------------------- Autocomplete -------------------
function PlaceAutocomplete({ label, value, onChange, onSelect, placeholder }) {
  const [q, setQ] = useState(value?.label || "");
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => setQ(value?.label || ""), [value?.label]);

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const doSearch = useMemo(
    () =>
      debounce(async (text) => {
        const r = await searchPlaces(text);
        setList(r);
        setOpen(true);
      }, 300),
    []
  );

  return (
    <div className="place-autocomplete" ref={boxRef}>
      <label className="input-label">{label}</label>
      <input
        className="location-input"
        placeholder={placeholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onChange?.(e.target.value);
          doSearch(e.target.value);
        }}
        onFocus={() => q && doSearch(q)}
      />
      {open && list.length > 0 && (
        <div className="autocomplete-dropdown">
          {list.map((opt) => (
            <button
              key={opt.id}
              className="autocomplete-option"
              onClick={() => {
                setQ(opt.label);
                setOpen(false);
                onSelect?.(opt);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------- Map auto-resize helper -------------------
function MapAutoResize() {
  const map = useMapEvents({});
  const container = map.getContainer();
  useEffect(() => {
    if (!container) return;
    const ro = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    ro.observe(container);
    setTimeout(() => map.invalidateSize(false), 0);
    return () => ro.disconnect();
  }, [map, container]);
  return null;
}

// ------------------- Main Component -------------------
export default function RideRequest({ onRequestRide, onBackToDashboard }) {
  const history = useHistory(); // v5 navigation

  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [vehicle, setVehicle] = useState("car");
  const [payment, setPayment] = useState("cash");
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Auto-detect pickup
  useEffect(() => {
    if (!navigator.geolocation) {
      setMapError("Geolocation not supported by your browser");
      return;
    }
    if (!pickup) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          const label = await reverseGeocode(coords);
          setPickup({ ...coords, label: label || "Current location" });
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setMapError("Unable to retrieve location. Enter manually.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []); // eslint-disable-line

  // Compute route
  useEffect(() => {
    const go = async () => {
      if (!pickup || !dropoff) return;
      setLoadingRoute(true);
      try {
        const r = await routeOSRM(pickup, dropoff);
        setRoute(r);
        setMapError(null);
      } catch (e) {
        console.error(e);
        setRoute(null);
        setMapError("Failed to calculate route.");
      } finally {
        setLoadingRoute(false);
      }
    };
    go();
  }, [pickup, dropoff]);

  const distanceKm = route ? route.distanceMeters / 1000 : 0;
  const durationMin = route ? route.durationSec / 60 : 0;
  const estimate = route
    ? estimateFare(vehicle, distanceKm, durationMin)
    : null;

  const canRequest = pickup && dropoff && vehicle && payment && !!route;

  return (
    <div className="ride-request-fullpage">
      {/* Left: form panel */}
      <div className="panel-pane">
        <div className="ride-request-card">
          <div className="card-header">
            <button
              className="back-button"
              onClick={() => {
                if (onBackToDashboard) onBackToDashboard();
                history.push("/user-dashboard");
              }}
            >
              ← Back to Dashboard
            </button>
            <h1>Request a Ride</h1>
          </div>

          {/* Pickup */}
          <div className="form-section">
            <PlaceAutocomplete
              label="Pickup Location"
              placeholder="Search or click on map"
              value={pickup}
              onSelect={(opt) => setPickup(opt)}
            />
            <div className="location-actions">
              <button
                className={`location-action-btn ${isLocating ? "loading" : ""}`}
                onClick={async () => {
                  if (!navigator.geolocation) {
                    setMapError("Geolocation not supported");
                    return;
                  }
                  setIsLocating(true);
                  navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                      const coords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                      };
                      const label = await reverseGeocode(coords);
                      setPickup({
                        ...coords,
                        label: label || "Current location",
                      });
                      setIsLocating(false);
                    },
                    (error) => {
                      console.error("Geolocation error:", error);
                      setMapError("Unable to retrieve your location.");
                      setIsLocating(false);
                    },
                    { enableHighAccuracy: true, timeout: 8000 }
                  );
                }}
                disabled={isLocating}
              >
                {isLocating ? "Locating..." : "Use My Current Location"}
              </button>
            </div>
          </div>

          {/* Dropoff */}
          <div className="form-section">
            <PlaceAutocomplete
              label="Dropoff Location"
              placeholder="Where to?"
              value={dropoff}
              onSelect={(opt) => setDropoff(opt)}
            />
          </div>

          {/* Vehicle */}
          <div className="form-section">
            <label className="section-label">Choose Vehicle</label>
            <div className="vehicle-options">
              {VEHICLES.map((v) => (
                <div
                  key={v.key}
                  className={`vehicle-option ${
                    vehicle === v.key ? "selected" : ""
                  }`}
                  onClick={() => setVehicle(v.key)}
                >
                  <span className="vehicle-icon">{v.icon}</span>
                  <span className="vehicle-name">{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="form-section">
            <label className="section-label">Payment Method</label>
            <div className="payment-options">
              {PAYMENTS.map((p) => (
                <div
                  key={p.key}
                  className={`payment-option ${
                    payment === p.key ? "selected" : ""
                  }`}
                  onClick={() => setPayment(p.key)}
                >
                  <span className="payment-icon">{p.icon}</span>
                  <span className="payment-name">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fare Estimate + Button */}
          <div className="fare-estimate">
            <div className="fare-details">
              <div className="fare-item">
                <span>Estimated Fare:</span>
                <span className="fare-value">
                  {estimate ? bdt(estimate) : "—"}
                </span>
              </div>
              <div className="fare-item">
                <span>ETA:</span>
                <span className="fare-value">
                  {route ? `${Math.round(durationMin)} min` : "—"}
                </span>
              </div>
              <div className="fare-item">
                <span>Distance:</span>
                <span className="fare-value">
                  {route ? `${distanceKm.toFixed(2)} km` : "—"}
                </span>
              </div>
            </div>

            <button
              disabled={!canRequest || loadingRoute}
              onClick={() => {
                const payload = {
                  pickup,
                  dropoff,
                  vehicle,
                  payment,
                  estimate,
                  etaMin: Math.round(durationMin),
                };

                if (onRequestRide) {
                  onRequestRide(payload);
                }

                // ✅ redirect to confirm ride page with payload
                history.push("/confirm-ride", payload);
              }}
              className={`request-button ${
                canRequest && !loadingRoute ? "" : "disabled"
              }`}
            >
              {loadingRoute ? "Calculating route..." : "Request Ride"}
            </button>
          </div>
        </div>
      </div>

      {/* Right: map */}
      <div className="map-pane">
        <MapContainer
          center={
            pickup
              ? [pickup.lat, pickup.lng]
              : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]
          }
          zoom={13}
          scrollWheelZoom
          className="map"
        >
          <MapAutoResize />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {pickup && <Marker position={[pickup.lat, pickup.lng]} />}
          {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} />}
          {route?.polyline && <Polyline positions={route.polyline} />}
          <ClickToSetMarker
            onPick={async (pt) => {
              if (!pickup) {
                const label = await reverseGeocode(pt);
                setPickup({ ...pt, label: label || "Pickup" });
              } else if (!dropoff) {
                const label = await reverseGeocode(pt);
                setDropoff({ ...pt, label: label || "Dropoff" });
              } else {
                const dPick = L.latLng(pickup.lat, pickup.lng).distanceTo(
                  L.latLng(pt.lat, pt.lng)
                );
                const dDrop = L.latLng(dropoff.lat, dropoff.lng).distanceTo(
                  L.latLng(pt.lat, pt.lng)
                );
                const label = await reverseGeocode(pt);
                if (dPick < dDrop)
                  setPickup({ ...pt, label: label || "Pickup" });
                else setDropoff({ ...pt, label: label || "Dropoff" });
              }
            }}
          />
        </MapContainer>

        {mapError && (
          <div className="map-error-overlay">
            <div className="map-error-message">
              <span>{mapError}</span>
              <button onClick={() => setMapError(null)}>×</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
