import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../API";

const AdminProfile = () => {
  const [user, setUser] = useState({
    id: "",
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const loginUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!loginUser) return;

    setUser({
      id: loginUser._id || loginUser.id,
      fullName: loginUser.fullName || "",
      userName: loginUser.userName || "",
      email: loginUser.email || "",
      password: "",
      userType: loginUser.userType || "Admin",
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.patch(`user/${user.id}`, user);
      toast.success(data);
    } catch (err) {
      toast.error(err?.response?.data || "Could not update admin profile.");
    }
  };

  return (
    <div className="col-md-9 userProfile-main">
      <div className="container">
        <h2>Profile</h2>
        <form className="user-Details" onSubmit={handleUpdate}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">User Name</label>
            <input
              type="text"
              className="form-control"
              value={user.userName}
              onChange={(e) => setUser({ ...user, userName: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              disabled
              value={user.password}
              readOnly
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Update Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
