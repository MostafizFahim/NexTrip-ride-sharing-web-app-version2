import React, { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../API";

const UserProfileEdit = () => {
  const history = useHistory();
  const { id } = useParams();
  const stateUser = history.location.state?.user;
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );
  const initialUser = stateUser || storedUser || {};

  const [user, setUser] = useState({
    id: initialUser.id || initialUser._id || id,
    fullName: initialUser.fullName || "",
    userName: initialUser.userName || "",
    email: initialUser.email || "",
    password: "",
    userType: initialUser.userType || "Passenger",
  });

  useEffect(() => {
    const loadUser = async () => {
      if (!user.id) {
        history.push("/login");
        return;
      }

      if (stateUser || storedUser) return;

      try {
        const { data } = await API.get(`user/${id}`);
        setUser({
          id: data._id || data.id,
          fullName: data.fullName || "",
          userName: data.userName || "",
          email: data.email || "",
          password: "",
          userType: data.userType || "Passenger",
        });
      } catch (error) {
        history.push("/user-dashboard/profile");
      }
    };

    loadUser();
  }, [history, id, stateUser, storedUser, user.id]);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.patch(`user/${user.id}`, user);
      toast.success(data);
      history.push("/user-dashboard/profile");
    } catch (err) {
      toast.error(err?.response?.data || "Could not update profile.");
    }
  };

  return (
    <div className="col-md-9 userProfile-main">
      <div className="container">
        <h2>Edit Profile</h2>
        <form className="user-Details" onSubmit={handleUpdate}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              onChange={handleChange}
              value={user.fullName}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">User Name</label>
            <input
              type="text"
              name="userName"
              className="form-control"
              onChange={handleChange}
              value={user.userName}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              onChange={handleChange}
              value={user.email}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
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
              onChange={handleChange}
              value={user.userType}
            >
              <option value="Passenger">Passenger</option>
              <option value="Driver">Driver</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="file">
              Select Your Image
            </label>
            <input type="file" className="form-control" accept=".jpg,.jpeg,.png" />
          </div>
          <button className="btn btn-primary">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default UserProfileEdit;
