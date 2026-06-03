import React, { useState } from "react";
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";
import "../../style/publishRideForm.css";
import { toast } from "react-toastify";
import API from "../../API";
import { useHistory } from "react-router-dom";

const PulishRideFormCard = () => {
  const history = useHistory();
  const loginUser = JSON.parse(localStorage.getItem("user") || "null");

  const [passenger, setpassenger] = useState(0);
  const [goingfrom, setGoingfrom] = useState("");
  const [goingto, setGoingto] = useState("");
  const [date, setDate] = useState("");
  const [name, setName] = useState(loginUser?.fullName || "");
  const [email, setEmail] = useState(loginUser?.email || "");
  const [status, setStatus] = useState("Inactive");
  const [phone, setPhone] = useState("");

  const plus = () => {
    setpassenger(passenger + 1);
  };

  const minus = () => {
    setpassenger(Math.max(0, passenger - 1));
  };

  const handleChange = (e) => {
    if (e.target.name === "goingfrom") {
      setGoingfrom(e.target.value);
    } else if (e.target.name === "goingto") {
      setGoingto(e.target.value);
    }
  };

  const publishRideHandle = async (e) => {
    e.preventDefault();

    if (!loginUser) {
      toast.info("Please login to publish a ride", { position: "top-center" });
      history.push("/login");
      return;
    }

    try {
      const { data } = await API.post("publishride", {
        goingfrom,
        goingto,
        name,
        email,
        phone,
        status,
        passenger,
        date,
      });

      if (data) {
        toast.success("Your Ride published successfully...");
        setGoingfrom("");
        setGoingto("");
        setPhone("");
        setpassenger(0);
        setDate("");
      }
    } catch (err) {
      toast.error(err?.response?.data || "Could not publish this ride.");
    }
  };

  return (
    <div data-aos="fade-left" data-aos-duration="1200">
      <h1 className="text-center my-5">Publish Your Ride</h1>
      <form onSubmit={publishRideHandle}>
        <div className="mb-4 input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Going from..."
            name="goingfrom"
            required
            onChange={handleChange}
            value={goingfrom}
          />
        </div>
        <div className="mb-4 input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Going to..."
            name="goingto"
            required
            onChange={handleChange}
            value={goingto}
          />
        </div>
        <div className="mb-4 input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Your Name..."
            name="name"
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>
        <div className="mb-4 input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Your Email Address..."
            name="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="mb-4 input-group">
          <input
            type="number"
            className="form-control"
            placeholder="Your Phone Number..."
            name="phone"
            required
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
          />
        </div>
        <label htmlFor="status" className="">
          The ride status will stay inactive until admin approval.
        </label>
        <div className="mb-4 input-group">
          <select
            className="form-control"
            name="status"
            disabled
            onChange={(e) => setStatus(e.target.value)}
            value={status}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="row">
          <div className="passenger-needed my-4 col-7">
            <span className="me-3">Passenger Needed:</span>
            <AiOutlinePlusCircle className="icon me-3" onClick={plus} />
            <span className="me-3">{passenger}</span>
            <AiOutlineMinusCircle className="me-3 icon" onClick={minus} />
          </div>
          <div className="date col-5 mt-2">
            <input
              type="date"
              name="date"
              required
              onChange={(e) => setDate(e.target.value)}
              value={date}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary primaryBtn">
          Publish Ride
        </button>
      </form>
    </div>
  );
};

export default PulishRideFormCard;
