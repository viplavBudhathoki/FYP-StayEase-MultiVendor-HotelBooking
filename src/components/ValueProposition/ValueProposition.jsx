import React from 'react';
import { FiShield, FiTag, FiClock, FiCheckCircle } from 'react-icons/fi';
import styles from './ValueProposition.module.css';

const features = [
  {
    icon: <FiShield />,
    title: 'Secure Booking',
    description: 'We use industry-standard encryption to protect your personal information and payments.'
  },
  {
    icon: <FiTag />,
    title: 'Best Price Guarantee',
    description: 'Find a lower price? We will match it. Enjoy the best rates on thousands of properties.'
  },
  {
    icon: <FiClock />,
    title: '24/7 Support',
    description: 'Our customer support team is available around the clock to help you with any issues.'
  },
  {
    icon: <FiCheckCircle />,
    title: 'Verified Reviews',
    description: 'Real reviews from real guests. We verify all stays to ensure authentic feedback.'
  }
];

const ValueProposition = () => {
  return (
    <section className={styles.valueSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why Choose StayEase?</h2>
          <p className={styles.subtitle}>We provide a seamless and trusted booking experience tailored for you.</p>
        </div>
        
        <div className={styles.grid}>
          {features.map((feature, index) => (
             <div key={index} className={styles.featureCard}>
               <div className={styles.iconWrapper}>
                 {feature.icon}
               </div>
               <h3 className={styles.featureTitle}>{feature.title}</h3>
               <p className={styles.featureDesc}>{feature.description}</p>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
