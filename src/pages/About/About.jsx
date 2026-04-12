import { ShieldCheck, Hotel, Users, BadgeCheck } from "lucide-react";
import styles from "./About.module.css";

const About = () => {
  const features = [
    {
      icon: <Hotel size={28} />,
      title: "Curated Hotel Selection",
      description:
        "We bring together quality stays across Nepal so travelers can find comfort, convenience, and value in one place.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Trusted Booking Experience",
      description:
        "Our platform is designed to make hotel discovery and booking simple, secure, and reliable for every customer.",
    },
    {
      icon: <Users size={28} />,
      title: "Customer-Centered Service",
      description:
        "We focus on user experience, transparent information, and helpful support throughout the booking journey.",
    },
    {
      icon: <BadgeCheck size={28} />,
      title: "Verified Quality",
      description:
        "We aim to maintain trusted hotel listings, clear details, and authentic experiences that travelers can depend on.",
    },
  ];

  const stats = [
    { value: "100+", label: "Hotel Listings" },
    { value: "1,000+", label: "Happy Bookings" },
    { value: "24/7", label: "Customer Support Vision" },
    { value: "Nepal", label: "Focused Destination" },
  ];

  return (
    <div className={styles.aboutPage}>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <span className={styles.badge}>About StayEase</span>
          <h1 className={styles.heroTitle}>
            Making hotel booking simpler, smarter, and more trustworthy
          </h1>
          <p className={styles.heroText}>
            StayEase is built to help travelers discover quality stays with confidence.
            From browsing hotels to comparing rooms and planning bookings, our goal is
            to create a smooth and modern hospitality experience.
          </p>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <div className={styles.storyCard}>
              <h2>Our Story</h2>
              <p>
                StayEase was created with the idea that booking accommodation should
                feel effortless. Instead of making travelers search through scattered
                information, we bring hotel listings, room details, pricing, and
                booking flow together in one organized platform.
              </p>
              <p>
                We want to bridge the gap between customers looking for dependable
                stays and hotel vendors who want a better digital presence. The result
                is a platform that supports both smooth booking experiences and strong
                hotel management.
              </p>
            </div>

            <div className={styles.storyCard}>
              <h2>Our Mission</h2>
              <p>
                Our mission is to provide a user-friendly hotel booking platform that
                delivers convenience, trust, and clarity for customers while helping
                hotels manage rooms and bookings more efficiently.
              </p>

              <h2 className={styles.secondaryTitle}>Our Vision</h2>
              <p>
                We aim to become a trusted hospitality platform that makes discovering
                and booking stays across Nepal easier, more transparent, and more
                enjoyable for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Why StayEase?</h2>
            <p>
              We focus on combining ease of use, trust, and practical hotel booking
              features in one platform.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.iconWrap}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((item, index) => (
              <div key={index} className={styles.statCard}>
                <h3>{item.value}</h3>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;