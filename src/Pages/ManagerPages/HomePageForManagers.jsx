import React, { useState } from 'react';
import styles from './HomeManagers.module.css';

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
        <div className={styles.heroGradient}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleHighlight}>Sustainable Community</span><br />
            Management Dashboard
          </h1>
          <p className={styles.heroText}>
            Lead your community toward a greener future with our comprehensive sustainability management tools.
          </p>
          <div className={styles.heroButtons}>
            <button 
              className={styles.primaryButton}
              onClick={() => setShowExploreModal(true)}
            >
              <span className={styles.buttonIcon}>📋</span> Explore Initiatives
            </button>
          </div>
        </div>
        <div className={styles.heroIllustration}></div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Management Focus Areas</h2>
        <p className={styles.sectionSubtitle}>Key programs under your supervision</p>
        
        <div className={styles.featuresGrid}>
          {features.map(feature => (
            <div 
              key={feature.id} 
              className={styles.featureCard}
              onClick={() => setActiveFeatureModal(feature.id)}
            >
              <div className={styles.featureIconContainer}>
                <div className={styles.featureIcon}>{feature.icon}</div>
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.description}</p>
              <div className={styles.learnMore}>View Details →</div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.cta}>
        <div className={styles.ctaPattern}></div>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Lead the Change?</h2>
          <p className={styles.ctaText}>
            Access advanced tools to track progress and engage your community.
          </p>
          <button 
            className={styles.ctaButton}
            onClick={() => setShowGetStartedModal(true)}
          >
            <span className={styles.buttonIcon}>🚀</span> Launch Dashboard
          </button>
        </div>
      </section>

      {/* Explore Initiatives Modal */}
      {showExploreModal && (
        <div className={styles.modalOverlay} onClick={() => setShowExploreModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowExploreModal(false)}>
              &times;
            </button>
            <h3 className={styles.modalTitle}>Available Initiatives</h3>
            <div className={styles.modalContent}>
              <div className={styles.initiativeCard}>
                <h4>Community Garden Program</h4>
                <p>Manage urban agriculture projects and track participation</p>
                <div className={styles.stats}>
                  <span>15 Active Locations</span>
                  <span>82% Satisfaction</span>
                </div>
              </div>
              <div className={styles.initiativeCard}>
                <h4>Waste Management</h4>
                <p>Monitor recycling rates and schedule collections</p>
                <div className={styles.stats}>
                  <span>45% Reduction</span>
                  <span>32 Tons Recycled</span>
                </div>
              </div>
              <div className={styles.initiativeCard}>
                <h4>Green Transportation</h4>
                <p>Track EV adoption and bike lane usage</p>
                <div className={styles.stats}>
                  <span>28% Increase</span>
                  <span>1,200 Daily Users</span>
                </div>
              </div>
             
            </div>
          </div>
        </div>
      )}

      {/* Get Started Modal */}
      {showGetStartedModal && (
        <div className={styles.modalOverlay} onClick={() => setShowGetStartedModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowGetStartedModal(false)}>
              &times;
            </button>
            <h3 className={styles.modalTitle}>Management Dashboard Setup</h3>
            <div className={styles.modalContent}>
              <div className={styles.setupSteps}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h4>Connect Your Community</h4>
                    <p>Import resident data or connect to existing systems</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h4>Set Sustainability Goals</h4>
                    <p>Establish targets for waste reduction, energy savings, etc.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h4>Launch Engagement</h4>
                    <p>Schedule events and communication campaigns</p>
                  </div>
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
            <button className={styles.modalClose} onClick={() => setActiveFeatureModal(null)}>
              &times;
            </button>
            <h3 className={styles.modalTitle}>
              {features.find(f => f.id === activeFeatureModal)?.title} Management
            </h3>
            <div className={styles.modalContent}>
              <p>{features.find(f => f.id === activeFeatureModal)?.details}</p>
              
              <div className={styles.managementTools}>
                <h4>Management Tools:</h4>
                <ul>
                  <li>Real-time participation tracking</li>
                  <li>Automated reporting templates</li>
                  <li>Community engagement metrics</li>
                  <li>Resource allocation dashboard</li>
                </ul>
              </div>
              
              <div className={styles.actionButtons}>
          
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;