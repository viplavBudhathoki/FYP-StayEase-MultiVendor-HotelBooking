import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/footer";
import LandingPage from "./pages/LandingPage/LandingPage";
import Register from "./pages/register/register";
import Login from "./pages/login/login";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Open modal based on current path
  const showLogin = location.pathname === "/login";
  const showRegister = location.pathname === "/register";

  // Close modal by going back to home
  const handleClose = () => navigate("/");
  const handleSwitchToRegister = () => navigate("/register");
  const handleSwitchToLogin = () => navigate("/login");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <Navbar
        onLoginClick={() => navigate("/login")}
        onSignUpClick={() => navigate("/register")}
      />

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Landing page always rendered */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LandingPage />} />
          <Route path="/register" element={<LandingPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Login/Register Modals */}
      {showLogin && (
        <Login
          onClose={handleClose}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}
      {showRegister && (
        <Register
          onClose={handleClose}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  );
};

export default App;
