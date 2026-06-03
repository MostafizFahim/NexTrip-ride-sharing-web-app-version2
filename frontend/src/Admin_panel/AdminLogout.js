import { useEffect } from "react";
import { toast } from "react-toastify";

const AdminLogout = () => {
  useEffect(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("nextrip:auth");
    toast.success("You are successfully logged out...", {
      position: "top-center",
    });
    window.location.href = "/";
  }, []);

  return null;
};

export default AdminLogout;
