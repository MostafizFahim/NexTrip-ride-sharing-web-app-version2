import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../API";
import backendAPI from "../API/backendAPI";

const statusTabs = ["ALL", "PENDING", "APPROVED", "SUSPENDED"];

function normalizeBackendDriver(driver) {
  return {
    id: driver.id,
    fullName: driver.user?.name || "Driver",
    phone: driver.user?.phone || "",
    email: driver.user?.phone || "",
    vehicleType: driver.vehicleType,
    plateNumber: driver.plateNumber,
    status: driver.status,
    isOnline: driver.isOnline,
    rating: driver.user?.rating || 5,
    createdAt: driver.createdAt,
    source: "backend",
  };
}

function normalizeLocalDriver(driver) {
  return {
    id: driver.id || driver._id,
    fullName: driver.fullName,
    phone: driver.email,
    email: driver.email,
    vehicleType: "BIKE",
    plateNumber: "Local preview",
    status: "APPROVED",
    isOnline: false,
    rating: 5,
    createdAt: driver.createdAt || driver.date,
    source: "local",
  };
}

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [dataMode, setDataMode] = useState("backend");

  const loadDrivers = async () => {
    try {
      const { data } = await backendAPI.get("/admin/drivers");
      setDrivers((data.drivers || []).map(normalizeBackendDriver));
      setDataMode("backend");
    } catch (err) {
      const { data } = await API.get("user/register");
      setDrivers(
        data
          .filter((driver) => driver.userType === "Driver")
          .map(normalizeLocalDriver)
      );
      setDataMode("local");
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleDriverAction = async (driverId, action) => {
    if (dataMode !== "backend") {
      toast.info("Start the backend and login as admin to approve drivers.");
      return;
    }

    try {
      await backendAPI.put(`/admin/drivers/${driverId}/${action}`);
      const labels = {
        approve: "approved",
        reject: "rejected",
        suspend: "suspended",
      };
      toast.success(`Driver ${labels[action]} successfully`);
      await loadDrivers();
    } catch (error) {
      toast.error(error?.message || "Driver action failed");
    }
  };

  const visibleDrivers = drivers.filter((driver) => {
    const matchesStatus =
      activeStatus === "ALL" || driver.status === activeStatus;
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      driver.fullName.toLowerCase().includes(keyword) ||
      driver.phone.toLowerCase().includes(keyword) ||
      driver.plateNumber.toLowerCase().includes(keyword);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="col-md-9 userProfile-main">
      <div>
        <div className="admin-title-row">
          <h2 className="mb-4">Drivers</h2>
          <span className="admin-data-mode">
            {dataMode === "backend" ? "Backend Connected" : "Local Preview"}
          </span>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              id="Search"
              placeholder="Search by driver, phone, or plate..."
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>
        </form>

        <div className="admin-status-tabs">
          {statusTabs.map((status) => (
            <button
              type="button"
              key={status}
              className={activeStatus === status ? "active" : ""}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="row">
          {visibleDrivers.map((driver) => (
            <div className="col-md-6" key={driver.id}>
              <div className="card mb-4 admin-driver-card">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png"
                      className="img-fluid rounded-start"
                      alt="driver"
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <div className="admin-card-heading">
                        <h5 className="card-title">{driver.fullName}</h5>
                        <span className={`admin-status ${driver.status}`}>
                          {driver.status}
                        </span>
                      </div>
                      <p className="card-text">{driver.phone}</p>
                      <p className="card-text">
                        {driver.vehicleType} - {driver.plateNumber}
                      </p>
                      <p className="card-text">
                        {driver.isOnline ? "Online" : "Offline"}
                      </p>

                      <div className="admin-action-row">
                        {driver.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                handleDriverAction(driver.id, "approve")
                              }
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleDriverAction(driver.id, "reject")
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {driver.status === "APPROVED" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              handleDriverAction(driver.id, "suspend")
                            }
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {visibleDrivers.length === 0 && (
            <div className="col-12">
              <div className="admin-empty-state">No drivers found.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drivers;
