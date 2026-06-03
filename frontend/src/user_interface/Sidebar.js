import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { MdOutlineDashboard } from "react-icons/md";
import { AiOutlineUser } from "react-icons/ai";
import { VscGitPullRequest } from "react-icons/vsc";
import {
  IoCarSportOutline,
  IoAddCircleOutline,
  IoCloseOutline,
  IoChatboxOutline,
  IoWalletOutline,
} from "react-icons/io5";
import AOS from "aos";

const Sidebar = () => {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const LoginUser = JSON.parse(localStorage.getItem("user") || "null");
    setUserName(LoginUser?.fullName || "Guest");
  }, []);
  const Logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("nextrip:auth");
    window.location.href = "/";
    toast.success("You are successfully logout...", { position: "top-center" });
  };

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);
  return (
    <div className="col-md-3 sidebar">
      <div
        className="sidebar-content"
        data-aos="fade-right"
        data-aos-duration="1200"
      >
        <div className="sidebar-header">
          <div className="user-image">
            <FaUserCircle className="user-photo" />
          </div>
          <div className="user-name">
            <h3>{userName}</h3>
          </div>
        </div>
        <div className="sidebar-menu">
          <ul className="nav nav-tabs flex-column">
            <li className="nav-item d-flex align-items-center SidebarMenuItem">
              <MdOutlineDashboard className="sidebarMenuIcon" />
              <Link to="/user-dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
            <li className="nav-item d-flex align-items-center SidebarMenuItem">
              <IoCarSportOutline className="sidebarMenuIcon" />
              <Link to="/user-dashboard/riderequest" className="nav-link">
                Request for Ride
              </Link>
            </li>

            <li className="nav-item d-flex align-items-center SidebarMenuItem">
              <IoAddCircleOutline className="sidebarMenuIcon" />
              <Link to="/user-dashboard/activeride" className="nav-link">
                Active Ride
              </Link>
            </li>

            <li className="nav-item d-flex align-items-center SidebarMenuItem">
              <VscGitPullRequest className="sidebarMenuIcon" />
              <Link to="/user-dashboard/my-ride-requests" className="nav-link">
                My Trips
              </Link>
            </li>
            <li className="nav-item active d-flex align-items-center SidebarMenuItem">
              <IoWalletOutline className="sidebarMenuIcon" />
              <Link to="/user-dashboard/payments" className="nav-link">
                Payments
              </Link>
            </li>
            <li className="nav-item active d-flex align-items-center SidebarMenuItem">
              <AiOutlineUser className="sidebarMenuIcon" />
              <Link to="/user-dashboard/profile" className="nav-link">
                Profile & Settings
              </Link>
            </li>
            <li className="nav-item d-flex align-items-center SidebarMenuItem">
              <IoChatboxOutline className="sidebarMenuIcon" />
              <Link to="/user-dashboard/support" className="nav-link">
                Support
              </Link>
            </li>

            <li className="nav-item d-flex align-items-center SidebarMenuItem">
              <IoCloseOutline className="sidebarMenuIcon" />
              <Link
                to="/user-dashboard/logout"
                className="nav-link"
                onClick={Logout}
              >
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
