import FeaturedHotels from "../../components/FeaturedHotels/FeaturedHotels"; // Featured Hotels Section
import Hero from "../../components/Hero/Hero"; // Hero banner section
import "./LandingPage.module.css"; // Page-specific CSS

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Welcome text */}
      <h1>Welcome to StayEase</h1>
      <p>Making your travel dreams easy and affordable!</p>

      {/* Hero section */}
      <Hero/>

      {/* Featured hotels section */}
      <FeaturedHotels/>

      {/* Additional sections can be added here */}
    </div>
  );
};

export default LandingPage;
