import React, { useEffect, useMemo, useState } from "react";
import Footer from "../footer/Footer";
import Navbar from "../Header/Navbar";
import "./search.css";
import { useHistory, Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { toast } from "react-toastify";
import API from "../../API";

const BookingRide = () => {
  const history = useHistory();
  const rideDetails = history.location.state || null;
  const loggedInUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );
  const [publisherId, setPublisherId] = useState("");
  const [passenger, setPassenger] = useState(
    rideDetails?.formData?.passengerNeeded || 1
  );

  const [formData, setFormData] = useState({
    goingfrom: rideDetails?.goingfrom || "",
    goingto: rideDetails?.goingto || "",
    passenger: rideDetails?.formData?.passengerNeeded || 1,
    rideStatus: rideDetails?.status || "Active",
    rideDate: rideDetails?.date || "",
    requestStatus: "Pending",
    bookerEmail: loggedInUser?.email || "",
    bookerId: loggedInUser?._id || loggedInUser?.id || "",
    rideId: rideDetails?.publishRideId || "",
  });

  useEffect(() => {
    const getPublisherDetails = async () => {
      if (!rideDetails?.email) return;

      try {
        const { data } = await API.get("user/register");
        const publisher = data.find((user) => user.email === rideDetails.email);
        setPublisherId(publisher?._id || publisher?.id || "");
      } catch (error) {
        console.log(error);
      }
    };

    getPublisherDetails();
  }, [rideDetails]);

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      passenger,
    }));
  }, [passenger]);

  const addBookerToConversation = async () => {
    if (!publisherId || !formData.bookerId) return;

    await API.post("conversations", {
      senderId: formData.bookerId,
      receiverId: publisherId,
    });
  };

  const handleRideBooking = async (e) => {
    e.preventDefault();

    if (!loggedInUser) {
      toast.info("Please login to book a ride", { position: "top-center" });
      history.push("/login");
      return;
    }

    if (!publisherId) {
      toast.error("Ride publisher could not be found.");
      return;
    }

    try {
      const { data } = await API.post("requestride", {
        goingfrom: formData.goingfrom,
        goingto: formData.goingto,
        passenger: formData.passenger,
        rideStatus: formData.rideStatus,
        bookingDate: formData.rideDate,
        requestStatus: formData.requestStatus,
        bookerEmail: formData.bookerEmail,
        publisherId,
        bookerId: formData.bookerId,
        rideId: formData.rideId,
      });

      await addBookerToConversation();
      toast.success(data);
      history.push("/user-dashboard/my-ride-requests");
    } catch (err) {
      toast.error(err?.response?.data || "Could not book this ride.");
    }
  };

  if (!rideDetails) {
    return (
      <>
        <Navbar />
        <section>
          <div className="container">
            <div className="bookingRide text-center">
              <h2>No ride selected</h2>
              <p>Choose a ride first, then you can book it from this page.</p>
              <Link to="/availablerides" className="btn primaryBtn">
                See Available Rides
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section>
        <div className="container">
          <div className="contact">
            <div className=" contactCol1">
              <h1>Book your Ride</h1>
              <p>Send a request to the ride publisher for local approval.</p>
            </div>
            <div className=" contactCol2">
              <form onSubmit={handleRideBooking}>
                <div className="row inputs">
                  <div className="col-12 col-lg-6 mb-4">
                    <label htmlFor="goingfrom" className="form-label">
                      Going From
                    </label>
                    <input
                      id="goingfrom"
                      type="text"
                      className="form-control"
                      name="goingfrom"
                      onChange={(e) =>
                        setFormData({ ...formData, goingfrom: e.target.value })
                      }
                      value={formData.goingfrom}
                    />
                  </div>
                  <div className="col-12 col-lg-6 mb-4">
                    <label htmlFor="goingto" className="form-label">
                      Going To
                    </label>
                    <input
                      id="goingto"
                      type="text"
                      className="form-control"
                      name="goingto"
                      onChange={(e) =>
                        setFormData({ ...formData, goingto: e.target.value })
                      }
                      value={formData.goingto}
                    />
                  </div>
                  <div className="col-12 col-lg-6 mb-4">
                    <label htmlFor="passenger" className="form-label">
                      Passengers
                    </label>
                    <input
                      id="passenger"
                      type="number"
                      min="1"
                      className="form-control"
                      name="passenger"
                      onChange={(e) => setPassenger(Number(e.target.value))}
                      value={passenger}
                    />
                  </div>
                  <div className="col-12 col-lg-6 mb-4">
                    <label htmlFor="rideStatus" className="form-label">
                      Ride Status
                    </label>
                    <input
                      id="rideStatus"
                      type="text"
                      className="form-control"
                      name="rideStatus"
                      value={formData.rideStatus}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-lg-12 mb-4">
                    <label htmlFor="bookingDate" className="form-label">
                      Ride Date
                    </label>
                    <input
                      id="bookingDate"
                      type="text"
                      className="form-control"
                      name="bookingDate"
                      value={formData.rideDate}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-lg-12 mb-4">
                    <label htmlFor="bookerEmail" className="form-label">
                      Your Email
                    </label>
                    <input
                      id="bookerEmail"
                      type="email"
                      className="form-control"
                      name="bookerEmail"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookerEmail: e.target.value,
                        })
                      }
                      value={formData.bookerEmail}
                    />
                  </div>

                  <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-primary primaryBtn">
                      Book Ride
                    </button>
                  </div>
                  <Link to="/availablerides" className="mt-4">
                    <p>
                      <BsArrowLeft /> Go back to available rides
                    </p>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default BookingRide;
