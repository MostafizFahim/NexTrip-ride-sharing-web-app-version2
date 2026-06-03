import React from "react";
import Header from "../components/Header/Navbar";
import Footer from "../components/footer/Footer";
import "../style/privacy.css";

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main className="privacy-root">
        <div className="privacy-container">
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-updated">Last updated: September 2025</p>

          <section>
            <h2>1. Information We Collect</h2>
            <p>
              We collect personal information you provide when signing up (name,
              phone, email), and data generated while using our services (trip
              details, payment method, location data).
            </p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To match riders with drivers and complete trips.</li>
              <li>To process payments and send invoices/receipts.</li>
              <li>To enhance safety with trip sharing and SOS features.</li>
              <li>To improve our services and provide customer support.</li>
            </ul>
          </section>

          <section>
            <h2>3. Sharing of Information</h2>
            <p>We do not sell your personal data. We may share it with:</p>
            <ul>
              <li>Drivers and riders for the purpose of completing a trip.</li>
              <li>Payment providers (e.g., bank, mobile wallet).</li>
              <li>Law enforcement if required by law or for safety reasons.</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>
              We apply strong security practices to protect your information.
              However, no online service is 100% secure, and we encourage you to
              safeguard your login credentials.
            </p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <ul>
              <li>Access and update your profile at any time.</li>
              <li>Request deletion of your account and data.</li>
              <li>Opt out of promotional messages.</li>
            </ul>
          </section>

          <section>
            <h2>6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              at:
              <br />
              Email: support@ridenow.com <br />
              Phone: +880-1XXXXXXXXX
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
