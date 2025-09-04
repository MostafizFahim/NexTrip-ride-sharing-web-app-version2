import React from "react";
import "../style/howItWorks.css";

// Import your existing header & footer components

import Footer from "../components/footer/Footer";
import Navbar from "../components/Header/Navbar";

const steps = [
  {
    id: 1,
    title: "Set pickup & destination",
    desc: "Allow location or choose pins manually. We auto-detect your pickup and autocomplete your dropoff with live route preview.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5.001 2.5 2.5 0 0 1 0 5z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Compare options & fares",
    desc: "Pick a vehicle type (Bike, Car, XL). See ETA, transparent fare estimates, and surge details before you confirm.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 18a8 8 0 1 1 5.292-14.036l1.827-1.827 1.414 1.414-1.827 1.827A8 8 0 0 1 10 18zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Match with a nearby driver",
    desc: "We notify the closest verified driver. Track live on the map, call or chat in-app, and share your trip for safety.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0v6a1 1 0 0 0 1 1h1m12-7v6a1 1 0 0 1-1 1h-1M7 18v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1m6 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Ride, pay & rate",
    desc: "Follow live navigation to your destination. Pay via card, mobile wallet, or cash. Rate and tip after the ride.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7h18v10H3zM5 5h14v2H5zM7 19h10v2H7z" />
      </svg>
    ),
  },
];

const highlights = [
  {
    title: "Safety first",
    body: "Driver KYC, trip sharing, SOS shortcut, and masked calling keep you in control during every ride.",
    emoji: "🛡️",
  },
  {
    title: "Always reachable",
    body: "24/7 help center with chat & phone escalation. Lost item or fare issue? We’ve got you.",
    emoji: "📞",
  },
  {
    title: "Fair pricing",
    body: "Transparent estimates, promos, and surge explanations. No surprises at checkout.",
    emoji: "💳",
  },
  {
    title: "Fast ETAs",
    body: "Smart matching and demand heatmaps minimize wait times during peak hours.",
    emoji: "⏱️",
  },
];

export default function Works({
  appName = "NexTrip",
  primaryCta = { label: "Request a ride", href: "/login" },
  secondaryCta = { label: "Become a driver", href: "/register?role=driver" },
}) {
  return (
    <>
      {/* Global Header */}
      <Navbar />

      <main className="hiw-root">
        {/* Hero */}
        <section className="hiw-hero">
          <div className="hiw-container">
            <h1 className="hiw-hero__title">How {appName} works</h1>
            <p className="hiw-hero__subtitle">
              A simple four-step flow designed for speed, safety, and
              transparency.
            </p>
            <div className="hiw-hero__ctas">
              <a className="hiw-btn hiw-btn--primary" href={primaryCta.href}>
                {primaryCta.label}
              </a>
              <a className="hiw-btn hiw-btn--ghost" href={secondaryCta.href}>
                {secondaryCta.label}
              </a>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="hiw-section">
          <div className="hiw-container">
            <ol className="hiw-steps">
              {steps.map((s) => (
                <li key={s.id} className="hiw-step">
                  <div className="hiw-step__icon">{s.icon}</div>
                  <h3 className="hiw-step__title">
                    {s.id}. {s.title}
                  </h3>
                  <p className="hiw-step__desc">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="hiw-divider" />

        {/* Highlights */}
        <section className="hiw-section">
          <div className="hiw-container">
            <div className="hiw-section__head">
              <h2 className="hiw-h2">Why riders choose us</h2>
              <p className="hiw-muted">
                Built with trust and comfort in mind, and tuned for the
                realities of busy cities.
              </p>
            </div>
            <div className="hiw-grid">
              {highlights.map((h) => (
                <div key={h.title} className="hiw-card">
                  <div className="hiw-card__icon">{h.emoji}</div>
                  <h3 className="hiw-card__title">{h.title}</h3>
                  <p className="hiw-card__body">{h.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        {/* <section className="hiw-section">
          <div className="hiw-container">
            <div className="hiw-section__head">
              <h2 className="hiw-h2">FAQs</h2>
              <p className="hiw-muted">
                Quick answers to common questions from riders and drivers.
              </p>
            </div>
            <div className="hiw-faq">
              <details className="hiw-faq__item" open>
                <summary className="hiw-faq__q">
                  How are fares calculated?
                  <span className="hiw-faq__toggle">+</span>
                </summary>
                <p className="hiw-faq__a">
                  Base fare + time + distance, adjusted for live demand (surge).
                  You’ll always see an estimate before you confirm.
                </p>
              </details>
              <details className="hiw-faq__item">
                <summary className="hiw-faq__q">
                  What payment methods do you support?
                  <span className="hiw-faq__toggle">+</span>
                </summary>
                <p className="hiw-faq__a">
                  Cards, mobile wallets (bKash/Nagad), and cash in supported
                  cities. Add or switch methods from your profile.
                </p>
              </details>
              <details className="hiw-faq__item">
                <summary className="hiw-faq__q">
                  What safety features are built in?
                  <span className="hiw-faq__toggle">+</span>
                </summary>
                <p className="hiw-faq__a">
                  Driver verification (KYC), trip sharing, SOS button with
                  hotline, and masked calling. Our team monitors incidents 24/7.
                </p>
              </details>
            </div>
          </div>
        </section> */}

        {/* Footer CTA */}
        <section className="hiw-cta">
          <div className="hiw-container">
            <div className="hiw-cta__box">
              <div className="hiw-cta__text">
                <h3 className="hiw-cta__title">Ready to ride?</h3>
                <p className="hiw-cta__sub">
                  Try {appName} today—fast ETAs, transparent pricing, and
                  built-in safety.
                </p>
              </div>
              <div className="hiw-cta__actions">
                <a className="hiw-btn hiw-btn--light" href={primaryCta.href}>
                  {primaryCta.label}
                </a>
                <a
                  className="hiw-btn hiw-btn--outline"
                  href={secondaryCta.href}
                >
                  {secondaryCta.label}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </>
  );
}
