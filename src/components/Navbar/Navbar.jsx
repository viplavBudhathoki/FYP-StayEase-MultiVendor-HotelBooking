import styles from './Navbar.module.css';
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      
      {/* Logo / Brand */}
      <a href="/" className={styles.navbarLogo}>
        Stay<span>Ease</span>
      </a>

      {/* Navigation Links */}
      <div className={styles.navbarLinks}>
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            isActive ? `${styles.navLinks} ${styles.navLinks.active}` : styles.navLinks
          }
        >
          Home
        </NavLink>

        <NavLink 
          to="/hotels" 
          className={({ isActive }) => 
            isActive ? `${styles.navLinks} ${styles.navLinks.active}` : styles.navLinks
          }
        >
          Hotels
        </NavLink>

        <NavLink 
          to="/about" 
          className={({ isActive }) => 
            isActive ? `${styles.navLinks} ${styles.navLinks.active}` : styles.navLinks
          }
        >
          About Us
        </NavLink>

        <NavLink 
          to="/contact" 
          className={({ isActive }) => 
            isActive ? `${styles.navLinks} ${styles.navLinks.active}` : styles.navLinks
          }
        >
          Contact Us
        </NavLink>
      </div>

      {/* Action Buttons */}
      <div className={styles.navbarActions}>
        <button className={styles.btnLogin}>Log in</button>
        <button className={styles.btnSignup}>Sign Up</button>
      </div>

    </nav>
  );
};

export default Navbar;
