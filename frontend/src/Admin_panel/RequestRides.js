import React, { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import { toast } from "react-toastify";
import API from "../API";

const RequestRides = ({
  id,
  goingfrom,
  goingto,
  name,
  email,
  passenger,
  date,
}) => {
  const [hidden, setHidden] = useState(false);

  const handleApprove = async (id) => {
    const status = "Active";
    try {
      await API.patch(`publishride/${id}`, { status });
      toast.success("Ride approved.");
      setHidden(true);
    } catch (err) {
      toast.error(err?.response?.data || "Could not approve this ride.");
    }
  };

  const handleDisapprove = async () => {
    try {
      const { data } = await API.delete(`publishride/${id}`);
      toast.info(data);
      setHidden(true);
    } catch (err) {
      toast.error(err?.response?.data || "Could not remove this ride.");
    }
  };
  if (hidden) return null;

  return (
    <div className="card text-center my-5" key={id}>
      <div className="card-header" style={{ textAlign: "left" }}>
        New Ride Publish Request
      </div>
      <div className="card-body">
        <h5 className="card-title">
          {goingfrom} <BsArrowRight /> {goingto}
        </h5>
        <p className="card-text">
          User <span>{name}</span> email <b>{email}"</b> has request to publish
          ride from {goingfrom} to {goingto} with need of <b>{passenger}</b>{" "}
          passenger on {date}
        </p>
        <div className="d-flex justify-content-between">
          <button className="btn primaryBtn" onClick={() => handleApprove(id)}>
            Approve
          </button>
          <button
            href="/"
            className="btn primaryBtn"
            onClick={handleDisapprove}
          >
            Disapprove
          </button>
        </div>
      </div>
      <div className="card-footer text-muted">{date}</div>
    </div>
  );
};

export default RequestRides;
