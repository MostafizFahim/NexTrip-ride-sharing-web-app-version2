import React, { useState, useEffect } from "react";
import Navbar from "../Header/Navbar";
import Footer from "../footer/Footer";
import "../../style/form.css";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import AOS from "aos";
import API from "../../API/localStorageAPI";

const Register = () => {
  const history = useHistory();

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    userType: "",
  });

  const [loading, setLoading] = useState(false);

  const validate = () => {
    const fullName = formData.fullName.trim();
    const userName = formData.userName.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const userType = formData.userType;

    if (!fullName || !userName || !email || !password || !userType) {
      toast.warn("Please fill in all fields.");
      return false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    // Changed to match localStorageAPI requirement
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        userType: formData.userType,
      };

      const { data } = await API.post("user/register", payload);

      // Removed special handling for "already" messages as localStorageAPI
      // consistently returns error responses for these cases
      toast.success("Registered successfully!");

      // Clear form only on success
      setFormData({
        fullName: "",
        userName: "",
        email: "",
        password: "",
        userType: "",
      });
      history.push("/login");
    } catch (err) {
      console.error(err);
      // Use the error message from the API if available
      const errorMsg =
        err.response?.data || "Registration failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false); // Ensure loading is set to false in all cases
    }
  };

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  return (
    <>
      <Navbar />
      <section className="formContainer">
        <div className="container">
          <div className="Register" data-aos="zoom-in" data-aos-duration="1200">
            <h2 className="text-center my-5">Register on NexTrip</h2>

            <form onSubmit={handleRegister} noValidate>
              {/* Full Name */}
              <div className="mb-4 input-group">
                <label htmlFor="fullName" className="visually-hidden">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="form-control"
                  placeholder="Full Name..."
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, fullName: e.target.value }))
                  }
                  autoComplete="name"
                  required
                />
              </div>

              {/* Username */}
              <div className="mb-4 input-group">
                <label htmlFor="userName" className="visually-hidden">
                  Username
                </label>
                <input
                  id="userName"
                  type="text"
                  className="form-control"
                  placeholder="Username..."
                  name="userName"
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, userName: e.target.value }))
                  }
                  autoComplete="username"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4 input-group">
                <label htmlFor="email" className="visually-hidden">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Email..."
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, email: e.target.value }))
                  }
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-4 input-group">
                <label htmlFor="password" className="visually-hidden">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Password..."
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, password: e.target.value }))
                  }
                  autoComplete="new-password"
                  minLength={4}
                  required
                />
              </div>

              {/* User Type */}
              <label htmlFor="userType" className="mb-1">
                Select user type
              </label>
              <select
                id="userType"
                className="mb-4 form-select"
                aria-label="Select user type"
                name="userType"
                value={formData.userType}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, userType: e.target.value }))
                }
                required
              >
                <option value="">-- Select --</option>
                <option value="Passenger">Passenger</option>
                <option value="Driver">Driver</option>
              </select>

              <Link to="/login">
                <p className="alreadyAccount">Already have an account?</p>
              </Link>

              <button
                type="submit"
                className="btn btn-primary primaryBtn"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Register;
