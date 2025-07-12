import React, { useState } from 'react';
import styles from '../ManagerPages/HomeManager.module.css';

function Home() {
  // State for modals
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [showEfficiencyModal, setShowEfficiencyModal] = useState(false);
  const [showEcoModal, setShowEcoModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleHighlight}>Efficient Routes,</span><br />
            Sustainable Deliveries
          </h1>
          <p className={styles.heroText}>
            Join our network of eco-conscious drivers making a difference on every mile.
            Optimize your routes, reduce emissions, and earn rewards for green driving.
          </p>
          <div className={styles.heroButtons}>
            <button 
              className={`${styles.primaryButton} ${styles.withIcon}`}
              onClick={() => setShowStatsModal(true)}
            >
              <span className={styles.buttonIcon}>📊</span> View My Stats
            </button>
            <button 
              className={`${styles.secondaryButton} ${styles.withIcon}`}
              onClick={() => setShowRouteModal(true)}
            >
              <span className={styles.buttonIcon}>🛣️</span> Plan Route
            </button>
          </div>
        </div>
        <div className={styles.heroImage}></div>
      </section>

      {/* Dashboard Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Your Driving Dashboard</h2>
        <p className={styles.sectionSubtitle}>Tools to help you drive smarter and greener</p>
        
        <div className={styles.featuresGrid}>
          <div 
            className={`${styles.featureCard} ${styles.cardHover}`}
            onClick={() => setShowEfficiencyModal(true)}
          >
            <div className={styles.featureIconContainer}>
              <div className={styles.featureIcon}>⛽</div>
            </div>
            <h3 className={styles.featureTitle}>Fuel Efficiency</h3>
            <p className={styles.featureText}>
              Real-time monitoring and tips to improve your MPG and reduce fuel consumption.
            </p>
            <div className={styles.featureProgress}>
              <div className={styles.progressBar} style={{width: '78%'}}></div>
              <span>78% Efficiency</span>
            </div>
          </div>
          
          <div 
            className={`${styles.featureCard} ${styles.cardHover}`}
            onClick={() => setShowEcoModal(true)}
          >
            <div className={styles.featureIconContainer}>
              <div className={styles.featureIcon}>🌿</div>
            </div>
            <h3 className={styles.featureTitle}>Eco-Score</h3>
            <p className={styles.featureText}>
              Track your environmental impact with our proprietary Eco-Score system.
            </p>
            <div className={styles.featureBadge}>
              <span className={styles.badgeValue}>A-</span>
              <span>Current Rating</span>
            </div>
          </div>
          
          <div 
            className={`${styles.featureCard} ${styles.cardHover}`}
            onClick={() => setShowRewardsModal(true)}
          >
            <div className={styles.featureIconContainer}>
              <div className={styles.featureIcon}>🏆</div>
            </div>
            <h3 className={styles.featureTitle}>Driver Rewards</h3>
            <p className={styles.featureText}>
              Earn points for sustainable driving that convert to real benefits.
            </p>
            <div className={styles.featurePoints}>
              <span className={styles.pointsValue}>1,250</span>
              <span>Points This Month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Preview Section */}
      <section className={styles.statsPreview}>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>4,328</div>
            <div className={styles.statLabel}>Miles Driven</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>78%</div>
            <div className={styles.statLabel}>Fuel Efficiency</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>2.1T</div>
            <div className={styles.statLabel}>CO₂ Saved</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>#42</div>
            <div className={styles.statLabel}>Company Rank</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.cta}>
        <div className={styles.ctaPattern}></div>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Upgrade Your Driving Experience?</h2>
          <p className={styles.ctaText}>
            Connect with our network of sustainable shippers and access premium green routes.
          </p>
          <div className={styles.ctaButtons}>
            <button 
              className={`${styles.ctaButton} ${styles.ctaPrimary}`}
              onClick={() => setShowFleetModal(true)}
            >
              Join Green Fleet
            </button>
            <button 
              className={`${styles.ctaButton} ${styles.ctaSecondary}`}
              onClick={() => setShowLearnModal(true)}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* All Modals */}
      {/* Stats Modal */}
      {showStatsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowStatsModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowStatsModal(false)}>
              &times;
            </button>
            <h3 className={styles.modalTitle}>Your Driving Performance</h3>
            <div className={styles.modalContent}>
              <div className={styles.driverStats}>
                <div className={styles.statRow}>
                  <span>Miles Driven:</span>
                  <strong>4,328 mi</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Fuel Efficiency:</span>
                  <strong>78% (Top 20%)</strong>
                </div>
                <div className={styles.statRow}>
                  <span>CO₂ Saved:</span>
                  <strong>2.1 Tons</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Company Rank:</span>
                  <strong>#42 of 250</strong>
                </div>
              </div>
              <div className={styles.tipSection}>
                <br></br>
                <h4>Tips to Improve:</h4>
                <ul>
                  <li>Reduce idling time by 15% to gain 3 efficiency points</li>
                  <li>Your acceleration pattern could save 2% more fuel</li>
                  <li>Try our suggested routes for better efficiency</li>
                </ul>
              </div>
           
            </div>
          </div>
        </div>
      )}

     {/* Route Planning Modal (View Only) */}
{showRouteModal && (
  <div className={styles.modalOverlay} onClick={() => setShowRouteModal(false)}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <button className={styles.modalClose} onClick={() => setShowRouteModal(false)}>
        &times;
      </button>
      <h3 className={styles.modalTitle}>Route Details</h3>
      <div className={styles.modalContent}>
        <div className={styles.routeForm}>
          <div className={styles.formGroup}>
            <label>Starting Location</label>
            <p className={styles.readOnlyValue}>Cairo Central Depot</p>
          </div>
          <div className={styles.formGroup}>
            <label>Destination</label>
            <p className={styles.readOnlyValue}>Alexandria Distribution Center</p>
          </div>
          <div className={styles.formGroup}>
            <label>Vehicle Type</label>
            <p className={styles.readOnlyValue}>Medium Duty Truck</p>
          </div>
          <div className={styles.preferenceOptions}>
            <h4>Route Preferences:</h4>
            <ul className={styles.readOnlyList}>
              <li>✓ Most Fuel Efficient</li>
              <li>✗ Avoid Toll Roads</li>
              <li>✓ Eco-Friendly Stops</li>
              <li>✗ Avoid Urban Centers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Fuel Efficiency Modal */}
      {showEfficiencyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEfficiencyModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowEfficiencyModal(false)}>
              &times;
            </button>
            <h3 className={styles.modalTitle}>Fuel Efficiency Analytics</h3>
            
            <div className={styles.modalContent}>
              <div className={styles.efficiencyMeter}>
                <div className={styles.meterVisual} style={{'--percentage': '78%'}}>
                  <div className={styles.meterFill}></div>
                  <div className={styles.meterText}>78% Efficiency</div>
                </div>
                <div className={styles.meterLegend}>
                  <span>Poor</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
                <br></br>
              </div>
              <div className={styles.efficiencyTips}>
                <h4>Personalized Recommendations:</h4>
                <ul>
                  <li>Reduce highway speed by 5mph to save 7% fuel</li>
                  <li>Your idling time is 12% higher than fleet average</li>
                  <li>Shift gears 200 RPM sooner for better efficiency</li>
                  <li>Check tire pressure (last checked 3 weeks ago)</li>
                </ul>
                <br></br>
              </div>
              <div className={styles.efficiencyComparison}>
                <div className={styles.comparisonItem}>
                  <span>Your Efficiency</span>
                  <strong>78%</strong>
                </div>
                <div className={styles.comparisonItem}>
                  <span>Fleet Average</span>
                  <strong>72%</strong>
                </div>
                <div className={styles.comparisonItem}>
                  <span>Top Performers</span>
                  <strong>85%</strong>
                </div>
              </div>
           
            </div>
          </div>
        </div>
      )}

      {/* Eco-Score Modal */}
      {showEcoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEcoModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowEcoModal(false)}>
              &times;
            </button>
            <h3 className={styles.modalTitle}>Your Eco-Score Breakdown</h3>
            <div className={styles.modalContent}>
              <div className={styles.ecoScoreDisplay}>
                <div className={styles.ecoBadge}>A-</div>
                <div className={styles.ecoDescription}>
                  <p>You're in the <strong>top 25%</strong> of eco-friendly drivers!</p>
                  <p>Keep up the good work to maintain your Gold Tier status.</p>
                </div>
              </div>
              <div className={styles.scoreComponents}>
                <h4>Score Components:</h4>
                <div className={styles.scoreMeter}>
                  <span>Fuel Efficiency</span>
                  <div className={styles.meterTrack}>
                    <div className={styles.meterFill} style={{width: '85%'}}></div>
                    <span>85%</span>
                  </div>
                </div>
                <div className={styles.scoreMeter}>
                  <span>Idling Time</span>
                  <div className={styles.meterTrack}>
                    <div className={styles.meterFill} style={{width: '72%'}}></div>
                    <span>72%</span>
                  </div>
                </div>
                <div className={styles.scoreMeter}>
                  <span>Route Optimization</span>
                  <div className={styles.meterTrack}>
                    <div className={styles.meterFill} style={{width: '91%'}}></div>
                    <span>91%</span>
                  </div>
                </div>
                <div className={styles.scoreMeter}>
                  <span>Vehicle Maintenance</span>
                  <div className={styles.meterTrack}>
                    <div className={styles.meterFill} style={{width: '68%'}}></div>
                    <span>68%</span>
                  </div>
                </div>
              </div>
            
            </div>
          </div>
        </div>
      )}

      {/* Rewards Modal */}
      {showRewardsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRewardsModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowRewardsModal(false)}>
              &times;
            </button>
            <h3 className={styles.modalTitle}>Your Rewards & Benefits</h3>
            <div className={styles.modalContent}>
              <div className={styles.pointsSummary}>
                <div className={styles.pointsTotal}>
                  <span>Total Points</span>
                  <strong>1,250</strong>
                </div>
                <div className={styles.pointsProgress}>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{width: '42%'}}></div>
                  </div>
                  <span>42% to next reward tier</span>
                </div>
              </div>
              <div className={styles.rewardsGrid}>
                <div className={styles.rewardCard}>
                  <div className={styles.rewardIcon}>⛽</div>
                  <h4>Fuel Discount</h4>
                  <p>5% off at participating stations</p>
                  <span className={styles.rewardCost}>500 pts</span>
                </div>
                <div className={styles.rewardCard}>
                  <div className={styles.rewardIcon}>🛏️</div>
                  <h4>Rest Stop Bonus</h4>
                  <p>Free premium parking at partner stops</p>
                  <span className={styles.rewardCost}>750 pts</span>
                </div>
                <div className={styles.rewardCard}>
                  <div className={styles.rewardIcon}>🍽️</div>
                  <h4>Meal Voucher</h4>
                  <p>$15 at truck stop restaurants</p>
                  <span className={styles.rewardCost}>1,000 pts</span>
                </div>
                <div className={styles.rewardCard}>
                  <div className={styles.rewardIcon}>💰</div>
                  <h4>Cash Bonus</h4>
                  <p>$50 direct deposit</p>
                  <span className={styles.rewardCost}>2,500 pts</span>
                </div>
              </div>
              <div className={styles.earnMore}>
                <h4>Ways to Earn More Points:</h4>
                <ul>
                  <li>+50 pts for each 100 eco-friendly miles</li>
                  <li>+100 pts for completing training modules</li>
                  <li>+200 pts for referring another driver</li>
                  <li>Bonus points for top monthly performers</li>
                </ul>
              </div>
             
            </div>
          </div>
        </div>
      )}

      {/* Green Fleet Modal */}
      {showFleetModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFleetModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowFleetModal(false)}>
              &times;
            </button>
            <h3 className={styles.modalTitle}>Join Our Green Fleet Program</h3>
            <div className={styles.modalContent}>
              <div className={styles.fleetBenefits}>
                <h4>Exclusive Benefits:</h4>
                <ul>
                  <li>Priority access to high-paying sustainable shipments</li>
                  <li>Exclusive fuel discounts (up to 15% off)</li>
                  <li>Free maintenance checks at partner locations</li>
                  <li>Double rewards points on all eco-friendly miles</li>
                  <li>Advanced route optimization tools</li>
                </ul>
              </div>
              <div className={styles.requirements}>
                <h4>Requirements:</h4>
                <ul>
                  <li>Maintain B+ or better Eco-Score</li>
                  <li>Minimum 5,000 miles/month</li>
                  <li>Complete sustainability training</li>
                  <li>Regular vehicle maintenance checks</li>
                </ul>
              </div>
            
           
            
            </div>
          </div>
        </div>
      )}

      {/* Learn More Modal */}
      {showLearnModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLearnModal(false)}>
          <div className={`${styles.modal} ${styles.wideModal}`} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowLearnModal(false)}>
              &times;
            </button>
            <h3 className={styles.modalTitle}>Sustainable Trucking Initiative</h3>
            <div className={styles.modalContent}>
              <div className={styles.infoTabs}>
                <div className={styles.infoTab}>
                  <h4>How It Works</h4>
                  <p>
                    Our program uses advanced telematics to monitor driving patterns
                    and suggest improvements that reduce fuel consumption and emissions
                    without sacrificing delivery times.
                  </p>
                </div>
                <div className={styles.infoTab}>
                  <h4>Technology</h4>
                  <p>
                    We equip trucks with IoT sensors that track acceleration, braking,
                    idling, and route efficiency. This data powers our real-time
                    recommendations and scoring system.
                  </p>
                </div>
                <div className={styles.infoTab}>
                  <h4>Environmental Impact</h4>
                  <p>
                    Participating drivers have reduced CO₂ emissions by an average of
                    18% while maintaining 99% on-time delivery rates. Together we've
                    saved over 50,000 tons of emissions this year.
                  </p>
                </div>
              </div>
              <div className={styles.videoPlaceholder}>
                <p>📺 Video: How our system helps drivers succeed</p>
              </div>
            
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;