import React from 'react';
import styles from './HomeManager.module.css';

function Home() {
  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Welcome to Our Green Community Manager</h1>
          <p className={styles.heroText}>
            Join us in creating a sustainable future for our city through eco-friendly initiatives and community action.
          </p>
          <div className={styles.heroButtons}>
            
            <button className={styles.primaryButton}>Explore Initiatives</button>
            
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Our Key Focus Areas</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌱</div>
            <h3 className={styles.featureTitle}>Urban Gardening</h3>
            <p className={styles.featureText}>
              Transforming concrete spaces into green oases with community gardens and vertical farming.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>♻️</div>
            <h3 className={styles.featureTitle}>Waste Reduction</h3>
            <p className={styles.featureText}>
              Innovative recycling programs and composting initiatives to minimize landfill waste.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚲</div>
            <h3 className={styles.featureTitle}>Sustainable Transport</h3>
            <p className={styles.featureText}>
              Expanding bike lanes and promoting electric vehicle use for cleaner city mobility.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Make a Difference?</h2>
          <p className={styles.ctaText}>
            Small actions lead to big changes. Start your sustainability journey today.
          </p>
          <button className={styles.ctaButton}>Get Started</button>
        </div>
      </section>
    </div>
  );
}

export default Home;