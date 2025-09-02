import React from "react";
import "./about.css";

const stats = [
  { label: "Rides Completed", value: "10,000+" },
  { label: "Active Riders & Drivers", value: "1,000+" },
  { label: "Coverage", value: "Dhaka (expanding)" },
];

const About = () => {
  return (
    <section className="aboutUs">
      <div className="cover" />
      <div className="container">
        <header className="about-header">
          <h1 className="text-center">About NexTrip</h1>
          <h3 className="text-center">
            Your on-demand ride app — with built-in ride sharing
          </h3>
        </header>

        <p className="about-lead">
          <strong>NexTrip</strong> is an on-demand ride platform for Dhaka that
          gets you from A to B fast — just like the apps you know — and adds a{" "}
          <strong>ride sharing</strong> option to save money, reduce traffic,
          and lower your carbon footprint. Choose a private ride when you’re in
          a hurry, or share a seat with someone going the same way.
        </p>

        <h4>What you can do with NexTrip</h4>
        <ul className="about-list">
          <li>
            <strong>Book on-demand rides:</strong> Car, Bike, CNG/Auto — pick
            what fits your time and budget.
          </li>
          <li>
            <strong>Share your ride (carpool):</strong> Split the fare by
            booking or offering seats on matching routes.
          </li>
          <li>
            <strong>Up-front pricing:</strong> Clear estimates before you
            confirm, no surprises.
          </li>
          <li>
            <strong>Driver tools:</strong> Publish routes, accept requests, and
            earn more with pooled seats.
          </li>
        </ul>

        <h4>How it works</h4>
        <ul className="about-list">
          <li>
            <strong>Set your trip:</strong> Enter pickup and destination; choose
            vehicle type or Ride Share.
          </li>
          <li>
            <strong>Get matched:</strong> We connect you with nearby drivers —
            or co-riders heading the same way.
          </li>
          <li>
            <strong>Ride & save:</strong> Track details, meet at the pickup, and
            go. With ride sharing, everyone pays less.
          </li>
        </ul>

        <h4>Safety & trust</h4>
        <ul className="about-list">
          <li>
            <strong>Verified profiles:</strong> Drivers and riders have basic
            info and history.
          </li>
          <li>
            <strong>Community standards:</strong> Ratings and guidelines keep
            rides respectful and reliable.
          </li>
        </ul>

        <h5 className="about-subtitle">Key Numbers</h5>
        <ul className="about-stats">
          {stats.map((s) => (
            <li key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </li>
          ))}
        </ul>

        <p className="about-note">
          NexTrip is designed for Dhaka’s reality: quick bookings, transparent
          fares, and smarter routes. Go solo when you need speed — choose Ride
          Share when you want to save.
        </p>

        <p
          className="about-thanks"
          style={{ fontWeight: "bold", textAlign: "center" }}
        >
          Thanks for riding with NexTrip
          <br />
          <br />
          <span className="lastLine">Tap. Match. Go.</span>
        </p>
      </div>
    </section>
  );
};

export default About;
