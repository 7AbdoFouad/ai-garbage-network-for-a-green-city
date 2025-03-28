import React, { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import styles from "./RewardsPage.module.css";
import { useParams } from "react-router-dom";
import RewordPopUp from "./RewordPopUp";

export default function RewardsPage() {
  const { Rewards, fetchUser } = useUser();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await fetchUser(id);
      if (res) {
        setUser(res);
      }
    };
    fetchUserData();
  }, [id, fetchUser]);

  useEffect(() => {
    setAvailableRewards(Rewards);
  }, [Rewards]);

  const isEligible = (reward) => {
    if (!user) return false;
    const req = reward.rewardRequirements;
    return (
      (req.numOfAcceptedAnnouncements
        ? user.numOfAcceptedAnnouncementsCount >= req.numOfAcceptedAnnouncements
        : true) &&
      (req.numOfCompletedActivities
        ? user.numOfCompletedActivitiesCount >= req.numOfCompletedActivities
        : true) &&
      (req.numOfCompletedPolls
        ? user.numOfCompletedPollsCount >= req.numOfCompletedPolls
        : true)
    );
  };

  const handleClaimClick = (reward) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  const renderRequirements = (reward) => {
    const req = reward.rewardRequirements;
    return (
      <>
        {req.numOfAcceptedAnnouncements && (
          <li>عدد البلاغات المقبولة: {req.numOfAcceptedAnnouncements}✅</li>
        )}
        {req.numOfCompletedActivities && (
          <li>عدد الفعاليات المكتملة: {req.numOfCompletedActivities}✅</li>
        )}
        {req.numOfCompletedPolls && (
          <li>عدد استطلاعات الرأي المكتملة: {req.numOfCompletedPolls}✅</li>
        )}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoBanner}>
        ⚠️ <strong>ملاحظة:</strong> أزرار المكافآت ستكون متاحة فقط إذا كنت مستوفياً لجميع المتطلبات المحددة لكل مكافأة.  
      </div>

      <h2>🌟 المكافآت المتاحة 🌟</h2>

      <div className={styles.rewardGrid}>
        {availableRewards.map((reward, index) => (
          <div key={index} className={styles.rewardCard}>
            <img
              src={`/src/Pages/UserPages/${index + 8}.jpg`}
              alt={reward.rewardName}
              className={styles.rewardImage}
            />
            <div className={styles.rewardContent}>
              <h3 className={styles.rewardTitle}>{reward.rewardName}</h3>
              <p className={styles.rewardDescription}>{reward.rewardDesc}</p>
              <ul className={styles.rewardRequirements}>
                <h3 className={styles.rewardTitle}>متطلبات المكافأة</h3>
                {renderRequirements(reward)}
              </ul>
              <p className={styles.rewardDetails}>
                🗓️ <strong>تاريخ الانتهاء:</strong> {reward.ExpiryDate}
              </p>
              <p className={styles.rewardValue}>
                💰 <strong>قيمة المكافأة:</strong> {reward.rewardValue} دولار
              </p>
              <button
                className={isEligible(reward) ? styles.claimButton : styles.disabledButton}
                disabled={!isEligible(reward)}
                onClick={() => handleClaimClick(reward)}
              >
                🎁 احصل على المكافأة
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <RewordPopUp
          selectedReward={selectedReward}
          user={user}
          setUser={setUser}
          setAvailableRewards={setAvailableRewards}
          onClose={() => setShowModal(false)}
          availableRewards={availableRewards}
        />
      )}
    </div>
  );
}
