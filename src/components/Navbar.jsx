// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Images/logo.png";
import { useContext } from "react";
import { AuthContext, useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2"
      : "text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Anda berhasil logout");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Gagal logout");
    }
  };

  return (
    <nav className="bg-indigo-700 border-b border-indigo-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            <NavLink className="flex flex-shrink-0 items-center mr-4" to="/">
              <img className="h-10 w-auto" src={logo} alt="React Jobs" />
              <span className="hidden md:block text-white text-2xl font-bold ml-2">
                React Jobs
              </span>
            </NavLink>
            <div className="md:ml-auto">
              <div className="flex space-x-2 items-center">
                {" "}
                {/* Tambahkan items-center */}
                <NavLink to="/" className={linkClass}>
                  Home
                </NavLink>
                <NavLink to="/jobs" className={linkClass}>
                  Jobs
                </NavLink>
                {/* --- Link Khusus Job Seeker --- */}
                {user && userProfile?.role === "jobSeeker" && (
                  <NavLink to="/my-applications" className={linkClass}>
                    My Applications
                  </NavLink>
                )}
                {/* --- Link Khusus Recruiter --- */}
                {user && userProfile?.role === "recruiter" && (
                  <NavLink to="/add-job" className={linkClass}>
                    Add Job
                  </NavLink>
                )}
                {/* ... (Link Login/Register & Tombol Logout) ... */}
                {/* --- Link Saat Logged Out --- */}
                {!user && (
                  <>
                    <NavLink to="/login" className={linkClass}>
                      Login
                    </NavLink>
                    <NavLink to="/register" className={linkClass}>
                      Register
                    </NavLink>
                  </>
                )}
                {/* --- Tombol Saat Logged In --- */}
                {user && (
                  <span className="text-white px-3 py-2">
                    {" "}
                    {/* Tampilkan email user */}
                    Welcome, {user.email}
                  </span>
                )}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="text-white bg-red-500 hover:bg-red-600 rounded-md px-3 py-2" // Beri warna beda
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
