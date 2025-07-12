import React, { useState } from 'react';
import styles from './Home.module.css';

function Home() {
  // State for modals
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);
  const [activeFeatureModal, setActiveFeatureModal] = useState(null);

  const features = [
    {
      id: 1,
      icon: '🌱',
      title: 'Urban Gardening',
      description: 'Transforming concrete spaces into green oases with community gardens and vertical farming.',
      details: 'Our urban gardening program helps communities convert unused spaces into productive gardens. We provide tools, training, and starter plants to get you growing your own food in the city.'
    },
    {
      id: 2,
      icon: '♻️',
      title: 'Waste Reduction',
      description: 'Innovative recycling programs and composting initiatives to minimize landfill waste.',
      details: 'Learn how to properly sort your waste, set up a home composting system, and participate in our community recycling drives. We make waste reduction easy and rewarding.'
    },
    {
      id: 3,
      icon: '🚲',
      title: 'Sustainable Transport',
      description: 'Expanding bike lanes and promoting electric vehicle use for cleaner city mobility.',
      details: 'Join our bike-share program, learn about EV incentives, or participate in our carpool matching system. We have options for every type of commuter.'
    }
  ];

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Welcome to Our Green User Community</h1>
          <p className={styles.heroText}>
            Join us in creating a sustainable future for our city through eco-friendly initiatives and community action.
          </p>
          <div className={styles.heroButtons}>
            <button 
              className={styles.primaryButton}
              onClick={() => setShowExploreModal(true)}
            >
              Explore Initiatives
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Our Key Focus Areas</h2>
        <div className={styles.featuresGrid}>
          {features.map(feature => (
            <div 
              key={feature.id} 
              className={styles.featureCard}
              onClick={() => setActiveFeatureModal(feature.id)}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.description}</p>
              <div className={styles.learnMore}>Learn more →</div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Make a Difference?</h2>
          <p className={styles.ctaText}>
            Small actions lead to big changes. Start your sustainability journey today.
          </p>
          <button 
            className={styles.ctaButton}
            onClick={() => setShowGetStartedModal(true)}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Explore Initiatives Modal */}
      {showExploreModal && (
        <div className={styles.modalOverlay} onClick={() => setShowExploreModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.modalClose}
              onClick={() => setShowExploreModal(false)}
            >
              &times;
            </button>
            <h3 className={styles.modalTitle}>Available Initiatives</h3>
            <div className={styles.modalContent}>
              <ul className={styles.initiativesList}>
                <li>Community Garden Volunteer Program</li>
                <li>Neighborhood Recycling Challenge</li>
                <li>Bike-to-Work Week Events</li>
                <li>Composting Workshops</li>
                <li>Urban Tree Planting Days</li>
                <li>Eco-Friendly Living Webinars</li>
              </ul>
           
            </div>
          </div>
        </div>
      )}

      {/* Get Started Modal */}
      {showGetStartedModal && (
        <div className={styles.modalOverlay} onClick={() => setShowGetStartedModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.modalClose}
              onClick={() => setShowGetStartedModal(false)}
            >
              &times;
            </button>
            <h3 className={styles.modalTitle}>Begin Your Green Journey</h3>
            <div className={styles.modalContent}>
              <p>Choose how you'd like to get involved:</p>
              <div className={styles.optionsGrid}>
                <div className={styles.optionCard}>
                  <div className={styles.optionIcon}>🌿</div>
                  <h4>Individual Actions</h4>
                  <p>Small changes you can make at home</p>
                </div>
                <div className={styles.optionCard}>
                  <div className={styles.optionIcon}>👥</div>
                  <h4>Community Events</h4>
                  <p>Join group activities and workshops</p>
                </div>
                <div className={styles.optionCard}>
                  <div className={styles.optionIcon}>🏢</div>
                  <h4>Business Programs</h4>
                  <p>Sustainability for organizations</p>
                </div>
                <div className={styles.optionCard}>
                  <div className={styles.optionIcon}>🏫</div>
                  <h4>Education</h4>
                  <p>Learn about environmental issues</p>
                </div>
              </div>
           
            </div>
          </div>
        </div>
      )}

      {/* Feature Detail Modals */}
      {activeFeatureModal && (
        <div className={styles.modalOverlay} onClick={() => setActiveFeatureModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.modalClose}
              onClick={() => setActiveFeatureModal(null)}
            >
              &times;
            </button>
            <h3 className={styles.modalTitle}>
              {features.find(f => f.id === activeFeatureModal)?.title}
            </h3>
            <div className={styles.modalContent}>
              <p>{features.find(f => f.id === activeFeatureModal)?.details}</p>
              <div className={styles.actionSteps}>
                <h4>How to Get Involved:</h4>
                <ol>
                  <li>Attend an orientation session</li>
                  <li>Sign up for our newsletter</li>
                  <li>Join a local group</li>
                  <li>Start implementing changes</li>
                </ol>
              </div>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;