import Navbar from "./components/Navbar/Navbar"; // Top navigation bar
import Footer from "./components/Footer/footer"; // Bottom footer
import LandingPage from "./pages/LandingPage/LandingPage"; // Main landing page content

const App = () => {
  return (
    <div
      style={{
        minHeight: "100vh", // Full viewport height
        display: "flex",
        flexDirection: "column", // Stack navbar, main, footer
      }}
    >
      {/* Navbar always at top */}
      <Navbar />

      {/* Main content grows to fill remaining space */}
      <main style={{ flex: 1 }}>
        <LandingPage />
      </main>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
};

export default App;
