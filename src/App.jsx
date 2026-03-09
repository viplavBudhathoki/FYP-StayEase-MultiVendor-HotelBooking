// React Router utilities
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";

// Toast notification provider
import { Toaster } from "react-hot-toast";

// ===== Public components =====
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import LandingPage from "./pages/LandingPage/LandingPage";
import Register from "./pages/register/register";
import Login from "./pages/Login/Login";
import Hotels from "./pages/Hotels/Hotels";
import HotelRooms from "./pages/HotelRooms/HotelRooms";

// ===== Vendor dashboard components =====
import VendorLayout from "./Vendor/VendorLayout";
import Dashboard from "./Vendor/Pages/Dashboard/Dashboard";
import Rooms from "./Vendor/Pages/Rooms/Rooms";
import Analysis from "./Vendor/Pages/Analysis/Analysis";
import Offers from "./Vendor/Pages/Offers/Offers";
import Bookings from "./Vendor/Pages/Bookings/Bookings";
import Notifications from "./Vendor/Pages/Notifications/Notifications";
import Settings from "./Vendor/Pages/Settings/Settings";

import VendorHotels from "./Vendor/Pages/Hotels/Hotels";
import HotelRooms from "./Vendor/Pages/HotelRooms/HotelRooms";

// ===== Admin dashboard components =====
import AdminLayout from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/Pages/Dashboard/AdminDashboard";
import Hotels from "./Admin/Pages/Hotels/Hotels";
import AdminVendors from "./Admin/Pages/Vendors/AdminVendors";
import AdminUsers from "./Admin/Pages/Users/AdminUsers";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const showLogin = location.pathname === "/login";
  const showRegister = location.pathname === "/register";

  const isVendor = user?.role === "vendor";
  const isAdmin = user?.role === "admin";

  const handleClose = () => navigate("/");
  const handleSwitchToRegister = () => navigate("/register");
  const handleSwitchToLogin = () => navigate("/login");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Toast */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Navbar (Only for Public Users) */}
      {!isVendor && !isAdmin && (
        <Navbar
          onLoginClick={() => navigate("/login")}
          onSignUpClick={() => navigate("/register")}
        />
      )}

      <main style={{ flex: 1 }}>
        <Routes>

          {/* ===== Public Routes ===== */}
          {!isVendor && !isAdmin && (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LandingPage />} />
              <Route path="/register" element={<LandingPage />} />
            </>
          )}

          {/* ===== Vendor Routes ===== */}
          {isVendor && (
            <Route path="/vendor/*" element={<VendorLayout />}>
              <Route index element={<Dashboard />} />

              {/* My Hotels */}
              <Route path="hotels" element={<VendorHotels />} />

              {/* Rooms inside selected hotel */}
              <Route path="hotels/:hotelId/rooms" element={<HotelRooms />} />

              {/* Room Status page (Sidebar link /vendor/rooms) */}
              <Route path="rooms" element={<Rooms />} />

              <Route path="/hotels" element={<Hotels />} />
              <Route path="/hotels/:hotelId/rooms" element={<HotelRooms />} />

              <Route path="bookings" element={<Bookings />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="offers" element={<Offers />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          )}

          {/* ===== Admin Routes ===== */}
          {isAdmin && (
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="hotels" element={<Hotels />} />

              <Route path="vendors" element={<AdminVendors />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          )}
          {/* ===== Redirect Unknown Routes ===== */}
          <Route
            path="*"
            element={
              isAdmin
                ? <Navigate to="/admin" replace />
                : isVendor
                ? <Navigate to="/vendor" replace />
                : <Navigate to="/" replace />
            }
          />

        </Routes>
      </main>

      {/* Footer (Only for Public Users) */}
      {!isVendor && !isAdmin && <Footer />}

      {/* ===== Login & Register Modals (Public Only) ===== */}
      {!isVendor && !isAdmin && showLogin && (
        <Login
          onClose={handleClose}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}

      {!isVendor && !isAdmin && showRegister && (
        <Register
          onClose={handleClose}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  );
};

export default App;
