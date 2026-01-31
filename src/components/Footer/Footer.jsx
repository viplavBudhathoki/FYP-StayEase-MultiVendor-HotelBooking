import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Footer Grid / Main Container */}
      <div className={styles.footerGrid}>

        {/* Brand Section */}
        <div className={styles.footerBrand}>
          <h2>
            Stay<span>Ease</span> {/* Brand Name */}
          </h2>
          <p>
            Making your travel dreams a reality with luxury stays at affordable prices.
          </p>
        </div>

        {/* Company Links Section */}
        <div className={styles.footerColumn}>
          <h4 className={styles.footerTitle}>Company</h4>
          <ul className={styles.footerLinks}>
            <li><a href="/about">About Us</a></li>
            <li><a href="/careers">Careers</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>

        {/* Support Links Section */}
        <div className={styles.footerColumn}>
          <h4 className={styles.footerTitle}>Support</h4>
          <ul className={styles.footerLinks}>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/faqs">FAQs</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>

        {/* Contact Info Section */}
        <div className={styles.footerColumn}>
          <h4 className={styles.footerTitle}>Contact</h4>
          <ul className={styles.footerLinks}>
            <li><a href="mailto:support@stayease.com">support@stayease.com</a></li>
            <li><a href="tel:9800000000">9800000000</a></li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom / Copyright */}
      <div className={styles.footerBottom}>
        <p>&copy; 2026 StayEase. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
