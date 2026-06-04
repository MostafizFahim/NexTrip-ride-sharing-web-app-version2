import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../API";
import backendAPI from "../API/backendAPI";

function normalizeBackendPassenger(passenger) {
  return {
    id: passenger.id,
    fullName: passenger.name,
    contact: passenger.phone,
    userType: "Passenger",
    rating: passenger.rating,
    createdAt: passenger.createdAt,
  };
}

function normalizeLocalUser(user) {
  return {
    id: user.id || user._id,
    fullName: user.fullName,
    contact: user.email,
    userType: user.userType,
    rating: 5,
    createdAt: user.createdAt || user.date,
  };
}

const Riders = () => {
  const [riders, setRiders] = useState([]);
  const [search, setSearch] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [dataMode, setDataMode] = useState("backend");

  useEffect(() => {
    const getRiders = async () => {
      try {
        const { data } = await backendAPI.get("/admin/passengers");
        setRiders((data.passengers || []).map(normalizeBackendPassenger));
        setDataMode("backend");
      } catch (err) {
        const { data } = await API.get("user/register");
        setRiders(data.map(normalizeLocalUser));
        setDataMode("local");
      }
    };

    getRiders();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const keyword = search.trim().toLowerCase();
    const filterUser = riders.filter(
      (user) =>
        user.fullName.toLowerCase().includes(keyword) ||
        user.contact.toLowerCase().includes(keyword)
    );

    if (filterUser.length === 0) {
      toast.error("No user found");
    }

    setSearchedUsers(filterUser);
  };

  const visibleRiders = searchedUsers.length > 0 ? searchedUsers : riders;

  return (
    <div className="col-md-9 userProfile-main">
      <div>
        <div className="admin-title-row">
          <h2 className="mb-4">Riders</h2>
          <span className="admin-data-mode">
            {dataMode === "backend" ? "Backend Connected" : "Local Preview"}
          </span>
        </div>

        <form onSubmit={handleSearch}>
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              id="Search"
              placeholder="Search for rider by name or phone..."
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>
          <div className="my-2">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            {searchedUsers.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => {
                  setSearch("");
                  setSearchedUsers([]);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        <div className="row">
          {visibleRiders.map((rider) => (
            <div className="col-md-6" key={rider.id}>
              <div className="card mb-4">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png"
                      className="img-fluid rounded-start"
                      alt="user"
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title">{rider.fullName}</h5>
                      <p className="card-text">{rider.contact}</p>
                      <p className="card-text">{rider.userType}</p>
                      <p className="card-text">Rating: {rider.rating}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {visibleRiders.length === 0 && (
            <div className="col-12">
              <div className="admin-empty-state">No riders found.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Riders;
