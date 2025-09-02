import React, { useState, useEffect } from "react";
import { FaUserAlt, FaEye } from "react-icons/fa";
import Footer from "../footer/Footer";
import Navbar from "../Header/Navbar";
import "../../style/form.css";
import { useHistory, Link } from "react-router-dom";
import { toast } from "react-toastify";
import AOS from "aos";
// Use the LocalStorage mock API
import API from "../../API/localStorageAPI";

const Login = () => {
  const history = useHistory();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    const email = String(formData.email || "").trim();
    const password = String(formData.password || "");

    if (!email || !password) {
      toast.warn("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("user/login", { email, password });
      // data: { token, user }

      // Keep your legacy keys (if other parts of your app read these)
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Optional: if you want a "session only" login when remember is off
      if (!remember) {
        // mirror to sessionStorage for current tab
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      // Route by role (from the seeded mock: admin/driver/passenger)
      const role = (data.user.role || "").toLowerCase();
      if (role === "admin") {
        history.push("/admin-dashboard");
      } else if (role === "driver") {
        history.push("/driver-dashboard"); // change if your route differs
      } else {
        history.push("/user-dashboard");
      }
    } catch (err) {
      const msg =
        err?.response?.data ||
        err?.message ||
        "Login failed. Please check your credentials.";
      toast.error(msg, { position: "top-center" });
    } finally {
      setLoading(false);
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
          <div className="Login" data-aos="flip-right" data-aos-duration="1000">
            <h1>Welcome Back !</h1>
            <h2 className="text-start my-4">Login to your Account</h2>

            <form onSubmit={handleLogin} noValidate>
              <div className="mb-4 input-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your Email..."
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, email: e.target.value }))
                  }
                  required
                  autoComplete="email"
                />
                <FaUserAlt className="loginIon" />
              </div>

              <div
                className="mb-4 input-group"
                style={{ position: "relative" }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Password..."
                  autoComplete="current-password"
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, password: e.target.value }))
                  }
                  required
                />
                <FaEye
                  className="loginIon"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? "Hide password" : "Show password"}
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>

              <Link to="/">
                <p className="forgot">Forgot Password</p>
              </Link>

              <button
                type="submit"
                className="btn btn-primary primaryBtn"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <Link to="/register">
                <p className="alreadyAccount">Not have Account yet ?</p>
              </Link>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Login;
