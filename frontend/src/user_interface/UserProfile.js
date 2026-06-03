import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState({
    id: "",
    fullName: "",
    userName: "",
    email: "",
    password: "",
    userType: "",
  });
  const history = useHistory();

  useEffect(() => {
    const loginUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!loginUser) {
      history.push("/login");
      return;
    }

    setUser({
      id: loginUser._id || loginUser.id,
      fullName: loginUser.fullName || "",
      userName: loginUser.userName || "",
      email: loginUser.email || "",
      password: "",
      userType: loginUser.userType || "",
    });
  }, [history]);

  const handleEdit = (e) => {
    e.preventDefault();

    history.push({
      pathname: "/user-dashboard/profile/edit/" + user.id,
      state: { user },
    });
  };

  return (
    <div className="col-md-9 userProfile-main">
      <div className="container">
        <h2>Profile</h2>
        <form className="user-Details">
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={user.fullName}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">User Name</label>
            <input
              type="text"
              className="form-control"
              value={user.userName}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={user.email}
              readOnly
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
          <div className="mb-3 mt-4">
            <label>User type</label>
            <select
              className="mb-4 form-select"
              aria-label="Default select example"
              name="userType"
              value={user.userType}
              disabled
            >
              <option value="Passenger">Passenger</option>
              <option value="Driver">Driver</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleEdit}>
            Edit Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
