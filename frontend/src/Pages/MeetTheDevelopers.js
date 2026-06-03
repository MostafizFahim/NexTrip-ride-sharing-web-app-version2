import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

import Footer from "../components/footer/Footer";
import Navbar from "../components/Header/Navbar";

import "../style/meetDevelopers.css";

const developers = [
  {
    name: "Rayhan Ferdous Srejon",
    role: "Full Stack Developer",
    avatar: "/srejon.jpg",
    socials: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      linkedin: "https://linkedin.com/",
      github: "https://github.com/",
    },
  },
  {
    name: "Mostafiz Fahim",
    role: "Frontend Developer",
    avatar: "/Mostafiz.jpg",
    socials: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      linkedin: "https://linkedin.com/",
      github: "https://github.com/",
    },
  },
  {
    name: "Sk. Md. Shadman Ifaz",
    role: "Backend & Blockchain",
    avatar: "/alindo.jpg",
    socials: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      linkedin: "https://linkedin.com/",
      github: "https://github.com/",
    },
  },
];

const SocialLink = ({ href, label, children }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      className="dev-social"
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
    >
      {children}
    </a>
  );
};

const DevCard = ({ dev }) => {
  const { name, role, avatar, socials } = dev;

  const handleImgError = (e) => {
    // fallback avatar (light purple bg with initials)
    e.currentTarget.src =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
           <rect width='100%' height='100%' fill='#f5f0fa'/>
           <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
             font-family='Arial, Helvetica, sans-serif' font-size='56' fill='#6f42c1'>NT</text>
         </svg>`
      );
  };

  return (
    <div className="dev-card">
      <div className="dev-avatar-wrap">
        <img
          src={avatar}
          alt={`${name} avatar`}
          className="dev-avatar"
          onError={handleImgError}
          loading="lazy"
        />
      </div>
      <h3 className="dev-name">{name}</h3>
      <p className="dev-role">{role}</p>
      <div className="dev-socials">
        <SocialLink href={socials.facebook} label={`${name} on Facebook`}>
          <FaFacebookF />
        </SocialLink>
        <SocialLink href={socials.instagram} label={`${name} on Instagram`}>
          <FaInstagram />
        </SocialLink>
        <SocialLink href={socials.linkedin} label={`${name} on LinkedIn`}>
          <FaLinkedinIn />
        </SocialLink>
        <SocialLink href={socials.github} label={`${name} on GitHub`}>
          <FaGithub />
        </SocialLink>
      </div>
    </div>
  );
};

const MeetTheDevelopers = () => {
  return (
    <>
      <Navbar />
      <section className="dev-page">
        <div className="dev-container">
          <header className="dev-header">
            <h1>Meet the Developers</h1>
            <p>
              The team building <strong>NexTrip</strong> — an on-demand ride app
              with built-in ride sharing.
            </p>
          </header>

          <div className="dev-grid">
            {developers.map((d) => (
              <DevCard key={d.name} dev={d} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default MeetTheDevelopers;
