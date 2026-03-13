import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Public components 
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import LandingPage from "./pages/LandingPage/LandingPage";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import PublicHotels from "./pages/Hotels/Hotels";
import PublicHotelRooms from "./pages/HotelRooms/HotelRooms";
import MyBookings from "./pages/MyBookings/MyBookings";

// Vendor dashboard components 
import VendorLayout from "./Vendor/VendorLayout";
import Dashboard from "./Vendor/Pages/Dashboard/Dashboard";
import Rooms from "./Vendor/Pages/Rooms/Rooms";
import Analysis from "./Vendor/Pages/Analysis/Analysis";
import Offers from "./Vendor/Pages/Offers/Offers";
import Bookings from "./Vendor/Pages/Bookings/Bookings";
import Notifications from "./Vendor/Pages/Notifications/Notifications";
import Settings from "./Vendor/Pages/Settings/Settings";
import VendorHotels from "./Vendor/Pages/Hotels/Hotels";
import VendorHotelRooms from "./Vendor/Pages/HotelRooms/HotelRooms";

// Admin dashboard components
import AdminLayout from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/Pages/Dashboard/AdminDashboard";
import AdminHotels from "./Admin/Pages/Hotels/Hotels";
import AdminVendors from "./Admin/Pages/Vendors/AdminVendors";
import AdminUsers from "./Admin/Pages/Users/AdminUsers";
import AdminBookings from "./Admin/Pages/Bookings/AdminBookings";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const showLogin = location.pathname === "/login";
  const showRegister = location.pathname === "/register";

  const isVendor = user?.role === "vendor";
  const isAdmin = user?.role === "admin";

  const handleClose = () => navigate(location.state?.from || "/");

  const handleSwitchToRegister = () =>
    navigate("/register", {
      state: { from: location.state?.from || location.pathname || "/" },
    });

  const handleSwitchToLogin = () =>
    navigate("/login", {
      state: { from: location.state?.from || "/" },
    });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Toaster position="top-center" reverseOrder={false} />

      {!isVendor && !isAdmin && (
        <Navbar
          onLoginClick={() => navigate("/login")}
          onSignUpClick={() => navigate("/register")}
        />
      )}

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Routes */}
          {!isVendor && !isAdmin && (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LandingPage />} />
              <Route path="/register" element={<LandingPage />} />

              <Route path="/hotels" element={<PublicHotels />} />
              <Route path="/hotels/:hotelId/rooms" element={<PublicHotelRooms />} />

              <Route
                path="/my-bookings"
                element={
                  user?.role === "user" ? <MyBookings /> : <Navigate to="/login" replace />
                }
              />
            </>
          )}

          {/* ===== Vendor Routes ===== */}
          {isVendor && (
            <Route path="/vendor/*" element={<VendorLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="hotels" element={<VendorHotels />} />
              <Route path="hotels/:hotelId/rooms" element={<VendorHotelRooms />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="offers" element={<Offers />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          )}

          {/* Admin Routes */}
          {isAdmin && (
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="hotels" element={<AdminHotels />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="bookings" element={<AdminBookings />} />
            </Route>
          )}

          {/* Redirect Unknown Routes */}
          <Route
            path="*"
            element={
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : isVendor ? (
                <Navigate to="/vendor" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>

      {!isVendor && !isAdmin && <Footer />}

      {!isVendor && !isAdmin && showLogin && (
        <Login onClose={handleClose} onSwitchToRegister={handleSwitchToRegister} />
      )}

      {!isVendor && !isAdmin && showRegister && (
        <Register onClose={handleClose} onSwitchToLogin={handleSwitchToLogin} />
      )}
    </div>
  );
};

export default App;