import React from "react";
import useUser from "../../hooks/useUser";
import styles from "./RewardsPage.module.css";

export default function RewardsPage() {
  const { Rewards } = useUser();

  const requirmentsdisplay = (reward) => {
    const requirements = reward.rewardRequirements;
    return (
      <>
        {requirements.numOfAcceptedAnnouncements && (
          <li>
            {" "}
            عدد البلاغات المقبولة: {requirements.numOfAcceptedAnnouncements}✅
          </li>
        )}
        {requirements.numOfCompletedActivities && (
          <li>
            {" "}
            عدد الفعاليات المكتملة: {requirements.numOfCompletedActivities}✅
          </li>
        )}
        {requirements.numOfCompletedPolls && (
          <li>
            {" "}
            عدد استطلاعات الرأي المكتملة: {requirements.numOfCompletedPolls}✅
          </li>
        )}
      </>
    );
  };
  return (
    <div className={styles.container}>
      <h2>🌟 المكافآت المتاحة 🌟</h2>
      <div className={styles.rewardGrid}>
        {Rewards.map((reward, index) => (
          <div key={index} className={styles.rewardCard}>
            {/* Reward Image */}
            <img
              src={`/src/Pages/UserPages/${index + 8}.jpg`}
              alt={reward.title}
              className={styles.rewardImage}
            />

            <div className={styles.rewardContent}>
              <h3 className={styles.rewardTitle}>{reward.rewardName}</h3>
              <p className={styles.rewardDescription}>{reward.rewardDesc}</p>

              {/* Reward Requirements */}
              <ul className={styles.rewardRequirements}>
                <h3 className={styles.rewardTitle}>متطلبات المكافأة</h3>
                {requirmentsdisplay(reward)}
                {/* <li> عدد البلاغات المقبولة: {reward.rewardRequirements.numOfAcceptedAnnouncements}✅</li> */}
                {/* <li>✅ عدد الفعاليات المكتملة: {reward.eventsCompleted}</li>
                <li>✅ عدد استطلاعات الرأي المكتملة: {reward.surveysCompleted}</li> */}
              </ul>

              {/* Reward Details */}
              <p className={styles.rewardDetails}>
                🗓️ <strong>تاريخ الانتهاء:</strong> {reward.ExpiryDate}
              </p>
              {/* <p className={styles.rewardDetails}>🔹 <strong>حالة المكافأة:</strong> {reward.status}</p> */}
              <p className={styles.rewardValue}>
                💰 <strong>قيمة المكافأة:</strong> {reward.rewardValue} دولار
              </p>

              {/* Claim Reward Button */}
              <button className={styles.claimButton}>
                🎁 احصل على المكافأة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
