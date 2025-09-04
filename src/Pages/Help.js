import React, { useState } from "react";
import "../style/help.css";
import Footer from "../components/footer/Footer";
import Navbar from "../components/Header/Navbar";

const Help = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "How are fares calculated?",
      answer:
        "Base fare + time + distance, adjusted for live demand (surge). You'll always see an estimate before you confirm.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "Cards, mobile wallets (bKash/Nagad), and cash in supported cities. Add or switch methods from your profile.",
    },
    {
      question: "What safety features are built in?",
      answer:
        "Driver verification (KYC), trip sharing, SOS button with hotline, and masked calling. Our team monitors incidents 24/7.",
    },
    {
      question: "How do I become a driver?",
      answer:
        "Apply through our Driver Portal with your license, vehicle documents, and background check. Our team will guide you through the onboarding process.",
    },
    {
      question: "What if I need to cancel a ride?",
      answer:
        "You can cancel free of charge within 2 minutes of booking. After that, a cancellation fee may apply depending on your location.",
    },
    {
      question: "How do I report a problem with my ride?",
      answer:
        "Go to 'Your Trips' in the app, select the trip, and use the 'Help' option to report any issues. Our support team will respond within 24 hours.",
    },
    {
      question: "Can I schedule rides in advance?",
      answer:
        "Yes! Use the 'Schedule' option to book rides up to 7 days in advance. You'll get a reminder before your scheduled pickup time.",
    },
    {
      question: "What vehicles are available?",
      answer:
        "We offer multiple options: Economy, Comfort, Premium, and larger vehicles for groups. Availability varies by location.",
    },
    {
      question: "How does the rating system work?",
      answer:
        "After each trip, both riders and drivers rate each other on a 5-star scale. This helps maintain quality and safety for everyone.",
    },
    {
      question: "Is there a loyalty program?",
      answer:
        "Yes! Our NexTrip Rewards program gives you points for every ride. Earn free rides, priority support, and other benefits.",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="help-container">
        <div className="help-header">
          <h1>Frequently Asked Questions</h1>
          <p>Quick answers to common questions from riders and drivers</p>
        </div>

        <div className="faq-search">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search for questions..."
              className="search-input"
            />
          </div>
        </div>

        <div className="faq-categories">
          <button className="category-btn active">All Questions</button>
          <button className="category-btn">Riders</button>
          <button className="category-btn">Drivers</button>
          <button className="category-btn">Payments</button>
          <button className="category-btn">Safety</button>
        </div>

        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${activeIndex === index ? "active" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <span className="faq-toggle">
                  {activeIndex === index ? (
                    <i className="fas fa-minus"></i>
                  ) : (
                    <i className="fas fa-plus"></i>
                  )}
                </span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="help-contact">
          <h2>Still need help?</h2>
          <p>Our support team is available 24/7 to assist you</p>
          <div className="contact-options">
            <div className="contact-option">
              <i className="fas fa-comments"></i>
              <h4>Live Chat</h4>
              <p>Get instant help from our team</p>
              <button className="contact-btn">Start Chat</button>
            </div>
            <div className="contact-option">
              <i className="fas fa-envelope"></i>
              <h4>Email Support</h4>
              <p>We'll respond within 24 hours</p>
              <button className="contact-btn">Send Email</button>
            </div>
            <div className="contact-option">
              <i className="fas fa-phone-alt"></i>
              <h4>Call Us</h4>
              <p>Mon-Sun, 8AM-11PM</p>
              <button className="contact-btn">+880 XXXX-XXXXXX</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Help;
