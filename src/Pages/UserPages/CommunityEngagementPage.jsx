import React from "react";
import useUser from "../../hooks/useUser.jsx";
import styles from "./CommunityEngagementPage.module.css"; // Import CSS Module

export default function CommunityEngagementPage() {
  const { CommunityActivities } = useUser();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>الأنشطة الاجتماعية المتاحة</h2>
      <div className={styles.activitiesGrid}>
        {CommunityActivities.map((activity, index) => (
          <div key={activity.id} className={styles.activityCard}>
            <img
              src={`/src/Pages/UserPages/${index + 4}.jpg`}
              alt={activity.ActName}
              className={styles.activityImage}
            />
            <h3 className={styles.activityTitle}>{activity.ActName}</h3>
            <p className={styles.activityDescription}>
              {activity.ActDescription}
            </p>
            <p>
              <strong>الفترة الزمنية:</strong> {activity.actIntervalDate}
            </p>
            <button className={styles.subscribeButton}>
              اشترك في الفاعلية
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
